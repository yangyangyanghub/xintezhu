import { afterEach, describe, expect, it } from 'bun:test';
import { existsSync } from 'node:fs';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

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
});
