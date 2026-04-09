import type { IngestGateway } from '../ingest/gateway.ts';
import type { RetrievalService } from '../retrieval/service.ts';
import type { ContextAssemblyService } from '../context/assembly.ts';
import type { MemoryCoreService } from '../service/core.ts';
import { handleIngest, handleGetEventStatus, handleGetBatchEvents } from './handlers/ingest.ts';
import { handleSearch, handleContext } from './handlers/search.ts';
import { 
  handleStatus, 
  handleProjectionRebuild, 
  handleProjectionVerify, 
  handleCleanupRun,
  handleRollbackBatch,
  type OpsHttpDeps 
} from './handlers/ops.ts';

export interface RouteDeps {
  ingestGateway: IngestGateway;
  retrieval: RetrievalService;
  contextAssembly: ContextAssemblyService;
  service: MemoryCoreService;
}

export function buildRoutes(deps: RouteDeps) {
  const opsDeps: OpsHttpDeps = { ...deps, service: deps.service };
  
  return {
    '/health': {
      GET: () => Response.json({ status: 'ok' }),
    },
    '/api/ingest': {
      POST: (req: Request) => handleIngest(req, deps),
    },
    '/api/ingest/status': {
      GET: (req: Request) => handleGetEventStatus(req, deps),
    },
    '/api/ingest/batch': {
      GET: (req: Request) => handleGetBatchEvents(req, deps),
    },
    '/api/search': {
      POST: (req: Request) => handleSearch(req, deps),
    },
    '/api/context': {
      POST: (req: Request) => handleContext(req, deps),
    },
    '/api/status': {
      GET: () => handleStatus({} as Request, opsDeps),
    },
    '/api/projection/rebuild': {
      POST: (req: Request) => handleProjectionRebuild(req, opsDeps),
    },
    '/api/projection/verify': {
      GET: () => handleProjectionVerify({} as Request, opsDeps),
    },
    '/api/cleanup/run': {
      POST: (req: Request) => handleCleanupRun(req, opsDeps),
    },
    '/api/rollback/batch': {
      POST: (req: Request) => handleRollbackBatch(req, opsDeps),
    },
  };
}
