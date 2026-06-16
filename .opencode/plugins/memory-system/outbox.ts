import { mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import type { IngestionEventInput, OutboxEntry, OutboxOptions, OutboxStats } from './types.js';

const DEFAULT_MAX_EVENTS = 1000;
const DEFAULT_MAX_SIZE_BYTES = 25 * 1024 * 1024;
const DEFAULT_TTL_DAYS = 7;

interface StoredEntryFile {
  path: string;
  size: number;
  entry: OutboxEntry;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getTimestamp(input: IngestionEventInput): string {
  const payloadTimestamp = input.payload.timestamp;
  if (typeof payloadTimestamp === 'string' && payloadTimestamp.length > 0) {
    return payloadTimestamp;
  }
  return new Date().toISOString();
}

function compareEntries(left: OutboxEntry, right: OutboxEntry): number {
  const timeDiff = new Date(left.timestamp).getTime() - new Date(right.timestamp).getTime();
  if (timeDiff !== 0) {
    return timeDiff;
  }
  return left.eventId.localeCompare(right.eventId);
}

function isExpired(timestamp: string, ttlDays: number, now = Date.now()): boolean {
  const parsed = Date.parse(timestamp);
  if (Number.isNaN(parsed)) {
    return false;
  }
  return parsed < now - ttlDays * 24 * 60 * 60 * 1000;
}

export class OutboxManager {
  private readonly outboxDir: string;
  private readonly maxEvents: number;
  private readonly maxSizeBytes: number;
  private readonly ttlDays: number;
  private droppedEvents = 0;

  constructor(options: OutboxOptions) {
    this.outboxDir = resolve(options.runtimeRoot, '.outbox');
    this.maxEvents = options.maxEvents ?? DEFAULT_MAX_EVENTS;
    this.maxSizeBytes = options.maxSizeBytes ?? DEFAULT_MAX_SIZE_BYTES;
    this.ttlDays = options.ttlDays ?? DEFAULT_TTL_DAYS;
  }

  async append(event: IngestionEventInput): Promise<void> {
    await this.ensureDir();

    const entry: OutboxEntry = {
      ...event,
      timestamp: getTimestamp(event),
      retryCount: 0,
    };

    await writeFile(this.getEntryPath(event.eventId), JSON.stringify(entry, null, 2), 'utf8');
    await this.enforceLimits();
  }

  async list(): Promise<OutboxEntry[]> {
    const entries = await this.readEntries();
    return entries.map((item) => item.entry);
  }

  async remove(eventId: string): Promise<void> {
    await rm(this.getEntryPath(eventId), { force: true });
  }

  async markAttempt(eventId: string, error?: string): Promise<void> {
    const entry = await this.readEntry(eventId);
    if (!entry) {
      return;
    }

    const updated: OutboxEntry = {
      ...entry,
      retryCount: entry.retryCount + 1,
      ...(error ? { lastError: error } : {}),
    };

    await writeFile(this.getEntryPath(eventId), JSON.stringify(updated, null, 2), 'utf8');
  }

  async cleanup(): Promise<void> {
    await this.ensureDir();
    const entries = await this.readEntryFiles();
    const now = Date.now();

    for (const item of entries) {
      if (isExpired(item.entry.timestamp, this.ttlDays, now)) {
        await rm(item.path, { force: true });
        this.droppedEvents += 1;
      }
    }

    await this.enforceLimits();
  }

  async getStats(): Promise<OutboxStats> {
    const entries = await this.readEntryFiles();
    const sortedEntries = entries.map((item) => item.entry).sort(compareEntries);
    const totalSizeBytes = entries.reduce((sum, item) => sum + item.size, 0);

    return {
      pendingEvents: sortedEntries.length,
      totalSizeBytes,
      maxEvents: this.maxEvents,
      maxSizeBytes: this.maxSizeBytes,
      ttlDays: this.ttlDays,
      oldestTimestamp: sortedEntries[0]?.timestamp,
      newestTimestamp: sortedEntries.at(-1)?.timestamp,
      droppedEvents: this.droppedEvents,
      outboxDir: this.outboxDir,
    };
  }

  private async enforceLimits(): Promise<void> {
    const entries = await this.readEntryFiles();
    let totalSizeBytes = entries.reduce((sum, item) => sum + item.size, 0);
    const sortedEntries = [...entries].sort((left, right) => compareEntries(left.entry, right.entry));

    while (sortedEntries.length > this.maxEvents || totalSizeBytes > this.maxSizeBytes) {
      const evicted = sortedEntries.shift();
      if (!evicted) {
        break;
      }

      totalSizeBytes -= evicted.size;
      await rm(evicted.path, { force: true });
      this.droppedEvents += 1;
    }
  }

  private async readEntries(): Promise<StoredEntryFile[]> {
    const entries = await this.readEntryFiles();
    return entries.sort((left, right) => compareEntries(left.entry, right.entry));
  }

  private async readEntryFiles(): Promise<StoredEntryFile[]> {
    await this.ensureDir();
    const names = await readdir(this.outboxDir);
    const results: StoredEntryFile[] = [];

    for (const name of names) {
      if (!name.endsWith('.json')) {
        continue;
      }

      const filePath = join(this.outboxDir, name);
      const parsed = await this.readEntryFromPath(filePath);
      if (parsed) {
        results.push(parsed);
      }
    }

    return results;
  }

  private async readEntry(eventId: string): Promise<OutboxEntry | null> {
    const filePath = this.getEntryPath(eventId);
    const parsed = await this.readEntryFromPath(filePath);
    return parsed?.entry ?? null;
  }

  private async readEntryFromPath(filePath: string): Promise<StoredEntryFile | null> {
    try {
      const [content, fileStats] = await Promise.all([
        readFile(filePath, 'utf8'),
        stat(filePath),
      ]);
      const parsed = JSON.parse(content) as unknown;
      if (!isRecord(parsed)) {
        return null;
      }

      return {
        path: filePath,
        size: fileStats.size,
        entry: parsed as unknown as OutboxEntry,
      };
    } catch (error) {
      const code = error instanceof Error && 'code' in error ? String(error.code) : '';
      if (code === 'ENOENT') {
        return null;
      }
      throw error;
    }
  }

  private getEntryPath(eventId: string): string {
    return join(this.outboxDir, `${eventId}.json`);
  }

  private async ensureDir(): Promise<void> {
    await mkdir(this.outboxDir, { recursive: true });
  }
}
