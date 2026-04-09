// Provider Router Interfaces
// TypeScript definitions for provider abstraction layer

export interface EmbeddingProvider {
  readonly name: string;
  readonly version: string;
  readonly dimensions: number;
  
  // Core embedding operation
  embed(text: string): Promise<Float32Array>;
  
  // Batch embedding for efficiency
  embedBatch(texts: string[]): Promise<Float32Array[]>;
  
  // Health check
  isHealthy(): Promise<boolean>;
  
  // Lifecycle
  initialize(config: ProviderConfig): Promise<void>;
  dispose(): Promise<void>;
}

export interface InferenceProvider {
  readonly name: string;
  readonly version: string;
  
  // Completion/chat interface
  complete(prompt: string, options?: CompletionOptions): Promise<string>;
  
  // Classification helper
  classify(text: string, categories: string[]): Promise<ClassificationResult>;
  
  // Health check
  isHealthy(): Promise<boolean>;
  
  // Lifecycle
  initialize(config: ProviderConfig): Promise<void>;
  dispose(): Promise<void>;
}

export interface ProviderRouter {
  // Current providers
  getEmbeddingProvider(): EmbeddingProvider | null;
  getInferenceProvider(): InferenceProvider | null;
  
  // Provider selection
  setEmbeddingProvider(provider: string): Promise<void>;
  setInferenceProvider(provider: string): Promise<void>;
  
  // Status
  getStatus(): ProviderStatus;
  
  // Degraded mode check
  isDegraded(): boolean;
  getDegradedReason(): string | null;
}

// Supporting types
export interface ProviderConfig {
  provider: string;
  model?: string;
  timeout?: number;
  maxRetries?: number;
  [key: string]: any;
}

export interface CompletionOptions {
  temperature?: number;
  maxTokens?: number;
  stopSequences?: string[];
}

export interface ClassificationResult {
  category: string;
  confidence: number;
  scores: Record<string, number>;
}

export interface ProviderStatus {
  embedding: ProviderHealth;
  inference: ProviderHealth;
  degraded: boolean;
  degradedReason?: string;
}

export interface ProviderHealth {
  available: boolean;
  provider: string;
  model?: string;
  latency?: number;
  lastError?: string;
}

// Provider implementations registry
export interface ProviderRegistry {
  registerEmbedding(name: string, factory: ProviderFactory<EmbeddingProvider>): void;
  registerInference(name: string, factory: ProviderFactory<InferenceProvider>): void;
  
  createEmbedding(name: string): EmbeddingProvider;
  createInference(name: string): InferenceProvider;
  
  listAvailable(): string[];
}

export type ProviderFactory<T> = (config: ProviderConfig) => T;

// Built-in provider names
export const BUILTIN_PROVIDERS = {
  EMBEDDING: ['none', 'ollama', 'local'] as const,
  INFERENCE: ['none', 'ollama', 'local'] as const
};

// Default/fallback behavior
export const DEFAULT_PROVIDER_CONFIG: ProviderConfig = {
  provider: 'none',
  timeout: 30000,
  maxRetries: 3
};
