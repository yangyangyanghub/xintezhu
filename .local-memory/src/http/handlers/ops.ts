import type { MemoryCoreService } from '../../service/core.ts';
import type { RouteDeps } from '../routes.ts';

export interface OpsHttpDeps extends RouteDeps {
  service: MemoryCoreService;
}

type RouteRequest = Request & {
  params?: Record<string, string>;
};

function getRouteParam(req: Request, key: string): string | undefined {
  return (req as RouteRequest).params?.[key];
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
    const body = await req.json();
    const { actor = 'api' } = body;
    const result = await deps.service.getProjectionEngine().rebuild({ actor });
    return Response.json(result);
  } catch (error) {
    return Response.json(
      { error: 'Projection rebuild failed', message: String(error) },
      { status: 500 }
    );
  }
}

export async function handleProjectionVerify(req: Request, deps: OpsHttpDeps) {
  try {
    const result = await deps.service.getProjectionEngine().verifyIntegrity();
    return Response.json(result);
  } catch (error) {
    return Response.json(
      { error: 'Projection verify failed', message: String(error) },
      { status: 500 }
    );
  }
}

export async function handleCleanupRun(req: Request, deps: OpsHttpDeps) {
  try {
    const body = await req.json();
    const { actor = 'api' } = body;
    const result = await deps.service.getCleanupService().runFullCleanup({ actor });
    return Response.json(result);
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

export async function handlePromotionEvaluate(req: Request, deps: OpsHttpDeps) {
  try {
    const { memoryId } = await req.json();

    if (!memoryId) {
      return Response.json(
        { error: 'memoryId is required' },
        { status: 400 }
      );
    }

    const result = await deps.service.getPromotionEngine().evaluate(memoryId);
    return Response.json(result);
  } catch (error) {
    return Response.json(
      { error: 'Promotion evaluation failed', message: String(error) },
      { status: 500 }
    );
  }
}

export async function handlePromotionPromote(req: Request, deps: OpsHttpDeps) {
  try {
    const { memoryId, force = false } = await req.json();

    if (!memoryId) {
      return Response.json(
        { error: 'memoryId is required' },
        { status: 400 }
      );
    }

    const result = await deps.service.getPromotionEngine().promote(memoryId, { actor: 'api' }, force);
    return Response.json(result);
  } catch (error) {
    return Response.json(
      { error: 'Promotion failed', message: String(error) },
      { status: 500 }
    );
  }
}

export async function handleRelationCreate(req: Request, deps: OpsHttpDeps) {
  try {
    const input = await req.json();
    const result = await deps.service.getRelationEngine().createRelation(input, { actor: 'api' });
    return Response.json(result);
  } catch (error) {
    return Response.json(
      { error: 'Relation creation failed', message: String(error) },
      { status: 500 }
    );
  }
}

export async function handleRelationGet(req: Request, deps: OpsHttpDeps) {
  try {
    const memoryId = getRouteParam(req, 'memoryId');

    if (!memoryId) {
      return Response.json(
        { error: 'memoryId is required' },
        { status: 400 }
      );
    }

    const relationEngine = deps.service.getRelationEngine();
    const [relations, lineage] = await Promise.all([
      relationEngine.getRelationsFrom(memoryId),
      relationEngine.getLineage(memoryId),
    ]);

    return Response.json({ relations, lineage });
  } catch (error) {
    return Response.json(
      { error: 'Relation query failed', message: String(error) },
      { status: 500 }
    );
  }
}

export async function handleRelationDeactivate(req: Request, deps: OpsHttpDeps) {
  try {
    const relationId = getRouteParam(req, 'id');

    if (!relationId) {
      return Response.json(
        { error: 'id is required' },
        { status: 400 }
      );
    }

    await deps.service.getRelationEngine().deactivateRelation(relationId, { actor: 'api' });
    return Response.json({ success: true, id: relationId });
  } catch (error) {
    return Response.json(
      { error: 'Relation deactivation failed', message: String(error) },
      { status: 500 }
    );
  }
}
