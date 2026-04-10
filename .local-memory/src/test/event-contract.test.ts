import { describe, expect, it } from 'bun:test';
import { join } from 'node:path';
import type { AuditRepository } from '../repository/audit.ts';
import type { IngestionRepository } from '../repository/ingestion.ts';
import type { ClassificationService } from '../classifier/service.ts';
import { IngestGateway } from '../ingest/gateway.ts';
import type { IngestionEventInput } from '../types/index.ts';

function createGateway(): IngestGateway {
  const ingestionRepo = {
    createEvent: async (input: IngestionEventInput) => ({
      id: 'ingestion-test-1',
      eventId: input.eventId,
      batchId: input.batchId,
      eventType: input.eventType,
      sourceType: input.sourceType,
      sourceRef: input.sourceRef,
      workspace: input.workspace ?? null,
      payload: input.payload,
      payloadHash: 'hash-test-1',
      status: 'pending',
      error: null,
      processedAt: null,
      createdAt: new Date().toISOString(),
    }),
    findByBatch: async () => [],
    findById: async () => null,
    findByEventId: async () => null,
    updateStatus: async () => {},
    markProcessed: async () => {},
    findPending: async () => [],
  } satisfies IngestionRepository;

  const auditRepo = {
    record: async () => {},
    findByEntity: async () => [],
    findByBatch: async () => [],
    findRecent: async () => [],
  } satisfies AuditRepository;

  const classifier = {
    classifyAndStore: async () => {},
  } as ClassificationService;

  return new IngestGateway(ingestionRepo, auditRepo, classifier);
}

describe('V1 event contract', () => {
  it('documents the runtime envelope with eventType instead of legacy type/timestamp fields', async () => {
    const schemaPath = join(import.meta.dir, '../../contracts/v1-event-schema.json');
    const schemaText = await Bun.file(schemaPath).text();
    const schema = JSON.parse(schemaText) as {
      definitions: {
        EventBase: {
          required: string[];
          properties: {
            eventId: { type?: string; format?: string };
            eventType: { type?: string; enum?: string[] };
          };
        };
        SessionCreatedEvent: {
          properties: {
            eventType: { const: string };
            payload: { required: string[] };
          };
        };
      };
    };

    const eventBase = schema.definitions.EventBase;

    expect(eventBase.required).toContain('eventType');
    expect(eventBase.required).toContain('batchId');
    expect(eventBase.required).not.toContain('type');
    expect(eventBase.required).not.toContain('timestamp');
    expect(eventBase.properties.eventId.type).toBe('string');
    expect(eventBase.properties.eventId.format).toBeUndefined();
    expect(eventBase.properties.eventType.type).toBe('string');
    expect(eventBase.properties.eventType.enum).toContain('session.created');
    expect(schema.definitions.SessionCreatedEvent.properties.eventType.const).toBe('session.created');
    expect(schema.definitions.SessionCreatedEvent.properties.payload.required).toContain('sessionId');
  });

  it('rejects events that omit batchId', async () => {
    const gateway = createGateway();

    const result = await gateway.ingestEvent({
      eventId: 'evt-contract-001',
      batchId: '',
      eventType: 'message.updated',
      sourceType: 'opencode',
      sourceRef: 'session-001',
      payload: {
        messageId: 'msg-001',
        role: 'user',
        content: '测试 batchId 必填',
      },
    });

    expect(result.accepted).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error?.code).toBe('MISSING_REQUIRED_FIELD');
    expect(result.error?.message).toContain('batchId');
  });

  it('accepts session.created as a first-class runtime event', async () => {
    const gateway = createGateway();

    const result = await gateway.ingestEvent({
      eventId: 'evt-session-created-001',
      batchId: 'batch-session-created-001',
      eventType: 'session.created',
      sourceType: 'opencode',
      sourceRef: 'session-001',
      payload: {
        sessionId: 'session-001',
        timestamp: '2026-04-10T10:00:00.000Z',
      },
    });

    expect(result.accepted).toBe(true);
    expect(result.eventId).toBe('evt-session-created-001');
    expect(result.ingestionEventId).toBe('ingestion-test-1');
  });
});
