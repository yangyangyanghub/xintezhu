import { describe, expect, it } from 'bun:test';
import { DefaultProviderRouter } from '../provider/router.ts';

describe('DefaultProviderRouter degraded mode', () => {
  it('reports keyword-only degraded status when no embedding provider is configured', async () => {
    const router = new DefaultProviderRouter();

    await router.initialize({
      embedding: { provider: 'none' },
      inference: { provider: 'none' },
    });

    const status = router.getStatus();

    expect(status.degraded).toBe(true);
    expect(status.embedding.available).toBe(false);
    expect(status.embedding.provider).toBe('null');
    expect(status.degradedReason).toContain('keyword-only');
  });
});
