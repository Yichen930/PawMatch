import { useState, useRef, useImperativeHandle, forwardRef } from 'react';

const SWIPE_THRESHOLD = 90; // px

function EnergyDots({ level }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs font-bold text-gray-500">Energy</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(i => (
          <div
            key={i}
            className={`w-4 h-1.5 rounded-full transition-colors ${
              i <= level ? 'bg-[#FF6B35]' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

const SwipeCard = forwardRef(function SwipeCard(
  { animal, isTop, behindIndex = 0, onSwipe, onTap },
  ref,
) {
  // ── Drag state (ref for values, state for display trigger) ─────────────────
  const dragRef = useRef({ active: false, startX: 0, startY: 0, x: 0, y: 0 });
  const [dragDisplay, setDragDisplay] = useState({ x: 0, y: 0, active: false });
  const [exitDir, setExitDir] = useState(null); // 'left' | 'right' | null

  // ── Programmatic swipe (for button triggers) ───────────────────────────────
  useImperativeHandle(ref, () => ({
    triggerSwipe(dir) {
      if (exitDir) return;
      setExitDir(dir);
      setTimeout(() => onSwipe(dir), 360);
    },
  }));

  // ── Pointer handlers ───────────────────────────────────────────────────────
  const onPointerStart = (clientX, clientY) => {
    if (!isTop || exitDir) return;
    dragRef.current = { active: true, startX: clientX, startY: clientY, x: 0, y: 0 };
    setDragDisplay({ x: 0, y: 0, active: true });
  };

  const onPointerMove = (clientX, clientY) => {
    if (!dragRef.current.active) return;
    const x = clientX - dragRef.current.startX;
    const y = clientY - dragRef.current.startY;
    dragRef.current.x = x;
    dragRef.current.y = y;
    setDragDisplay({ x, y, active: true });
  };

  const onPointerEnd = () => {
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    const { x, y } = dragRef.current;

    // Treat as a tap if barely moved — show detail view
    if (Math.abs(x) < 10 && Math.abs(y) < 15) {
      setDragDisplay({ x: 0, y: 0, active: false });
      onTap?.();
      return;
    }

    if (x > SWIPE_THRESHOLD) {
      setExitDir('right');
      setTimeout(() => onSwipe('right'), 360);
    } else if (x < -SWIPE_THRESHOLD) {
      setExitDir('left');
      setTimeout(() => onSwipe('left'), 360);
    } else {
      dragRef.current.x = 0;
      dragRef.current.y = 0;
      setDragDisplay({ x: 0, y: 0, active: false });
    }
  };

  // ── Transform calculation ──────────────────────────────────────────────────
  const getTransform = () => {
    if (exitDir === 'right') return 'translateX(130%) rotate(25deg)';
    if (exitDir === 'left')  return 'translateX(-130%) rotate(-25deg)';
    if (dragDisplay.active) {
      const rot = dragDisplay.x * 0.07;
      return `translateX(${dragDisplay.x}px) translateY(${dragDisplay.y * 0.25}px) rotate(${rot}deg)`;
    }
    if (!isTop && behindIndex > 0) {
      const scale = 1 - behindIndex * 0.04;
      const ty    = behindIndex * 14;
      return `scale(${scale}) translateY(${ty}px)`;
    }
    return 'scale(1) translateY(0)';
  };

  const absX           = Math.abs(dragDisplay.x);
  const overlayOpacity = Math.min(absX / SWIPE_THRESHOLD, 1);
  const showAdopt      = dragDisplay.x > 15;
  const showPass       = dragDisplay.x < -15;

  return (
    <div
      className="swipe-card absolute inset-0"
      style={{
        transform:  getTransform(),
        transition: dragDisplay.active ? 'none' : 'transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        zIndex:     isTop ? 10 : 10 - behindIndex,
        cursor:     isTop ? (dragDisplay.active ? 'grabbing' : 'grab') : 'default',
      }}
      onMouseDown={isTop ? (e) => { e.preventDefault(); onPointerStart(e.clientX, e.clientY); } : undefined}
      onMouseMove={dragDisplay.active ? (e) => onPointerMove(e.clientX, e.clientY) : undefined}
      onMouseUp={dragDisplay.active ? onPointerEnd : undefined}
      onMouseLeave={dragDisplay.active ? onPointerEnd : undefined}
      onTouchStart={isTop ? (e) => onPointerStart(e.touches[0].clientX, e.touches[0].clientY) : undefined}
      onTouchMove={dragDisplay.active ? (e) => { e.preventDefault(); onPointerMove(e.touches[0].clientX, e.touches[0].clientY); } : undefined}
      onTouchEnd={dragDisplay.active ? (e) => { e.preventDefault(); onPointerEnd(); } : undefined}
    >
      <div className="w-full h-full bg-white rounded-[28px] overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.12)]">

        {/* ── Photo ── */}
        <div className="relative" style={{ height: '58%' }}>
          <img
            src={animal.photo}
            alt={animal.name}
            className="w-full h-full object-cover"
            draggable={false}
            onError={(e) => {
              e.target.onerror = null;
              if (animal.species === 'cat') {
                e.target.src = `https://placekitten.com/500/600`;
              } else if (animal.species === 'rabbit') {
                e.target.src = `https://picsum.photos/seed/rabbit/500/600`;
              } else {
                e.target.src = `https://placedog.net/500/600?id=${animal.id}`;
              }
            }}
          />
          {/* Top gradient */}
          <div className="absolute inset-0 photo-gradient" />

          {/* Waiting badge */}
          <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-amber-500 text-white px-3 py-1.5 rounded-full shadow-lg">
            <span className="text-sm">⏰</span>
            <span className="text-xs font-extrabold tracking-wide">{animal.daysInShelter}d waiting</span>
          </div>

          {/* Species */}
          <div className="absolute top-4 right-4 text-2xl drop-shadow-lg">
            {animal.species === 'dog' ? '🐕' : '🐈'}
          </div>

          {/* Special needs */}
          {animal.specialNeeds && (
            <div className="absolute bottom-3 left-4 bg-purple-500 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow">
              ✨ Special Care
            </div>
          )}
        </div>

        {/* ── Info panel ── */}
        <div className="flex flex-col justify-between px-5 py-3.5" style={{ height: '42%' }}>
          <div>
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="min-w-0">
                <h2 className="font-display text-xl font-bold text-gray-900 leading-tight">
                  {animal.name}, {animal.age}
                </h2>
                <p className="text-gray-600 text-xs font-semibold mt-0.5">{animal.breed}</p>
              </div>
              <span className="flex-shrink-0 bg-orange-50 border border-orange-200 text-[#FF6B35] px-2.5 py-1 rounded-full text-[11px] font-bold text-center leading-tight max-w-[130px]">
                {animal.personalityTag}
              </span>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <EnergyDots level={animal.energyLevel} />
              {/* HDB badge */}
              {animal.hdbApproved !== undefined && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  animal.hdbApproved
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {animal.hdbApproved ? '✓ HDB' : 'Private only'}
                </span>
              )}
            </div>
          </div>

          <p className="text-[13px] text-gray-700 leading-snug line-clamp-2">
            {animal.bio}
          </p>
        </div>

        {/* ── ADOPT overlay ── */}
        <div
          className="absolute inset-0 rounded-[28px] flex items-center justify-start pl-7"
          style={{
            backgroundColor: `rgba(76,175,120,${0.65 * (showAdopt ? overlayOpacity : 0)})`,
            opacity: showAdopt ? 1 : 0,
            transition: 'opacity 0.08s',
          }}
        >
          <div
            className="border-[3px] border-white px-5 py-2 rounded-xl"
            style={{ transform: 'rotate(-22deg)' }}
          >
            <span className="text-white text-3xl font-black tracking-[0.15em]">ADOPT</span>
          </div>
        </div>

        {/* ── PASS overlay ── */}
        <div
          className="absolute inset-0 rounded-[28px] flex items-center justify-end pr-7"
          style={{
            backgroundColor: `rgba(239,68,68,${0.65 * (showPass ? overlayOpacity : 0)})`,
            opacity: showPass ? 1 : 0,
            transition: 'opacity 0.08s',
          }}
        >
          <div
            className="border-[3px] border-white px-5 py-2 rounded-xl"
            style={{ transform: 'rotate(22deg)' }}
          >
            <span className="text-white text-3xl font-black tracking-[0.15em]">PASS</span>
          </div>
        </div>

      </div>
    </div>
  );
});

export default SwipeCard;
