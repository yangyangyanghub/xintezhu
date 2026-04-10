import type { IngestionEventInput, IngestionEvent, EventType, ErrorDetail, Memory } from '../types/index.ts';
import type { IngestionRepository } from '../repository/ingestion.ts';
import type { AuditRepository } from '../repository/audit.ts';
import type { ClassificationService } from '../classifier/service.ts';

export interface IngestResult {
  accepted: boolean;
  eventId: string;
  batchId: string;
  ingestionEventId: string;
  memoryId?: string;
  error?: ErrorDetail;
}

export interface BatchIngestResult {
  batchId: string;
  total: number;
  accepted: number;
  rejected: number;
  results: IngestResult[];
}

export interface IngestGatewayReadiness {
  ready: boolean;
  checks: {
    database: { status: 'ok' | 'error'; message?: string };
    classifier: { status: 'ok' | 'error'; message?: string };
  };
  timestamp: string;
}

export class IngestGateway {
  private ingestionRepo: IngestionRepository;
  private auditRepo: AuditRepository;
  private classifier: ClassificationService;

  constructor(
    ingestionRepo: IngestionRepository,
    auditRepo: AuditRepository,
    classifier: ClassificationService
  ) {
    this.ingestionRepo = ingestionRepo;
    this.auditRepo = auditRepo;
    this.classifier = classifier;
  }

