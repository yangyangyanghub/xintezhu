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

  it('serves /health and returns 404 for unknown routes', async () => {
    const health = await fetch(`${baseUrl}/health`);
    expect(health.status).toBe(200);

    const notFound = await fetch(`${baseUrl}/api/unknown`);
    expect(notFound.status).toBe(404);
  });
});
