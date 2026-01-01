import { useMemo, useState } from 'react';
import { runCypher } from '../services/api.js';
import { toRows } from '../utils/normalize.js';
import { ensureLimit } from '../utils/cypher.js';
import browserQueries from '../data/browserQueries.json';

function DataBrowser({ onResultsChange, onLastRun }) {
  const [selectedId, setSelectedId] = useState(browserQueries[0]?.id);
  const [showQuery, setShowQuery] = useState(false);
  const [copyStatus, setCopyStatus] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const selectedQuery = useMemo(
    () => browserQueries.find((item) => item.id === selectedId) || browserQueries[0],
    [selectedId]
  );

  const handleCopy = async () => {
    if (!selectedQuery?.query) return;
    try {
      await navigator.clipboard?.writeText(selectedQuery.query);
      setCopyStatus('복사 완료');
    } catch (err) {
      setCopyStatus('복사 실패');
    }
  };

  const handleRun = async () => {
    if (!selectedQuery?.query) return;
    setError(null);
    setCopyStatus(null);
    setLoading(true);
    const safeQuery = ensureLimit(selectedQuery.query, 50);
    const start = performance.now();
    try {
      const { data, debug } = await runCypher(safeQuery, {});
      const rows = toRows(data);
      onResultsChange?.(rows?.slice(0, 50) ?? []);
      const elapsed = Math.round(performance.now() - start);
      onLastRun?.({ query: safeQuery, ms: elapsed, rowCount: rows?.length ?? 0, source: 'browser', debug });
    } catch (err) {
      setError(err?.message || '실행 중 오류가 발생했습니다.');
      onResultsChange?.([]);
      onLastRun?.({ query: safeQuery, source: 'browser', error: err?.message, debug: err?.debug });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card data-browser-card">
      <div className="card-header">
        <div>
          <p className="subtitle">Browse Data</p>
          <span className="muted">안전한 쿼리로 데이터셋을 둘러보세요.</span>
        </div>
      </div>
      <div className="data-browser">
        <div className="data-browser__list" data-testid="browser-query-list">
          {browserQueries.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`browser-query ${item.id === selectedId ? 'browser-query--active' : ''}`}
              onClick={() => setSelectedId(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="data-browser__detail">
          <div className="data-browser__header">
            <div>
              <h3 className="data-browser__title">{selectedQuery?.label}</h3>
              <p className="muted">{selectedQuery?.description}</p>
            </div>
            <div className="data-browser__actions">
              <button type="button" className="secondary-button" onClick={() => setShowQuery((prev) => !prev)}>
                {showQuery ? '쿼리 숨기기' : '쿼리 보기/복사'}
              </button>
              <button type="button" className="primary-button" onClick={handleRun} disabled={loading}>
                {loading ? '실행 중...' : '실행'}
              </button>
            </div>
          </div>
          {showQuery ? (
            <div className="data-browser__query">
              <textarea readOnly value={selectedQuery?.query || ''} aria-label="브라우저 쿼리" />
              <button type="button" className="text-button" onClick={handleCopy}>
                쿼리 복사
              </button>
              {copyStatus ? <span className="muted">{copyStatus}</span> : null}
            </div>
          ) : null}
          {error ? <p className="error-text">{error}</p> : null}
        </div>
      </div>
    </div>
  );
}

export default DataBrowser;
