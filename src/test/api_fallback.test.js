
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { runCypher } from '../services/api.js';

// Mock fetch globally
const originalFetch = global.fetch;

describe('runCypher with Mock Fallback', () => {
  beforeAll(() => {
    global.fetch = vi.fn();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it('should return mock data when API returns empty records for known query', async () => {
    // Mock the API returning empty records
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ records: [] }),
    });

    const query = 'RETURN 1 AS one';
    const result = await runCypher(query);

    // Verify fallback to mock data
    expect(result.records).toBeDefined();
    expect(result.records.length).toBeGreaterThan(0);
    expect(result.records[0]._fields[0]).toBe(1);
    expect(result._mocked).toBe(true);
  });
});
