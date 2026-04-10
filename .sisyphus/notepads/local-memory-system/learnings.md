# Local Memory System Learnings

## Projection Policy (V1)
- **One-Way Truth**: Established that the database is the sole source of truth. Markdown projection is for consumption only.
- **Deterministic Rebuild**: Projection must be reproducible from the database state.
- **Layer Mapping**: 
    - Core layer (`.memory/core/`) maps to singleton files (identity, preferences, habits, workflows).
    - Semantic layer (`.memory/semantic/`) maps to itemized files (projects, decisions, patterns, error-solutions).
- **Manual Edits**: Explicitly documented as non-authoritative and volatile in V1 to prevent split-brain scenarios.
- **Noise Control**: Working and episodic layers are excluded from durable projection to maintain knowledge quality.

## Classification Embedding Persistence (2026-04-10)
- `ClassificationService` can now accept optional `EmbeddingRepository` and `ProviderRouter` dependencies without breaking older two-argument call sites.
- Embeddings should be generated only after the memory has been promoted to `active`, and only when an embedding provider exists and `isHealthy()` returns true.
- Embedding generation must stay best-effort: provider/embed/save failures are logged and must not block `markProcessed()` or successful classification.
