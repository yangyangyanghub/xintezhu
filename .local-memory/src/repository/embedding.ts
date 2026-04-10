import { Database } from 'bun:sqlite';

export interface ModelInfo {
  name: string;
  version: string;
  dimensions: number;
}

export interface Embedding {
  id: string;
  memoryId: string;
  embedding: Float32Array;
  modelName: string;
  modelVersion: string;
  dimensions: number;
  createdAt: string;
}

export interface StoredEmbedding {
  memoryId: string;
  embedding: Float32Array;
  modelName: string;
  modelVersion: string;
  dimensions: number;
}

export interface SimilarityResult {
  memoryId: string;
  similarity: number;
  embedding: Float32Array;
}

export interface EmbeddingRepository {
  save(memoryId: string, vector: Float32Array, modelInfo: ModelInfo): Promise<void>;
  findByMemory(memoryId: string): Promise<Embedding | null>;
  listByMemoryIds(memoryIds: string[]): Promise<StoredEmbedding[]>;
  searchSimilar(vector: Float32Array, limit: number): Promise<SimilarityResult[]>;
  deleteByMemory(memoryId: string): Promise<void>;
}

export class SQLiteEmbeddingRepository implements EmbeddingRepository {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async save(memoryId: string, vector: Float32Array, modelInfo: ModelInfo): Promise<void> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    // Convert Float32Array to Buffer for SQLite BLOB storage
    const embeddingBuffer = Buffer.from(vector.buffer);

    this.db.run(
      `INSERT INTO embeddings (id, memory_id, embedding, model_name, model_version, dimensions, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(memory_id) DO UPDATE SET
       embedding = excluded.embedding,
       model_name = excluded.model_name,
       model_version = excluded.model_version,
       dimensions = excluded.dimensions,
       created_at = excluded.created_at`,
      [id, memoryId, embeddingBuffer, modelInfo.name, modelInfo.version, modelInfo.dimensions, now]
    );
  }

  async findByMemory(memoryId: string): Promise<Embedding | null> {
    const row = this.db.query('SELECT * FROM embeddings WHERE memory_id = ?').get(memoryId) as Record<string, unknown> | null;
    return row ? this.mapRowToEmbedding(row) : null;
  }

  async listByMemoryIds(memoryIds: string[]): Promise<StoredEmbedding[]> {
    if (memoryIds.length === 0) return [];

    const placeholders = memoryIds.map(() => '?').join(',');
    const rows = this.db.query(`SELECT memory_id, embedding, model_name, model_version, dimensions 
                                FROM embeddings WHERE memory_id IN (${placeholders})`)
                      .all(...memoryIds) as Record<string, unknown>[];

    return rows.map(row => ({
      memoryId: row.memory_id as string,
      embedding: this.bufferToFloat32Array(row.embedding as Buffer),
      modelName: row.model_name as string,
      modelVersion: row.model_version as string,
      dimensions: row.dimensions as number,
    }));
  }

  async searchSimilar(vector: Float32Array, limit: number): Promise<SimilarityResult[]> {
    // V1: Compute cosine similarity in-process
    // Get all embeddings from database
    const rows = this.db.query('SELECT memory_id, embedding FROM embeddings').all() as Record<string, unknown>[];

    const results: SimilarityResult[] = [];
    const queryVector = vector;

    for (const row of rows) {
      const embedding = this.bufferToFloat32Array(row.embedding as Buffer);
      const similarity = this.cosineSimilarity(queryVector, embedding);

      results.push({
        memoryId: row.memory_id as string,
        similarity,
        embedding,
      });
    }

    // Sort by similarity (descending) and limit
    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  async deleteByMemory(memoryId: string): Promise<void> {
    this.db.run('DELETE FROM embeddings WHERE memory_id = ?', [memoryId]);
  }

  private mapRowToEmbedding(row: Record<string, unknown>): Embedding {
    return {
      id: row.id as string,
      memoryId: row.memory_id as string,
      embedding: this.bufferToFloat32Array(row.embedding as Buffer),
      modelName: row.model_name as string,
      modelVersion: row.model_version as string,
      dimensions: row.dimensions as number,
      createdAt: row.created_at as string,
    };
  }

  private bufferToFloat32Array(buffer: Buffer): Float32Array {
    // Convert Buffer back to Float32Array
    return new Float32Array(buffer.buffer, buffer.byteOffset, buffer.byteLength / 4);
  }

  private cosineSimilarity(a: Float32Array, b: Float32Array): number {
    // Cosine similarity: dot(a,b) / (|a| * |b|)
    if (a.length !== b.length) {
      throw new Error(`Vector dimension mismatch: ${a.length} vs ${b.length}`);
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    if (normA === 0 || normB === 0) {
      return 0; // Handle zero vectors
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}
