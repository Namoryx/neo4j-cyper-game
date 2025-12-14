function ResultTable({ rows }) {
  if (!rows?.length) return <p className="placeholder">결과 없음</p>;

  const columns = Object.keys(rows[0]).slice(0, 5);

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
              <td key={col}>{typeof row[col] === 'object' ? JSON.stringify(row[col]) : String(row[col])}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ResultPanel({ rows }) {
  return (
    <div className="card result-card">
      <div className="card-header">
        <p className="subtitle">Result</p>
        <span className="muted">최근 실행 결과</span>
      </div>
      <ResultTable rows={rows} />
    </div>
  );
}

export default ResultPanel;
