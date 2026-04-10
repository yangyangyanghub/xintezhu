# Local Memory System Learnings

## Projection Policy (V1)
- **One-Way Truth**: Established that the database is the sole source of truth. Markdown projection is for consumption only.
- **Deterministic Rebuild**: Projection must be reproducible from the database state.
- **Layer Mapping**: 
    - Core layer (`.memory/core/`) maps to singleton files (identity, preferences, habits, workflows).
    - Semantic layer (`.memory/semantic/`) maps to itemized files (projects, decisions, patterns, error-solutions).
- **Manual Edits**: Explicitly documented as non-authoritative and volatile in V1 to prevent split-brain scenarios.
- **Noise Control**: Working and episodic layers are excluded from durable projection to maintain knowledge quality.
