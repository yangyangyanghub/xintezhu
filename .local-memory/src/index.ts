import { MemoryCoreService, type MemoryCoreConfig } from './service/core.ts';
import { createServer } from './http/server.ts';
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';

interface CliOptions extends Partial<MemoryCoreConfig> {
  port?: number;
  query?: string;
  mode?: string;
  workspace?: string;
  eventFile?: string;
  memoryId?: string;
  force?: boolean;
  actor?: string;
  daemon?: boolean;
}

export function getPidFilePath(runtimeRoot: string): string {
  return join(resolve(runtimeRoot), '.pid');
}

export async function writePidFile(runtimeRoot: string, pid: number): Promise<void> {
  await mkdir(resolve(runtimeRoot), { recursive: true });
  await writeFile(getPidFilePath(runtimeRoot), `${pid}\n`, 'utf8');
}

export async function removePidFile(runtimeRoot: string): Promise<void> {
  await unlink(getPidFilePath(runtimeRoot)).catch((error: unknown) => {
    const code = error instanceof Error && 'code' in error ? String(error.code) : '';
    if (code !== 'ENOENT') {
      throw error;
    }
  });
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

function isProcessRunning(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function resolveStartOptions(options: CliOptions): CliOptions {
  if (options.runtimeRoot || options.databasePath || options.projectionRoot) {
    return options;
  }

  if (basename(process.cwd()) !== '.local-memory') {
    return options;
  }

  return {
    ...options,
    runtimeRoot: '.',
    databasePath: './memory.db',
    projectionRoot: '../.memory',
  };
}

async function spawnDaemon(options: CliOptions): Promise<number> {
  const resolvedOptions = resolveStartOptions({ ...options, daemon: false });
  const args = ['bun', 'run', 'src/index.ts', 'start'];
  if (resolvedOptions.port !== undefined) {
    args.push('--port', String(resolvedOptions.port));
  }
  if (resolvedOptions.runtimeRoot) {
    args.push('--runtime-root', resolvedOptions.runtimeRoot);
  }
  if (resolvedOptions.databasePath) {
    args.push('--database-path', resolvedOptions.databasePath);
  }
  if (resolvedOptions.projectionRoot) {
    args.push('--projection-root', resolvedOptions.projectionRoot);
  }
  if (resolvedOptions.enableProjection === false) {
    args.push('--disable-projection');
  }

  const child = Bun.spawn({
    cmd: args,
    cwd: resolve(import.meta.dir, '..'),
    detached: true,
    stdin: 'ignore',
    stdout: 'ignore',
    stderr: 'ignore',
  });
  child.unref?.();

  console.log(`[MemoryCore] Daemon started (pid: ${child.pid ?? 'unknown'})`);
  return 0;
}

function parseArgs(argv: string[]): { command: string; options: CliOptions } {
  const commandParts: string[] = [];
  let optionStart = argv.findIndex((arg) => arg.startsWith('--'));
  if (optionStart === -1) {
    optionStart = argv.length;
  }

  for (let index = 0; index < optionStart; index += 1) {
    commandParts.push(argv[index]);
  }

  const command = commandParts.join(' ') || 'help';
  const rest = argv.slice(optionStart);
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
      case '--memory-id':
        options.memoryId = value;
        index += 1;
        break;
      case '--force':
        options.force = true;
        break;
      case '--actor':
        options.actor = value;
        index += 1;
        break;
      case '--daemon':
        options.daemon = true;
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
  if (options.daemon) {
    return spawnDaemon(options);
  }

  const resolvedOptions = resolveStartOptions(options);
  const port = resolvedOptions.port ?? 37777;
  const runtimeRoot = resolvedOptions.runtimeRoot ?? '.local-memory';
  const existingPid = await readPidFile(runtimeRoot);
  if (existingPid && existingPid !== process.pid && isProcessRunning(existingPid)) {
    console.error(`[MemoryCore] Service already running with pid ${existingPid}`);
    return 1;
  }

  const service = new MemoryCoreService(resolvedOptions);
  await service.initialize();

  const server = createServer({ port, deps: service.getRouteDeps() });
  await writePidFile(runtimeRoot, process.pid);

  const shutdown = async () => {
    server.stop(true);
    await service.dispose();
    await removePidFile(runtimeRoot);
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

async function runPromote(options: CliOptions): Promise<number> {
  if (!options.memoryId) {
    console.error('Error: --memory-id is required');
    return 1;
  }

  const service = new MemoryCoreService(options);

  try {
    await service.initialize();
    const result = await service.getPromotionEngine().promote(
      options.memoryId,
      { actor: 'cli' },
      options.force ?? false
    );

    console.log(JSON.stringify(result, null, 2));
    return result.promoted ? 0 : 1;
  } catch (error) {
    console.error(`Error promoting memory: ${error}`);
    return 1;
  } finally {
    await service.dispose();
  }
}

async function runRelations(options: CliOptions): Promise<number> {
  if (!options.memoryId) {
    console.error('Error: --memory-id is required');
    return 1;
  }

  const service = new MemoryCoreService(options);

  try {
    await service.initialize();
    const relationEngine = service.getRelationEngine();
    const [relations, lineage] = await Promise.all([
      relationEngine.getRelationsFrom(options.memoryId),
      relationEngine.getLineage(options.memoryId),
    ]);

    console.log(JSON.stringify({ relations, lineage }, null, 2));
    return 0;
  } catch (error) {
    console.error(`Error querying relations: ${error}`);
    return 1;
  } finally {
    await service.dispose();
  }
}

async function runProjectionRebuild(options: CliOptions): Promise<number> {
  const service = new MemoryCoreService(options);

  try {
    await service.initialize();
    const result = await service.getProjectionEngine().rebuild({ actor: options.actor ?? 'cli' });
    console.log(JSON.stringify(result, null, 2));
    return result.success ? 0 : 1;
  } catch (error) {
    console.error(`Error rebuilding projection: ${error}`);
    return 1;
  } finally {
    await service.dispose();
  }
}

async function runProjectionVerify(options: CliOptions): Promise<number> {
  const service = new MemoryCoreService(options);

  try {
    await service.initialize();
    const result = await service.getProjectionEngine().verifyIntegrity();
    console.log(JSON.stringify(result, null, 2));
    return result.valid ? 0 : 1;
  } catch (error) {
    console.error(`Error verifying projection: ${error}`);
    return 1;
  } finally {
    await service.dispose();
  }
}

async function runCleanup(options: CliOptions): Promise<number> {
  const service = new MemoryCoreService(options);

  try {
    await service.initialize();
    const result = await service.getCleanupService().runFullCleanup({ actor: options.actor ?? 'cli' });
    console.log(JSON.stringify(result, null, 2));
    return 0;
  } catch (error) {
    console.error(`Error running cleanup: ${error}`);
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
    case 'promote':
      return runPromote(options);
    case 'relations':
      return runRelations(options);
    case 'projection rebuild':
      return runProjectionRebuild(options);
    case 'projection verify':
      return runProjectionVerify(options);
    case 'cleanup run':
      return runCleanup(options);
    default:
      console.log(`Usage: bun run src/index.ts <command> [options]

Commands:
  init                          Initialize the memory service
  start                         Start the HTTP server
  status                        Get service status and stats
  search --query <text>         Search memories
  context --query <text>        Assemble context for query
  ingest --event-file <path>    Ingest event from JSON file
  promote --memory-id <id>      Promote memory to next layer
  relations --memory-id <id>    Query memory relations and lineage
  projection rebuild            Run full projection rebuild
  projection verify             Verify projection integrity
  cleanup run                   Run full cleanup

Options:
  --runtime-root <path>         Runtime directory (default: .local-memory)
  --database-path <path>        Database file (default: .local-memory/memory.db)
  --projection-root <path>      Projection directory (default: .memory)
  --port <number>               HTTP port (default: 37777)
  --query <text>                Search query
  --mode <keyword|semantic|hybrid>  Search mode (default: hybrid)
  --workspace <name>            Workspace name
  --event-file <path>           Path to event JSON file
  --memory-id <id>              Memory id for promote/relations commands
  --actor <name>                Actor name for audit context
  --force                       Force promotion even if not eligible
  --disable-projection          Disable projection feature`);
      return 1;
  }
}

if (import.meta.main) {
  const exitCode = await main();
  if (exitCode !== 0) {
    process.exit(exitCode);
  }
}
