import { useMemo } from 'react';

const COLORS = ['#10b981', '#06b6d4', '#f59e0b', '#ef4444', '#6366f1'];

function ConfettiBurst({ active }) {
  const reduceMotion =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const pieces = useMemo(
    () =>
      Array.from({ length: 26 }, (_, index) => ({
        id: index,
        left: Math.random() * 100,
        delay: (index % 10) * 25,
        duration: 850 + (index % 6) * 70,
        rotation: Math.random() * 360,
        size: 6 + (index % 4) * 2,
        color: COLORS[index % COLORS.length]
      })),
    []
  );

  if (!active || reduceMotion) return null;

  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((piece) => (
        <span
          key={piece.id}
          className="confetti__piece"
          style={{
            left: `${piece.left}%`,
            animationDelay: `${piece.delay}ms`,
            animationDuration: `${piece.duration}ms`,
            transform: `rotate(${piece.rotation}deg)`,
            width: `${piece.size}px`,
            height: `${piece.size * 2}px`,
            backgroundColor: piece.color
          }}
        />
      ))}
    </div>
  );
}

export default ConfettiBurst;
