import { MemoryCoreService, type MemoryCoreConfig } from './service/core.ts';
import { createServer } from './http/server.ts';

interface CliOptions extends Partial<MemoryCoreConfig> {
  port?: number;
  query?: string;
  mode?: string;
  workspace?: string;
  eventFile?: string;
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
      case '--query':
        options.query = value;
        index += 1;
        break;
      case '--mode':
        options.mode = value;
        index += 1;
        break;
      case '--workspace':
        options.workspace = value;
        index += 1;
        break;
      case '--event-file':
        options.eventFile = value;
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

  const server = createServer({ port, deps: service.getRouteDeps() });

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

async function runStatus(options: CliOptions): Promise<number> {
  const service = new MemoryCoreService(options);
  
  try {
    await service.initialize();
    const health = await service.health();
    const db = service.getDatabase();
    
    // Get additional stats
    const memoryCount = db.query('SELECT COUNT(*) as count FROM memories').get() as { count: number };
    const activeCount = db.query('SELECT COUNT(*) as count FROM memories WHERE status = ?').get('active') as { count: number };
    const eventCount = db.query('SELECT COUNT(*) as count FROM ingestion_events').get() as { count: number };
    
    console.log(JSON.stringify({
      health,
      stats: {
        totalMemories: memoryCount.count,
        activeMemories: activeCount.count,
        totalEvents: eventCount.count,
      },
      timestamp: new Date().toISOString(),
    }, null, 2));
    
    return 0;
  } finally {
    await service.dispose();
  }
}

async function runSearch(options: CliOptions): Promise<number> {
  if (!options.query) {
    console.error('Error: --query is required');
    return 1;
  }
  
  const service = new MemoryCoreService(options);
  
  try {
    await service.initialize();
    const deps = service.getRouteDeps();
    const result = await deps.retrieval.search(
      options.query,
      (options.mode as 'keyword' | 'semantic' | 'hybrid') ?? 'hybrid'
    );
    
    console.log(JSON.stringify(result, null, 2));
    return 0;
  } finally {
    await service.dispose();
  }
}

async function runContext(options: CliOptions): Promise<number> {
  if (!options.query) {
    console.error('Error: --query is required');
    return 1;
  }
  
  const service = new MemoryCoreService(options);
  
  try {
    await service.initialize();
    const deps = service.getRouteDeps();
    const result = await deps.contextAssembly.assemble(
      options.query,
      options.workspace ?? 'default'
    );
    
    console.log(JSON.stringify(result, null, 2));
    return 0;
  } finally {
    await service.dispose();
  }
}

async function runIngest(options: CliOptions): Promise<number> {
  if (!options.eventFile) {
    console.error('Error: --event-file is required');
    return 1;
  }
  
  const service = new MemoryCoreService(options);
  
  try {
    await service.initialize();
    
    // Read event from file
    const eventData = await Bun.file(options.eventFile).json();
    const deps = service.getRouteDeps();
    const result = await deps.ingestGateway.ingestEvent(eventData);
    
    console.log(JSON.stringify(result, null, 2));
    return result.accepted ? 0 : 1;
  } catch (error) {
    console.error(`Error ingesting event: ${error}`);
    return 1;
  } finally {
    await service.dispose();
  }
}

async function main(): Promise<number> {
  const { command, options } = parseArgs(process.argv.slice(2));

  switch (command) {
    case 'init':
      return runInit(options);
    case 'start':
      return runStart(options);
    case 'status':
      return runStatus(options);
    case 'search':
      return runSearch(options);
    case 'context':
      return runContext(options);
    case 'ingest':
      return runIngest(options);
    default:
      console.log(`Usage: bun run src/index.ts <command> [options]

Commands:
  init                          Initialize the memory service
  start                         Start the HTTP server
  status                        Get service status and stats
  search --query <text>         Search memories
  context --query <text>        Assemble context for query
  ingest --event-file <path>    Ingest event from JSON file

Options:
  --runtime-root <path>         Runtime directory (default: .local-memory)
  --database-path <path>        Database file (default: .local-memory/memory.db)
  --projection-root <path>      Projection directory (default: .memory)
  --port <number>               HTTP port (default: 37777)
  --query <text>                Search query
  --mode <keyword|semantic|hybrid>  Search mode (default: hybrid)
  --workspace <name>            Workspace name
  --event-file <path>           Path to event JSON file
  --disable-projection          Disable projection feature`);
      return 1;
  }
}

const exitCode = await main();
if (exitCode !== 0) {
  process.exit(exitCode);
}
