-- Local Memory System V1 Database Schema
-- SQLite compatible

-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Memories: Core entity table for all memory types
CREATE TABLE memories (
    id TEXT PRIMARY KEY,
    version INTEGER NOT NULL DEFAULT 1,
    parent_id TEXT,
    layer TEXT NOT NULL CHECK (layer IN ('core', 'semantic', 'episodic', 'working')),
    type TEXT NOT NULL CHECK (type IN ('identity', 'preference', 'habit', 'workflow', 'project', 'decision', 'pattern', 'error_solution', 'observation', 'event')),
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'active', 'superseded', 'forgotten', 'archived', 'reverted')),
    content TEXT NOT NULL,
    content_hash TEXT NOT NULL, -- For deduplication
    confidence REAL DEFAULT 0.0 CHECK (confidence >= 0.0 AND confidence <= 1.0),
    importance TEXT DEFAULT 'medium' CHECK (importance IN ('high', 'medium', 'low')),
    source_event_id TEXT,
    workspace TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    expires_at TEXT,
    FOREIGN KEY (parent_id) REFERENCES memories(id) ON DELETE SET NULL
);

-- Memory Relations: updates/extends/derives edges
CREATE TABLE memory_relations (
    id TEXT PRIMARY KEY,
    source_id TEXT NOT NULL,
    target_id TEXT NOT NULL,
    relation_type TEXT NOT NULL CHECK (relation_type IN ('updates', 'extends', 'derives', 'conflicts', 'relates')),
    confidence REAL DEFAULT 0.0 CHECK (confidence >= 0.0 AND confidence <= 1.0),
    evidence_refs TEXT, -- JSON array of source evidence
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    FOREIGN KEY (source_id) REFERENCES memories(id) ON DELETE CASCADE,
    FOREIGN KEY (target_id) REFERENCES memories(id) ON DELETE CASCADE,
    UNIQUE(source_id, target_id, relation_type)
);

-- Ingestion Events: Raw event log from adapters
CREATE TABLE ingestion_events (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL UNIQUE, -- External event ID
    batch_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    source_type TEXT NOT NULL,
    source_ref TEXT NOT NULL,
    workspace TEXT,
    payload TEXT NOT NULL, -- JSON
    payload_hash TEXT NOT NULL, -- For deduplication
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'processed')),
    error TEXT, -- JSON error object if rejected
    processed_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================================
-- PROMOTION & CLASSIFICATION
-- ============================================================================

-- Classifications: Classification results for ingested events
CREATE TABLE classifications (
    id TEXT PRIMARY KEY,
    ingestion_event_id TEXT NOT NULL UNIQUE,
    memory_id TEXT, -- Created memory (if worth storing)
    worth_storing BOOLEAN NOT NULL DEFAULT FALSE,
    layer TEXT CHECK (layer IN ('core', 'semantic', 'episodic', 'working', NULL)),
    type TEXT,
    confidence REAL DEFAULT 0.0,
    importance TEXT CHECK (importance IN ('high', 'medium', 'low', NULL)),
    classifier_version TEXT NOT NULL,
    classified_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (ingestion_event_id) REFERENCES ingestion_events(id) ON DELETE CASCADE,
    FOREIGN KEY (memory_id) REFERENCES memories(id) ON DELETE SET NULL
);

-- Promotions: Promotion records for stable memories
CREATE TABLE memory_promotions (
    id TEXT PRIMARY KEY,
    memory_id TEXT NOT NULL,
    from_layer TEXT NOT NULL,
    to_layer TEXT NOT NULL,
    trigger_scores TEXT NOT NULL, -- JSON with score breakdown
    evidence_refs TEXT NOT NULL, -- JSON array
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'rolled_back')),
    promoted_at TEXT,
    rolled_back_at TEXT,
    FOREIGN KEY (memory_id) REFERENCES memories(id) ON DELETE CASCADE
);

-- ============================================================================
-- EMBEDDINGS & RETRIEVAL
-- ============================================================================

