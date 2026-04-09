# Memory Versioning & State Semantics

## Identity Model

### Memory Identity
Each memory has a unique identity composed of:
- `memoryId`: UUID - Primary identifier
- `version`: Integer - Monotonic version counter
- `sequence`: Integer - Global sequence number for ordering

### Memory Lineage
- **Parent**: Previous version of same logical memory (for updates)
- **Children**: Subsequent versions that supersede this memory
- **Relations**: Linked memories (extends, derives, conflicts)

## State Definitions

### new
- Initial state upon ingestion
- Not yet classified
- Not visible in retrieval
- **Transition to**: active (after classification)

### active
- Currently valid memory
- Available for retrieval
- Can be promoted to semantic/core
- **Transition to**: superseded, forgotten, archived

### superseded
- Replaced by newer version
- Kept for audit/provenance
- Hidden from default retrieval
- **Transition to**: reverted (rollback to this version)

### forgotten
- Explicitly removed by user
- Content obscured but metadata retained
- Not visible in retrieval
- **Transition to**: reverted (restore)

### archived
- Automatically expired per retention policy
- Kept for compliance but not active
- Not visible in retrieval
- **Transition to**: reverted (if needed)

### reverted
- Rolled back to previous state
- Audit trail preserved
- Previous active version restored
- **Transition to**: active (after rollback completion)

## Rollback Semantics

### Rollback Units
1. **Single Memory**: Revert one specific memory
2. **Ingestion Batch**: Revert all memories from a batch
3. **Time Range**: Revert all memories in time window

### Rollback Process
1. Create rollback audit record
2. Mark target memories as reverted
3. Restore previous active versions (if any)
4. Update projections
5. Emit rollback event

### Rollback Constraints
- Cannot rollback if would violate referential integrity
- Cannot rollback audit records themselves
- Rollback operations are themselves auditable
- Maximum rollback window: 30 days (configurable)

## Version Chain Example

```
Memory A v1 (superseded) ← derives ← Memory B v1 (active)
         ↓
Memory A v2 (superseded) ← updates ← Memory A v3 (active)
         ↓
    [rollback to v1]
         ↓
Memory A v1 (active again)
Memory A v3 (reverted)
```
