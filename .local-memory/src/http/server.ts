import { buildRoutes } from './routes.ts';

export function createServer(options: { port?: number }) {
  const server = Bun.serve({
    port: options.port ?? 37777,
    routes: buildRoutes(),
    fetch() {
      return Response.json({ error: 'Not Found' }, { status: 404 });
    },
  });

  return server;
}
