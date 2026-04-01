import { useEffect, useState } from 'react';

function RatingBar({ icon, label, level, colorClass, labelLow, labelHigh }) {
  const levelLabel = level <= 2 ? labelLow : level >= 4 ? labelHigh : 'Moderate';
  return (
    <div className="flex items-center gap-3 mb-3 last:mb-0">
      <span className="text-lg w-7 flex-shrink-0">{icon}</span>
      <div className="flex-1">
        <div className="flex justify-between mb-1">
          <span className="text-xs font-bold text-gray-700">{label}</span>
          <span className="text-xs text-gray-400">{levelLabel}</span>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(i => (
            <div
              key={i}
              className={`h-2 rounded-full flex-1 ${i <= level ? colorClass : 'bg-gray-200'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function HeatFlames({ level }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={`text-sm ${i <= level ? 'opacity-100' : 'opacity-20'}`}>🔥</span>
      ))}
    </div>
  );
}

export default function BreedDetailModal({ breed, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 30);
    return () => clearTimeout(t);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 320);
  };

  const handleShelterSearch = () => {
    window.open(breed.shelterSearchUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center"
      style={{ zIndex: 200 }}
      onClick={handleClose}
    >
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
        <div className="relative mx-4 mt-2 rounded-2xl overflow-hidden" style={{ height: 200 }}>
          <img
            src={breed.photo}
            alt={breed.name}
            className="w-full h-full object-cover"
            onError={e => {
              e.target.onerror = null;
              e.target.src = `https://placedog.net/400/400?id=${breed.id.length * 17}`;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

          {/* HDB badge */}
          <div className={`absolute bottom-3 left-3 px-3 py-1.5 rounded-full shadow flex items-center gap-1.5 ${
            breed.hdbApproved
              ? 'bg-green-500 text-white'
              : 'bg-gray-600 text-white'
          }`}>
            <span className="text-xs font-extrabold">
              {breed.hdbApproved ? '✓ HDB Approved' : 'Private Housing Only'}
            </span>
          </div>

          {/* Heat indicator */}
          <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
            <HeatFlames level={breed.heatTolerance} />
          </div>
        </div>

        {/* Content */}
        <div className="px-5 pt-4 pb-8">

          {/* Name + stats */}
          <div className="mb-3">
            <h2 className="font-display text-2xl font-bold text-gray-900 leading-tight">{breed.name}</h2>
            <p className="text-gray-500 text-sm font-semibold mt-0.5">
              {breed.weightKg} · {breed.lifespan}
              {breed.firstTimeFriendly && (
                <span className="ml-2 text-green-600 font-bold">· Great for first-timers ✓</span>
              )}
            </p>
          </div>

          {/* Temperament tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {breed.temperament.map(tag => (
              <span
                key={tag}
                className="bg-orange-50 border border-orange-200 text-[#FF6B35] px-3 py-1 rounded-full text-xs font-bold"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Rating scales */}
          <div className="bg-gray-50 rounded-2xl p-4 mb-4">
            <p className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-3">Traits & Ratings</p>
            <RatingBar icon="⚡" label="Energy Level"    level={breed.energyLevel}    colorClass="bg-[#FF6B35]" labelLow="Couch potato"       labelHigh="Marathon runner" />
            <RatingBar icon="🎓" label="Trainability"    level={breed.trainability}   colorClass="bg-[#4CAF78]" labelLow="Independent thinker" labelHigh="Eager to please" />
            <RatingBar icon="✂️" label="Grooming Needs"  level={breed.groomingNeeds}  colorClass="bg-blue-400"  labelLow="Wash & go"           labelHigh="Salon regular" />
            <RatingBar icon="☀️" label="Heat Tolerance"  level={breed.heatTolerance}  colorClass="bg-amber-400" labelLow="Needs A/C"            labelHigh="Loves the heat" />
          </div>

          {/* Singapore Suitability */}
          <div className="bg-[#FFF8F0] border border-orange-100 rounded-2xl p-4 mb-4">
            <p className="text-xs font-extrabold text-gray-500 uppercase tracking-wider mb-3">🇸🇬 Singapore Suitability</p>
            <div className="flex flex-wrap gap-2">
              {breed.suitabilityTags.map(tag => (
                <span
                  key={tag}
                  className="bg-white border border-orange-200 text-orange-700 px-3 py-1 rounded-full text-xs font-semibold"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Ideal Owner */}
          <div className="bg-gray-50 rounded-2xl p-4 mb-4">
            <p className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-3">👤 Ideal Owner</p>
            <div className="flex flex-wrap gap-2">
              {breed.idealOwner.map(owner => (
                <span
                  key={owner}
                  className="bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-full text-xs font-semibold"
                >
                  {owner}
                </span>
              ))}
            </div>
          </div>

          {/* Health & Lifespan */}
          <div className="bg-gray-50 rounded-2xl p-4 mb-4">
            <p className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-2">❤️ Health & Lifespan</p>
            <p className="text-sm text-gray-700 font-semibold mb-3">Average lifespan: {breed.lifespan}</p>
            <div className="flex flex-wrap gap-2">
              {breed.healthIssues.map(issue => (
                <span
                  key={issue}
                  className="bg-amber-50 border border-amber-200 text-amber-700 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                >
                  {issue}
                </span>
              ))}
            </div>
          </div>

          {/* Non-HDB reason (conditional) */}
          {!breed.hdbApproved && breed.notHdbReason && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-4">
              <p className="text-sm font-bold text-red-700 mb-2">⚠️ Why Not HDB Approved</p>
              <p className="text-sm text-red-600 leading-relaxed">{breed.notHdbReason}</p>
            </div>
          )}

          {/* About */}
          <div className="mb-4">
            <p className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-2">About {breed.name}</p>
            <p className="text-sm text-gray-700 leading-relaxed">{breed.summary}</p>
          </div>

          {/* Shelter CTA */}
          <div className="bg-gray-50 rounded-2xl p-4 mb-4 border border-gray-100">
            <p className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-1">
              Find a {breed.name} to adopt
            </p>
            <p className="text-xs text-gray-400 mb-3">Search Singapore shelters for available dogs</p>
            {!breed.hdbApproved && (
              <p className="text-xs text-amber-600 font-bold mb-2">
                ⚠️ Remember: this breed requires private housing (condo or landed)
              </p>
            )}
            <button
              onClick={handleShelterSearch}
              className="w-full py-3.5 rounded-xl font-bold text-sm bg-[#4CAF78] text-white shadow hover:bg-green-600 active:scale-95 transition-all duration-200"
            >
              Search Shelter Adoptions →
            </button>
          </div>

          {/* Close */}
          <button
            onClick={handleClose}
            className="w-full py-3.5 rounded-2xl font-bold text-sm border-2 border-gray-200 text-gray-500 hover:bg-gray-50 active:scale-95 transition-all duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
