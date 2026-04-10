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
