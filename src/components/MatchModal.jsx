import { useEffect, useState } from 'react';
import Confetti from './Confetti.jsx';
import { generateMatchReasons } from '../utils/matchingAlgorithm.js';

export default function MatchModal({ animal, score, userProfile, onKeepSwiping, onViewMatches }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  const { bullets, waitingNote } = generateMatchReasons(userProfile, animal);

  const scoreColor =
    score >= 80 ? '#4CAF78' :
    score >= 60 ? '#FF6B35' :
    '#94a3b8';

  const handleContactShelter = () => {
    if (animal.shelter?.url) {
      window.open(animal.shelter.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <>
      <Confetti />

      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center"
        style={{ zIndex: 150 }}
        onClick={onKeepSwiping}
      >
        {/* Modal sheet */}
        <div
          className={`w-full max-w-[430px] bg-white rounded-t-[32px] overflow-hidden transition-all duration-500 ${
            visible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
          }`}
          style={{ maxHeight: '92vh', overflowY: 'auto' }}
          onClick={e => e.stopPropagation()}
        >
          {/* Pull handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 bg-gray-200 rounded-full" />
          </div>

          {/* Animal photo */}
          <div className="relative mx-5 mt-3 rounded-2xl overflow-hidden" style={{ height: 200 }}>
            <img
              src={animal.photo}
              alt={animal.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
            <div className="absolute bottom-3 left-4 right-4">
              <p className="text-white text-xs font-bold opacity-90">
                ⏰ {animal.daysInShelter} days in shelter
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 pt-5 pb-8">

            {/* Score */}
            <div className="text-center mb-5 animate-pop-in">
              <div
                className="inline-flex items-center justify-center w-20 h-20 rounded-full border-4 mb-3 shadow-lg"
                style={{ borderColor: scoreColor, backgroundColor: `${scoreColor}18` }}
              >
                <span className="font-display text-2xl font-bold" style={{ color: scoreColor }}>
                  {score}%
                </span>
              </div>
              <h2 className="font-display text-2xl font-bold text-gray-900 leading-tight">
                You and {animal.name}
              </h2>
              <h2 className="font-display text-2xl font-bold leading-tight" style={{ color: scoreColor }}>
                are a {score}% match!
              </h2>
              <p className="text-gray-400 text-sm mt-1 font-semibold">
                {animal.breed} · {animal.age} {animal.age === 1 ? 'year' : 'years'} old
              </p>
            </div>

            {/* Why compatible */}
            <div className="bg-[#FFF8F0] rounded-2xl p-4 mb-4 animate-slide-up-fade">
              <p className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-3">
                Why you're compatible
              </p>
              <ul className="space-y-2.5">
                {bullets.map((bullet, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="text-[#4CAF78] font-black text-lg leading-tight flex-shrink-0 mt-0.5">✓</span>
                    <span className="text-gray-700 text-sm leading-snug font-semibold">{bullet}</span>
                  </li>
                ))}
              </ul>

              {waitingNote && (
                <div className="mt-3 pt-3 border-t border-amber-200 flex items-start gap-2.5">
                  <span className="text-amber-500 text-lg leading-tight flex-shrink-0 mt-0.5">⏰</span>
                  <span className="text-amber-600 text-sm leading-snug font-bold">{waitingNote}</span>
                </div>
              )}
            </div>

            {/* Personality tag */}
            <div className="flex items-center justify-center mb-4">
              <span className="bg-orange-50 border border-orange-200 text-[#FF6B35] px-4 py-1.5 rounded-full text-sm font-bold">
                {animal.personalityTag}
              </span>
            </div>

            {/* Shelter CTA */}
            {animal.shelter && (
              <div className="bg-gray-50 rounded-2xl p-4 mb-4 border border-gray-100">
                <p className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-3">
                  Ready to meet {animal.name}?
                </p>
                <button
                  onClick={handleContactShelter}
                  className="w-full py-3.5 rounded-xl font-bold text-sm bg-[#4CAF78] text-white shadow hover:bg-green-600 active:scale-95 transition-all duration-200 mb-2.5"
                >
                  Contact {animal.shelter.name} →
                </button>
                <p className="text-xs text-gray-400 text-center leading-snug">
                  📍 {animal.shelter.address}
                </p>
                {animal.daysInShelter > 90 && (
                  <p className="text-xs text-amber-600 font-bold text-center mt-2 leading-snug">
                    ⏰ {animal.name} has been waiting {animal.daysInShelter} days. Please reach out today.
                  </p>
                )}
              </div>
            )}

            {/* Navigation CTAs */}
            <div className="flex flex-col gap-3">
              <button
                onClick={onKeepSwiping}
                className="w-full py-4 rounded-2xl font-bold text-base bg-[#FF6B35] text-white shadow-lg hover:bg-orange-600 active:scale-95 transition-all duration-200"
              >
                🐾 Keep Swiping
              </button>
              <button
                onClick={onViewMatches}
                className="w-full py-4 rounded-2xl font-bold text-base bg-white border-2 border-[#FF6B35] text-[#FF6B35] hover:bg-orange-50 active:scale-95 transition-all duration-200"
              >
                ❤️ View All My Matches
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
