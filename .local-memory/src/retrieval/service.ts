import type { MemoryRepository } from '../repository/memory.ts';
import type { ProviderRouter } from '../provider/router.ts';
import type { 
  Memory, 
  SearchFilters, 
  SearchResult, 
  MemoryLayer,
  MemoryStatus,
  QueryOptions 
} from '../types/index.ts';

// Ranking constants
const RRF_K = 60; // Reciprocal Rank Fusion constant
const LAYER_BOOST: Record<MemoryLayer, number> = {
  'core': 4.0,
  'semantic': 3.0,
  'episodic': 2.0,
  'working': 1.0,
};

const IMPORTANCE_BOOST: Record<string, number> = {
  'high': 3.0,
  'medium': 2.0,
  'low': 1.0,
};

interface RetrievalConfig {
  maxResults: number;
  minRelevanceScore: number;
  enableSemantic: boolean;
  semanticWeight: number;
  keywordWeight: number;
}

const DEFAULT_CONFIG: RetrievalConfig = {
  maxResults: 20,
  minRelevanceScore: 0.01,
  enableSemantic: true,
  semanticWeight: 0.6,
  keywordWeight: 0.4,
};

export interface HybridSearchResult extends SearchResult {
  keywordRank?: number;
  semanticRank?: number;
  rrfScore: number;
  boostFactors: {
    layer: number;
    importance: number;
    freshness: number;
    confidence: number;
  };
}

export interface RetrievalResponse {
  results: HybridSearchResult[];
  total: number;
  mode: 'keyword' | 'semantic' | 'hybrid';
  degraded: boolean;
  degradedReason?: string;
  query: string;
  duration: number;
}

export class RetrievalService {
  private memoryRepo: MemoryRepository;
  private providerRouter: ProviderRouter;
  private config: RetrievalConfig;

  constructor(
    memoryRepo: MemoryRepository,
    providerRouter: ProviderRouter,
    config: Partial<RetrievalConfig> = {}
  ) {
    this.memoryRepo = memoryRepo;
    this.providerRouter = providerRouter;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async search(
    query: string,
    mode: 'keyword' | 'semantic' | 'hybrid' = 'hybrid',
    filters?: SearchFilters,
    options?: QueryOptions
  ): Promise<RetrievalResponse> {
    const startTime = performance.now();

    // Determine actual mode based on provider health
    let actualMode = mode;
    let degraded = false;
    let degradedReason: string | undefined;

    const embeddingProvider = this.providerRouter.getEmbeddingProvider();
    const isSemanticAvailable = embeddingProvider && await embeddingProvider.isHealthy();

    if (mode === 'semantic' && !isSemanticAvailable) {
      // Semantic requested but unavailable - error
      throw new Error('Semantic search requested but provider unavailable');
    }

    if (mode === 'hybrid' && !isSemanticAvailable) {
      // Hybrid requested but semantic unavailable - degrade to keyword
      actualMode = 'keyword';
      degraded = true;
      degradedReason = this.providerRouter.getStatus().degradedReason || 'Semantic provider unavailable';
    }

    let results: HybridSearchResult[] = [];

    switch (actualMode) {
      case 'keyword':
        results = await this.keywordSearch(query, filters, options);
        break;
      case 'semantic':
        results = await this.semanticSearch(query, filters, options);
        break;
      case 'hybrid':
        results = await this.hybridSearch(query, filters, options);
        break;
    }

    // Apply ranking and filtering
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
      duration,
    };
  }

  private async keywordSearch(
    query: string,
    filters?: SearchFilters,
    options?: QueryOptions
  ): Promise<HybridSearchResult[]> {
    const memories = await this.memoryRepo.searchByKeyword(
      query,
      { ...filters, status: ['active'] },
      { ...options, limit: this.config.maxResults * 2 }
    );

    return memories.map((memory, index) => ({
      memory,
      score: 1.0 / (index + 1), // Initial rank-based score
      keywordRank: index + 1,
      rrfScore: 1.0 / (RRF_K + index + 1),
      boostFactors: this.calculateBoostFactors(memory),
    }));
  }

