// @bun
// .local-memory/src/service/core.ts
import { Database } from "bun:sqlite";
import { existsSync, mkdirSync } from "fs";
import { join, resolve } from "path";

// .local-memory/src/repository/memory.ts
class SQLiteMemoryRepository {
  db;
  constructor(db) {
    this.db = db;
  }
  async create(input) {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const contentHash = await this.hashContent(input.content);
    const memory = {
      id,
      version: 1,
      parentId: null,
      layer: input.layer,
      type: input.type,
      status: "new",
      content: input.content,
      contentHash,
      confidence: 0,
      importance: input.importance || "medium",
      sourceEventId: input.sourceEventId || null,
      workspace: input.workspace || null,
      createdAt: now,
      updatedAt: now,
      expiresAt: input.expiresAt || null
    };
    this.db.run(`INSERT INTO memories (id, version, layer, type, status, content, content_hash, 
       confidence, importance, source_event_id, workspace, created_at, updated_at, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
      memory.id,
      memory.version,
      memory.layer,
      memory.type,
      memory.status,
      memory.content,
      memory.contentHash,
      memory.confidence,
      memory.importance,
      memory.sourceEventId,
      memory.workspace,
      memory.createdAt,
      memory.updatedAt,
      memory.expiresAt
    ]);
    return memory;
  }
  async findById(id) {
    const row = this.db.query("SELECT * FROM memories WHERE id = ?").get(id);
    return row ? this.mapRowToMemory(row) : null;
  }
  async findBySourceEventId(sourceEventId) {
    const row = this.db.query("SELECT * FROM memories WHERE source_event_id = ?").get(sourceEventId);
    return row ? this.mapRowToMemory(row) : null;
  }
  async findByLayer(layer, status) {
    let sql = "SELECT * FROM memories WHERE layer = ?";
    const params = [layer];
    if (status) {
      sql += " AND status = ?";
      params.push(status);
    }
    sql += " ORDER BY created_at DESC";
    const rows = this.db.query(sql).all(...params);
    return rows.map((row) => this.mapRowToMemory(row));
  }
  async findByType(type, options) {
    let sql = "SELECT * FROM memories WHERE type = ?";
    const params = [type];
    sql += " ORDER BY created_at DESC";
    if (options?.limit) {
      sql += ` LIMIT ${options.limit}`;
      if (options.offset) {
        sql += ` OFFSET ${options.offset}`;
      }
    }
    const rows = this.db.query(sql).all(...params);
    return rows.map((row) => this.mapRowToMemory(row));
  }
  async searchByKeyword(query, filters, options) {
    let sql = "SELECT * FROM memories m WHERE m.content LIKE ?";
    const params = [`%${query}%`];
    if (filters?.layers?.length) {
      sql += ` AND m.layer IN (${filters.layers.map(() => "?").join(",")})`;
      params.push(...filters.layers);
    }
    if (filters?.types?.length) {
      sql += ` AND m.type IN (${filters.types.map(() => "?").join(",")})`;
      params.push(...filters.types);
    }
    if (filters?.status?.length) {
      sql += ` AND m.status IN (${filters.status.map(() => "?").join(",")})`;
      params.push(...filters.status);
    } else {
      sql += ` AND m.status = 'active'`;
    }
    sql += " ORDER BY m.created_at DESC";
    if (options?.limit) {
      sql += ` LIMIT ${options.limit}`;
    }
    const rows = this.db.query(sql).all(...params);
    return rows.map((row) => this.mapRowToMemory(row));
  }
  async update(id, updates) {
    const existing = await this.findById(id);
    if (!existing)
      throw new Error(`Memory not found: ${id}`);
    const now = new Date().toISOString();
    const contentHash = updates.content ? await this.hashContent(updates.content) : existing.contentHash;
    this.db.run(`UPDATE memories SET 
       content = COALESCE(?, content),
       content_hash = COALESCE(?, content_hash),
       confidence = COALESCE(?, confidence),
       importance = COALESCE(?, importance),
       status = COALESCE(?, status),
       updated_at = ?
       WHERE id = ?`, [updates.content, contentHash, updates.confidence, updates.importance, updates.status, now, id]);
    return this.findById(id);
  }
  async updateStatus(id, status) {
    return this.update(id, { status });
  }
  async markForgotten(id, reason) {
    return this.updateStatus(id, "forgotten");
  }
  mapRowToMemory(row) {
    return {
      id: row.id,
      version: row.version,
      parentId: row.parent_id,
      layer: row.layer,
      type: row.type,
      status: row.status,
      content: row.content,
      contentHash: row.content_hash,
      confidence: row.confidence,
      importance: row.importance,
      sourceEventId: row.source_event_id,
      workspace: row.workspace,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      expiresAt: row.expires_at
    };
  }
  async hashContent(content) {
    const encoder = new TextEncoder;
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }
}
// .local-memory/src/repository/ingestion.ts
class SQLiteIngestionRepository {
  db;
  constructor(db) {
    this.db = db;
  }
  async createEvent(input) {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const payloadStr = JSON.stringify(input.payload);
    const payloadHash = await this.hashString(payloadStr);
    const event = {
      id,
      eventId: input.eventId,
      batchId: input.batchId,
      eventType: input.eventType,
      sourceType: input.sourceType,
      sourceRef: input.sourceRef,
      workspace: input.workspace || null,
      payload: input.payload,
      payloadHash,
      status: "pending",
      error: null,
      processedAt: null,
      createdAt: now
    };
    this.db.run(`INSERT INTO ingestion_events (id, event_id, batch_id, event_type, source_type, source_ref,
       workspace, payload, payload_hash, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
      id,
      event.eventId,
      event.batchId,
      event.eventType,
      event.sourceType,
      event.sourceRef,
      event.workspace,
      payloadStr,
      payloadHash,
      event.status,
      event.createdAt
    ]);
    return event;
  }
  async findByBatch(batchId) {
    const rows = this.db.query("SELECT * FROM ingestion_events WHERE batch_id = ? ORDER BY created_at").all(batchId);
    return rows.map((row) => this.mapRowToEvent(row));
  }
  async findById(id) {
    const row = this.db.query("SELECT * FROM ingestion_events WHERE id = ?").get(id);
    return row ? this.mapRowToEvent(row) : null;
  }
  async updateStatus(id, status, error) {
    const errorStr = error ? JSON.stringify(error) : null;
    this.db.run("UPDATE ingestion_events SET status = ?, error = ? WHERE id = ?", [status, errorStr, id]);
  }
  async markProcessed(id, memoryId) {
    const now = new Date().toISOString();
    this.db.run("UPDATE ingestion_events SET status = ?, processed_at = ? WHERE id = ?", ["processed", now, id]);
  }
  async findPending(limit = 100) {
    const rows = this.db.query("SELECT * FROM ingestion_events WHERE status = ? ORDER BY created_at LIMIT ?").all("pending", limit);
    return rows.map((row) => this.mapRowToEvent(row));
  }
  mapRowToEvent(row) {
    return {
      id: row.id,
      eventId: row.event_id,
      batchId: row.batch_id,
      eventType: row.event_type,
      sourceType: row.source_type,
      sourceRef: row.source_ref,
      workspace: row.workspace,
      payload: JSON.parse(row.payload),
      payloadHash: row.payload_hash,
      status: row.status,
      error: row.error ? JSON.parse(row.error) : null,
      processedAt: row.processed_at,
      createdAt: row.created_at
    };
  }
  async hashString(str) {
    const encoder = new TextEncoder;
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }
}
// .local-memory/src/repository/audit.ts
class SQLiteAuditRepository {
  db;
  constructor(db) {
    this.db = db;
  }
  async record(action, entityType, entityId, payload, context, previousState) {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const record = {
      id,
      actionType: action,
      entityType,
      entityId,
      actor: context.actor,
      payload,
      previousState,
      batchId: context.batchId || null,
      createdAt: now
    };
    this.db.run(`INSERT INTO audit_log (id, action_type, entity_type, entity_id, actor, payload, previous_state, batch_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
      id,
      action,
      entityType,
      entityId,
      context.actor,
      JSON.stringify(payload),
      previousState ? JSON.stringify(previousState) : null,
      context.batchId || null,
      now
    ]);
    return record;
  }
  async findByEntity(entityType, entityId) {
    const rows = this.db.query("SELECT * FROM audit_log WHERE entity_type = ? AND entity_id = ? ORDER BY created_at DESC").all(entityType, entityId);
    return rows.map((row) => this.mapRowToRecord(row));
  }
  async findByBatch(batchId) {
    const rows = this.db.query("SELECT * FROM audit_log WHERE batch_id = ? ORDER BY created_at DESC").all(batchId);
    return rows.map((row) => this.mapRowToRecord(row));
  }
  mapRowToRecord(row) {
    return {
      id: row.id,
      actionType: row.action_type,
      entityType: row.entity_type,
      entityId: row.entity_id,
      actor: row.actor,
      payload: row.payload ? JSON.parse(row.payload) : null,
      previousState: row.previous_state ? JSON.parse(row.previous_state) : null,
      batchId: row.batch_id,
      createdAt: row.created_at
    };
  }
}
// .local-memory/src/repository/embedding.ts
class SQLiteEmbeddingRepository {
  db;
  constructor(db) {
    this.db = db;
  }
  async save(memoryId, vector, modelInfo) {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const embeddingBuffer = Buffer.from(vector.buffer);
    this.db.run(`INSERT INTO embeddings (id, memory_id, embedding, model_name, model_version, dimensions, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(memory_id) DO UPDATE SET
       embedding = excluded.embedding,
       model_name = excluded.model_name,
       model_version = excluded.model_version,
       dimensions = excluded.dimensions,
       created_at = excluded.created_at`, [id, memoryId, embeddingBuffer, modelInfo.name, modelInfo.version, modelInfo.dimensions, now]);
  }
  async findByMemory(memoryId) {
    const row = this.db.query("SELECT * FROM embeddings WHERE memory_id = ?").get(memoryId);
    return row ? this.mapRowToEmbedding(row) : null;
  }
  async listByMemoryIds(memoryIds) {
    if (memoryIds.length === 0)
      return [];
    const placeholders = memoryIds.map(() => "?").join(",");
    const rows = this.db.query(`SELECT memory_id, embedding, model_name, model_version, dimensions 
                                FROM embeddings WHERE memory_id IN (${placeholders})`).all(...memoryIds);
    return rows.map((row) => ({
      memoryId: row.memory_id,
      embedding: this.bufferToFloat32Array(row.embedding),
      modelName: row.model_name,
      modelVersion: row.model_version,
      dimensions: row.dimensions
    }));
  }
  async searchSimilar(vector, limit) {
    const rows = this.db.query("SELECT memory_id, embedding FROM embeddings").all();
    const results = [];
    const queryVector = vector;
    for (const row of rows) {
      const embedding = this.bufferToFloat32Array(row.embedding);
      const similarity = this.cosineSimilarity(queryVector, embedding);
      results.push({
        memoryId: row.memory_id,
        similarity,
        embedding
      });
    }
    return results.sort((a, b) => b.similarity - a.similarity).slice(0, limit);
  }
  async deleteByMemory(memoryId) {
    this.db.run("DELETE FROM embeddings WHERE memory_id = ?", [memoryId]);
  }
  mapRowToEmbedding(row) {
    return {
      id: row.id,
      memoryId: row.memory_id,
      embedding: this.bufferToFloat32Array(row.embedding),
      modelName: row.model_name,
      modelVersion: row.model_version,
      dimensions: row.dimensions,
      createdAt: row.created_at
    };
  }
  bufferToFloat32Array(buffer) {
    return new Float32Array(buffer.buffer, buffer.byteOffset, buffer.byteLength / 4);
  }
  cosineSimilarity(a, b) {
    if (a.length !== b.length) {
      throw new Error(`Vector dimension mismatch: ${a.length} vs ${b.length}`);
    }
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0;i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    if (normA === 0 || normB === 0) {
      return 0;
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}
// .local-memory/src/repository/promotion.ts
class SQLitePromotionRepository {
  db;
  constructor(db) {
    this.db = db;
  }
  async create(promotion) {
    this.db.run(`INSERT INTO memory_promotions (
        id, memory_id, from_layer, to_layer, trigger_scores, evidence_refs, status, promoted_at, rolled_back_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
      promotion.id,
      promotion.memoryId,
      promotion.fromLayer,
      promotion.toLayer,
      JSON.stringify(promotion.triggerScores),
      JSON.stringify(promotion.evidenceRefs),
      promotion.status,
      promotion.promotedAt,
      promotion.rolledBackAt
    ]);
    return promotion;
  }
  async findById(id) {
    const row = this.db.query("SELECT * FROM memory_promotions WHERE id = ?").get(id);
    return row ? this.mapRowToPromotion(row) : null;
  }
  async findByMemoryId(memoryId) {
    const rows = this.db.query("SELECT * FROM memory_promotions WHERE memory_id = ? ORDER BY promoted_at DESC, rowid DESC").all(memoryId);
    return rows.map((row) => this.mapRowToPromotion(row));
  }
  async updateStatus(id, status) {
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error(`Promotion not found: ${id}`);
    }
    const now = new Date().toISOString();
    const promotedAt = status === "approved" ? existing.promotedAt ?? now : existing.promotedAt;
    const rolledBackAt = status === "rolled_back" ? now : existing.rolledBackAt;
    this.db.run(`UPDATE memory_promotions
       SET status = ?, promoted_at = ?, rolled_back_at = ?
       WHERE id = ?`, [status, promotedAt, rolledBackAt, id]);
    return await this.findById(id);
  }
  mapRowToPromotion(row) {
    return {
      id: row.id,
      memoryId: row.memory_id,
      fromLayer: row.from_layer,
      toLayer: row.to_layer,
      triggerScores: JSON.parse(row.trigger_scores),
      evidenceRefs: JSON.parse(row.evidence_refs),
      status: row.status,
      promotedAt: row.promoted_at,
      rolledBackAt: row.rolled_back_at
    };
  }
}
// .local-memory/src/classifier/service.ts
class ClassificationService {
  memoryRepo;
  ingestionRepo;
  embeddingRepo;
  providerRouter;
  version = "1.0.0-rule-based";
  highImportanceKeywords = [
    "\u91CD\u8981",
    "\u5FC5\u987B",
    "\u94C1\u5F8B",
    "\u8BB0\u4F4F",
    "\u4EE5\u540E\u90FD",
    "\u6C38\u8FDC",
    "\u5173\u952E",
    "\u6838\u5FC3",
    "\u4E00\u5B9A\u8981",
    "\u5343\u4E07",
    "\u7EDD\u5BF9",
    "\u4E0D\u53EF",
    "\u7981\u6B62",
    "\u4E60\u60EF",
    "\u504F\u597D",
    "\u89C4\u5219",
    "\u51B3\u5B9A",
    "\u91CD\u8981",
    "important",
    "must",
    "always",
    "never",
    "critical",
    "key",
    "habit",
    "preference",
    "rule",
    "decision"
  ];
  rules = [
    {
      name: "noise-filter",
      condition: (event) => {
        if (event.sourceType === "manual") {
          return false;
        }
        const content = this.extractContent(event);
        return content.length < 10 || /^\u6211\u5148\u8BD5\u8BD5|\u6211\u770B\u770B|ok|\u597D\u7684$/.test(content);
      },
      classify: () => ({
        worthStoring: false,
        confidence: 0.9,
        reason: "noise"
      }),
      priority: 100
    },
    {
      name: "preference-detection",
      condition: (event) => {
        const content = this.extractContent(event);
        const hasPrefKeywords = /\u559C\u6B22|\u4E60\u60EF|\u504F\u597D|preference|habit/i.test(content);
        const hasStabilityMarkers = /\u6C38\u8FDC|\u603B\u662F|\u4E00\u76F4|always|never/i.test(content);
        const hasImportance = this.hasHighImportance(content);
        return hasPrefKeywords && (hasStabilityMarkers || hasImportance);
      },
      classify: (event) => ({
        worthStoring: true,
        layer: "episodic",
        type: "preference",
        confidence: 0.85,
        importance: "high"
      }),
      priority: 90
    },
    {
      name: "rule-detection",
      condition: (event) => {
        const content = this.extractContent(event);
        return /\u89C4\u5219|\u7EA6\u5B9A|\u5FC5\u987B|\u5E94\u8BE5|rule|convention|must|should/i.test(content) && content.length > 50;
      },
      classify: () => ({
        worthStoring: true,
        layer: "episodic",
        type: "observation",
        confidence: 0.75,
        importance: "high"
      }),
      priority: 85
    },
    {
      name: "decision-detection",
      condition: (event) => {
        const content = this.extractContent(event);
        return /\u51B3\u5B9A|\u9009\u62E9|\u4F7F\u7528.*\u56E0\u4E3A|decision|choose.*because/i.test(content) && content.length > 80;
      },
      classify: () => ({
        worthStoring: true,
        layer: "episodic",
        type: "decision",
        confidence: 0.8,
        importance: "high"
      }),
      priority: 80
    },
    {
      name: "file-edit",
      condition: (event) => event.eventType === "file.edited",
      classify: (event) => ({
        worthStoring: true,
        layer: "working",
        type: "observation",
        confidence: 0.6,
        importance: "medium"
      }),
      priority: 50
    },
    {
      name: "test-result",
      condition: (event) => event.eventType === "test.result",
      classify: (event) => {
        const payload = event.payload;
        const isFailure = payload.status === "failed" || payload.testsFailed && payload.testsFailed > 0;
        return {
          worthStoring: true,
          layer: "episodic",
          type: "event",
          confidence: isFailure ? 0.6 : 0.4,
          importance: isFailure ? "medium" : "low"
        };
      },
      priority: 45
    },
    {
      name: "build-result",
      condition: (event) => event.eventType === "build.result",
      classify: (event) => {
        const payload = event.payload;
        const isFailure = payload.status === "failure";
        return {
          worthStoring: true,
          layer: "episodic",
          type: "event",
          confidence: isFailure ? 0.55 : 0.4,
          importance: isFailure ? "medium" : "low"
        };
      },
      priority: 44
    },
    {
      name: "session-event",
      condition: (event) => event.eventType === "session.idle" || event.eventType === "session.compacted",
      classify: () => ({
        worthStoring: true,
        layer: "episodic",
        type: "event",
        confidence: 0.4,
        importance: "low"
      }),
      priority: 30
    },
    {
      name: "git-commit",
      condition: (event) => event.eventType === "git.commit",
      classify: () => ({
        worthStoring: true,
        layer: "episodic",
        type: "event",
        confidence: 0.5,
        importance: "medium"
      }),
      priority: 40
    },
    {
      name: "default-message",
      condition: (event) => event.eventType === "message.updated",
      classify: (event) => {
        const content = this.extractContent(event);
        const hasImportance = this.hasHighImportance(content);
        return {
          worthStoring: true,
          layer: "episodic",
          type: "observation",
          confidence: hasImportance ? 0.5 : 0.3,
          importance: hasImportance ? "medium" : "low"
        };
      },
      priority: 10
    }
  ];
  constructor(memoryRepo, ingestionRepo, embeddingRepo, providerRouter) {
    this.memoryRepo = memoryRepo;
    this.ingestionRepo = ingestionRepo;
    this.embeddingRepo = embeddingRepo;
    this.providerRouter = providerRouter;
  }
  async classify(event) {
    const sortedRules = [...this.rules].sort((a, b) => b.priority - a.priority);
    for (const rule of sortedRules) {
      if (rule.condition(event)) {
        const result = rule.classify(event);
        console.log(`[Classifier] Matched rule '${rule.name}' for event ${event.id}`);
        return result;
      }
    }
    return {
      worthStoring: false,
      confidence: 0.5,
      reason: "no_matching_rule"
    };
  }
  async classifyAndStore(event) {
    const result = await this.classify(event);
    await this.ingestionRepo.updateStatus(event.id, result.worthStoring ? "accepted" : "rejected");
    if (!result.worthStoring) {
      console.log(`[Classifier] Event ${event.id} filtered: ${result.reason}`);
      return;
    }
    const memoryInput = {
      layer: result.layer || "episodic",
      type: result.type || "observation",
      content: this.extractContent(event),
      importance: result.importance || "medium",
      sourceEventId: event.id,
      workspace: event.workspace
    };
    const memory = await this.memoryRepo.create(memoryInput);
    const memoryStatus = "active";
    await this.memoryRepo.update(memory.id, {
      confidence: result.confidence,
      status: memoryStatus
    });
    if (memoryStatus === "active" && this.embeddingRepo && this.providerRouter) {
      try {
        const provider = this.providerRouter.getEmbeddingProvider();
        if (provider && await provider.isHealthy()) {
          const embedding = await provider.embed(memory.content);
          await this.embeddingRepo.save(memory.id, embedding, {
            name: provider.name,
            version: provider.version,
            dimensions: provider.dimensions
          });
        }
      } catch (error) {
        console.warn(`[Classifier] Failed to persist embedding for memory ${memory.id}: ${error}`);
      }
    }
    await this.ingestionRepo.markProcessed(event.id, memory.id);
    console.log(`[Classifier] Created memory ${memory.id} from event ${event.id}`);
  }
  getVersion() {
    return this.version;
  }
  extractContent(event) {
    const payload = event.payload;
    if (typeof payload.content === "string") {
      return payload.content;
    }
    if (typeof payload.message === "string") {
      return payload.message;
    }
    if (typeof payload.summary === "string") {
      return payload.summary;
    }
    if (payload.summary && typeof payload.summary === "object") {
      const s = payload.summary;
      return `${s.title || ""} ${s.body || ""}`.trim();
    }
    return JSON.stringify(payload);
  }
  hasHighImportance(content) {
    return this.highImportanceKeywords.some((kw) => content.toLowerCase().includes(kw.toLowerCase()));
  }
}