-- Embeddings: Vector cache for semantic search
CREATE TABLE embeddings (
    id TEXT PRIMARY KEY,
    memory_id TEXT NOT NULL UNIQUE,
    embedding BLOB NOT NULL, -- Serialized vector
    model_name TEXT NOT NULL,
    model_version TEXT NOT NULL,
    dimensions INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (memory_id) REFERENCES memories(id) ON DELETE CASCADE
);

-- Full-text search virtual table
CREATE VIRTUAL TABLE memories_fts USING fts5(
    memory_id UNINDEXED,
    content
);

-- Trigger to keep FTS index updated
CREATE TRIGGER memories_fts_insert AFTER INSERT ON memories BEGIN
    INSERT INTO memories_fts(memory_id, content) VALUES (new.id, new.content);
END;

CREATE TRIGGER memories_fts_update AFTER UPDATE ON memories BEGIN
    UPDATE memories_fts SET content = new.content WHERE memory_id = new.id;
END;

CREATE TRIGGER memories_fts_delete AFTER DELETE ON memories BEGIN
    DELETE FROM memories_fts WHERE memory_id = old.id;
END;

-- ============================================================================
-- AUDIT & GOVERNANCE
-- ============================================================================

-- Audit Log: Every write-affecting action
CREATE TABLE audit_log (
    id TEXT PRIMARY KEY,
    action_type TEXT NOT NULL CHECK (action_type IN ('ingest', 'classify', 'promote', 'rollback', 'project', 'forget', 'update', 'delete')),
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    actor TEXT NOT NULL, -- system, user, or adapter
    payload TEXT, -- JSON of changes
    previous_state TEXT, -- JSON of previous state (for rollback)
    batch_id TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Rollback Operations
CREATE TABLE rollback_operations (
    id TEXT PRIMARY KEY,
    batch_id TEXT NOT NULL,
    rollback_type TEXT NOT NULL CHECK (rollback_type IN ('memory', 'relation', 'promotion', 'batch')),
    target_id TEXT NOT NULL,
    previous_status TEXT,
    new_status TEXT,
    reason TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================================
-- PROFILES & CONTEXT
-- ============================================================================

-- Profiles: User/project profiles
CREATE TABLE profiles (
    id TEXT PRIMARY KEY,
    profile_type TEXT NOT NULL CHECK (profile_type IN ('user', 'project', 'workspace')),
    name TEXT NOT NULL,
    content TEXT NOT NULL, -- JSON profile data
    version INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Profile-Memory associations
CREATE TABLE profile_memories (
    profile_id TEXT NOT NULL,
    memory_id TEXT NOT NULL,
    relevance_score REAL DEFAULT 0.0,
    associated_at TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (profile_id, memory_id),
    FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (memory_id) REFERENCES memories(id) ON DELETE CASCADE
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Common query patterns
CREATE INDEX idx_memories_layer ON memories(layer);
CREATE INDEX idx_memories_type ON memories(type);
CREATE INDEX idx_memories_status ON memories(status);
CREATE INDEX idx_memories_workspace ON memories(workspace);
CREATE INDEX idx_memories_created ON memories(created_at);
CREATE INDEX idx_memories_expires ON memories(expires_at);
CREATE INDEX idx_memories_source ON memories(source_event_id);

-- Composite indexes for common filters
CREATE INDEX idx_memories_layer_status ON memories(layer, status);
CREATE INDEX idx_memories_workspace_type ON memories(workspace, type);

-- Relations
CREATE INDEX idx_relations_source ON memory_relations(source_id);
CREATE INDEX idx_relations_target ON memory_relations(target_id);
CREATE INDEX idx_relations_type ON memory_relations(relation_type);

-- Events
CREATE INDEX idx_events_batch ON ingestion_events(batch_id);
CREATE INDEX idx_events_status ON ingestion_events(status);
CREATE INDEX idx_events_type ON ingestion_events(event_type);
CREATE INDEX idx_events_created ON ingestion_events(created_at);

-- Audit
CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_batch ON audit_log(batch_id);
CREATE INDEX idx_audit_created ON audit_log(created_at);

-- Promotions
CREATE INDEX idx_promotions_memory ON memory_promotions(memory_id);
CREATE INDEX idx_promotions_status ON memory_promotions(status);
