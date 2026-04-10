import { describe, expect, it, beforeAll, afterAll } from 'bun:test';
import { createTestDatabase } from './helpers.ts';
import type { Database } from 'bun:sqlite';
import { MemoryCoreService } from '../service/core.ts';

describe('Ingest and Search API', () => {
  let service: MemoryCoreService;
  let baseUrl: string;

  beforeAll(async () => {
    service = new MemoryCoreService({
      runtimeRoot: '.local-memory-test-http',
      databasePath: ':memory:',
      enableProjection: false,
      projectionRoot: '.memory-test-http',
    });
    await service.initialize();
    
    // Start HTTP server on ephemeral port with deps
    const server = await import('../http/server.ts');
    const srv = server.createServer({ port: 0, deps: service.getRouteDeps() });
    baseUrl = `http://127.0.0.1:${srv.port}`;
    
    // Store server for cleanup
    (globalThis as any).__testServer = srv;
  });

  afterAll(async () => {
    const srv = (globalThis as any).__testServer;
    if (srv) {
      srv.stop(true);
    }
    await service.dispose();
  });

  it('accepts /api/ingest and returns ingestion ids', async () => {
    const response = await fetch(`${baseUrl}/api/ingest`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        eventId: 'evt-api-001',
        batchId: 'batch-api-001',
        eventType: 'message.updated',
        sourceType: 'manual',
        sourceRef: 'api-test',
        payload: { messageId: 'msg-api-001', role: 'user', content: '来自 API 的记忆' },
      }),
    });

    expect(response.status).toBe(200);
  });

  it('queries ingest status by business eventId instead of internal ingestion id', async () => {
    const ingestResponse = await fetch(`${baseUrl}/api/ingest`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        eventId: 'evt-status-001',
        batchId: 'batch-status-001',
        eventType: 'message.updated',
        sourceType: 'manual',
        sourceRef: 'api-test-status',
        payload: { messageId: 'msg-status-001', role: 'user', content: '状态查询测试' },
      }),
    });

    const ingestBody = await ingestResponse.json();
    expect(ingestResponse.status).toBe(200);

    const statusResponse = await fetch(`${baseUrl}/api/ingest/status?eventId=evt-status-001`);
    const statusBody = await statusResponse.json();

    expect(statusResponse.status).toBe(200);
    expect(statusBody.eventId).toBe('evt-status-001');
    expect(statusBody.id).toBe(ingestBody.ingestionEventId);

    const wrongIdResponse = await fetch(`${baseUrl}/api/ingest/status?eventId=${ingestBody.ingestionEventId}`);
    expect(await wrongIdResponse.json()).toBeNull();
  });

  it('returns search results from /api/search', async () => {
    const response = await fetch(`${baseUrl}/api/search`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query: 'API 的记忆', mode: 'keyword' }),
    });

    expect(response.status).toBe(200);
    expect((await response.json()).results.length).toBeGreaterThan(0);
  });

  it('returns context assembly from /api/context', async () => {
    const response = await fetch(`${baseUrl}/api/context`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query: 'API 的记忆', workspace: 'test' }),
    });

    expect(response.status).toBe(200);
  });
});
