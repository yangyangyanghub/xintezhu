import { describe, expect, it, beforeAll, afterAll } from 'bun:test';
import { MemoryCoreService } from '../service/core.ts';
import { SQLiteMemoryRepository } from '../repository/index.ts';

describe('HTTP Operations API', () => {
  let service: MemoryCoreService;
  let baseUrl: string;
  let memoryRepo: SQLiteMemoryRepository;

  beforeAll(async () => {
    service = new MemoryCoreService({
      runtimeRoot: '.local-memory-test-ops',
      databasePath: ':memory:',
      enableProjection: false,
      projectionRoot: '.memory-test-ops',
    });
    await service.initialize();
    memoryRepo = new SQLiteMemoryRepository(service.getDatabase());
    
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

  async function createMemory(content: string, sourceEventId: string) {
    return memoryRepo.create({
      layer: 'episodic',
      type: 'habit',
      content,
      importance: 'medium',
      sourceEventId,
      workspace: 'test',
    });
  }

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
    expect(data.summary).toBeDefined();
    expect(data.summary.total).toBeDefined();
    expect(data.errors).toBeArray();
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
    expect(data.results).toBeArray();
    expect(data.totalProcessed).toBeDefined();
    expect(data.totalArchived).toBeDefined();
    expect(data.totalDeleted).toBeDefined();
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

  it('evaluates promotion eligibility via /api/promotions/evaluate', async () => {
    const memory = await createMemory('待评估的晋升记忆', 'evt-http-promotion-evaluate-001');

    const response = await fetch(`${baseUrl}/api/promotions/evaluate`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ memoryId: memory.id }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.eligible).toBeDefined();
    expect(data.scores).toBeDefined();
  });

  it('promotes a memory via /api/promotions/promote', async () => {
    const memory = await createMemory('待执行晋升的记忆', 'evt-http-promotion-promote-001');

    const response = await fetch(`${baseUrl}/api/promotions/promote`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ memoryId: memory.id, force: true }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.promoted).toBe(true);
    expect(data.toLayer).toBe('semantic');
  });

  it('creates and queries relations via relation endpoints', async () => {
    const source = await createMemory('关系源记忆', 'evt-http-relation-create-001');
    const target = await createMemory('关系目标记忆', 'evt-http-relation-create-002');

    const createResponse = await fetch(`${baseUrl}/api/relations`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        sourceId: source.id,
        targetId: target.id,
        relationType: 'extends',
        confidence: 0.8,
      }),
    });

    expect(createResponse.status).toBe(200);
    const created = await createResponse.json();
    expect(created.id).toBeDefined();

    const getResponse = await fetch(`${baseUrl}/api/relations/${source.id}`);

    expect(getResponse.status).toBe(200);
    const data = await getResponse.json();
    expect(data.relations).toHaveLength(1);
  });

  it('deactivates a relation via /api/relations/:id', async () => {
    const source = await createMemory('待停用关系源记忆', 'evt-http-relation-delete-001');
    const target = await createMemory('待停用关系目标记忆', 'evt-http-relation-delete-002');

    const createResponse = await fetch(`${baseUrl}/api/relations`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        sourceId: source.id,
        targetId: target.id,
        relationType: 'relates',
      }),
    });
    const created = await createResponse.json();

    const deleteResponse = await fetch(`${baseUrl}/api/relations/${created.id}`, {
      method: 'DELETE',
    });

    expect(deleteResponse.status).toBe(200);
    const deleted = await deleteResponse.json();
    expect(deleted.success).toBe(true);

    const getResponse = await fetch(`${baseUrl}/api/relations/${source.id}`);
    const data = await getResponse.json();
    expect(data.relations).toHaveLength(0);
  });
});
