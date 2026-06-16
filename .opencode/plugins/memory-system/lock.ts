import { mkdir, open, readFile, unlink } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';

export interface LockOptions {
  timeoutMs?: number;
}

interface LockDeps {
  sleepImpl?: (ms: number) => Promise<void>;
}

const DEFAULT_TIMEOUT_MS = 10_000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolveSleep) => {
    setTimeout(resolveSleep, ms);
  });
}

function isProcessRunning(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    console.debug(`[LaunchLock] Process ${pid} is not reachable`, error);
    return false;
  }
}

async function readLockPid(lockFilePath: string): Promise<number | null> {
  try {
    const content = await readFile(lockFilePath, 'utf8');
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

async function removeLockFile(lockFilePath: string): Promise<void> {
  await unlink(lockFilePath).catch((error: unknown) => {
    const code = error instanceof Error && 'code' in error ? String(error.code) : '';
    if (code !== 'ENOENT') {
      throw error;
    }
  });
}

export function getLaunchLockPath(runtimeRoot: string): string {
  return join(resolve(runtimeRoot), '.launcher-lock');
}

export class LaunchLock {
  private readonly sleepImpl: (ms: number) => Promise<void>;
  private fileHandle: Awaited<ReturnType<typeof open>> | null = null;
  private acquired = false;

  constructor(
    private readonly lockFilePath: string,
    deps: LockDeps = {},
  ) {
    this.sleepImpl = deps.sleepImpl ?? sleep;
  }

  async acquire(options: LockOptions = {}): Promise<boolean> {
    const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    const deadline = Date.now() + timeoutMs;
    let delayMs = 25;

    await mkdir(dirname(this.lockFilePath), { recursive: true });

    while (Date.now() <= deadline) {
      try {
        const fileHandle = await open(this.lockFilePath, 'wx');
        await fileHandle.writeFile(String(process.pid));
        this.fileHandle = fileHandle;
        this.acquired = true;
        return true;
      } catch (error) {
        const code = error instanceof Error && 'code' in error ? String(error.code) : '';
        if (code !== 'EEXIST') {
          throw error;
        }

        const existingPid = await readLockPid(this.lockFilePath);
        if (!existingPid || !isProcessRunning(existingPid)) {
          await removeLockFile(this.lockFilePath);
          continue;
        }
      }

      await this.sleepImpl(delayMs);
      delayMs = Math.min(delayMs * 2, 250);
    }

    return false;
  }

  async release(): Promise<void> {
    if (!this.acquired) {
      return;
    }

    try {
      await this.fileHandle?.close();
    } finally {
      this.acquired = false;
      this.fileHandle = null;
      await removeLockFile(this.lockFilePath);
    }
  }
}