  async ingestEvent(input: IngestionEventInput): Promise<IngestResult> {
    try {
      // Validate event
      const validationError = this.validateEvent(input);
      if (validationError) {
        return {
          accepted: false,
          eventId: input.eventId,
          batchId: input.batchId,
          ingestionEventId: '',
          error: validationError,
        };
      }

      // Check for duplicates
      const duplicate = await this.checkDuplicate(input);
      if (duplicate) {
        return {
          accepted: false,
          eventId: input.eventId,
          batchId: input.batchId,
          ingestionEventId: duplicate.id,
          error: {
            code: 'DUPLICATE_EVENT',
            message: 'Event with same payload already ingested',
          },
        };
      }

      // Persist ingestion event
      const event = await this.ingestionRepo.createEvent(input);

      // Audit
      await this.auditRepo.record(
        'ingest',
        'ingestion_event',
        event.id,
        { eventType: input.eventType, sourceType: input.sourceType },
        { actor: input.sourceType, batchId: input.batchId }
      );

      // Classify before reporting success so downstream reads see a consistent state.
      await this.classifier.classifyAndStore(event);

      return {
        accepted: true,
        eventId: input.eventId,
        batchId: input.batchId,
        ingestionEventId: event.id,
      };

    } catch (error) {
      console.error('[IngestGateway] Ingest error:', error);
      return {
        accepted: false,
        eventId: input.eventId,
        batchId: input.batchId,
        ingestionEventId: '',
        error: {
          code: 'INGESTION_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  async ingestBatch(events: IngestionEventInput[]): Promise<BatchIngestResult> {
    const batchId = events[0]?.batchId || `batch_${Date.now()}`;
    const results: IngestResult[] = [];

    for (const event of events) {
      // Ensure all events have same batchId
      const eventWithBatch = { ...event, batchId };
      const result = await this.ingestEvent(eventWithBatch);
      results.push(result);
    }

    const accepted = results.filter(r => r.accepted).length;
    const rejected = results.filter(r => !r.accepted).length;

    return {
      batchId,
      total: events.length,
      accepted,
      rejected,
      results,
    };
  }

  async getEventStatus(eventId: string): Promise<IngestionEvent | null> {
    return this.ingestionRepo.findByEventId(eventId);
  }

  async getBatchEvents(batchId: string): Promise<IngestionEvent[]> {
    return this.ingestionRepo.findByBatch(batchId);
  }

  async isReady(): Promise<IngestGatewayReadiness> {
    const checks: IngestGatewayReadiness['checks'] = {
      database: { status: 'ok' },
      classifier: { status: 'ok' },
    };

    try {
      await this.ingestionRepo.findPending(1);
    } catch (error) {
      checks.database = {
        status: 'error',
        message: error instanceof Error ? error.message : 'Ingestion repository unavailable',
      };
    }

    if (typeof this.classifier.classifyAndStore !== 'function') {
      checks.classifier = {
        status: 'error',
        message: 'Classification service unavailable',
      };
    }

    return {
      ready: checks.database.status === 'ok' && checks.classifier.status === 'ok',
      checks,
      timestamp: new Date().toISOString(),
    };
  }

  private validateEvent(input: IngestionEventInput): ErrorDetail | null {
    // Required fields
    if (!input.eventId) {
      return { code: 'MISSING_REQUIRED_FIELD', message: 'eventId is required' };
    }
    if (!input.batchId) {
      return { code: 'MISSING_REQUIRED_FIELD', message: 'batchId is required' };
    }
    if (!input.eventType) {
      return { code: 'MISSING_REQUIRED_FIELD', message: 'eventType is required' };
    }
    if (!input.sourceType) {
      return { code: 'MISSING_REQUIRED_FIELD', message: 'sourceType is required' };
    }
    if (!input.sourceRef) {
      return { code: 'MISSING_REQUIRED_FIELD', message: 'sourceRef is required' };
    }
    if (!input.payload) {
      return { code: 'MISSING_REQUIRED_FIELD', message: 'payload is required' };
    }

    // Validate event type
    const validTypes: EventType[] = [
      'message.updated',
      'file.edited',
      'session.created',
      'session.idle',
      'session.compacted',
      'git.commit',
      'test.result',
      'build.result',
    ];
    if (!validTypes.includes(input.eventType)) {
      return { 
        code: 'INVALID_EVENT_TYPE', 
        message: `Event type '${input.eventType}' not supported in V1` 
      };
    }

    // Validate payload based on type
    const payloadError = this.validatePayload(input.eventType, input.payload);
    if (payloadError) {
      return payloadError;
    }

    return null;
  }

  private validatePayload(eventType: EventType, payload: Record<string, unknown>): ErrorDetail | null {
    switch (eventType) {
      case 'message.updated':
        if (!payload.messageId) {
          return { code: 'MALFORMED_PAYLOAD', message: 'payload.messageId required' };
        }
        if (!payload.role) {
          return { code: 'MALFORMED_PAYLOAD', message: 'payload.role required' };
        }
        if (!payload.content && !payload.summary) {
          return { code: 'MALFORMED_PAYLOAD', message: 'payload.content or payload.summary required' };
        }
        break;

      case 'file.edited':
        if (!payload.filePath) {
          return { code: 'MALFORMED_PAYLOAD', message: 'payload.filePath required' };
        }
        if (!payload.changeType) {
          return { code: 'MALFORMED_PAYLOAD', message: 'payload.changeType required' };
        }
        break;

      case 'session.created':
      case 'session.idle':
      case 'session.compacted':
        if (!payload.sessionId) {
          return { code: 'MALFORMED_PAYLOAD', message: 'payload.sessionId required' };
        }
        break;

      case 'test.result':
        if (!payload.testSuite) {
          return { code: 'MALFORMED_PAYLOAD', message: 'payload.testSuite required' };
        }
        if (!payload.status) {
          return { code: 'MALFORMED_PAYLOAD', message: 'payload.status required' };
        }
        break;

      case 'build.result':
        if (!payload.status) {
          return { code: 'MALFORMED_PAYLOAD', message: 'payload.status required' };
        }
        break;
    }

    return null;
  }

  private async checkDuplicate(input: IngestionEventInput): Promise<IngestionEvent | null> {
    // Check by eventId first
    const byEventId = await this.ingestionRepo.findByEventId(input.eventId);
    if (byEventId) return byEventId;

    // Could also check by payload hash for content duplicates
    // For now, eventId uniqueness is sufficient
    return null;
  }
}
