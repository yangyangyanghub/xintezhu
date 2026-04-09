# Repository Boundaries

## Architecture Principle

**Separation of Concerns**: Repository layer isolates persistence logic from business logic.

## Repository Interfaces

### MemoryRepository
Responsible for: Memory entity CRUD operations

```typescript
interface MemoryRepository {
  // Create
  create(memory: CreateMemoryInput): Promise<Memory>;
  
  // Read
  findById(id: string): Promise<Memory | null>;
  findByLayer(layer: MemoryLayer, status?: MemoryStatus): Promise<Memory[]>;
  findByType(type: MemoryType, options?: QueryOptions): Promise<Memory[]>;
  searchByKeyword(query: string, filters?: SearchFilters): Promise<Memory[]>;
  
  // Update
  update(id: string, updates: UpdateMemoryInput): Promise<Memory>;
  updateStatus(id: string, status: MemoryStatus, auditContext: AuditContext): Promise<Memory>;
  
  // Delete (soft only - never hard delete)
  markForgotten(id: string, reason: string): Promise<Memory>;
}
```

### RelationRepository
Responsible for: Memory graph edges

```typescript
interface RelationRepository {
  createRelation(input: CreateRelationInput): Promise<Relation>;
  findBySource(sourceId: string): Promise<Relation[]>;
  findByTarget(targetId: string): Promise<Relation[]>;
  findByType(type: RelationType): Promise<Relation[]>;
  deactivateRelation(id: string): Promise<void>;
  
  // Supersession logic
  createSupersession(oldMemoryId: string, newMemoryId: string): Promise<Relation>;
}
```

### IngestionRepository
Responsible for: Event persistence

```typescript
interface IngestionRepository {
  createEvent(event: IngestionEventInput): Promise<IngestionEvent>;
  findByBatch(batchId: string): Promise<IngestionEvent[]>;
  updateStatus(id: string, status: IngestionStatus, error?: ErrorDetail): Promise<void>;
  markProcessed(id: string, memoryId?: string): Promise<void>;
  findPending(): Promise<IngestionEvent[]>;
}
```

### AuditRepository
Responsible for: Audit trail

```typescript
interface AuditRepository {
  record(action: AuditAction): Promise<AuditRecord>;
  findByEntity(entityType: string, entityId: string): Promise<AuditRecord[]>;
  findByBatch(batchId: string): Promise<AuditRecord[]>;
  
  // Rollback support
  getStateBefore(entityId: string, timestamp: string): Promise<AuditRecord | null>;
}
```

### EmbeddingRepository
Responsible for: Vector cache

```typescript
interface EmbeddingRepository {
  save(memoryId: string, vector: Float32Array, modelInfo: ModelInfo): Promise<void>;
  findByMemory(memoryId: string): Promise<Embedding | null>;
  searchSimilar(vector: Float32Array, limit: number): Promise<SimilarityResult[]>;
  deleteByMemory(memoryId: string): Promise<void>;
}
```

## What's NOT in Repositories

Repositories do NOT contain:
- Classification logic (belongs in Classifier service)
- Promotion logic (belongs in PromotionEngine)
- Projection/Markdown writes (belongs in ProjectionEngine)
- Business rules about what to store (belongs in Policy layer)
- Model provider calls (belongs in ProviderRouter)

## Transaction Boundaries

Repositories support transactions via:
```typescript
await repository.withTransaction(async (trx) => {
  const memory = await trx.memories.create(...);
  await trx.relations.createRelation(...);
  await trx.audit.record(...);
});
```

## Repository vs Service Layer

| Layer | Responsibility |
|-------|---------------|
| Repository | How to persist/retrieve |
| Service | What to do with data |
| Policy | Rules for decisions |
| Adapter | Protocol translation |
