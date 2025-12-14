function CypherEditor({ value, onChange, onSubmit }) {
  return (
    <div className="cypher-editor">
      <label htmlFor="cypher-input" className="subtitle">
        Cypher 작성
      </label>
      <textarea
        id="cypher-input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && event.ctrlKey) {
            event.preventDefault();
            onSubmit?.();
          }
        }}
        placeholder="여기에 MATCH 패턴을 적어 보세요"
      />
    </div>
  );
}

export default CypherEditor;