  private async semanticSearch(
    query: string,
    filters?: SearchFilters,
    options?: QueryOptions
  ): Promise<HybridSearchResult[]> {
    const embeddingProvider = this.providerRouter.getEmbeddingProvider();
    if (!embeddingProvider) {
      return [];
    }

    // Generate query embedding
    const queryEmbedding = await embeddingProvider.embed(query);

    // Search for similar memories (in real implementation, would use vector DB or SQLite extension)
    // For now, return empty as we don't have vector search implemented yet
    // This would require SQLite with sqlite-vss or similar
    console.warn('[RetrievalService] Semantic search not fully implemented - requires vector DB');
    return [];
  }

  private async hybridSearch(
    query: string,
    filters?: SearchFilters,
    options?: QueryOptions
  ): Promise<HybridSearchResult[]> {
    // Run both searches in parallel
    const [keywordResults, semanticResults] = await Promise.all([
      this.keywordSearch(query, filters, { ...options, limit: this.config.maxResults * 2 }),
      this.semanticSearch(query, filters, { ...options, limit: this.config.maxResults * 2 }),
    ]);

    // Merge using Reciprocal Rank Fusion
    const merged = this.mergeWithRRF(keywordResults, semanticResults);

    return merged;
  }

  private mergeWithRRF(
    keywordResults: HybridSearchResult[],
    semanticResults: HybridSearchResult[]
  ): HybridSearchResult[] {
    const scores = new Map<string, number>();
    const memories = new Map<string, Memory>();
    const keywordRanks = new Map<string, number>();
    const semanticRanks = new Map<string, number>();

    // Add keyword results
    keywordResults.forEach((result, index) => {
      const id = result.memory.id;
      scores.set(id, (scores.get(id) || 0) + 1.0 / (RRF_K + index + 1) * this.config.keywordWeight);
      memories.set(id, result.memory);
      keywordRanks.set(id, index + 1);
    });

    // Add semantic results
    semanticResults.forEach((result, index) => {
      const id = result.memory.id;
      scores.set(id, (scores.get(id) || 0) + 1.0 / (RRF_K + index + 1) * this.config.semanticWeight);
      memories.set(id, result.memory);
      semanticRanks.set(id, index + 1);
    });

    // Convert to array and sort by RRF score
    const merged: HybridSearchResult[] = [];
    scores.forEach((rrfScore, id) => {
      const memory = memories.get(id)!;
      merged.push({
        memory,
        score: rrfScore,
        keywordRank: keywordRanks.get(id),
        semanticRank: semanticRanks.get(id),
        rrfScore,
        boostFactors: this.calculateBoostFactors(memory),
      });
    });

    return merged.sort((a, b) => b.rrfScore - a.rrfScore);
  }

  private rankResults(results: HybridSearchResult[]): HybridSearchResult[] {
    return results.map(result => {
      // Calculate final score from RRF and boost factors
      const layerBoost = result.boostFactors.layer;
      const importanceBoost = result.boostFactors.importance;
      const freshnessBoost = result.boostFactors.freshness;
      const confidenceBoost = result.boostFactors.confidence;

      // Combine scores (multiplicative boosts)
      const finalScore = result.rrfScore * 
        layerBoost * 
        importanceBoost * 
        freshnessBoost * 
        confidenceBoost;

      return {
        ...result,
        score: finalScore,
      };
    }).sort((a, b) => b.score - a.score);
  }

  private filterResults(results: HybridSearchResult[]): HybridSearchResult[] {
    // Filter by minimum relevance
    let filtered = results.filter(r => r.score >= this.config.minRelevanceScore);

    // Limit results
    filtered = filtered.slice(0, this.config.maxResults);

    return filtered;
  }

  private calculateBoostFactors(memory: Memory): HybridSearchResult['boostFactors'] {
    // Layer boost
    const layerBoost = LAYER_BOOST[memory.layer] || 1.0;

    // Importance boost
    const importanceBoost = IMPORTANCE_BOOST[memory.importance] || 1.0;

    // Freshness boost (decay over time)
    const ageDays = (Date.now() - new Date(memory.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    const freshnessBoost = Math.max(0.5, 1.0 - (ageDays / 90)); // Decay over 90 days

    // Confidence boost
    const confidenceBoost = 0.5 + (memory.confidence * 0.5); // Range 0.5 to 1.0

    return {
      layer: layerBoost,
      importance: importanceBoost,
      freshness: freshnessBoost,
      confidence: confidenceBoost,
    };
  }

  // Public method to check if semantic search is available
  async isSemanticAvailable(): Promise<boolean> {
    const provider = this.providerRouter.getEmbeddingProvider();
    return provider ? await provider.isHealthy() : false;
  }
}