// .local-memory/src/ingest/gateway.ts
class IngestGateway {
  ingestionRepo;
  auditRepo;
  classifier;
  constructor(ingestionRepo, auditRepo, classifier) {
    this.ingestionRepo = ingestionRepo;
    this.auditRepo = auditRepo;
    this.classifier = classifier;
  }
  async ingestEvent(input) {
    try {
      const validationError = this.validateEvent(input);
      if (validationError) {
        return {
          accepted: false,
          eventId: input.eventId,
          batchId: input.batchId,
          ingestionEventId: "",
          error: validationError
        };
      }
      const duplicate = await this.checkDuplicate(input);
      if (duplicate) {
        return {
          accepted: false,
          eventId: input.eventId,
          batchId: input.batchId,
          ingestionEventId: duplicate.id,
          error: {
            code: "DUPLICATE_EVENT",
            message: "Event with same payload already ingested"
          }
        };
      }
      const event = await this.ingestionRepo.createEvent(input);
      await this.auditRepo.record("ingest", "ingestion_event", event.id, { eventType: input.eventType, sourceType: input.sourceType }, { actor: input.sourceType, batchId: input.batchId });
      await this.classifier.classifyAndStore(event);
      return {
        accepted: true,
        eventId: input.eventId,
        batchId: input.batchId,
        ingestionEventId: event.id
      };
    } catch (error) {
      console.error("[IngestGateway] Ingest error:", error);
      return {
        accepted: false,
        eventId: input.eventId,
        batchId: input.batchId,
        ingestionEventId: "",
        error: {
          code: "INGESTION_FAILED",
          message: error instanceof Error ? error.message : "Unknown error"
        }
      };
    }
  }
  async ingestBatch(events) {
    const batchId = events[0]?.batchId || `batch_${Date.now()}`;
    const results = [];
    for (const event of events) {
      const eventWithBatch = { ...event, batchId };
      const result = await this.ingestEvent(eventWithBatch);
      results.push(result);
    }
    const accepted = results.filter((r) => r.accepted).length;
    const rejected = results.filter((r) => !r.accepted).length;
    return {
      batchId,
      total: events.length,
      accepted,
      rejected,
      results
    };
  }
  async getEventStatus(eventId) {
    return this.ingestionRepo.findById(eventId);
  }
  async getBatchEvents(batchId) {
    return this.ingestionRepo.findByBatch(batchId);
  }
  validateEvent(input) {
    if (!input.eventId) {
      return { code: "MISSING_REQUIRED_FIELD", message: "eventId is required" };
    }
    if (!input.batchId) {
      return { code: "MISSING_REQUIRED_FIELD", message: "batchId is required" };
    }
    if (!input.eventType) {
      return { code: "MISSING_REQUIRED_FIELD", message: "eventType is required" };
    }
    if (!input.sourceType) {
      return { code: "MISSING_REQUIRED_FIELD", message: "sourceType is required" };
    }
    if (!input.sourceRef) {
      return { code: "MISSING_REQUIRED_FIELD", message: "sourceRef is required" };
    }
    if (!input.payload) {
      return { code: "MISSING_REQUIRED_FIELD", message: "payload is required" };
    }
    const validTypes = [
      "message.updated",
      "file.edited",
      "session.idle",
      "session.compacted",
      "git.commit",
      "test.result",
      "build.result"
    ];
    if (!validTypes.includes(input.eventType)) {
      return {
        code: "INVALID_EVENT_TYPE",
        message: `Event type '${input.eventType}' not supported in V1`
      };
    }
    const payloadError = this.validatePayload(input.eventType, input.payload);
    if (payloadError) {
      return payloadError;
    }
    return null;
  }
  validatePayload(eventType, payload) {
    switch (eventType) {
      case "message.updated":
        if (!payload.messageId) {
          return { code: "MALFORMED_PAYLOAD", message: "payload.messageId required" };
        }
        if (!payload.role) {
          return { code: "MALFORMED_PAYLOAD", message: "payload.role required" };
        }
        if (!payload.content && !payload.summary) {
          return { code: "MALFORMED_PAYLOAD", message: "payload.content or payload.summary required" };
        }
        break;
      case "file.edited":
        if (!payload.filePath) {
          return { code: "MALFORMED_PAYLOAD", message: "payload.filePath required" };
        }
        if (!payload.changeType) {
          return { code: "MALFORMED_PAYLOAD", message: "payload.changeType required" };
        }
        break;
      case "test.result":
        if (!payload.testSuite) {
          return { code: "MALFORMED_PAYLOAD", message: "payload.testSuite required" };
        }
        if (!payload.status) {
          return { code: "MALFORMED_PAYLOAD", message: "payload.status required" };
        }
        break;
      case "build.result":
        if (!payload.status) {
          return { code: "MALFORMED_PAYLOAD", message: "payload.status required" };
        }
        break;
    }
    return null;
  }
  async checkDuplicate(input) {
    const byEventId = await this.ingestionRepo.findById(input.eventId);
    if (byEventId)
      return byEventId;
    return null;
  }
}

