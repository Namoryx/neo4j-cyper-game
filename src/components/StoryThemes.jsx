function StoryThemes({ themes = [], activeTheme, onSelect }) {
  if (!themes.length) return null;

  return (
    <div className="story-themes" aria-label="스토리 테마 선택">
      {themes.map((theme) => {
        const isActive = theme.id === activeTheme;
        return (
          <button
            key={theme.id}
            type="button"
            className={`story-theme ${isActive ? 'story-theme--active' : ''}`}
            onClick={() => onSelect?.(theme.id)}
            aria-pressed={isActive}
          >
            <div className="story-theme__header">
              <span className="story-theme__eyebrow">스토리</span>
              <strong className="story-theme__title">{theme.title}</strong>
            </div>
            <p className="story-theme__description">{theme.description}</p>
            <span className="story-theme__meta">도메인: {theme.domainLabel}</span>
          </button>
        );
      })}
    </div>
  );
}

export default StoryThemes;
