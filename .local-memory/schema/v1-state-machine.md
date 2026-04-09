# State Machine Reference

## Memory States

```
┌─────────┐    classify     ┌─────────┐    supersede    ┌───────────┐
│   new   │ ───────────────→│  active │ ──────────────→│superseded │
└─────────┘                 └────┬────┘                └───────────┘
                                 │
           ┌─────────────────────┼─────────────────────┐
           │                     │                     │
           ▼                     ▼                     ▼
     ┌──────────┐         ┌──────────┐         ┌──────────┐
     │forgotten │         │ archived │         │ reverted │
     └──────────┘         └──────────┘         └──────────┘
           ▲                     ▲                     │
           │                     │                     │
           └─────────────────────┴─────────────────────┘
                              rollback
```

## State Transitions

| From | To | Trigger | Reversible |
|------|----|---------|------------|
| new | active | classification complete | No |
| active | superseded | new version ingested | Yes (rollback) |
| active | forgotten | explicit forget command | Yes (restore) |
| active | archived | retention policy expiry | Yes (restore) |
| any | reverted | rollback operation | No (new state) |
| superseded | active | rollback | N/A |
| forgotten | active | restore | N/A |
| archived | active | restore | N/A |

## Status Semantics

### active
- **Retrieval**: Included by default
- **Projection**: Eligible if confidence ≥ threshold
- **Relations**: Can be source/target
- **Promotion**: Eligible

### superseded
- **Retrieval**: Excluded by default
- **Projection**: Removed (but historical versions kept)
- **Relations**: Preserved for lineage
- **Promotion**: Not eligible

### forgotten
- **Retrieval**: Never included
- **Projection**: Removed
- **Relations**: Deactivated
- **Promotion**: Not eligible

### archived
- **Retrieval**: Not included
- **Projection**: Not included
- **Relations**: Preserved but inactive
- **Promotion**: Not eligible

### reverted
- **Retrieval**: Not included
- **Projection**: Not included
- **Relations**: Rolled back to previous state
- **Promotion**: Not eligible

## Rollback Mechanics

### Memory Rollback
1. Create rollback audit record
2. Set current version status = reverted
3. Restore previous version status = active
4. Update projections

### Batch Rollback
1. Identify all memories in batch
2. Create rollback audit record for batch
3. For each memory: perform individual rollback
4. Rollback any relations created in batch
5. Rollback any promotions from batch

### Rollback Constraints
- Cannot rollback if target state would conflict
- Cannot rollback if memory has been promoted (semantic/core)
- Rollback operations are themselves auditable
