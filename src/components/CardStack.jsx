import { useState, useRef } from 'react';
import SwipeCard from './SwipeCard.jsx';
import AnimalDetailModal from './AnimalDetailModal.jsx';

const SG_SPECIAL_FACTS = [
  "Singapore Specials are mixed-breed dogs rescued from our local streets and kampungs. They're resilient, street-smart, and deeply loyal.",
  "Singapore Specials are NOT HDB-approved, so they need private housing. But they make up for it with unconditional love and adaptability.",
  "Studies show mixed-breed dogs often have fewer genetic health issues than purebreds — Singapore Specials tend to live long, healthy lives.",
  "Many Singapore Specials were saved by volunteers who trap, neuter, and rehome them. Adopting one directly supports this vital community work.",
];

function SingaporeSpecialCard({ swipeCount, onDismiss }) {
  const fact = SG_SPECIAL_FACTS[(Math.floor(swipeCount / 5) - 1) % SG_SPECIAL_FACTS.length];

  return (
    <div className="absolute inset-0 z-20">
      <div className="w-full h-full bg-gradient-to-br from-[#2d7a4f] to-[#4CAF78] rounded-[28px] overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.2)] flex flex-col">
        {/* Top pattern */}
        <div className="relative flex-1 flex flex-col items-center justify-center px-7 text-center">
          <div className="text-7xl mb-4">🐕</div>
          <div className="bg-white/20 rounded-full px-4 py-1.5 mb-4">
            <span className="text-white text-xs font-extrabold uppercase tracking-widest">Did you know?</span>
          </div>
          <h2 className="font-display text-2xl font-bold text-white leading-snug mb-4">
            About Singapore Specials
          </h2>
          <p className="text-white/90 text-sm leading-relaxed font-medium">
            {fact}
          </p>
        </div>

        {/* Bottom */}
        <div className="px-6 pb-8 flex flex-col gap-3">
          <button
            onClick={onDismiss}
            className="w-full py-4 rounded-2xl font-bold text-base bg-white text-[#2d7a4f] shadow-lg hover:bg-green-50 active:scale-95 transition-all duration-200"
          >
            Got it! Keep swiping 🐾
          </button>
          <p className="text-white/70 text-xs text-center font-semibold">
            Singapore Specials need private housing (not HDB)
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CardStack({ animals, onSwipeRight, onSwipeLeft }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeCount, setSwipeCount] = useState(0);
  const [showSgCard, setShowSgCard] = useState(false);
  const [detailAnimal, setDetailAnimal] = useState(null);
  const topCardRef = useRef(null);

  const visibleAnimals = animals.slice(currentIndex, currentIndex + 3);
  const hasCards = visibleAnimals.length > 0;

  const handleCardSwipe = (direction, animal) => {
    if (direction === 'right') {
      onSwipeRight(animal);
    } else {
      onSwipeLeft(animal);
    }
    const newCount = swipeCount + 1;
    setSwipeCount(newCount);
    setCurrentIndex(i => i + 1);
    // Show Singapore Special info card every 5 swipes
    if (newCount % 5 === 0) {
      setShowSgCard(true);
    }
  };

  const triggerButtonSwipe = (direction) => {
    if (topCardRef.current && hasCards && !showSgCard) {
      topCardRef.current.triggerSwipe(direction);
    }
  };

  // ── No more cards ──────────────────────────────────────────────────────────
  if (!hasCards && !showSgCard) {
    return (
      <div className="flex flex-col h-full items-center justify-center px-8 text-center">
        <div className="text-7xl mb-5">🐾</div>
        <h2 className="font-display text-2xl font-bold text-gray-800 mb-3">
          You've seen everyone!
        </h2>
        <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
          You've reviewed all the animals in our shelter. Check your matches tab to revisit the ones you liked, or retake the quiz for a fresh start.
        </p>
        <div className="flex gap-2 mt-6 text-3xl">
          <span>🐕</span><span>🐈</span><span>🐕</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full px-4 pb-4">

      {/* ── Card stack area ── */}
      <div className="relative flex-1 mb-4">
        {/* Render back to front so top card is on top */}
        {[...visibleAnimals].reverse().map((animal, reversedIdx) => {
          const behindIndex = visibleAnimals.length - 1 - reversedIdx;
          const isTop       = behindIndex === 0;
          return (
            <SwipeCard
              key={animal.id}
              ref={isTop ? topCardRef : null}
              animal={animal}
              isTop={isTop && !showSgCard}
              behindIndex={behindIndex}
              onSwipe={(dir) => handleCardSwipe(dir, animal)}
              onTap={isTop && !showSgCard ? () => setDetailAnimal(animal) : undefined}
            />
          );
        })}

        {/* Singapore Special info card overlay */}
        {showSgCard && (
          <SingaporeSpecialCard
            swipeCount={swipeCount}
            onDismiss={() => setShowSgCard(false)}
          />
        )}
      </div>

      {/* ── Action buttons ── */}
      <div className="flex items-center justify-center gap-6 pt-1 pb-2">
        {/* Pass */}
        <button
          onClick={() => triggerButtonSwipe('left')}
          disabled={showSgCard}
          className="w-16 h-16 rounded-full bg-white shadow-lg border-2 border-gray-100 flex items-center justify-center text-2xl transition-all duration-200 hover:scale-110 hover:shadow-xl active:scale-95 disabled:opacity-40"
          aria-label="Pass"
        >
          ✕
        </button>

        {/* Like */}
        <button
          onClick={() => triggerButtonSwipe('right')}
          disabled={showSgCard}
          className="w-20 h-20 rounded-full flex items-center justify-center text-3xl transition-all duration-200 hover:scale-110 active:scale-95 shadow-xl disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg, #FF6B35, #ff8c5a)' }}
          aria-label="Like"
        >
          ❤️
        </button>

        {/* Skip */}
        <button
          onClick={() => triggerButtonSwipe('left')}
          disabled={showSgCard}
          className="w-16 h-16 rounded-full bg-white shadow-lg border-2 border-gray-100 flex items-center justify-center text-xl transition-all duration-200 hover:scale-110 hover:shadow-xl active:scale-95 disabled:opacity-40"
          aria-label="Skip"
        >
          ⏭
        </button>
      </div>

      {/* ── Hint ── */}
      <p className="text-center text-[11px] text-gray-400 font-semibold pb-1">
        Tap card for details · Swipe right to adopt · Swipe left to pass
      </p>

      {/* ── Animal detail modal (tap to view) ── */}
      {detailAnimal && (
        <AnimalDetailModal
          animal={detailAnimal}
          onClose={() => setDetailAnimal(null)}
        />
      )}
    </div>
  );
}
