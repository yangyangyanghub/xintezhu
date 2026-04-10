import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import type { Database } from 'bun:sqlite';
import { ContextAssemblyService } from '../context/assembly.ts';
import type { ProviderRouter } from '../provider/router.ts';
import { SQLiteEmbeddingRepository, SQLiteMemoryRepository } from '../repository/index.ts';
import { RetrievalService } from '../retrieval/service.ts';
import type { CreateMemoryInput, Memory, MemoryStatus } from '../types/index.ts';
import { createTestDatabase } from './helpers.ts';

const testWorkspace = 'context-assembly-workspace';

function createKeywordOnlyProviderRouter(): ProviderRouter {
  return {
    getEmbeddingProvider: () => null,
    getInferenceProvider: () => null,
    getStatus: () => ({
      embedding: { available: false, provider: 'none', lastError: 'keyword only' },
      inference: { available: false, provider: 'none' },
      degraded: true,
      degradedReason: 'keyword only',
    }),
    isDegraded: () => true,
    initialize: async () => {},
    dispose: async () => {},
  };
}

async function createAssemblyHarness(): Promise<{
  db: Database;
  memoryRepo: SQLiteMemoryRepository;
  assemblyService: ContextAssemblyService;
}> {
  const db = await createTestDatabase();
  const memoryRepo = new SQLiteMemoryRepository(db);
  const embeddingRepo = new SQLiteEmbeddingRepository(db);
  const retrievalService = new RetrievalService(
    memoryRepo,
    embeddingRepo,
    createKeywordOnlyProviderRouter()
  );

  return {
    db,
    memoryRepo,
    assemblyService: new ContextAssemblyService(memoryRepo, retrievalService),
  };
}

function getIsoDateDaysAgo(daysAgo: number, hourOffset = 0): string {
  const timestamp = Date.now() - ((daysAgo * 24) + hourOffset) * 60 * 60 * 1000;
  return new Date(timestamp).toISOString();
}

async function seedMemory(
  db: Database,
  memoryRepo: SQLiteMemoryRepository,
  input: CreateMemoryInput & {
    status?: MemoryStatus;
    confidence?: number;
    createdAt?: string;
  }
): Promise<Memory> {
  const createdMemory = await memoryRepo.create(input);
  const status = input.status ?? 'active';
  const confidence = input.confidence ?? 0.9;
  const createdAt = input.createdAt ?? createdMemory.createdAt;

  db.run(
    `UPDATE memories
     SET status = ?, confidence = ?, importance = ?, workspace = ?, created_at = ?, updated_at = ?
     WHERE id = ?`,
    [
      status,
      confidence,
      input.importance ?? 'medium',
      input.workspace ?? null,
      createdAt,
      createdAt,
      createdMemory.id,
    ]
  );

  const storedMemory = await memoryRepo.findById(createdMemory.id);
  if (!storedMemory) {
    throw new Error(`Failed to load seeded memory ${createdMemory.id}`);
  }

  return storedMemory;
}