// .local-memory/src/provider/router.ts
class BaseEmbeddingProvider {
  config;
  healthy = false;
  constructor(config) {
    this.config = config;
  }
  async isHealthy() {
    return this.healthy;
  }
  async checkHealth() {
    try {
      await this.embed("health check");
      this.healthy = true;
      return true;
    } catch {
      this.healthy = false;
      return false;
    }
  }
}

class NullEmbeddingProvider extends BaseEmbeddingProvider {
  name = "null";
  version = "1.0.0";
  dimensions = 0;
  async embed() {
    throw new Error("Null provider cannot generate embeddings");
  }
  async embedBatch() {
    throw new Error("Null provider cannot generate embeddings");
  }
  async initialize() {
    this.healthy = false;
  }
  async dispose() {
    this.healthy = false;
  }
}

class OllamaEmbeddingProvider extends BaseEmbeddingProvider {
  name = "ollama";
  version = "1.0.0";
  dimensions = 768;
  baseUrl;
  model;
  constructor(config) {
    super(config);
    this.baseUrl = config.baseUrl || "http://localhost:11434";
    this.model = config.model || "nomic-embed-text";
  }
  async embed(text) {
    const response = await fetch(`${this.baseUrl}/api/embeddings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: this.model, prompt: text })
    });
    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status} ${await response.text()}`);
    }
    const data = await response.json();
    return new Float32Array(data.embedding);
  }
  async embedBatch(texts) {
    const results = [];
    for (const text of texts) {
      results.push(await this.embed(text));
    }
    return results;
  }
  async initialize() {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: "GET",
        signal: AbortSignal.timeout(5000)
      });
      if (response.ok) {
        await this.checkHealth();
      } else {
        this.healthy = false;
      }
    } catch {
      this.healthy = false;
    }
  }
  async dispose() {
    this.healthy = false;
  }
}

class LocalEmbeddingProvider extends BaseEmbeddingProvider {
  name = "local";
  version = "1.0.0";
  dimensions = 384;
  async embed() {
    throw new Error("Local provider not yet implemented");
  }
  async embedBatch() {
    throw new Error("Local provider not yet implemented");
  }
  async initialize() {
    this.healthy = false;
  }
  async dispose() {
    this.healthy = false;
  }
}

