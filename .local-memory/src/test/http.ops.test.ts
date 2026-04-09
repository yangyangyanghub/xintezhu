import { describe, expect, it, beforeAll, afterAll } from 'bun:test';
import { MemoryCoreService } from '../service/core.ts';

describe('HTTP Operations API', () => {
  let service: MemoryCoreService;
  let baseUrl: string;

  beforeAll(async () => {
    service = new MemoryCoreService({
      runtimeRoot: '.local-memory-test-ops',
      databasePath: ':memory:',
      enableProjection: false,
      projectionRoot: '.memory-test-ops',
    });
    await service.initialize();
    
    // Start HTTP server on ephemeral port with deps
    const server = await import('../http/server.ts');
    const srv = server.createServer({ port: 0, deps: service.getRouteDeps() });
    baseUrl = `http://127.0.0.1:${srv.port}`;
    
    // Store server for cleanup
    (globalThis as any).__testServerOps = srv;
  });

  afterAll(async () => {
    const srv = (globalThis as any).__testServerOps;
    if (srv) {
      srv.stop(true);
    }
    await service.dispose();
  });

  it('returns detailed status from /api/status', async () => {
    const response = await fetch(`${baseUrl}/api/status`);
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.health).toBeDefined();
    expect(data.stats).toBeDefined();
    expect(data.timestamp).toBeDefined();
  });

  it('triggers projection rebuild via /api/projection/rebuild', async () => {
    const response = await fetch(`${baseUrl}/api/projection/rebuild`, { 
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({}),
    });
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
  });

  it('verifies projection via /api/projection/verify', async () => {
    const response = await fetch(`${baseUrl}/api/projection/verify`);
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.valid).toBeDefined();
    expect(data.issues).toBeDefined();
  });

  it('triggers cleanup via /api/cleanup/run', async () => {
    const response = await fetch(`${baseUrl}/api/cleanup/run`, { 
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({}),
    });
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
  });

  it('handles rollback via /api/rollback/batch', async () => {
    const response = await fetch(`${baseUrl}/api/rollback/batch`, { 
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ batchId: 'test-batch-001' }),
    });
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
  });

  it('returns 400 for rollback without batchId', async () => {
    const response = await fetch(`${baseUrl}/api/rollback/batch`, { 
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({}),
    });
    
    expect(response.status).toBe(400);
  });
});
