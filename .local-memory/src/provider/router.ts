// Provider Router - manages embedding and inference providers

import type { 
  EmbeddingProvider, 
  InferenceProvider, 
  ProviderConfig,
  ProviderStatus,
  ProviderHealth 
} from '../types/provider.ts';

export interface ProviderRouter {
  getEmbeddingProvider(): EmbeddingProvider | null;
  getInferenceProvider(): InferenceProvider | null;
  getStatus(): ProviderStatus;
  isDegraded(): boolean;
  initialize(config: ProviderConfig): Promise<void>;
  dispose(): Promise<void>;
}

// Base provider implementation
export abstract class BaseEmbeddingProvider implements EmbeddingProvider {
  abstract readonly name: string;
  abstract readonly version: string;
  abstract readonly dimensions: number;
  
  protected config: ProviderConfig;
  protected healthy = false;

  constructor(config: ProviderConfig) {
    this.config = config;
  }

  abstract embed(text: string): Promise<Float32Array>;
  abstract embedBatch(texts: string[]): Promise<Float32Array[]>;
  
  async isHealthy(): Promise<boolean> {
    return this.healthy;
  }

  abstract initialize(config: ProviderConfig): Promise<void>;
  abstract dispose(): Promise<void>;

  protected async checkHealth(): Promise<boolean> {
    try {
      // Try a simple embedding to verify connectivity
      await this.embed('health check');
      this.healthy = true;
      return true;
    } catch {
      this.healthy = false;
      return false;
    }
  }
}

// Null provider - used when no semantic provider is configured
export class NullEmbeddingProvider extends BaseEmbeddingProvider {
  readonly name = 'null';
  readonly version = '1.0.0';
  readonly dimensions = 0;

  async embed(): Promise<Float32Array> {
    throw new Error('Null provider cannot generate embeddings');
  }

  async embedBatch(): Promise<Float32Array[]> {
    throw new Error('Null provider cannot generate embeddings');
  }

  async initialize(): Promise<void> {
    this.healthy = false;
  }

  async dispose(): Promise<void> {
    this.healthy = false;
  }
}

// Ollama provider implementation
export class OllamaEmbeddingProvider extends BaseEmbeddingProvider {
  readonly name = 'ollama';
  readonly version = '1.0.0';
  readonly dimensions = 768; // nomic-embed-text default
  
  private baseUrl: string;
  private model: string;

  constructor(config: ProviderConfig) {
    super(config);
    this.baseUrl = config.baseUrl || 'http://localhost:11434';
    this.model = config.model || 'nomic-embed-text';
  }

  async embed(text: string): Promise<Float32Array> {
    const response = await fetch(`${this.baseUrl}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: this.model, prompt: text }),
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status} ${await response.text()}`);
    }

