// Repository index - exports all repository implementations

export { SQLiteMemoryRepository, type MemoryRepository } from './memory.ts';
export { SQLiteIngestionRepository, type IngestionRepository } from './ingestion.ts';
export { SQLiteAuditRepository, type AuditRepository } from './audit.ts';
export { SQLiteEmbeddingRepository, type EmbeddingRepository, type ModelInfo, type Embedding, type StoredEmbedding, type SimilarityResult } from './embedding.ts';
export { SQLitePromotionRepository, type PromotionRepository } from './promotion.ts';
