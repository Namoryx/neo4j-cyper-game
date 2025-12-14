import { useState } from 'react';
import { runCypher } from '../services/api.js';

function DiagnosticsPanel() {
  const [open, setOpen] = useState(true);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTest = async () => {
    setLoading(true);
    setStatus(null);
    const start = performance.now();
    try {
      await runCypher('RETURN 1 AS one');
      const elapsed = Math.round(performance.now() - start);
      setStatus({ ok: true, message: `성공 · ${elapsed}ms` });
    } catch (error) {
      const elapsed = Math.round(performance.now() - start);
      setStatus({ ok: false, message: `${error?.message || '실패'} · ${elapsed}ms` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card diagnostics-card">
      <div className="card-header">
        <p className="subtitle">연결 테스트</p>
        <button type="button" className="text-button" onClick={() => setOpen((prev) => !prev)}>
          {open ? '접기' : '펼치기'}
        </button>
      </div>
      {open ? (
        <div className="diagnostics-body">
          <button type="button" className="secondary-button" disabled={loading} onClick={handleTest}>
            {loading ? '확인 중...' : 'RETURN 1 실행'}
          </button>
          {status ? (
            <p className={status.ok ? 'status success' : 'status error'}>{status.message}</p>
          ) : (
            <p className="muted">Worker 연결을 점검하세요.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default DiagnosticsPanel;
