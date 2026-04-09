export function buildRoutes() {
  return {
    '/health': {
      GET: () => Response.json({ status: 'ok' }),
    },
  };
}
