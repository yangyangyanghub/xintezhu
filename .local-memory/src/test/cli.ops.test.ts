import { describe, expect, it } from 'bun:test';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const localMemoryRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

describe('CLI Operations', () => {
  it('supports status command', () => {
    const result = Bun.spawnSync({
      cmd: ['bun', 'run', 'src/index.ts', 'status'],
      cwd: localMemoryRoot,
      stdout: 'pipe',
      stderr: 'pipe',
    });

    expect(result.exitCode).toBe(0);
    const output = result.stdout.toString();
    expect(output).toContain('health');
  });

  it('supports search command', () => {
    const result = Bun.spawnSync({
      cmd: ['bun', 'run', 'src/index.ts', 'search', '--query', '测试'],
      cwd: localMemoryRoot,
      stdout: 'pipe',
      stderr: 'pipe',
    });

    expect(result.exitCode).toBe(0);
    const output = result.stdout.toString();
    expect(output).toContain('results');
  });

  it('supports context command', () => {
    const result = Bun.spawnSync({
      cmd: ['bun', 'run', 'src/index.ts', 'context', '--query', '测试', '--workspace', 'test'],
      cwd: localMemoryRoot,
      stdout: 'pipe',
      stderr: 'pipe',
    });

    expect(result.exitCode).toBe(0);
    const output = result.stdout.toString();
    expect(output).toContain('context');
  });

  it('search command fails without query', () => {
    const result = Bun.spawnSync({
      cmd: ['bun', 'run', 'src/index.ts', 'search'],
      cwd: localMemoryRoot,
      stdout: 'pipe',
      stderr: 'pipe',
    });

    expect(result.exitCode).toBe(1);
  });

  it('context command fails without query', () => {
    const result = Bun.spawnSync({
      cmd: ['bun', 'run', 'src/index.ts', 'context'],
      cwd: localMemoryRoot,
      stdout: 'pipe',
      stderr: 'pipe',
    });

    expect(result.exitCode).toBe(1);
  });

  it('supports projection rebuild command', () => {
    const result = Bun.spawnSync({
      cmd: ['bun', 'run', 'src/index.ts', 'projection', 'rebuild'],
      cwd: localMemoryRoot,
      stdout: 'pipe',
      stderr: 'pipe',
    });

    expect(result.exitCode).toBe(0);
    const output = result.stdout.toString();
    expect(output).toContain('summary');
    expect(output).toContain('success');
  });

  it('supports projection verify command', () => {
    const result = Bun.spawnSync({
      cmd: ['bun', 'run', 'src/index.ts', 'projection', 'verify'],
      cwd: localMemoryRoot,
      stdout: 'pipe',
      stderr: 'pipe',
    });

    expect(result.exitCode).toBe(0);
    const output = result.stdout.toString();
    expect(output).toContain('valid');
    expect(output).toContain('issues');
  });

  it('supports cleanup run command', () => {
    const result = Bun.spawnSync({
      cmd: ['bun', 'run', 'src/index.ts', 'cleanup', 'run'],
      cwd: localMemoryRoot,
      stdout: 'pipe',
      stderr: 'pipe',
    });

    expect(result.exitCode).toBe(0);
    const output = result.stdout.toString();
    expect(output).toContain('results');
    expect(output).toContain('totalProcessed');
  });
});
