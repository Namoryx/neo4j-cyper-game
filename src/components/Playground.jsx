import { useCallback, useState } from 'react';
import { runCypher } from '../services/api.js';
import { toRows } from '../utils/normalize.js';
import { ensureLimit } from '../utils/cypher.js';

function Playground({ onResultsChange, onLastRun }) {
  const [query, setQuery] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRun = useCallback(async () => {
    setError(null);
    if (!query.trim()) {
      setError('Cypher를 입력해주세요.');
      return;
    }

    const safeQuery = ensureLimit(query, 50);
    const start = performance.now();
    setLoading(true);
    try {
      const response = await runCypher(safeQuery, {});
      const rows = toRows(response);
      onResultsChange?.(rows?.slice(0, 50) ?? []);
      const elapsed = Math.round(performance.now() - start);
      onLastRun?.({ query: safeQuery, ms: elapsed, rowCount: rows?.length ?? 0, source: 'playground' });
    } catch (err) {
      setError(err?.message || '실행 중 오류가 발생했습니다.');
      onResultsChange?.([]);
    } finally {
      setLoading(false);
    }
  }, [onLastRun, onResultsChange, query]);

  const handleKeyDown = (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      handleRun();
    }
  };

  return (
    <div className="card playground-card">
      <div className="card-header">
        <div>
          <p className="subtitle">Playground</p>
          <span className="muted">읽기 전용 쿼리만 가능</span>
        </div>
      </div>
      <div className="playground-body">
        <label className="playground-label" htmlFor="playground-query">
          자유 Cypher 입력
        </label>
        <textarea
          id="playground-query"
          className="playground-textarea"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="MATCH (n) RETURN n LIMIT 20"
          aria-label="Playground Cypher 입력"
          data-testid="playground-textarea"
        />
        {error ? <p className="error-text">{error}</p> : null}
        <button type="button" className="primary-button" onClick={handleRun} disabled={loading}>
          {loading ? '실행 중...' : '실행 (Ctrl+Enter)'}
        </button>
      </div>
    </div>
  );
}

export default Playground;