class DefaultProviderRouter {
  embeddingProvider = null;
  inferenceProvider = null;
  config = { embedding: { provider: "none" }, inference: { provider: "none" } };
  degraded = false;
  degradedReason = null;
  embeddingHealth = {
    available: false,
    provider: "none",
    lastError: "No provider configured"
  };
  inferenceHealth = {
    available: false,
    provider: "none"
  };
  async initialize(config) {
    this.config = config;
    this.degraded = false;
    this.degradedReason = null;
    if (config.embedding?.provider && config.embedding.provider !== "none") {
      try {
        this.embeddingProvider = this.createEmbeddingProvider(config.embedding);
        await this.embeddingProvider.initialize(config.embedding);
        const healthy = await this.embeddingProvider.isHealthy();
        this.embeddingHealth = {
          available: healthy,
          provider: this.embeddingProvider.name,
          model: config.embedding.model,
          lastError: healthy ? undefined : "Embedding provider unhealthy"
        };
        if (!healthy) {
          this.setDegraded("Embedding provider unhealthy, falling back to keyword-only");
        }
      } catch (error) {
        this.setDegraded(`Failed to initialize embedding provider: ${error}`);
        this.embeddingProvider = new NullEmbeddingProvider(config.embedding);
        await this.embeddingProvider.initialize(config.embedding);
        this.embeddingHealth = {
          available: false,
          provider: this.embeddingProvider.name,
          model: config.embedding.model,
          lastError: String(error)
        };
      }
    } else {
      this.embeddingProvider = new NullEmbeddingProvider({ provider: "none" });
      await this.embeddingProvider.initialize({ provider: "none" });
      this.setDegraded("No embedding provider configured, keyword-only mode");
      this.embeddingHealth = {
        available: false,
        provider: this.embeddingProvider.name,
        lastError: "No embedding provider configured"
      };
    }
    if (config.inference?.provider && config.inference.provider !== "none") {
      this.inferenceHealth = {
        available: false,
        provider: config.inference.provider,
        model: config.inference.model
      };
    } else {
      this.inferenceHealth = {
        available: false,
        provider: "none"
      };
    }
    console.log(`[ProviderRouter] Initialized with embedding: ${this.embeddingProvider?.name || "none"}`);
    if (this.degraded) {
      console.warn(`[ProviderRouter] Degraded: ${this.degradedReason}`);
    }
  }
  getEmbeddingProvider() {
    return this.embeddingProvider;
  }
  getInferenceProvider() {
    return this.inferenceProvider;
  }
  getStatus() {
    return {
      embedding: this.embeddingHealth,
      inference: this.inferenceHealth,
      degraded: this.degraded,
      degradedReason: this.degradedReason || undefined
    };
  }
  isDegraded() {
    return this.degraded;
  }
  async dispose() {
    await this.embeddingProvider?.dispose();
    await this.inferenceProvider?.dispose();
    this.degraded = false;
    this.degradedReason = null;
    this.embeddingHealth = {
      available: false,
      provider: "none",
      lastError: "No provider configured"
    };
    this.inferenceHealth = {
      available: false,
      provider: "none"
    };
  }
  createEmbeddingProvider(config) {
    switch (config.provider) {
      case "ollama":
        return new OllamaEmbeddingProvider(config);
      case "local":
        return new LocalEmbeddingProvider(config);
      case "none":
      default:
        return new NullEmbeddingProvider(config);
    }
  }
  setDegraded(reason) {
    this.degraded = true;
    this.degradedReason = reason;
  }
}

// .local-memory/src/retrieval/service.ts
var RRF_K = 60;
var LAYER_BOOST = {
  core: 4,
  semantic: 3,
  episodic: 2,
  working: 1
};
var IMPORTANCE_BOOST = {
  high: 3,
  medium: 2,
  low: 1
};
var DEFAULT_CONFIG = {
  maxResults: 20,
  minRelevanceScore: 0.01,
  enableSemantic: true,
  semanticWeight: 0.6,
  keywordWeight: 0.4
};

