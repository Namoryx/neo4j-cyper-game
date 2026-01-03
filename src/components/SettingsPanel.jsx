import { useEffect, useRef } from 'react';

const SOUNDTRACK_OPTIONS = [
  { id: 'A', label: 'Soundtrack A', description: '따뜻한 신스톤으로 차분한 분위기' },
  { id: 'B', label: 'Soundtrack B', description: '리듬감 있는 퍼커션으로 몰입감 상승' },
];

function SettingsPanel({ soundtrack = 'A', onSoundtrackChange }) {
  const audioContextRef = useRef(null);

  const playPreview = (variant) => {
    if (typeof window === 'undefined') return;
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) return;

    const ctx = audioContextRef.current || new AudioCtor();
    audioContextRef.current = ctx;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const baseFreq = variant === 'B' ? 520 : 440;
    const now = ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, now);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 1.25);
  };

  const handleSoundtrackChange = (value) => {
    onSoundtrackChange?.(value);
    playPreview(value);
  };

  useEffect(() => () => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }, []);

  return (
    <div className="settings-panel" aria-label="설정">
      <p className="settings-panel__title">설정</p>
      <fieldset className="settings-panel__group">
        <legend className="settings-panel__legend">사운드트랙</legend>
        {SOUNDTRACK_OPTIONS.map((option) => {
          const isActive = option.id === soundtrack;
          return (
            <label key={option.id} className={`settings-panel__option ${isActive ? 'settings-panel__option--active' : ''}`}>
              <input
                type="radio"
                name="soundtrack"
                value={option.id}
                checked={isActive}
                onChange={() => handleSoundtrackChange(option.id)}
              />
              <div className="settings-panel__texts">
                <span className="settings-panel__label">{option.label}</span>
                <span className="settings-panel__description">{option.description}</span>
              </div>
              <span className="settings-panel__preview">프리뷰</span>
            </label>
          );
        })}
      </fieldset>
    </div>
  );
}

export default SettingsPanel;
