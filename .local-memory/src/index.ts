import { MemoryCoreService, type MemoryCoreConfig } from './service/core.ts';
import { createServer } from './http/server.ts';

interface CliOptions extends Partial<MemoryCoreConfig> {
  port?: number;
}

function parseArgs(argv: string[]): { command: string; options: CliOptions } {
  const [command = 'help', ...rest] = argv;
  const options: CliOptions = {};

  for (let index = 0; index < rest.length; index += 1) {
    const arg = rest[index];
    const value = rest[index + 1];

    switch (arg) {
      case '--runtime-root':
        options.runtimeRoot = value;
        index += 1;
        break;
      case '--database-path':
        options.databasePath = value;
        index += 1;
        break;
      case '--projection-root':
        options.projectionRoot = value;
        index += 1;
        break;
      case '--port':
        options.port = value ? Number.parseInt(value, 10) : undefined;
        index += 1;
        break;
      case '--disable-projection':
        options.enableProjection = false;
        break;
      default:
        break;
    }
  }

  return { command, options };
}

async function runInit(options: CliOptions): Promise<number> {
  const service = new MemoryCoreService(options);

  try {
    await service.initialize();
    const health = await service.health();
    console.log(JSON.stringify(health, null, 2));
    return 0;
  } finally {
    await service.dispose();
  }
}

async function runStart(options: CliOptions): Promise<number> {
  const port = options.port ?? 37777;
  const service = new MemoryCoreService(options);
  await service.initialize();

  const server = createServer({ port });

  const shutdown = async () => {
    server.stop(true);
    await service.dispose();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  console.log(`[MemoryCore] Listening on http://127.0.0.1:${port}`);
  return 0;
}

async function main(): Promise<number> {
  const { command, options } = parseArgs(process.argv.slice(2));

  switch (command) {
    case 'init':
      return runInit(options);
    case 'start':
      return runStart(options);
    default:
      console.log('Usage: bun run src/index.ts <init|start> [--runtime-root path] [--database-path path] [--projection-root path] [--port 37777] [--disable-projection]');
      return 1;
  }
}

const exitCode = await main();
if (exitCode !== 0) {
  process.exit(exitCode);
}
