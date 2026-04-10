import { afterEach, describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { LaunchLock, getLaunchLockPath } from './lock.js';

describe('LaunchLock', () => {
  const tempDirs: string[] = [];

  afterEach(async () => {
    while (tempDirs.length > 0) {
      const dir = tempDirs.pop();
      if (dir) {
        await rm(dir, { force: true, recursive: true });
      }
    }
  });

  it('recovers a stale launcher lock whose pid is no longer alive', async () => {
    const sandboxRoot = await mkdtemp(join(tmpdir(), 'memory-lock-'));
    tempDirs.push(sandboxRoot);

    const lockFilePath = getLaunchLockPath(sandboxRoot);
    await writeFile(lockFilePath, '999999\n', 'utf8');

    const lock = new LaunchLock(lockFilePath, {
      sleepImpl: async () => {},
    });

    const acquired = await lock.acquire({ timeoutMs: 50 });

    expect(acquired).toBe(true);
    expect(readFileSync(lockFilePath, 'utf8').trim()).toBe(String(process.pid));

    await lock.release();
  });
});
