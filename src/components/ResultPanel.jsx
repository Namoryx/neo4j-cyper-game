import { useState } from 'react';

function formatCellValue(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') {
    const text = JSON.stringify(value);
    return text.length > 120 ? `${text.slice(0, 120)}…` : text;
  }
  return String(value);
}

function getColumns(rows, maxColumns = 6) {
  const columnCounts = new Map();
  rows.forEach((row) => {
    if (!row || typeof row !== 'object') return;
    Object.keys(row).forEach((key) => {
      columnCounts.set(key, (columnCounts.get(key) || 0) + 1);
    });
  });

  return Array.from(columnCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxColumns)
    .map(([key]) => key);
}

function ResultTable({ rows }) {
  if (!rows?.length) return <p className="placeholder">결과 없음</p>;

  const columns = getColumns(rows, 6);
  if (!columns.length) return <p className="placeholder">표시할 컬럼이 없습니다.</p>;

  return (
    <table className="result-table">
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col}>{col}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.slice(0, 10).map((row, idx) => (
          <tr key={idx}>
            {columns.map((col) => (
              <td key={col}>{formatCellValue(row?.[col])}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ResultPanel({ rows }) {
  const [showRaw, setShowRaw] = useState(false);

  return (
    <div className="card result-card">
      <div className="card-header">
        <p className="subtitle">Result</p>
        <button type="button" className="text-button" onClick={() => setShowRaw((prev) => !prev)}>
          {showRaw ? '원본 JSON 숨기기' : '원본 JSON 보기'}
        </button>
      </div>
      <ResultTable rows={rows} />
      {showRaw ? <pre className="result-raw">{JSON.stringify(rows, null, 2)}</pre> : null}
    </div>
  );
}

export default ResultPanel;
