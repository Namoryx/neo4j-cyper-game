import { useMemo } from 'react';

function FilterPanel({
  domains,
  concepts,
  draftDomain,
  draftConcepts,
  draftTrack,
  draftLesson,
  draftSearch,
  onDraftDomainChange,
  onDraftTrackChange,
  onDraftLessonChange,
  onDraftSearchChange,
  onDraftConceptToggle,
  onApply,
  onlyWeak,
  onWeakToggle,
  disabled,
  tracks = [],
  lessons = [],
  showPracticeFilters = false,
}) {
  const sortedConcepts = useMemo(() => concepts.slice().sort(), [concepts]);

  return (
    <div className={`filter-panel ${disabled ? 'filter-panel--disabled' : ''}`}>
      <div className="filter-panel__row">
        <label className="filter-panel__label" htmlFor="search-input">
          검색
        </label>
        <input
          id="search-input"
          type="search"
          value={draftSearch}
          onChange={(e) => onDraftSearchChange?.(e.target.value)}
          placeholder="문제 문장을 검색하세요"
          disabled={disabled}
        />
      </div>
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

      {showPracticeFilters ? (
        <>
          <div className="filter-panel__row">
            <label className="filter-panel__label" htmlFor="track-select">
              Track
            </label>
            <select
              id="track-select"
              value={draftTrack}
              onChange={(e) => onDraftTrackChange?.(e.target.value)}
              disabled={disabled}
            >
              {tracks.map((track) => (
                <option key={track} value={track}>
                  {track === 'all' ? '전체' : track}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-panel__row">
            <label className="filter-panel__label" htmlFor="lesson-select">
              Lesson
            </label>
            <select
              id="lesson-select"
              value={draftLesson}
              onChange={(e) => onDraftLessonChange?.(e.target.value)}
              disabled={disabled}
            >
              {lessons.map((lesson) => (
                <option key={lesson} value={lesson}>
                  {lesson === 'all' ? '전체' : lesson}
                </option>
              ))}
            </select>
          </div>
        </>
      ) : null}

      <div className="filter-panel__row">
        <p className="filter-panel__label">Concepts</p>
        <div className="filter-panel__concepts" role="group" aria-label="concept filters">
          {sortedConcepts.map((concept) => {
            const isActive = draftConcepts.includes(concept);
            return (
              <button
                key={concept}
                type="button"
                className={`concept-tag ${isActive ? 'concept-tag--active' : ''}`}
                onClick={() => onDraftConceptToggle?.(concept)}
                disabled={disabled}
              >
                {concept}
              </button>
            );
          })}
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