describe('ContextAssemblyService budgets', () => {
  let db: Database;
  let memoryRepo: SQLiteMemoryRepository;
  let assemblyService: ContextAssemblyService;

  beforeAll(async () => {
    const harness = await createAssemblyHarness();
    db = harness.db;
    memoryRepo = harness.memoryRepo;
    assemblyService = harness.assemblyService;

    const coreTypes: CreateMemoryInput['type'][] = ['preference', 'habit', 'workflow', 'identity'];
    for (let index = 0; index < 7; index += 1) {
      await seedMemory(db, memoryRepo, {
        layer: 'core',
        type: coreTypes[index % coreTypes.length],
        content: `user profile memory ${index}`,
        importance: 'high',
        confidence: 0.9 - (index * 0.01),
        createdAt: getIsoDateDaysAgo(index + 1),
      });
    }

    const projectTypes: CreateMemoryInput['type'][] = ['project', 'decision', 'pattern', 'error_solution'];
    for (let index = 0; index < 10; index += 1) {
      await seedMemory(db, memoryRepo, {
        layer: 'semantic',
        type: projectTypes[index % projectTypes.length],
        content: `project knowledge memory ${index}`,
        workspace: testWorkspace,
        importance: 'high',
        confidence: 0.85 - (index * 0.01),
        createdAt: getIsoDateDaysAgo(index + 1),
      });
    }

    for (let index = 0; index < 10; index += 1) {
      await seedMemory(db, memoryRepo, {
        layer: index % 2 === 0 ? 'semantic' : 'episodic',
        type: index % 2 === 0 ? 'project' : 'observation',
        content: `budget query memory ${index}`,
        workspace: testWorkspace,
        importance: 'high',
        confidence: 0.8,
        createdAt: getIsoDateDaysAgo(index),
      });
    }

    for (let index = 0; index < 6; index += 1) {
      await seedMemory(db, memoryRepo, {
        layer: 'episodic',
        type: 'event',
        content: `recent episodic memory ${index}`,
        workspace: testWorkspace,
        importance: 'high',
        confidence: 0.9,
        createdAt: getIsoDateDaysAgo(index),
      });
    }
  });

  afterAll(() => {
    db.close();
  });

  it('enforces the default budgets for all context categories', async () => {
    const assembled = await assemblyService.assemble('budget query', testWorkspace);

    expect(assembled.context.userProfile).toHaveLength(5);
    expect(assembled.context.projectKnowledge).toHaveLength(8);
    expect(assembled.context.taskRelevant).toHaveLength(5);
    expect(assembled.context.recentEpisodic).toHaveLength(3);

    expect(assembled.metadata.budgetsUsed).toEqual({
      userProfile: 5,
      projectKnowledge: 8,
      taskRelevant: 5,
      recentEpisodic: 3,
    });
  });
});

describe('ContextAssemblyService confidence filtering', () => {
  let db: Database;
  let memoryRepo: SQLiteMemoryRepository;
  let assemblyService: ContextAssemblyService;

  beforeAll(async () => {
    const harness = await createAssemblyHarness();
    db = harness.db;
    memoryRepo = harness.memoryRepo;
    assemblyService = harness.assemblyService;

    await seedMemory(db, memoryRepo, {
      layer: 'core',
      type: 'preference',
      content: 'profile low confidence',
      importance: 'high',
      confidence: 0.2,
      createdAt: getIsoDateDaysAgo(3),
    });
    await seedMemory(db, memoryRepo, {
      layer: 'core',
      type: 'habit',
      content: 'profile high confidence',
      importance: 'high',
      confidence: 0.95,
      createdAt: getIsoDateDaysAgo(10),
    });

    await seedMemory(db, memoryRepo, {
      layer: 'semantic',
      type: 'project',
      content: 'project keep',
      workspace: testWorkspace,
      importance: 'high',
      confidence: 0.91,
      createdAt: getIsoDateDaysAgo(2),
    });
    await seedMemory(db, memoryRepo, {
      layer: 'semantic',
      type: 'decision',
      content: 'project drop for low confidence',
      workspace: testWorkspace,
      importance: 'high',
      confidence: 0.49,
      createdAt: getIsoDateDaysAgo(1),
    });

    await seedMemory(db, memoryRepo, {
      layer: 'episodic',
      type: 'observation',
      content: 'filter query keep',
      workspace: testWorkspace,
      importance: 'medium',
      confidence: 0.88,
      createdAt: getIsoDateDaysAgo(1),
    });
    await seedMemory(db, memoryRepo, {
      layer: 'semantic',
      type: 'pattern',
      content: 'filter query drop',
      workspace: testWorkspace,
      importance: 'high',
      confidence: 0.2,
      createdAt: getIsoDateDaysAgo(0),
    });

    await seedMemory(db, memoryRepo, {
      layer: 'episodic',
      type: 'event',
      content: 'recent keep',
      workspace: testWorkspace,
      importance: 'high',
      confidence: 0.86,
      createdAt: getIsoDateDaysAgo(1),
    });
    await seedMemory(db, memoryRepo, {
      layer: 'episodic',
      type: 'event',
      content: 'recent drop for low confidence',
      workspace: testWorkspace,
      importance: 'high',
      confidence: 0.3,
      createdAt: getIsoDateDaysAgo(0),
    });
  });

  afterAll(() => {
    db.close();
  });

  it('excludes low-confidence memories outside user profile and ranks user profile by confidence', async () => {
    const assembled = await assemblyService.assemble('filter query', testWorkspace);

    expect(assembled.context.userProfile.map((memory) => memory.content)).toEqual([
      'profile high confidence',
      'profile low confidence',
    ]);
    expect(assembled.context.projectKnowledge.map((memory) => memory.content)).toEqual([
      'project keep',
    ]);
    expect(assembled.context.taskRelevant.map((memory) => memory.content)).toEqual([
      'filter query keep',
    ]);
    expect(assembled.context.recentEpisodic.map((memory) => memory.content)).toEqual([
      'recent keep',
    ]);
  });
});

