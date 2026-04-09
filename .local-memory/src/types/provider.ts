export interface SingleProviderConfig {
  provider: string;
  model?: string;
  timeout?: number;
  maxRetries?: number;
  baseUrl?: string;
  [key: string]: unknown;
}

export interface ProviderConfig {
  provider?: string;
  model?: string;
  timeout?: number;
  maxRetries?: number;
  baseUrl?: string;
  embedding?: SingleProviderConfig;
  inference?: SingleProviderConfig;
  [key: string]: unknown;
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

export interface ProviderHealth {
  available: boolean;
  provider: string;
  model?: string;
  latency?: number;
  lastError?: string;
}

export interface ProviderStatus {
  embedding: ProviderHealth;
  inference: ProviderHealth;
  degraded: boolean;
  degradedReason?: string;
}

export interface EmbeddingProvider {
  readonly name: string;
  readonly version: string;
  readonly dimensions: number;
  embed(text: string): Promise<Float32Array>;
  embedBatch(texts: string[]): Promise<Float32Array[]>;
  isHealthy(): Promise<boolean>;
  initialize(config: ProviderConfig): Promise<void>;
  dispose(): Promise<void>;
}

export interface InferenceProvider {
  readonly name: string;
  readonly version: string;
  complete(prompt: string, options?: CompletionOptions): Promise<string>;
  classify(text: string, categories: string[]): Promise<ClassificationResult>;
  isHealthy(): Promise<boolean>;
  initialize(config: ProviderConfig): Promise<void>;
  dispose(): Promise<void>;
}