    const data = await response.json() as { embedding: number[] };
    return new Float32Array(data.embedding);
  }

  async embedBatch(texts: string[]): Promise<Float32Array[]> {
    // Ollama doesn't have native batch support, so we do sequential
    const results: Float32Array[] = [];
    for (const text of texts) {
      results.push(await this.embed(text));
    }
    return results;
  }

  async initialize(): Promise<void> {
    // Check if Ollama is available
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, { 
        method: 'GET',
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

  async dispose(): Promise<void> {
    this.healthy = false;
  }
}

// Local provider - placeholder for local model implementation
export class LocalEmbeddingProvider extends BaseEmbeddingProvider {
  readonly name = 'local';
  readonly version = '1.0.0';
  readonly dimensions = 384; // Smaller for local models

  async embed(): Promise<Float32Array> {
    // Placeholder - would use local onnxruntime or similar
    throw new Error('Local provider not yet implemented');
  }

  async embedBatch(): Promise<Float32Array[]> {
    throw new Error('Local provider not yet implemented');
  }

  async initialize(): Promise<void> {
    this.healthy = false; // Not implemented yet
  }

  async dispose(): Promise<void> {
    this.healthy = false;
  }
}

// Provider Router implementation
export class DefaultProviderRouter implements ProviderRouter {
  private embeddingProvider: EmbeddingProvider | null = null;
  private inferenceProvider: InferenceProvider | null = null;
  private config: ProviderConfig = { embedding: { provider: 'none' }, inference: { provider: 'none' } };
  private degraded = false;
  private degradedReason: string | null = null;
  private embeddingHealth: ProviderHealth = {
    available: false,
    provider: 'none',
    lastError: 'No provider configured',
  };
  private inferenceHealth: ProviderHealth = {
    available: false,
    provider: 'none',
  };

  async initialize(config: ProviderConfig): Promise<void> {
    this.config = config;
    this.degraded = false;
    this.degradedReason = null;

    // Initialize embedding provider
    if (config.embedding?.provider && config.embedding.provider !== 'none') {
      try {
        this.embeddingProvider = this.createEmbeddingProvider(config.embedding);
        await this.embeddingProvider.initialize(config.embedding);

        const healthy = await this.embeddingProvider.isHealthy();
        this.embeddingHealth = {
          available: healthy,
          provider: this.embeddingProvider.name,
          model: config.embedding.model,
          lastError: healthy ? undefined : 'Embedding provider unhealthy',
        };

        if (!healthy) {
          this.setDegraded('Embedding provider unhealthy, falling back to keyword-only');
        }
      } catch (error) {
        this.setDegraded(`Failed to initialize embedding provider: ${error}`);
        this.embeddingProvider = new NullEmbeddingProvider(config.embedding);
        await this.embeddingProvider.initialize(config.embedding);
        this.embeddingHealth = {
          available: false,
          provider: this.embeddingProvider.name,
          model: config.embedding.model,
          lastError: String(error),
        };
      }
    } else {
      this.embeddingProvider = new NullEmbeddingProvider({ provider: 'none' });
      await this.embeddingProvider.initialize({ provider: 'none' });
      this.setDegraded('No embedding provider configured, keyword-only mode');
      this.embeddingHealth = {
        available: false,
        provider: this.embeddingProvider.name,
        lastError: 'No embedding provider configured',
      };
    }

    // Initialize inference provider (if different from embedding)
    if (config.inference?.provider && config.inference.provider !== 'none') {
      // Similar logic for inference provider
      // For V1, we can skip inference provider as we use rule-based classification
      this.inferenceHealth = {
        available: false,
        provider: config.inference.provider,
        model: config.inference.model,
      };
    } else {
      this.inferenceHealth = {
        available: false,
        provider: 'none',
      };
    }

    console.log(`[ProviderRouter] Initialized with embedding: ${this.embeddingProvider?.name || 'none'}`);
    if (this.degraded) {
      console.warn(`[ProviderRouter] Degraded: ${this.degradedReason}`);
    }
  }

  getEmbeddingProvider(): EmbeddingProvider | null {
    return this.embeddingProvider;
  }

  getInferenceProvider(): InferenceProvider | null {
    return this.inferenceProvider;
  }

  getStatus(): ProviderStatus {
    return {
      embedding: this.embeddingHealth,
      inference: this.inferenceHealth,
      degraded: this.degraded,
      degradedReason: this.degradedReason || undefined,
    };
  }

  isDegraded(): boolean {
    return this.degraded;
  }

  async dispose(): Promise<void> {
    await this.embeddingProvider?.dispose();
    await this.inferenceProvider?.dispose();
    this.degraded = false;
    this.degradedReason = null;
    this.embeddingHealth = {
      available: false,
      provider: 'none',
      lastError: 'No provider configured',
    };
    this.inferenceHealth = {
      available: false,
      provider: 'none',
    };
  }

  private createEmbeddingProvider(config: ProviderConfig): EmbeddingProvider {
    switch (config.provider) {
      case 'ollama':
        return new OllamaEmbeddingProvider(config);
      case 'local':
        return new LocalEmbeddingProvider(config);
      case 'none':
      default:
        return new NullEmbeddingProvider(config);
    }
  }

  private setDegraded(reason: string): void {
    this.degraded = true;
    this.degradedReason = reason;
  }
}

// Singleton instance
let routerInstance: ProviderRouter | null = null;

export function getProviderRouter(): ProviderRouter {
  if (!routerInstance) {
    routerInstance = new DefaultProviderRouter();
  }
  return routerInstance;
}

export function resetProviderRouter(): void {
  routerInstance = null;
}
