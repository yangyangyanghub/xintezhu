# Local Memory System Decisions

## Decision: One-Way Markdown Projection (V1)
- **Context**: Need to provide human-readable access to memory while maintaining data integrity.
- **Decision**: Implement a one-way projection from the SQLite database to Markdown files in `.memory/`.
- **Rationale**: 
    - Simplifies the V1 implementation by avoiding complex bidirectional sync/merge logic.
    - Ensures the database remains the single source of truth for the Memory Core service.
    - Allows for deterministic rebuilds of the knowledge base.
- **Consequences**: 
    - Manual edits to `.memory/*.md` are volatile and will be overwritten.
    - Users must use system tools (e.g., `remember`, `consolidate`) to mutate durable memory.

## Decision: Keep Classification Embedding Dependencies Optional (2026-04-10)
- **Context**: `ClassificationService` needs to persist embeddings during classification, but existing production/test call sites still construct it with only memory and ingestion repositories.
- **Decision**: Add `EmbeddingRepository` and `ProviderRouter` as optional constructor dependencies and gate embedding persistence behind their presence.
- **Rationale**:
    - Preserves backward compatibility for existing callers while enabling embedding persistence where the extra dependencies are available.
    - Keeps the classification pipeline resilient in keyword-only or degraded environments.
- **Consequences**:
    - Embedding persistence is opt-in until callers pass the new dependencies.
    - The service now treats embedding generation as a non-fatal side effect after active-memory promotion.

## Decision: Inject EmbeddingRepository Into RetrievalService (2026-04-10)
- **Context**: `semanticSearch()` had provider-based embedding generation but no repository access, so semantic mode always returned an empty array.
- **Decision**: Make `EmbeddingRepository` a required `RetrievalService` constructor dependency and use repository-backed similarity results as the semantic search source.
- **Rationale**:
    - Keeps cosine similarity logic in the repository where embeddings are already stored and queried.
    - Avoids duplicating vector ranking logic inside retrieval orchestration.
    - Preserves hybrid RRF merging by returning semantic results in the same `HybridSearchResult` shape as keyword results.
- **Consequences**:
    - All `RetrievalService` call sites must now pass an embedding repository.
    - Semantic retrieval still tolerates provider/repository failures by returning `[]`, but no longer behaves as an unimplemented stub.
