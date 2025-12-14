import { useMemo } from 'react';

function FilterPanel({
  domains,
  concepts,
  draftDomain,
  draftConcepts,
  onDraftDomainChange,
  onDraftConceptToggle,
  onApply,
  onlyWeak,
  onWeakToggle,
  disabled,
}) {
  const sortedConcepts = useMemo(() => concepts.slice().sort(), [concepts]);

  return (
    <div className={`filter-panel ${disabled ? 'filter-panel--disabled' : ''}`}>
      <div className="filter-panel__row">
        <label className="filter-panel__label" htmlFor="domain-select">
          Domain
        </label>
        <select
          id="domain-select"
          value={draftDomain}
          onChange={(e) => onDraftDomainChange?.(e.target.value)}
          disabled={disabled}
        >
          {domains.map((domain) => (
            <option key={domain} value={domain}>
              {domain === 'all' ? '전체' : domain}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-panel__row">
        <p className="filter-panel__label">Concepts</p>
        <div className="filter-panel__concepts" role="group" aria-label="concept filters">
          {sortedConcepts.map((concept) => (
            <label key={concept} className="filter-panel__checkbox">
              <input
                type="checkbox"
                checked={draftConcepts.includes(concept)}
                disabled={disabled}
                onChange={() => onDraftConceptToggle?.(concept)}
              />
              <span>{concept}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-panel__actions">
        <label className="filter-panel__checkbox">
          <input
            type="checkbox"
            checked={onlyWeak}
            disabled={disabled}
            onChange={(e) => onWeakToggle?.(e.target.checked)}
          />
          <span>약점만</span>
        </label>
        <button type="button" className="secondary-button" disabled={disabled} onClick={onApply}>
          적용
        </button>
      </div>
    </div>
  );
}

export default FilterPanel;
