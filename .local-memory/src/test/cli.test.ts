import { afterEach, describe, expect, it } from 'bun:test';
import { existsSync, readFileSync } from 'node:fs';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { getPidFilePath, removePidFile, writePidFile } from '../index.ts';

const localMemoryRoot = resolve(import.meta.dir, '..', '..');

describe('local-memory CLI', () => {
  const tempDirs: string[] = [];

  afterEach(async () => {
    while (tempDirs.length > 0) {
      const dir = tempDirs.pop();
      if (dir) {
        await rm(dir, { force: true, recursive: true });
      }
    }
  });

  it('supports init command from the .local-memory directory', async () => {
    const sandboxRoot = await mkdtemp(join(tmpdir(), 'local-memory-cli-'));
    tempDirs.push(sandboxRoot);

    const runtimeRoot = join(sandboxRoot, 'runtime');
    const projectionRoot = join(sandboxRoot, 'projection');
    const databasePath = join(runtimeRoot, 'memory.db');

    const command = Bun.spawnSync({
      cmd: [
        'bun',
        'run',
        'src/index.ts',
        'init',
        '--runtime-root',
        runtimeRoot,
        '--database-path',
        databasePath,
        '--projection-root',
        projectionRoot,
      ],
      cwd: localMemoryRoot,
      stdout: 'pipe',
      stderr: 'pipe',
    });

    expect(command.exitCode).toBe(0);
    expect(existsSync(databasePath)).toBe(true);
  });

  it('writes and removes the runtime pid file', async () => {
    const sandboxRoot = await mkdtemp(join(tmpdir(), 'local-memory-pid-'));
    tempDirs.push(sandboxRoot);

    const pidFilePath = getPidFilePath(sandboxRoot);
    await writePidFile(sandboxRoot, 24680);

    expect(existsSync(pidFilePath)).toBe(true);
    expect(readFileSync(pidFilePath, 'utf8').trim()).toBe('24680');

    await removePidFile(sandboxRoot);

    expect(existsSync(pidFilePath)).toBe(false);
  });
});
