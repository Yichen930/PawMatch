import { useEffect, useState } from 'react';

function EnergyDots({ level }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-bold text-gray-400">Energy</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(i => (
          <div
            key={i}
            className={`w-5 h-2 rounded-full ${i <= level ? 'bg-[#FF6B35]' : 'bg-gray-200'}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function AnimalDetailModal({ animal, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 30);
    return () => clearTimeout(t);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 320);
  };

  const handleContactShelter = () => {
    if (animal.shelter?.url) {
      window.open(animal.shelter.url, '_blank', 'noopener,noreferrer');
    }
  };

  const scoreColor =
    animal.score >= 80 ? '#4CAF78' :
    animal.score >= 60 ? '#FF6B35' :
    '#94a3b8';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center"
        style={{ zIndex: 200 }}
        onClick={handleClose}
      >
        {/* Sheet */}
        <div
          className={`w-full max-w-[430px] bg-white rounded-t-[32px] overflow-hidden transition-all duration-320 ${
            visible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
          }`}
          style={{ maxHeight: '94vh', overflowY: 'auto', transition: 'transform 0.32s cubic-bezier(0.32,0.72,0,1), opacity 0.32s ease' }}
          onClick={e => e.stopPropagation()}
        >
          {/* Pull handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 bg-gray-200 rounded-full" />
          </div>

          {/* Photo */}
          <div className="relative mx-4 mt-2 rounded-2xl overflow-hidden" style={{ height: 230 }}>
            <img
              src={animal.photo}
              alt={animal.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                if (animal.species === 'cat') {
                  e.target.src = 'https://placekitten.com/500/400';
                } else if (animal.species === 'rabbit') {
                  e.target.src = 'https://picsum.photos/seed/rabbit/500/400';
                } else {
                  e.target.src = `https://placedog.net/500/400?id=${animal.id}`;
                }
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

            {/* Bottom-left: days in shelter */}
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-amber-500 text-white px-3 py-1.5 rounded-full shadow">
              <span className="text-xs">⏰</span>
              <span className="text-xs font-extrabold">{animal.daysInShelter} days waiting</span>
            </div>

            {/* Bottom-right: species */}
            <div className="absolute bottom-3 right-3 text-2xl drop-shadow-lg">
              {animal.species === 'dog' ? '🐕' : animal.species === 'cat' ? '🐈' : '🐇'}
            </div>
          </div>

          {/* Content */}
          <div className="px-5 pt-4 pb-8">

            {/* Name + score row */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <h2 className="font-display text-2xl font-bold text-gray-900 leading-tight">
                  {animal.name}
                </h2>
                <p className="text-gray-500 text-sm font-semibold">
                  {animal.breed} · {animal.age} {animal.age === 1 ? 'year' : 'years'} old
                </p>
              </div>

              {animal.score !== undefined && (
                <div
                  className="flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-full border-[3px] shadow"
                  style={{ borderColor: scoreColor, backgroundColor: `${scoreColor}18` }}
                >
                  <span className="font-bold text-sm" style={{ color: scoreColor }}>
                    {animal.score}%
                  </span>
                </div>
              )}
            </div>

            {/* Badges row */}
            <div className="flex flex-wrap gap-2 mb-4">
              {/* Personality tag */}
              <span className="bg-orange-50 border border-orange-200 text-[#FF6B35] px-3 py-1 rounded-full text-xs font-bold">
                {animal.personalityTag}
              </span>

              {/* HDB badge */}
              {animal.hdbApproved !== undefined && (
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  animal.hdbApproved
                    ? 'bg-green-50 border border-green-200 text-green-700'
                    : 'bg-gray-100 border border-gray-200 text-gray-500'
                }`}>
                  {animal.hdbApproved ? '✓ HDB Approved' : 'Private Housing Only'}
                </span>
              )}

              {/* Special care */}
              {animal.specialNeeds && (
                <span className="bg-purple-50 border border-purple-200 text-purple-700 px-3 py-1 rounded-full text-xs font-bold">
                  ✨ Special Care
                </span>
              )}
            </div>

            {/* Energy */}
            <div className="mb-4">
              <EnergyDots level={animal.energyLevel} />
            </div>

            {/* MBTI type */}
            <div className="bg-gray-50 rounded-2xl px-4 py-3 mb-4 flex items-center gap-3">
              <div className="text-2xl">🧠</div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Personality type</p>
                <p className="font-display font-bold text-gray-900 text-base">{animal.mbtiType}</p>
              </div>
            </div>

            {/* Bio */}
            <div className="mb-4">
              <p className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-2">About {animal.name}</p>
              <p className="text-sm text-gray-700 leading-relaxed">{animal.bio}</p>
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
                {animal.shelter.email && !animal.shelter.email.startsWith('Contact') && (
                  <a
                    href={`mailto:${animal.shelter.email}`}
                    className="block text-center text-xs text-[#FF6B35] font-semibold mt-1.5 hover:underline"
                  >
                    ✉️ {animal.shelter.email}
                  </a>
                )}
                {animal.daysInShelter > 90 && (
                  <p className="text-xs text-amber-600 font-bold text-center mt-2 leading-snug">
                    ⏰ {animal.name} has been waiting {animal.daysInShelter} days. Please reach out today.
                  </p>
                )}
              </div>
            )}

            {/* Close button */}
            <button
              onClick={handleClose}
              className="w-full py-3.5 rounded-2xl font-bold text-sm border-2 border-gray-200 text-gray-500 hover:bg-gray-50 active:scale-95 transition-all duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
