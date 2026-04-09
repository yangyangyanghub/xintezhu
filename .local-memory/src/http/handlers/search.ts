import type { RetrievalService } from '../retrieval/service.ts';
import type { ContextAssemblyService } from '../context/assembly.ts';

export interface HttpDeps {
  retrieval: RetrievalService;
  contextAssembly: ContextAssemblyService;
}

export async function handleSearch(req: Request, deps: HttpDeps) {
  try {
    const body = await req.json();
    const result = await deps.retrieval.search(
      body.query,
      body.mode ?? 'hybrid',
      body.filters,
      body.options
    );
    return Response.json(result);
  } catch (error) {
    return Response.json(
      { error: 'Search failed', message: String(error) },
      { status: 500 }
    );
  }
}

export async function handleContext(req: Request, deps: HttpDeps) {
  try {
    const body = await req.json();
    const assembly = await deps.contextAssembly.assemble(body.query, body.workspace);
    return Response.json(assembly);
  } catch (error) {
    return Response.json(
      { error: 'Context assembly failed', message: String(error) },
      { status: 500 }
    );
  }
}
