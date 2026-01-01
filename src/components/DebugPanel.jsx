import React from 'react';

function DebugPanel({ lastRun }) {
  const attempts = lastRun?.debug?.attempts || [];
  const truncate = (text) => {
    if (!text) return '';
    if (text.length > 600) return `${text.slice(0, 600)}…`;
    return text;
  };

  return (
    <div className="card debug-card">
      <div className="card-header">
        <p className="subtitle">Debug</p>
        <span className="muted">요청/응답 세부 정보</span>
      </div>
      <div className="debug-body">
        {lastRun ? (
          <div className="debug-meta">
            <p className="muted">최근 실행 · {lastRun.source === 'browser' ? 'Browse' : 'Playground'}</p>
            <p className="debug-query">{lastRun.query}</p>
            {lastRun.error ? <p className="status error">{lastRun.error}</p> : null}
          </div>
        ) : (
          <p className="muted">최근 실행 정보가 없습니다.</p>
        )}

        {attempts.length ? (
          <div className="debug-attempts" data-testid="debug-attempts">
            {attempts.map((attempt, index) => (
              <details key={`${attempt.url}-${index}`} className="debug-attempt" open={index === 0}>
                <summary>
                  {attempt.label || 'request'} · {attempt.status || attempt.error || 'pending'}
                </summary>
                <dl>
                  <dt>URL</dt>
                  <dd className="muted">{attempt.url || '알 수 없음'}</dd>
                  <dt>Body</dt>
                  <dd>
                    <pre className="debug-pre">{JSON.stringify(attempt.body, null, 2)}</pre>
                  </dd>
                  <dt>Status</dt>
                  <dd className="muted">
                    {attempt.status ? `${attempt.status} ${attempt.statusText || ''}`.trim() : '응답 없음'}
                  </dd>
                  <dt>응답 원문</dt>
                  <dd>
                    <pre className="debug-pre">{truncate(attempt.responseText) || '없음'}</pre>
                  </dd>
                  {attempt.error ? <dd className="error-text">{attempt.error}</dd> : null}
                  {attempt.corsLikely ? <dd className="muted">CORS 문제 가능성</dd> : null}
                </dl>
              </details>
            ))}
          </div>
        ) : (
          <p className="muted">요청 기록이 없습니다. 쿼리를 실행해보세요.</p>
        )}
      </div>
    </div>
  );
}

export default DebugPanel;
