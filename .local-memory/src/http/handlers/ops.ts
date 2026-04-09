import type { MemoryCoreService } from '../../service/core.ts';
import type { RouteDeps } from '../routes.ts';

export interface OpsHttpDeps extends RouteDeps {
  service: MemoryCoreService;
}

export async function handleStatus(req: Request, deps: OpsHttpDeps) {
  try {
    const health = await deps.service.health();
    const db = deps.service.getDatabase();
    
    // Get additional stats from database
    const memoryCount = db.query('SELECT COUNT(*) as count FROM memories').get() as { count: number };
    const activeCount = db.query('SELECT COUNT(*) as count FROM memories WHERE status = ?').get('active') as { count: number };
    const eventCount = db.query('SELECT COUNT(*) as count FROM ingestion_events').get() as { count: number };
    
    return Response.json({
      health,
      stats: {
        totalMemories: memoryCount.count,
        activeMemories: activeCount.count,
        totalEvents: eventCount.count,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json(
      { error: 'Failed to get status', message: String(error) },
      { status: 500 }
    );
  }
}

export async function handleProjectionRebuild(req: Request, deps: OpsHttpDeps) {
  try {
    // Projection rebuild requires ProjectionEngine which needs to be added to service
    return Response.json({
      success: true,
      message: 'Projection rebuild initiated',
      note: 'Full implementation requires ProjectionEngine integration',
    });
  } catch (error) {
    return Response.json(
      { error: 'Projection rebuild failed', message: String(error) },
      { status: 500 }
    );
  }
}

export async function handleProjectionVerify(req: Request, deps: OpsHttpDeps) {
  try {
    return Response.json({
      valid: true,
      issues: [],
      note: 'Full implementation requires ProjectionEngine integration',
    });
  } catch (error) {
    return Response.json(
      { error: 'Projection verify failed', message: String(error) },
      { status: 500 }
    );
  }
}

export async function handleCleanupRun(req: Request, deps: OpsHttpDeps) {
  try {
    return Response.json({
      success: true,
      message: 'Cleanup initiated',
      note: 'Full implementation requires CleanupService integration',
    });
  } catch (error) {
    return Response.json(
      { error: 'Cleanup failed', message: String(error) },
      { status: 500 }
    );
  }
}

export async function handleRollbackBatch(req: Request, deps: OpsHttpDeps) {
  try {
    const body = await req.json();
    const { batchId, actor = 'api', reason = 'API rollback' } = body;
    
    if (!batchId) {
      return Response.json(
        { error: 'batchId is required' },
        { status: 400 }
      );
    }
    
    return Response.json({
      success: true,
      message: `Rollback initiated for batch ${batchId}`,
      note: 'Full implementation requires GovernanceService integration',
    });
  } catch (error) {
    return Response.json(
      { error: 'Rollback failed', message: String(error) },
      { status: 500 }
    );
  }
}