describe('ContextAssemblyService sorting and freshness', () => {
  let db: Database;
  let memoryRepo: SQLiteMemoryRepository;
  let assemblyService: ContextAssemblyService;

  beforeAll(async () => {
    const harness = await createAssemblyHarness();
    db = harness.db;
    memoryRepo = harness.memoryRepo;
    assemblyService = harness.assemblyService;

    await seedMemory(db, memoryRepo, {
      layer: 'core',
      type: 'preference',
      content: 'profile confidence medium',
      importance: 'high',
      confidence: 0.7,
      createdAt: getIsoDateDaysAgo(1),
    });
    await seedMemory(db, memoryRepo, {
      layer: 'core',
      type: 'habit',
      content: 'profile confidence highest',
      importance: 'high',
      confidence: 0.96,
      createdAt: getIsoDateDaysAgo(20),
    });
    await seedMemory(db, memoryRepo, {
      layer: 'core',
      type: 'workflow',
      content: 'profile confidence lower',
      importance: 'high',
      confidence: 0.55,
      createdAt: getIsoDateDaysAgo(0),
    });

    await seedMemory(db, memoryRepo, {
      layer: 'semantic',
      type: 'project',
      content: 'project equal confidence recent',
      workspace: testWorkspace,
      importance: 'high',
      confidence: 0.82,
      createdAt: getIsoDateDaysAgo(1),
    });
    await seedMemory(db, memoryRepo, {
      layer: 'semantic',
      type: 'decision',
      content: 'project equal confidence older',
      workspace: testWorkspace,
      importance: 'high',
      confidence: 0.82,
      createdAt: getIsoDateDaysAgo(9),
    });

    await seedMemory(db, memoryRepo, {
      layer: 'episodic',
      type: 'event',
      content: 'episodic inside cutoff',
      workspace: testWorkspace,
      importance: 'high',
      confidence: 0.8,
      createdAt: getIsoDateDaysAgo(7),
    });
    await seedMemory(db, memoryRepo, {
      layer: 'episodic',
      type: 'event',
      content: 'episodic outside cutoff',
      workspace: testWorkspace,
      importance: 'high',
      confidence: 0.99,
      createdAt: getIsoDateDaysAgo(31),
    });
  });

  afterAll(() => {
    db.close();
  });

  it('prefers higher confidence memories in user profile ranking', async () => {
    const assembled = await assemblyService.assemble('unused query', testWorkspace);

    expect(assembled.context.userProfile.map((memory) => memory.content)).toEqual([
      'profile confidence highest',
      'profile confidence medium',
      'profile confidence lower',
    ]);
  });

  it('prefers more recent memories when confidence is equal', async () => {
    const assembled = await assemblyService.assemble('unused query', testWorkspace);

    expect(assembled.context.projectKnowledge.map((memory) => memory.content)).toEqual([
      'project equal confidence recent',
      'project equal confidence older',
    ]);
  });

  it('keeps only recent episodic memories inside the 30-day cutoff', async () => {
    const assembled = await assemblyService.assemble('unused query', testWorkspace);

    expect(assembled.context.recentEpisodic.map((memory) => memory.content)).toEqual([
      'episodic inside cutoff',
    ]);
  });
});

