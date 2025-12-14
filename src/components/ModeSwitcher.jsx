function ModeSwitcher({ mode, onChange }) {
  return (
    <div className="mode-switcher" aria-label="모드 선택">
      <button
        type="button"
        className={`chip ${mode === 'story' ? 'chip--active' : ''}`}
        onClick={() => onChange?.('story')}
      >
        Story
      </button>
      <button
        type="button"
        className={`chip ${mode === 'practice' ? 'chip--active' : ''}`}
        onClick={() => onChange?.('practice')}
      >
        Practice
      </button>
    </div>
  );
}

export default ModeSwitcher;
