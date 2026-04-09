import { describe, expect, it } from 'bun:test';
import { createServer } from '../http/server.ts';

describe('HTTP server', () => {
  it('serves /health and returns 404 for unknown routes', async () => {
    const server = await createServer({ port: 0 });
    const baseUrl = `http://127.0.0.1:${server.port}`;

    const health = await fetch(`${baseUrl}/health`);
    expect(health.status).toBe(200);

    const notFound = await fetch(`${baseUrl}/api/unknown`);
    expect(notFound.status).toBe(404);

    server.stop(true);
  });
});
