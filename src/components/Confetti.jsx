import { useMemo } from 'react';

const COLORS = [
  '#FF6B35', '#4CAF78', '#FFD700', '#FF69B4',
  '#87CEEB', '#9B59B6', '#E74C3C', '#2ECC71',
];

export default function Confetti({ count = 70 }) {
  const pieces = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2.5,
      duration: 2.5 + Math.random() * 2.5,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      width: 6 + Math.random() * 8,
      height: 4 + Math.random() * 8,
      isCircle: Math.random() > 0.5,
      startRotation: Math.random() * 360,
    })),
  [count]);

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 200 }}
      aria-hidden="true"
    >
      {pieces.map(p => (
        <div
          key={p.id}
          className="absolute animate-confetti-fall"
          style={{
            '--fall-duration': `${p.duration}s`,
            '--fall-delay': `${p.delay}s`,
            left: `${p.left}%`,
            top: -20,
            width: p.width,
            height: p.height,
            backgroundColor: p.color,
            borderRadius: p.isCircle ? '50%' : '2px',
            transform: `rotate(${p.startRotation}deg)`,
            willChange: 'transform, opacity',
          }}
        />
      ))}
    </div>
  );
}
