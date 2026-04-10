import { describe, expect, it, beforeAll, afterAll } from 'bun:test';
import { MemoryCoreService } from '../service/core.ts';
import { createServer } from '../http/server.ts';

describe('HTTP server', () => {
  let service: MemoryCoreService;
  let server: { port: number; stop: (force?: boolean) => void };
  let baseUrl: string;
  
  beforeAll(async () => {
    service = new MemoryCoreService({
      runtimeRoot: '.local-memory-test-server',
      databasePath: ':memory:',
      enableProjection: false,
      projectionRoot: '.memory-test-server',
    });
    await service.initialize();
    
    server = createServer({ port: 0, deps: service.getRouteDeps() });
    baseUrl = `http://127.0.0.1:${server.port}`;
  });

  afterAll(async () => {
    server.stop(true);
    await service.dispose();
  });

  it('serves /health and /ready, then returns 404 for unknown routes', async () => {
    const health = await fetch(`${baseUrl}/health`);
    expect(health.status).toBe(200);
    expect(await health.json()).toEqual({ status: 'ok' });

    const ready = await fetch(`${baseUrl}/ready`);
    expect(ready.status).toBe(200);
    expect((await ready.json()).ready).toBe(true);

    const notFound = await fetch(`${baseUrl}/api/unknown`);
    expect(notFound.status).toBe(404);
  });

  it('keeps /health alive while /ready reports ingest unavailability', async () => {
    const degradedServer = createServer({
      port: 0,
      deps: {
        ingestGateway: {
          isReady: async () => ({
            ready: false,
            checks: {
              database: { status: 'error', message: 'database unavailable' },
              classifier: { status: 'ok' },
            },
            timestamp: new Date().toISOString(),
          }),
        } as never,
        retrieval: {} as never,
        contextAssembly: {} as never,
        service: {} as never,
      },
    });

    const degradedBaseUrl = `http://127.0.0.1:${degradedServer.port}`;
    const health = await fetch(`${degradedBaseUrl}/health`);
    const ready = await fetch(`${degradedBaseUrl}/ready`);

    expect(health.status).toBe(200);
    expect((await health.json()).status).toBe('ok');
    expect(ready.status).toBe(503);
    expect((await ready.json()).ready).toBe(false);

    degradedServer.stop(true);
  });
});
