import type { IngestGateway } from '../ingest/gateway.ts';

export interface HttpDeps {
  ingestGateway: IngestGateway;
}

export async function handleIngest(req: Request, deps: HttpDeps) {
  try {
    const body = await req.json();
    const result = await deps.ingestGateway.ingestEvent(body);
    return Response.json(result, { status: result.accepted ? 200 : 400 });
  } catch (error) {
    return Response.json(
      { error: 'Invalid request', message: String(error) },
      { status: 400 }
    );
  }
}

export async function handleGetEventStatus(req: Request, deps: HttpDeps) {
  const url = new URL(req.url);
  const eventId = url.searchParams.get('eventId');
  
  if (!eventId) {
    return Response.json({ error: 'eventId required' }, { status: 400 });
  }
  
  const status = await deps.ingestGateway.getEventStatus(eventId);
  return Response.json(status);
}

export async function handleReady(_req: Request, deps: HttpDeps) {
  const readiness = await deps.ingestGateway.isReady();
  return Response.json(readiness, { status: readiness.ready ? 200 : 503 });
}

export async function handleGetBatchEvents(req: Request, deps: HttpDeps) {
  const url = new URL(req.url);
  const batchId = url.searchParams.get('batchId');
  
  if (!batchId) {
    return Response.json({ error: 'batchId required' }, { status: 400 });
  }
  
  const events = await deps.ingestGateway.getBatchEvents(batchId);
  return Response.json(events);
}