class RetrievalService {
  memoryRepo;
  embeddingRepo;
  providerRouter;
  config;
  constructor(memoryRepo, embeddingRepo, providerRouter, config = {}) {
    this.memoryRepo = memoryRepo;
    this.embeddingRepo = embeddingRepo;
    this.providerRouter = providerRouter;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }
  async search(query, mode = "hybrid", filters, options) {
    const startTime = performance.now();
    let actualMode = mode;
    let degraded = false;
    let degradedReason;
    const embeddingProvider = this.providerRouter.getEmbeddingProvider();
    const isSemanticAvailable = embeddingProvider && await embeddingProvider.isHealthy();
    if (mode === "semantic" && !isSemanticAvailable) {
      throw new Error("Semantic search requested but provider unavailable");
    }
    if (mode === "hybrid" && !isSemanticAvailable) {
      actualMode = "keyword";
      degraded = true;
      degradedReason = this.providerRouter.getStatus().degradedReason || "Semantic provider unavailable";
    }
    let results = [];
    switch (actualMode) {
      case "keyword":
        results = await this.keywordSearch(query, filters, options);
        break;
      case "semantic":
        results = await this.semanticSearch(query, filters, options);
        break;
      case "hybrid":
        results = await this.hybridSearch(query, filters, options);
        break;
    }
    results = this.rankResults(results);
    results = this.filterResults(results);
    const duration = performance.now() - startTime;
    return {
      results,
      total: results.length,
      mode: actualMode,
      degraded,
      degradedReason,
      query,
      duration
    };
  }
  async keywordSearch(query, filters, options) {
    const memories = await this.memoryRepo.searchByKeyword(query, { ...filters, status: ["active"] }, { ...options, limit: this.config.maxResults * 2 });
    return memories.map((memory, index) => ({
      memory,
      score: 1 / (index + 1),
      keywordRank: index + 1,
      rrfScore: 1 / (RRF_K + index + 1),
      boostFactors: this.calculateBoostFactors(memory)
    }));
  }
  async semanticSearch(query, filters, options) {
    const embeddingProvider = this.providerRouter.getEmbeddingProvider();
    if (!embeddingProvider) {
      return [];
    }
    try {
      const limit = options?.limit ?? this.config.maxResults;
      const queryEmbedding = await embeddingProvider.embed(query);
      const similarResults = await this.embeddingRepo.searchSimilar(queryEmbedding, limit);
      const memories = await Promise.all(similarResults.map(async (result) => ({
        similarity: result.similarity,
        memory: await this.memoryRepo.findById(result.memoryId)
      })));
      return memories.filter((result) => result.memory !== null).filter(({ memory }) => this.matchesFilters(memory, filters)).map(({ similarity, memory }, index) => ({
        memory,
        score: similarity,
        semanticRank: index + 1,
        rrfScore: 1 / (RRF_K + index + 1),
        boostFactors: this.calculateBoostFactors(memory)
      }));
    } catch (error) {
      console.warn("[RetrievalService] Semantic search failed:", error);
      return [];
    }
  }
  async hybridSearch(query, filters, options) {
    const [keywordResults, semanticResults] = await Promise.all([
      this.keywordSearch(query, filters, { ...options, limit: this.config.maxResults * 2 }),
      this.semanticSearch(query, filters, { ...options, limit: this.config.maxResults * 2 })
    ]);
    const merged = this.mergeWithRRF(keywordResults, semanticResults);
    return merged;
  }
  mergeWithRRF(keywordResults, semanticResults) {
    const scores = new Map;
    const memories = new Map;
    const keywordRanks = new Map;
    const semanticRanks = new Map;
    keywordResults.forEach((result, index) => {
      const id = result.memory.id;
      scores.set(id, (scores.get(id) || 0) + 1 / (RRF_K + index + 1) * this.config.keywordWeight);
      memories.set(id, result.memory);
      keywordRanks.set(id, index + 1);
    });
    semanticResults.forEach((result, index) => {
      const id = result.memory.id;
      scores.set(id, (scores.get(id) || 0) + 1 / (RRF_K + index + 1) * this.config.semanticWeight);
      memories.set(id, result.memory);
      semanticRanks.set(id, index + 1);
    });
    const merged = [];
    scores.forEach((rrfScore, id) => {
      const memory = memories.get(id);
      merged.push({
        memory,
        score: rrfScore,
        keywordRank: keywordRanks.get(id),
        semanticRank: semanticRanks.get(id),
        rrfScore,
        boostFactors: this.calculateBoostFactors(memory)
      });
    });
    return merged.sort((a, b) => b.rrfScore - a.rrfScore);
  }
  rankResults(results) {
    return results.map((result) => {
      const layerBoost = result.boostFactors.layer;
      const importanceBoost = result.boostFactors.importance;
      const freshnessBoost = result.boostFactors.freshness;
      const confidenceBoost = result.boostFactors.confidence;
      const finalScore = result.rrfScore * layerBoost * importanceBoost * freshnessBoost * confidenceBoost;
      return {
        ...result,
        score: finalScore
      };
    }).sort((a, b) => b.score - a.score);
  }
  filterResults(results) {
    let filtered = results.filter((r) => r.score >= this.config.minRelevanceScore);
    filtered = filtered.slice(0, this.config.maxResults);
    return filtered;
  }
  calculateBoostFactors(memory) {
    const layerBoost = LAYER_BOOST[memory.layer] || 1;
    const importanceBoost = IMPORTANCE_BOOST[memory.importance] || 1;
    const ageDays = (Date.now() - new Date(memory.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    const freshnessBoost = Math.max(0.5, 1 - ageDays / 90);
    const confidenceBoost = 0.5 + memory.confidence * 0.5;
    return {
      layer: layerBoost,
      importance: importanceBoost,
      freshness: freshnessBoost,
      confidence: confidenceBoost
    };
  }
  matchesFilters(memory, filters) {
    const statuses = filters?.status ?? ["active"];
    if (!statuses.includes(memory.status)) {
      return false;
    }
    if (filters?.layers?.length && !filters.layers.includes(memory.layer)) {
      return false;
    }
    if (filters?.types?.length && !filters.types.includes(memory.type)) {
      return false;
    }
    if (filters?.workspace && memory.workspace !== filters.workspace) {
      return false;
    }
    if (filters?.importance?.length && !filters.importance.includes(memory.importance)) {
      return false;
    }
    const createdAt = new Date(memory.createdAt).getTime();
    if (filters?.createdAfter && createdAt < new Date(filters.createdAfter).getTime()) {
      return false;
    }
    if (filters?.createdBefore && createdAt > new Date(filters.createdBefore).getTime()) {
      return false;
    }
    return true;
  }
  async isSemanticAvailable() {
    const provider = this.providerRouter.getEmbeddingProvider();
    return provider ? await provider.isHealthy() : false;
  }
}

// .local-memory/src/context/assembly.ts
var DEFAULT_BUDGETS = {
  userProfile: 5,
  projectKnowledge: 8,
  taskRelevant: 5,
  recentEpisodic: 3
};
var DEFAULT_CONFIG2 = {
  budgets: DEFAULT_BUDGETS,
  minConfidence: 0.5,
  minImportance: "medium",
  maxAgeDays: 30
};

class ContextAssemblyService {
  memoryRepo;
  retrievalService;
  config;
  constructor(memoryRepo, retrievalService, config = {}) {
    this.memoryRepo = memoryRepo;
    this.retrievalService = retrievalService;
    this.config = { ...DEFAULT_CONFIG2, ...config };
  }
  async assemble(query, workspace, customBudgets) {
    const startTime = performance.now();
    const budgets = { ...this.config.budgets, ...customBudgets };
    const [
      userProfile,
      projectKnowledge,
      taskRelevant,
      recentEpisodic
    ] = await Promise.all([
      this.assembleUserProfile(budgets.userProfile),
      this.assembleProjectKnowledge(workspace, budgets.projectKnowledge),
      this.assembleTaskRelevant(query, workspace, budgets.taskRelevant),
      this.assembleRecentEpisodic(budgets.recentEpisodic)
    ]);
    const context = {
      userProfile,
      projectKnowledge,
      taskRelevant,
      recentEpisodic,
      metadata: {
        totalTokens: this.estimateTokens([
          ...userProfile,
          ...projectKnowledge,
          ...taskRelevant,
          ...recentEpisodic
        ]),
        assembledAt: new Date().toISOString()
      }
    };
    const assemblyTime = performance.now() - startTime;
    const totalMemories = userProfile.length + projectKnowledge.length + taskRelevant.length + recentEpisodic.length;
    return {
      context,
      metadata: {
        totalMemories,
        totalTokens: context.metadata.totalTokens,
        assemblyTime,
        budgetsUsed: {
          userProfile: userProfile.length,
          projectKnowledge: projectKnowledge.length,
          taskRelevant: taskRelevant.length,
          recentEpisodic: recentEpisodic.length
        }
      }
    };
  }
  async assembleUserProfile(budget) {
    const memories = [];
    const coreMemories = await this.memoryRepo.findByLayer("core", "active");
    const relevant = coreMemories.filter((m) => ["preference", "habit", "workflow", "identity"].includes(m.type));
    const sorted = this.rankByQuality(relevant);
    return sorted.slice(0, budget);
  }
  async assembleProjectKnowledge(workspace, budget) {
    const semanticMemories = await this.memoryRepo.findByLayer("semantic", "active");
    const relevant = semanticMemories.filter((m) => {
      const matchesWorkspace = !workspace || m.workspace === workspace;
      const isRelevantType = ["project", "decision", "pattern", "error_solution"].includes(m.type);
      return matchesWorkspace && isRelevantType && this.meetsQualityThreshold(m);
    });
    const sorted = this.rankByQuality(relevant);
    return sorted.slice(0, budget);
  }
  async assembleTaskRelevant(query, workspace, budget) {
    const result = await this.retrievalService.search(query, "hybrid", {
      layers: ["episodic", "semantic"],
      workspace,
      status: ["active"]
    }, { limit: budget * 2 });
    const memories = result.results.filter((r) => this.meetsQualityThreshold(r.memory)).map((r) => r.memory);
    return memories.slice(0, budget);
  }
  async assembleRecentEpisodic(budget) {
    const episodicMemories = await this.memoryRepo.findByLayer("episodic", "active");
    const cutoffDate = new Date;
    cutoffDate.setDate(cutoffDate.getDate() - this.config.maxAgeDays);
    const recent = episodicMemories.filter((m) => {
      const memoryDate = new Date(m.createdAt);
      const isRecent = memoryDate >= cutoffDate;
      const isImportant = m.importance === "high";
      return isRecent && isImportant && this.meetsQualityThreshold(m);
    });
    const sorted = recent.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return sorted.slice(0, budget);
  }
  meetsQualityThreshold(memory) {
    if (memory.confidence < this.config.minConfidence) {
      return false;
    }
    const importanceRank = {
      high: 3,
      medium: 2,
      low: 1
    };
    if (importanceRank[memory.importance] < importanceRank[this.config.minImportance]) {
      return false;
    }
    return true;
  }
  rankByQuality(memories) {
    return memories.sort((a, b) => {
      if (b.confidence !== a.confidence) {
        return b.confidence - a.confidence;
      }
      const importanceRank = { high: 3, medium: 2, low: 1 };
      if (importanceRank[b.importance] !== importanceRank[a.importance]) {
        return importanceRank[b.importance] - importanceRank[a.importance];
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }
  estimateTokens(memories) {
    const totalChars = memories.reduce((sum, m) => sum + m.content.length, 0);
    return Math.ceil(totalChars / 4);
  }
  formatForPrompt(assembly) {
    const sections = [];
    if (assembly.userProfile.length > 0) {
      sections.push("## User Profile");
      sections.push(...assembly.userProfile.map((m) => `- ${m.content}`));
    }
    if (assembly.projectKnowledge.length > 0) {
      sections.push("## Project Knowledge");
      sections.push(...assembly.projectKnowledge.map((m) => `- ${m.content}`));
    }
    if (assembly.taskRelevant.length > 0) {
      sections.push("## Task Context");
      sections.push(...assembly.taskRelevant.map((m) => `- ${m.content}`));
    }
    if (assembly.recentEpisodic.length > 0) {
      sections.push("## Recent Activity");
      sections.push(...assembly.recentEpisodic.map((m) => `- ${m.content}`));
    }
    return sections.join(`

`);
  }
  formatForJSON(assembly) {
    return {
      userProfile: assembly.userProfile.map((m) => ({
        id: m.id,
        type: m.type,
        content: m.content,
        confidence: m.confidence
      })),
      projectKnowledge: assembly.projectKnowledge.map((m) => ({
        id: m.id,
        type: m.type,
        content: m.content,
        workspace: m.workspace
      })),
      taskRelevant: assembly.taskRelevant.map((m) => ({
        id: m.id,
        type: m.type,
        content: m.content
      })),
      recentEpisodic: assembly.recentEpisodic.map((m) => ({
        id: m.id,
        type: m.type,
        content: m.content,
        createdAt: m.createdAt
      })),
      metadata: assembly.metadata
    };
  }
}

// .local-memory/src/relations/engine.ts
var DEFAULT_CONFIG3 = {
  minDeriveEvidence: 2,
  minDeriveConfidence: 0.7,
  enableSupersession: true
};

class RelationEngine {
  db;
  memoryRepo;
  auditRepo;
  config;
  constructor(db, memoryRepo, auditRepo, config = {}) {
    this.db = db;
    this.memoryRepo = memoryRepo;
    this.auditRepo = auditRepo;
    this.config = { ...DEFAULT_CONFIG3, ...config };
  }
  async createRelation(input, context) {
    if (!this.isValidRelationType(input.relationType)) {
      throw new Error(`Invalid relation type: ${input.relationType}`);
    }
    const source = await this.memoryRepo.findById(input.sourceId);
    const target = await this.memoryRepo.findById(input.targetId);
    if (!source)
      throw new Error(`Source memory not found: ${input.sourceId}`);
    if (!target)
      throw new Error(`Target memory not found: ${input.targetId}`);
    switch (input.relationType) {
      case "updates":
        return this.handleUpdates(source, target, input, context);
      case "extends":
        return this.handleExtends(source, target, input, context);
      case "derives":
        return this.handleDerives(source, target, input, context);
      case "conflicts":
      case "relates":
        return this.createSimpleRelation(source, target, input, context);
      default:
        throw new Error(`Unhandled relation type: ${input.relationType}`);
    }
  }
  async handleUpdates(source, target, input, context) {
    if (!this.config.enableSupersession) {
      throw new Error("Supersession is disabled");
    }
    const sourceDate = new Date(source.createdAt);
    const targetDate = new Date(target.createdAt);
    if (sourceDate <= targetDate) {
      throw new Error("Source must be newer than target for updates relation");
    }
    const relation = await this.createSimpleRelation(source, target, input, context);
    const previousState = { ...target };
    await this.memoryRepo.updateStatus(target.id, "superseded");
    await this.memoryRepo.update(source.id, {});
    await this.auditRepo.record("update", "memory", target.id, {
      superseded: true,
      supersededBy: source.id,
      relationId: relation.id
    }, context, previousState);
    console.log(`[RelationEngine] Created updates relation: ${source.id} -> ${target.id}, superseded ${target.id}`);
    return relation;
  }
  async handleExtends(source, target, input, context) {
    const relation = await this.createSimpleRelation(source, target, input, context);
    console.log(`[RelationEngine] Created extends relation: ${source.id} -> ${target.id}`);
    return relation;
  }
  async handleDerives(source, target, input, context) {
    const evidenceRefs = input.evidenceRefs || [];
    if (evidenceRefs.length < this.config.minDeriveEvidence) {
      throw new Error(`Derives relation requires at least ${this.config.minDeriveEvidence} evidence references, ` + `got ${evidenceRefs.length}`);
    }
    const confidence = input.confidence || 0;
    if (confidence < this.config.minDeriveConfidence) {
      throw new Error(`Derives relation requires confidence >= ${this.config.minDeriveConfidence}, ` + `got ${confidence}`);
    }
    const relation = await this.createSimpleRelation(source, target, {
      ...input,
      evidenceRefs,
      confidence
    }, context);
    const previousState = { ...target };
    await this.memoryRepo.update(target.id, {
      confidence: Math.min(1, target.confidence + confidence * 0.1)
    });
    await this.auditRepo.record("update", "memory", target.id, {
      derived: true,
      derivedFrom: source.id,
      evidenceCount: evidenceRefs.length,
      confidence
    }, context, previousState);
    console.log(`[RelationEngine] Created derives relation: ${source.id} -> ${target.id} ` + `(evidence: ${evidenceRefs.length}, confidence: ${confidence})`);
    return relation;
  }
  async createSimpleRelation(source, target, input, context) {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const relation = {
      id,
      sourceId: source.id,
      targetId: target.id,
      relationType: input.relationType,
      confidence: input.confidence || 0.5,
      evidenceRefs: input.evidenceRefs || [],
      createdAt: now,
      status: "active"
    };
    this.db.run(`INSERT INTO memory_relations (id, source_id, target_id, relation_type, confidence, 
       evidence_refs, created_at, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
      id,
      source.id,
      target.id,
      input.relationType,
      relation.confidence,
      JSON.stringify(relation.evidenceRefs),
      now,
      "active"
    ]);
    await this.auditRepo.record("update", "memory_relation", id, { relation: input.relationType, sourceId: source.id, targetId: target.id }, context);
    return relation;
  }
  async getRelationsFrom(memoryId, type) {
    let sql = "SELECT * FROM memory_relations WHERE source_id = ? AND status = ?";
    const params = [memoryId, "active"];
    if (type) {
      sql += " AND relation_type = ?";
      params.push(type);
    }
    sql += " ORDER BY created_at DESC";
    const rows = this.db.query(sql).all(...params);
    return rows.map((row) => this.mapRowToRelation(row));
  }
  async getRelationsTo(memoryId, type) {
    let sql = "SELECT * FROM memory_relations WHERE target_id = ? AND status = ?";
    const params = [memoryId, "active"];
    if (type) {
      sql += " AND relation_type = ?";
      params.push(type);
    }
    sql += " ORDER BY created_at DESC";
    const rows = this.db.query(sql).all(...params);
    return rows.map((row) => this.mapRowToRelation(row));
  }
  async getAllRelations(memoryId) {
    const [from, to] = await Promise.all([
      this.getRelationsFrom(memoryId),
      this.getRelationsTo(memoryId)
    ]);
    return { from, to };
  }
  async deactivateRelation(relationId, context) {
    const previousState = this.db.query("SELECT * FROM memory_relations WHERE id = ?").get(relationId);
    if (!previousState) {
      throw new Error(`Relation not found: ${relationId}`);
    }
    this.db.run("UPDATE memory_relations SET status = ? WHERE id = ?", ["inactive", relationId]);
    await this.auditRepo.record("update", "memory_relation", relationId, { deactivated: true }, context, previousState);
  }
  async getSupersededVersion(memoryId) {
    const row = this.db.query(`SELECT m.* FROM memories m 
       JOIN memory_relations r ON m.id = r.target_id 
       WHERE r.source_id = ? AND r.relation_type = 'updates' AND r.status = 'active'`).get(memoryId);
    return row ? this.mapRowToMemory(row) : null;
  }
  async getSupersedingVersion(memoryId) {
    const row = this.db.query(`SELECT m.* FROM memories m 
       JOIN memory_relations r ON m.id = r.source_id 
       WHERE r.target_id = ? AND r.relation_type = 'updates' AND r.status = 'active'`).get(memoryId);
    return row ? this.mapRowToMemory(row) : null;
  }
  async getLineage(memoryId) {
    const lineage = [];
    let current = await this.memoryRepo.findById(memoryId);
    while (current) {
      lineage.unshift(current);
      const superseded = await this.getSupersededVersion(current.id);
      current = superseded;
    }
    const original = lineage[0];
    if (original) {
      let next = await this.getSupersedingVersion(original.id);
      if (next && next.id === memoryId) {
        next = await this.getSupersedingVersion(next.id);
      }
      while (next) {
        lineage.push(next);
        next = await this.getSupersedingVersion(next.id);
      }
    }
    return lineage;
  }
  isValidRelationType(type) {
    return ["updates", "extends", "derives", "conflicts", "relates"].includes(type);
  }
  mapRowToRelation(row) {
    return {
      id: row.id,
      sourceId: row.source_id,
      targetId: row.target_id,
      relationType: row.relation_type,
      confidence: row.confidence,
      evidenceRefs: row.evidence_refs ? JSON.parse(row.evidence_refs) : [],
      createdAt: row.created_at,
      status: row.status
    };
  }
  mapRowToMemory(row) {
    return {
      id: row.id,
      version: row.version,
      parentId: row.parent_id,
      layer: row.layer,
      type: row.type,
      status: row.status,
      content: row.content,
      contentHash: row.content_hash,
      confidence: row.confidence,
      importance: row.importance,
      sourceEventId: row.source_event_id,
      workspace: row.workspace,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      expiresAt: row.expires_at
    };
  }
}

// .local-memory/src/promotion/engine.ts
var PROMOTION_WHITELIST = [
  "preference",
  "habit",
  "workflow",
  "project",
  "decision",
  "pattern",
  "error_solution"
];
var PROMOTION_PATH = {
  working: "episodic",
  episodic: "semantic",
  semantic: "core",
  core: null
};
var DEFAULT_CONFIG4 = {
  threshold: 0.8,
  minConfidence: 0.7,
  minEvidenceCount: 2,
  minStabilityDays: 7,
  maxRepetitionBoost: 0.2,
  enableAutoPromotion: true
};

class PromotionEngine {
  memoryRepo;
  auditRepo;
  promotionRepo;
  relationEngine;
  config;
  constructor(memoryRepo, auditRepo, promotionRepo, relationEngine, config = {}) {
    this.memoryRepo = memoryRepo;
    this.auditRepo = auditRepo;
    this.promotionRepo = promotionRepo;
    this.relationEngine = relationEngine;
    this.config = { ...DEFAULT_CONFIG4, ...config };
  }
  async evaluate(memoryId) {
    const memory = await this.memoryRepo.findById(memoryId);
    if (!memory) {
      throw new Error(`Memory not found: ${memoryId}`);
    }
    if (!this.isWhitelisted(memory.type)) {
      return {
        eligible: false,
        scores: { stability: 0, confidence: 0, evidenceDiversity: 0, repetition: 0, overall: 0 },
        factors: { confidence: 0, repetition: 0, evidenceDiversity: 0, stability: 0 }
      };
    }
    const scores = await this.calculateScores(memory);
    const factors = await this.calculateFactors(memory);
    const eligible = scores.overall >= this.config.threshold && scores.confidence >= this.config.minConfidence && scores.evidenceDiversity >= this.config.minEvidenceCount;
    return {
      eligible,
      scores,
      factors
    };
  }
  async promote(memoryId, context, force = false) {
    const memory = await this.memoryRepo.findById(memoryId);
    if (!memory) {
      throw new Error(`Memory not found: ${memoryId}`);
    }
    const targetLayer = PROMOTION_PATH[memory.layer];
    if (!targetLayer) {
      return {
        eligible: false,
        promoted: false,
        fromLayer: memory.layer,
        toLayer: null,
        reason: "Already at highest layer (core)"
      };
    }
    if (!this.isWhitelisted(memory.type)) {
      return {
        eligible: false,
        promoted: false,
        fromLayer: memory.layer,
        toLayer: targetLayer,
        reason: `Type '${memory.type}' not in promotion whitelist`
      };
    }
    const evaluation = await this.evaluate(memoryId);
    if (!evaluation.eligible && !force) {
      return {
        eligible: false,
        promoted: false,
        fromLayer: memory.layer,
        toLayer: targetLayer,
        scores: evaluation.scores,
        reason: `Scores below threshold: overall=${evaluation.scores.overall.toFixed(2)}, ` + `threshold=${this.config.threshold}`
      };
    }
    if (!this.config.enableAutoPromotion && !force) {
      return {
        eligible: evaluation.eligible,
        promoted: false,
        fromLayer: memory.layer,
        toLayer: targetLayer,
        scores: evaluation.scores,
        reason: "Auto-promotion disabled"
      };
    }
    const evidenceRefs = await this.gatherEvidence(memory);
    const previousState = { ...memory };
    await this.memoryRepo.update(memoryId, { layer: targetLayer });
    const promotion = {
      id: crypto.randomUUID(),
      memoryId,
      fromLayer: memory.layer,
      toLayer: targetLayer,
      triggerScores: evaluation.scores,
      evidenceRefs,
      status: "approved",
      promotedAt: new Date().toISOString(),
      rolledBackAt: null
    };
    await this.promotionRepo.create(promotion);
    await this.auditRepo.record("promote", "memory", memoryId, {
      promotionId: promotion.id,
      fromLayer: memory.layer,
      toLayer: targetLayer,
      scores: evaluation.scores,
      evidenceCount: evidenceRefs.length,
      forced: force
    }, context, previousState);
    console.log(`[PromotionEngine] Promoted memory ${memoryId} from ${memory.layer} to ${targetLayer} ` + `(score: ${evaluation.scores.overall.toFixed(2)})`);
    return {
      eligible: true,
      promoted: true,
      fromLayer: memory.layer,
      toLayer: targetLayer,
      scores: evaluation.scores,
      reason: `Promoted to ${targetLayer}`
    };
  }
  async batchEvaluate(layer = "episodic") {
    const memories = await this.memoryRepo.findByLayer(layer, "active");
    const results = [];
    for (const memory of memories) {
      if (!this.isWhitelisted(memory.type))
        continue;
      const evaluation = await this.evaluate(memory.id);
      results.push({ memoryId: memory.id, result: evaluation });
    }
    results.sort((a, b) => b.result.scores.overall - a.result.scores.overall);
    return results;
  }
  async autoPromote(context) {
    if (!this.config.enableAutoPromotion) {
      console.log("[PromotionEngine] Auto-promotion disabled");
      return [];
    }
    const results = [];
    const evaluations = await this.batchEvaluate("episodic");
    for (const { memoryId, result } of evaluations) {
      if (result.eligible) {
        const promotion = await this.promote(memoryId, context);
        results.push(promotion);
      }
    }
    const semanticEvaluations = await this.batchEvaluate("semantic");
    for (const { memoryId, result } of semanticEvaluations) {
      if (result.eligible) {
        const promotion = await this.promote(memoryId, context);
        results.push(promotion);
      }
    }
    console.log(`[PromotionEngine] Auto-promotion complete: ${results.filter((r) => r.promoted).length} promoted`);
    return results;
  }
  isWhitelisted(type) {
    return PROMOTION_WHITELIST.includes(type);
  }
  getWhitelist() {
    return [...PROMOTION_WHITELIST];
  }
  async calculateScores(memory) {
    const factors = await this.calculateFactors(memory);
    const confidenceScore = Math.min(1, memory.confidence / this.config.minConfidence);
    const repetitionScore = Math.min(1, factors.repetition / 5);
    const evidenceScore = Math.min(1, factors.evidenceDiversity / this.config.minEvidenceCount);
    const stabilityScore = Math.min(1, factors.stability / this.config.minStabilityDays);
    const weights = {
      confidence: 0.35,
      repetition: 0.25,
      evidence: 0.25,
      stability: 0.15
    };
    const overall = confidenceScore * weights.confidence + repetitionScore * weights.repetition + evidenceScore * weights.evidence + stabilityScore * weights.stability;
    return {
      stability: stabilityScore,
      confidence: confidenceScore,
      evidenceDiversity: evidenceScore,
      repetition: repetitionScore,
      overall
    };
  }
  async calculateFactors(memory) {
    const confidence = memory.confidence;
    const repetition = await this.countSimilarMemories(memory);
    const relations = await this.relationEngine.getRelationsFrom(memory.id, "derives");
    const evidenceDiversity = relations.length + relations.reduce((sum, r) => sum + r.evidenceRefs.length, 0);
    const ageDays = (Date.now() - new Date(memory.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    const stability = ageDays;
    return {
      confidence,
      repetition,
      evidenceDiversity,
      stability
    };
  }
  async countSimilarMemories(memory) {
    const contentWords = memory.content.split(/\s+/).slice(0, 10).join(" ");
    const similar = await this.memoryRepo.searchByKeyword(contentWords, { types: [memory.type], status: ["active"] }, { limit: 10 });
    return similar.filter((m) => m.id !== memory.id).length;
  }
  async gatherEvidence(memory) {
    const evidence = [];
    const relations = await this.relationEngine.getRelationsFrom(memory.id, "derives");
    for (const relation of relations) {
      evidence.push(relation.id);
      evidence.push(...relation.evidenceRefs);
    }
    if (memory.sourceEventId) {
      evidence.push(memory.sourceEventId);
    }
    return [...new Set(evidence)];
  }
}

// .local-memory/src/service/core.ts
var DEFAULT_CONFIG5 = {
  runtimeRoot: ".local-memory",
  databasePath: ".local-memory/memory.db",
  enableProjection: true,
  projectionRoot: ".memory"
};

class MemoryCoreService {
  db = null;
  config;
  initialized = false;
  memoryRepo = null;
  ingestionRepo = null;
  auditRepo = null;
  embeddingRepo = null;
  promotionRepo = null;
  classifier = null;
  ingestGateway = null;
  providerRouter = null;
  retrievalService = null;
  contextAssembly = null;
  relationEngine = null;
  promotionEngine = null;
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG5, ...config };
  }
  async initialize() {
    if (this.initialized)
      return;
    this.ensureDirectories();
    this.db = new Database(this.config.databasePath);
    this.db.run("PRAGMA foreign_keys = ON");
    await this.runMigrations();
    this.initializeRepositories();
    await this.initializeServices();
    this.initialized = true;
    console.log("[MemoryCore] Service initialized");
  }
  initializeRepositories() {
    if (!this.db) {
      throw new Error("Database not initialized");
    }
    this.memoryRepo = new SQLiteMemoryRepository(this.db);
    this.ingestionRepo = new SQLiteIngestionRepository(this.db);
    this.auditRepo = new SQLiteAuditRepository(this.db);
    this.embeddingRepo = new SQLiteEmbeddingRepository(this.db);
    this.promotionRepo = new SQLitePromotionRepository(this.db);
  }
  async initializeServices() {
    if (!this.db || !this.memoryRepo || !this.ingestionRepo || !this.auditRepo || !this.embeddingRepo || !this.promotionRepo) {
      throw new Error("Repositories not initialized");
    }
    this.classifier = new ClassificationService(this.memoryRepo, this.ingestionRepo);
    this.ingestGateway = new IngestGateway(this.ingestionRepo, this.auditRepo, this.classifier);
    this.providerRouter = new DefaultProviderRouter;
    await this.providerRouter.initialize({ embedding: { provider: "none" }, inference: { provider: "none" } });
    this.retrievalService = new RetrievalService(this.memoryRepo, this.embeddingRepo, this.providerRouter);
    this.contextAssembly = new ContextAssemblyService(this.memoryRepo, this.retrievalService);
    this.relationEngine = new RelationEngine(this.db, this.memoryRepo, this.auditRepo);
    this.promotionEngine = new PromotionEngine(this.memoryRepo, this.auditRepo, this.promotionRepo, this.relationEngine);
  }
  async health() {
    const checks = {
      database: await this.checkDatabase(),
      projection: await this.checkProjection()
    };
    const allOk = Object.values(checks).every((c) => c.status === "ok");
    const anyError = Object.values(checks).some((c) => c.status === "error");
    return {
      status: anyError ? "error" : allOk ? "ok" : "degraded",
      localOnly: true,
      runtimeRoot: this.config.runtimeRoot,
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      checks
    };
  }
  getRouteDeps() {
    if (!this.ingestGateway || !this.retrievalService || !this.contextAssembly) {
      throw new Error("Services not initialized. Call initialize() first.");
    }
    return {
      ingestGateway: this.ingestGateway,
      retrieval: this.retrievalService,
      contextAssembly: this.contextAssembly,
      service: this
    };
  }
  getDatabase() {
    if (!this.db) {
      throw new Error("Database not initialized. Call initialize() first.");
    }
    return this.db;
  }
  getConfig() {
    return this.config;
  }
  async dispose() {
    if (this.providerRouter) {
      await this.providerRouter.dispose();
    }
    if (this.db) {
      this.db.close();
      this.db = null;
    }
    this.initialized = false;
  }
  ensureDirectories() {
    const dirs = [
      this.config.runtimeRoot,
      join(this.config.runtimeRoot, "logs"),
      join(this.config.runtimeRoot, "cache")
    ];
    if (this.config.enableProjection) {
      dirs.push(this.config.projectionRoot);
    }
    for (const dir of dirs) {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
    }
  }
  async runMigrations() {
    if (!this.db)
      return;
    this.db.run(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version INTEGER PRIMARY KEY,
        applied_at TEXT NOT NULL
      )
    `);
    const result = this.db.query("SELECT MAX(version) as version FROM schema_migrations").get();
    const currentVersion = result?.version || 0;
    if (currentVersion < 1) {
      await this.migrationV1();
      this.db.run("INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)", [1, new Date().toISOString()]);
    }
    console.log(`[MemoryCore] Database at version ${currentVersion}`);
  }
  async migrationV1() {
    if (!this.db)
      return;
    const schemaPath = resolve(import.meta.dir, "..", "..", "schema", "v1-database.sql");
    if (existsSync(schemaPath)) {
      const schema = await Bun.file(schemaPath).text();
      this.db.exec(schema);
    }
    console.log("[MemoryCore] Applied migration V1");
  }
  async checkDatabase() {
    if (!this.db) {
      return { status: "error", message: "Database not initialized" };
    }
    try {
      const start = performance.now();
      this.db.query("SELECT 1").get();
      const latency = performance.now() - start;
      return { status: "ok", latency };
    } catch (e) {
      return { status: "error", message: `Database error: ${e}` };
    }
  }
  async checkProjection() {
    if (!this.config.enableProjection) {
      return { status: "ok", message: "Projection disabled" };
    }
    try {
      const testFile = join(this.config.projectionRoot, ".health");
      await Bun.write(testFile, "");
      await Bun.file(testFile).delete();
      return { status: "ok" };
    } catch (e) {
      return { status: "warning", message: `Projection not writable: ${e}` };
    }
  }
}

// .local-memory/src/http/handlers/ingest.ts
async function handleIngest(req, deps) {
  try {
    const body = await req.json();
    const result = await deps.ingestGateway.ingestEvent(body);
    return Response.json(result, { status: result.accepted ? 200 : 400 });
  } catch (error) {
    return Response.json({ error: "Invalid request", message: String(error) }, { status: 400 });
  }
}
async function handleGetEventStatus(req, deps) {
  const url = new URL(req.url);
  const eventId = url.searchParams.get("eventId");
  if (!eventId) {
    return Response.json({ error: "eventId required" }, { status: 400 });
  }
  const status = await deps.ingestGateway.getEventStatus(eventId);
  return Response.json(status);
}
async function handleGetBatchEvents(req, deps) {
  const url = new URL(req.url);
  const batchId = url.searchParams.get("batchId");
  if (!batchId) {
    return Response.json({ error: "batchId required" }, { status: 400 });
  }
  const events = await deps.ingestGateway.getBatchEvents(batchId);
  return Response.json(events);
}

// .local-memory/src/http/handlers/search.ts
async function handleSearch(req, deps) {
  try {
    const body = await req.json();
    const result = await deps.retrieval.search(body.query, body.mode ?? "hybrid", body.filters, body.options);
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: "Search failed", message: String(error) }, { status: 500 });
  }
}
async function handleContext(req, deps) {
  try {
    const body = await req.json();
    const assembly = await deps.contextAssembly.assemble(body.query, body.workspace);
    return Response.json(assembly);
  } catch (error) {
    return Response.json({ error: "Context assembly failed", message: String(error) }, { status: 500 });
  }
}

// .local-memory/src/http/handlers/ops.ts
async function handleStatus(req, deps) {
  try {
    const health = await deps.service.health();
    const db = deps.service.getDatabase();
    const memoryCount = db.query("SELECT COUNT(*) as count FROM memories").get();
    const activeCount = db.query("SELECT COUNT(*) as count FROM memories WHERE status = ?").get("active");
    const eventCount = db.query("SELECT COUNT(*) as count FROM ingestion_events").get();
    return Response.json({
      health,
      stats: {
        totalMemories: memoryCount.count,
        activeMemories: activeCount.count,
        totalEvents: eventCount.count
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return Response.json({ error: "Failed to get status", message: String(error) }, { status: 500 });
  }
}
async function handleProjectionRebuild(req, deps) {
  try {
    return Response.json({
      success: true,
      message: "Projection rebuild initiated",
      note: "Full implementation requires ProjectionEngine integration"
    });
  } catch (error) {
    return Response.json({ error: "Projection rebuild failed", message: String(error) }, { status: 500 });
  }
}
async function handleProjectionVerify(req, deps) {
  try {
    return Response.json({
      valid: true,
      issues: [],
      note: "Full implementation requires ProjectionEngine integration"
    });
  } catch (error) {
    return Response.json({ error: "Projection verify failed", message: String(error) }, { status: 500 });
  }
}
async function handleCleanupRun(req, deps) {
  try {
    return Response.json({
      success: true,
      message: "Cleanup initiated",
      note: "Full implementation requires CleanupService integration"
    });
  } catch (error) {
    return Response.json({ error: "Cleanup failed", message: String(error) }, { status: 500 });
  }
}
async function handleRollbackBatch(req, deps) {
  try {
    const body = await req.json();
    const { batchId, actor = "api", reason = "API rollback" } = body;
    if (!batchId) {
      return Response.json({ error: "batchId is required" }, { status: 400 });
    }
    return Response.json({
      success: true,
      message: `Rollback initiated for batch ${batchId}`,
      note: "Full implementation requires GovernanceService integration"
    });
  } catch (error) {
    return Response.json({ error: "Rollback failed", message: String(error) }, { status: 500 });
  }
}

// .local-memory/src/http/routes.ts
function buildRoutes(deps) {
  const opsDeps = { ...deps, service: deps.service };
  return {
    "/health": {
      GET: () => Response.json({ status: "ok" })
    },
    "/api/ingest": {
      POST: (req) => handleIngest(req, deps)
    },
    "/api/ingest/status": {
      GET: (req) => handleGetEventStatus(req, deps)
    },
    "/api/ingest/batch": {
      GET: (req) => handleGetBatchEvents(req, deps)
    },
    "/api/search": {
      POST: (req) => handleSearch(req, deps)
    },
    "/api/context": {
      POST: (req) => handleContext(req, deps)
    },
    "/api/status": {
      GET: () => handleStatus({}, opsDeps)
    },
    "/api/projection/rebuild": {
      POST: (req) => handleProjectionRebuild(req, opsDeps)
    },
    "/api/projection/verify": {
      GET: () => handleProjectionVerify({}, opsDeps)
    },
    "/api/cleanup/run": {
      POST: (req) => handleCleanupRun(req, opsDeps)
    },
    "/api/rollback/batch": {
      POST: (req) => handleRollbackBatch(req, opsDeps)
    }
  };
}

// .local-memory/src/http/server.ts
function createServer(options) {
  const server = Bun.serve({
    port: options.port ?? 37777,
    routes: buildRoutes(options.deps),
    fetch() {
      return Response.json({ error: "Not Found" }, { status: 404 });
    }
  });
  return server;
}

// .local-memory/src/index.ts
function parseArgs(argv) {
  const [command = "help", ...rest] = argv;
  const options = {};
  for (let index = 0;index < rest.length; index += 1) {
    const arg = rest[index];
    const value = rest[index + 1];
    switch (arg) {
      case "--runtime-root":
        options.runtimeRoot = value;
        index += 1;
        break;
      case "--database-path":
        options.databasePath = value;
        index += 1;
        break;
      case "--projection-root":
        options.projectionRoot = value;
        index += 1;
        break;
      case "--port":
        options.port = value ? Number.parseInt(value, 10) : undefined;
        index += 1;
        break;
      case "--query":
        options.query = value;
        index += 1;
        break;
      case "--mode":
        options.mode = value;
        index += 1;
        break;
      case "--workspace":
        options.workspace = value;
        index += 1;
        break;
      case "--event-file":
        options.eventFile = value;
        index += 1;
        break;
      case "--disable-projection":
        options.enableProjection = false;
        break;
      default:
        break;
    }
  }
  return { command, options };
}
async function runInit(options) {
  const service = new MemoryCoreService(options);
  try {
    await service.initialize();
    const health = await service.health();
    console.log(JSON.stringify(health, null, 2));
    return 0;
  } finally {
    await service.dispose();
  }
}
async function runStart(options) {
  const port = options.port ?? 37777;
  const service = new MemoryCoreService(options);
  await service.initialize();
  const server = createServer({ port, deps: service.getRouteDeps() });
  const shutdown = async () => {
    server.stop(true);
    await service.dispose();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
  console.log(`[MemoryCore] Listening on http://127.0.0.1:${port}`);
  return 0;
}
async function runStatus(options) {
  const service = new MemoryCoreService(options);
  try {
    await service.initialize();
    const health = await service.health();
    const db = service.getDatabase();
    const memoryCount = db.query("SELECT COUNT(*) as count FROM memories").get();
    const activeCount = db.query("SELECT COUNT(*) as count FROM memories WHERE status = ?").get("active");
    const eventCount = db.query("SELECT COUNT(*) as count FROM ingestion_events").get();
    console.log(JSON.stringify({
      health,
      stats: {
        totalMemories: memoryCount.count,
        activeMemories: activeCount.count,
        totalEvents: eventCount.count
      },
      timestamp: new Date().toISOString()
    }, null, 2));
    return 0;
  } finally {
    await service.dispose();
  }
}
async function runSearch(options) {
  if (!options.query) {
    console.error("Error: --query is required");
    return 1;
  }
  const service = new MemoryCoreService(options);
  try {
    await service.initialize();
    const deps = service.getRouteDeps();
    const result = await deps.retrieval.search(options.query, options.mode ?? "hybrid");
    console.log(JSON.stringify(result, null, 2));
    return 0;
  } finally {
    await service.dispose();
  }
}
async function runContext(options) {
  if (!options.query) {
    console.error("Error: --query is required");
    return 1;
  }
  const service = new MemoryCoreService(options);
  try {
    await service.initialize();
    const deps = service.getRouteDeps();
    const result = await deps.contextAssembly.assemble(options.query, options.workspace ?? "default");
    console.log(JSON.stringify(result, null, 2));
    return 0;
  } finally {
    await service.dispose();
  }
}
async function runIngest(options) {
  if (!options.eventFile) {
    console.error("Error: --event-file is required");
    return 1;
  }
  const service = new MemoryCoreService(options);
  try {
    await service.initialize();
    const eventData = await Bun.file(options.eventFile).json();
    const deps = service.getRouteDeps();
    const result = await deps.ingestGateway.ingestEvent(eventData);
    console.log(JSON.stringify(result, null, 2));
    return result.accepted ? 0 : 1;
  } catch (error) {
    console.error(`Error ingesting event: ${error}`);
    return 1;
  } finally {
    await service.dispose();
  }
}
async function main() {
  const { command, options } = parseArgs(process.argv.slice(2));
  switch (command) {
    case "init":
      return runInit(options);
    case "start":
      return runStart(options);
    case "status":
      return runStatus(options);
    case "search":
      return runSearch(options);
    case "context":
      return runContext(options);
    case "ingest":
      return runIngest(options);
    default:
      console.log(`Usage: bun run src/index.ts <command> [options]

Commands:
  init                          Initialize the memory service
  start                         Start the HTTP server
  status                        Get service status and stats
  search --query <text>         Search memories
  context --query <text>        Assemble context for query
  ingest --event-file <path>    Ingest event from JSON file

Options:
  --runtime-root <path>         Runtime directory (default: .local-memory)
  --database-path <path>        Database file (default: .local-memory/memory.db)
  --projection-root <path>      Projection directory (default: .memory)
  --port <number>               HTTP port (default: 37777)
  --query <text>                Search query
  --mode <keyword|semantic|hybrid>  Search mode (default: hybrid)
  --workspace <name>            Workspace name
  --event-file <path>           Path to event JSON file
  --disable-projection          Disable projection feature`);
      return 1;
  }
}
var exitCode = await main();
if (exitCode !== 0) {
  process.exit(exitCode);
}
