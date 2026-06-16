import { afterEach, describe, expect, it } from 'bun:test';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ServiceLauncher } from './launcher.js';

interface SpawnResultLike {
  pid?: number;
  exited: Promise<number>;
}

describe('ServiceLauncher', () => {
  const tempDirs: string[] = [];

  afterEach(async () => {
    while (tempDirs.length > 0) {
      const dir = tempDirs.pop();
      if (dir) {
        await rm(dir, { force: true, recursive: true });
      }
    }
  });

  it('returns ready immediately when /ready succeeds', async () => {
    let spawnCalls = 0;
    const launcher = new ServiceLauncher({
      fetchImpl: async () => new Response(JSON.stringify({ ready: true }), { status: 200 }),
      spawnImpl: () => {
        spawnCalls += 1;
        return { pid: 5001, exited: Promise.resolve(0) } as SpawnResultLike;
      },
      sleepImpl: async () => {},
    });

    const result = await launcher.ensureReady({ port: 37777, runtimeRoot: '.local-memory' });

    expect(result.success).toBe(true);
    expect(result.ready).toBe(true);
    expect(spawnCalls).toBe(0);
  });

  it('starts the service when /ready is unavailable and returns the spawned pid', async () => {
    const fetchStates = [
      new TypeError('connect ECONNREFUSED'),
      new Response(JSON.stringify({ ready: false }), { status: 503 }),
      new Response(JSON.stringify({ ready: true }), { status: 200 }),
    ];
    const spawnCalls: Array<string[]> = [];

    const launcher = new ServiceLauncher({
      fetchImpl: async () => {
        const next = fetchStates.shift();
        if (next instanceof Error) {
          throw next;
        }
        return next ?? new Response(JSON.stringify({ ready: true }), { status: 200 });
      },
      spawnImpl: (command, options) => {
        spawnCalls.push(command);
        expect(options.cwd).toContain('.local-memory');
        return { pid: 4321, exited: Promise.resolve(0) } as SpawnResultLike;
      },
      sleepImpl: async () => {},
    });

    const result = await launcher.ensureReady({
      port: 37777,
      runtimeRoot: 'E:/code/my-ai-workspace/.local-memory',
      timeoutMs: 100,
    });

    expect(result).toMatchObject({ success: true, ready: true, pid: 4321 });
    expect(spawnCalls).toHaveLength(1);
    expect(spawnCalls[0]).toEqual(['bun', 'run', 'src/index.ts', 'start', '--daemon', '--port', '37777']);
  });

  it('prefers the runtime pid file once the daemon becomes ready', async () => {
    const sandboxRoot = await mkdtemp(join(tmpdir(), 'memory-launcher-pid-'));
    tempDirs.push(sandboxRoot);

    let fetchCalls = 0;
    const launcher = new ServiceLauncher({
      fetchImpl: async () => {
        fetchCalls += 1;
        if (fetchCalls === 3) {
          await writeFile(join(sandboxRoot, '.pid'), '2468\n', 'utf8');
        }

        if (fetchCalls < 3) {
          return new Response(JSON.stringify({ ready: false }), { status: 503 });
        }

        return new Response(JSON.stringify({ ready: true }), { status: 200 });
      },
      spawnImpl: () => ({ pid: 4321, exited: Promise.resolve(0) } as SpawnResultLike),
      sleepImpl: async () => {},
    });

    const result = await launcher.ensureReady({ runtimeRoot: sandboxRoot, port: 37777, timeoutMs: 100 });

    expect(result).toMatchObject({ success: true, ready: true, pid: 2468 });
  });

  it('coalesces concurrent launch attempts into one startup', async () => {
    const sandboxRoot = await mkdtemp(join(tmpdir(), 'memory-launcher-'));
    tempDirs.push(sandboxRoot);

    let fetchCalls = 0;
    let spawnCalls = 0;
    const launcher = new ServiceLauncher({
      fetchImpl: async () => {
        fetchCalls += 1;
        if (fetchCalls < 4) {
          throw new TypeError('connect ECONNREFUSED');
        }
        return new Response(JSON.stringify({ ready: true }), { status: 200 });
      },
      spawnImpl: () => {
        spawnCalls += 1;
        return { pid: 9876, exited: Promise.resolve(0) } as SpawnResultLike;
      },
      sleepImpl: async () => {},
    });

    const [first, second] = await Promise.all([
      launcher.ensureReady({ runtimeRoot: sandboxRoot, port: 37777, timeoutMs: 100 }),
      launcher.ensureReady({ runtimeRoot: sandboxRoot, port: 37777, timeoutMs: 100 }),
    ]);

    expect(first.success).toBe(true);
    expect(second.success).toBe(true);
    expect(spawnCalls).toBe(1);
  });

  it('returns a structured timeout error when readiness never succeeds', async () => {
    const sandboxRoot = await mkdtemp(join(tmpdir(), 'memory-launcher-timeout-'));
    tempDirs.push(sandboxRoot);

    const launcher = new ServiceLauncher({
      fetchImpl: async () => new Response(JSON.stringify({ ready: false }), { status: 503 }),
      spawnImpl: () => ({ pid: 7654, exited: Promise.resolve(0) } as SpawnResultLike),
      sleepImpl: async () => {},
    });

    const result = await launcher.ensureReady({ runtimeRoot: sandboxRoot, port: 37777, timeoutMs: 10 });

    expect(result.success).toBe(false);
    expect(result.ready).toBe(false);
    expect(result.error).toContain('timeout');
  });
});