describe('ContextAssemblyService end-to-end assembly', () => {
  let db: Database;
  let memoryRepo: SQLiteMemoryRepository;
  let assemblyService: ContextAssemblyService;

  beforeAll(async () => {
    const harness = await createAssemblyHarness();
    db = harness.db;
    memoryRepo = harness.memoryRepo;
    assemblyService = harness.assemblyService;

    await seedMemory(db, memoryRepo, {
      layer: 'core',
      type: 'identity',
      content: 'active profile memory',
      importance: 'high',
      confidence: 0.9,
      createdAt: getIsoDateDaysAgo(4),
    });
    await seedMemory(db, memoryRepo, {
      layer: 'core',
      type: 'preference',
      content: 'inactive profile memory',
      importance: 'high',
      confidence: 0.99,
      status: 'archived',
      createdAt: getIsoDateDaysAgo(0),
    });

    await seedMemory(db, memoryRepo, {
      layer: 'semantic',
      type: 'project',
      content: 'active project memory',
      workspace: testWorkspace,
      importance: 'high',
      confidence: 0.9,
      createdAt: getIsoDateDaysAgo(2),
    });
    await seedMemory(db, memoryRepo, {
      layer: 'semantic',
      type: 'pattern',
      content: 'inactive project memory',
      workspace: testWorkspace,
      importance: 'high',
      confidence: 0.95,
      status: 'forgotten',
      createdAt: getIsoDateDaysAgo(1),
    });

    await seedMemory(db, memoryRepo, {
      layer: 'episodic',
      type: 'observation',
      content: 'assembly query active',
      workspace: testWorkspace,
      importance: 'high',
      confidence: 0.84,
      createdAt: getIsoDateDaysAgo(1),
    });
    await seedMemory(db, memoryRepo, {
      layer: 'episodic',
      type: 'observation',
      content: 'assembly query inactive',
      workspace: testWorkspace,
      importance: 'high',
      confidence: 0.99,
      status: 'archived',
      createdAt: getIsoDateDaysAgo(0),
    });

    await seedMemory(db, memoryRepo, {
      layer: 'episodic',
      type: 'event',
      content: 'recent activity active',
      workspace: testWorkspace,
      importance: 'high',
      confidence: 0.86,
      createdAt: getIsoDateDaysAgo(3),
    });
    await seedMemory(db, memoryRepo, {
      layer: 'episodic',
      type: 'event',
      content: 'recent activity inactive',
      workspace: testWorkspace,
      importance: 'high',
      confidence: 0.88,
      status: 'archived',
      createdAt: getIsoDateDaysAgo(2),
    });
  });

  afterAll(() => {
    db.close();
  });

  it('assembles all four categories and reports budgets used', async () => {
    const assembled = await assemblyService.assemble('assembly query', testWorkspace);

    expect(assembled.context.userProfile.map((memory) => memory.content)).toEqual([
      'active profile memory',
    ]);
    expect(assembled.context.projectKnowledge.map((memory) => memory.content)).toEqual([
      'active project memory',
    ]);
    expect(assembled.context.taskRelevant.map((memory) => memory.content)).toEqual([
      'assembly query active',
    ]);
    expect(assembled.context.recentEpisodic.map((memory) => memory.content)).toEqual([
      'assembly query active',
      'recent activity active',
    ]);

    expect(assembled.metadata.budgetsUsed).toEqual({
      userProfile: 1,
      projectKnowledge: 1,
      taskRelevant: 1,
      recentEpisodic: 2,
    });

    expect(assembled.context.userProfile.every((memory) => memory.status === 'active')).toBe(true);
    expect(assembled.context.projectKnowledge.every((memory) => memory.status === 'active')).toBe(true);
    expect(assembled.context.taskRelevant.every((memory) => memory.status === 'active')).toBe(true);
    expect(assembled.context.recentEpisodic.every((memory) => memory.status === 'active')).toBe(true);
  });

  it('propagates retrieval errors instead of hiding assembly failures', async () => {
    const failingAssemblyService = new ContextAssemblyService(memoryRepo, {
      search: async () => {
        throw new Error('retrieval failed');
      },
    } as RetrievalService);

    await expect(
      failingAssemblyService.assemble('assembly query', testWorkspace)
    ).rejects.toThrow('retrieval failed');
  });
});
