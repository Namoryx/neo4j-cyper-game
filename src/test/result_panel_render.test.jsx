import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import ResultPanel from '../components/ResultPanel.jsx';
import { runCypher } from '../services/api.js';
import { toRows } from '../utils/normalize.js';

const originalFetch = global.fetch;

describe('ResultPanel rendering with runCypher data', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('shows returned rows instead of the empty placeholder', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        records: [
          {
            keys: ['n'],
            _fields: [{ name: 'Neo' }],
          },
        ],
      }),
      text: async () => JSON.stringify({
        records: [
          {
            keys: ['n'],
            _fields: [{ name: 'Neo' }],
          },
        ],
      }),
    });

    const { data } = await runCypher('RETURN {name: "Neo"} AS n');
    const rows = toRows(data);

    render(<ResultPanel rows={rows} />);

    expect(screen.queryByText('결과 없음')).not.toBeInTheDocument();
    expect(screen.getByText(/Neo/)).toBeInTheDocument();
  });
});
