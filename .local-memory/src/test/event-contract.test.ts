import { describe, expect, it } from 'bun:test';
import type { AuditRepository } from '../repository/audit.ts';
import type { IngestionRepository } from '../repository/ingestion.ts';
import type { ClassificationService } from '../classifier/service.ts';
import { IngestGateway } from '../ingest/gateway.ts';

function createGateway(): IngestGateway {
  const ingestionRepo = {
    createEvent: async () => {
      throw new Error('createEvent should not be called during validation failure');
    },
    findByBatch: async () => [],
    findById: async () => null,
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
    const schemaText = await Bun.file('.local-memory/contracts/v1-event-schema.json').text();
    const schema = JSON.parse(schemaText) as {
      definitions: {
        EventBase: {
          required: string[];
          properties: Record<string, { type?: string; format?: string }>;
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
});
