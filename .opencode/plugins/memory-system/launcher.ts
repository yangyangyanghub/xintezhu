import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { LaunchLock, getLaunchLockPath } from './lock.js';

export interface LaunchResult {
  success: boolean;
  ready: boolean;
  error?: string;
  pid?: number;
}

export interface LauncherOptions {
  port?: number;
  timeoutMs?: number;
  runtimeRoot?: string;
}

interface SpawnOptionsLike {
  cmd: string[];
  cwd: string;
  detached: boolean;
  stdin: 'ignore';
  stdout: 'ignore';
  stderr: 'ignore';
}

interface SpawnResultLike {
  pid?: number;
  exited: Promise<number>;
  unref?: () => void;
}

type FetchLike = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

interface LauncherDeps {
  fetchImpl?: FetchLike;
  sleepImpl?: (ms: number) => Promise<void>;
  spawnImpl?: (command: string[], options: SpawnOptionsLike) => SpawnResultLike;
}

const DEFAULT_PORT = 37777;
const DEFAULT_TIMEOUT_MS = 10_000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolveSleep) => {
    setTimeout(resolveSleep, ms);
  });
}

function buildReadyUrl(port: number): string {
  return `http://127.0.0.1:${port}/ready`;
}

function getPidFilePath(runtimeRoot: string): string {
  return resolve(runtimeRoot, '.pid');
}

async function readPidFile(runtimeRoot: string): Promise<number | null> {
  try {
    const content = await readFile(getPidFilePath(runtimeRoot), 'utf8');
    const pid = Number.parseInt(content.trim(), 10);
    return Number.isInteger(pid) && pid > 0 ? pid : null;
  } catch (error) {
    const code = error instanceof Error && 'code' in error ? String(error.code) : '';
    if (code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

async function waitForPidFile(runtimeRoot: string, timeoutMs: number, sleepImpl: (ms: number) => Promise<void>): Promise<number | null> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() <= deadline) {
    const pid = await readPidFile(runtimeRoot);
    if (pid) {
      return pid;
    }

    await sleepImpl(25);
  }

  return null;
}

function isProcessRunning(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    console.debug(`[ServiceLauncher] Process ${pid} is not reachable`, error);
    return false;
  }
}

export class ServiceLauncher {
  private readonly fetchImpl: FetchLike;
  private readonly sleepImpl: (ms: number) => Promise<void>;
  private readonly spawnImpl: (command: string[], options: SpawnOptionsLike) => SpawnResultLike;
  private readonly inFlight = new Map<string, Promise<LaunchResult>>();

  constructor(deps: LauncherDeps = {}) {
    this.fetchImpl = deps.fetchImpl ?? fetch;
    this.sleepImpl = deps.sleepImpl ?? sleep;
    this.spawnImpl = deps.spawnImpl ?? ((command, options) => Bun.spawn({ ...options, cmd: command }));
  }

  async ensureReady(options: LauncherOptions = {}): Promise<LaunchResult> {
    const resolvedOptions = this.resolveOptions(options);
    const key = `${resolvedOptions.runtimeRoot}:${resolvedOptions.port}`;
    const existing = this.inFlight.get(key);
    if (existing) {
      return existing;
    }

    const task = this.ensureReadyInternal(resolvedOptions);
    this.inFlight.set(key, task);

    try {
      return await task;
    } finally {
      this.inFlight.delete(key);
    }
  }

  async isReady(port = DEFAULT_PORT): Promise<boolean> {
    try {
      const response = await this.fetchImpl(buildReadyUrl(port));
      if (!response.ok) {
        return false;
      }

      const data = await response.json() as { ready?: boolean };
      return data.ready === true;
    } catch (error) {
      console.debug(`[ServiceLauncher] Readiness probe failed on port ${port}`, error);
      return false;
    }
  }

  async startService(options: LauncherOptions = {}): Promise<LaunchResult> {
    const resolvedOptions = this.resolveOptions(options);
    const lock = new LaunchLock(getLaunchLockPath(resolvedOptions.runtimeRoot), {
      sleepImpl: this.sleepImpl,
    });

    const lockAcquired = await lock.acquire({ timeoutMs: resolvedOptions.timeoutMs });
    if (!lockAcquired) {
      return {
        success: false,
        ready: false,
        error: `launcher timeout while waiting for startup lock (${resolvedOptions.timeoutMs}ms)`,
      };
    }

    try {
      if (await this.isReady(resolvedOptions.port)) {
        return { success: true, ready: true };
      }

      const existingPid = await readPidFile(resolvedOptions.runtimeRoot);
      if (existingPid && isProcessRunning(existingPid)) {
        const ready = await this.waitForReady(resolvedOptions);
        if (ready) {
          return { success: true, ready: true, pid: existingPid };
        }

        return {
          success: false,
          ready: false,
          pid: existingPid,
          error: `service readiness timeout on port ${resolvedOptions.port}`,
        };
      }

      const command = ['bun', 'run', 'src/index.ts', 'start', '--daemon', '--port', String(resolvedOptions.port)];
      const child = this.spawnImpl(command, {
        cmd: command,
        cwd: resolvedOptions.runtimeRoot,
        detached: true,
        stdin: 'ignore',
        stdout: 'ignore',
        stderr: 'ignore',
      });
      child.unref?.();

      const started = await Promise.race([
        this.waitForReady(resolvedOptions).then((ready) => ({ type: 'ready' as const, ready })),
        child.exited.then((code) => ({ type: 'exit' as const, code })),
      ]);

      if (started.type === 'ready' && started.ready) {
        const runtimePid = await waitForPidFile(resolvedOptions.runtimeRoot, 250, this.sleepImpl);
        return {
          success: true,
          ready: true,
          pid: runtimePid ?? child.pid,
        };
      }

      if (started.type === 'exit') {
        if (started.code === 0) {
          const ready = await this.waitForReady(resolvedOptions);
          if (ready) {
            const runtimePid = await waitForPidFile(resolvedOptions.runtimeRoot, 250, this.sleepImpl);
            return {
              success: true,
              ready: true,
              pid: runtimePid ?? child.pid,
            };
          }

          return {
            success: false,
            ready: false,
            pid: child.pid,
            error: `service readiness timeout on port ${resolvedOptions.port}`,
          };
        }

        return {
          success: false,
          ready: false,
          pid: child.pid,
          error: `service exited before readiness with code ${started.code}`,
        };
      }

      return {
        success: false,
        ready: false,
        pid: child.pid,
        error: `service readiness timeout on port ${resolvedOptions.port}`,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        ready: false,
        error: `failed to start local memory service: ${message}`,
      };
    } finally {
      await lock.release();
    }
  }

  private async ensureReadyInternal(options: Required<LauncherOptions>): Promise<LaunchResult> {
    if (await this.isReady(options.port)) {
      return { success: true, ready: true };
    }

    return this.startService(options);
  }

  private resolveOptions(options: LauncherOptions): Required<LauncherOptions> {
    return {
      port: options.port ?? DEFAULT_PORT,
      timeoutMs: options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
      runtimeRoot: resolve(options.runtimeRoot ?? '.local-memory'),
    };
  }

  private async waitForReady(options: Required<LauncherOptions>): Promise<boolean> {
    const deadline = Date.now() + options.timeoutMs;
    let delayMs = 50;

    while (Date.now() <= deadline) {
      if (await this.isReady(options.port)) {
        return true;
      }

      await this.sleepImpl(delayMs);
      delayMs = Math.min(delayMs * 2, 500);
    }

    return false;
  }
}
