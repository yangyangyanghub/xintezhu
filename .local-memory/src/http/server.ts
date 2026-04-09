import { buildRoutes, type RouteDeps } from './routes.ts';

export function createServer(options: { port?: number; deps: RouteDeps }) {
  const server = Bun.serve({
    port: options.port ?? 37777,
    routes: buildRoutes(options.deps),
    fetch() {
      return Response.json({ error: 'Not Found' }, { status: 404 });
    },
  });

  return server;
}
