import { useState, useMemo } from 'react';
import breedsData from '../data/breedsData.js';
import BreedDetailModal from './BreedDetailModal.jsx';

// ── Filter config ────────────────────────────────────────────────────────────
const FILTER_CHIPS = [
  { key: 'hdbOnly',           label: 'HDB Approved',     type: 'toggle' },
  { key: 'firstTimeFriendly', label: 'First-timer OK',   type: 'toggle' },
  { key: 'heatTolerant',      label: 'Heat Tolerant',    type: 'toggle' },
  { key: 'energyLevel',       label: 'Low Energy',       type: 'value',  value: 'low'  },
  { key: 'energyLevel',       label: 'High Energy',      type: 'value',  value: 'high' },
  { key: 'groomingNeeds',     label: 'Low Grooming',     type: 'value',  value: 'low'  },
  { key: 'groomingNeeds',     label: 'High Grooming',    type: 'value',  value: 'high' },
  { key: 'trainability',      label: 'Highly Trainable', type: 'value',  value: 'high' },
];

const INITIAL_FILTERS = {
  hdbOnly: false,
  energyLevel: null,
  groomingNeeds: null,
  trainability: null,
  firstTimeFriendly: false,
  heatTolerant: false,
};

const rangeLow  = [1, 2];
const rangeMid  = [3];
const rangeHigh = [4, 5];
const rangeMap  = { low: rangeLow, medium: rangeMid, high: rangeHigh };

// ── Rating dots (mini, used on breed cards) ──────────────────────────────────
function MiniDots({ level, color }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <div
          key={i}
          className={`w-3.5 h-1.5 rounded-full ${i <= level ? color : 'bg-gray-200'}`}
        />
      ))}
    </div>
  );
}

// ── Individual breed card (2-per-row grid) ───────────────────────────────────
function BreedCard({ breed, onTap }) {
  return (
    <button
      onClick={onTap}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden text-left active:scale-95 transition-all duration-200 hover:shadow-md"
    >
      {/* Photo */}
      <div className="relative" style={{ height: 110 }}>
        <img
          src={breed.photo}
          alt={breed.name}
          className="w-full h-full object-cover"
          onError={e => {
            e.target.onerror = null;
            e.target.src = `https://placedog.net/400/400?id=${breed.id.length * 17}`;
          }}
        />
        {/* HDB badge overlay */}
        <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
          breed.hdbApproved
            ? 'bg-green-500 text-white'
            : 'bg-gray-500 text-white'
        }`}>
          {breed.hdbApproved ? 'HDB ✓' : 'Private'}
        </div>
        {/* First-timer badge */}
        {breed.firstTimeFriendly && (
          <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-0.5 rounded-full text-[9px] font-extrabold">
            Beginner ✓
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-3 py-2.5">
        <p className="font-display font-bold text-gray-900 text-sm leading-tight truncate mb-1.5">
          {breed.name}
        </p>
        <div className="mb-1">
          <MiniDots level={breed.energyLevel} color="bg-[#FF6B35]" />
        </div>
        <p className="text-[10px] text-gray-400 font-semibold truncate">
          {breed.temperament[0]} · {breed.temperament[1]}
        </p>
      </div>
    </button>
  );
}

// ── Singapore Special featured card ─────────────────────────────────────────
function SingaporeSpecialCard({ breed, onTap }) {
  return (
    <button
      onClick={onTap}
      className="w-full rounded-2xl overflow-hidden text-left active:scale-[0.98] transition-all duration-200 shadow-md"
    >
      <div className="bg-gradient-to-r from-[#2d7a4f] to-[#4CAF78] flex" style={{ minHeight: 120 }}>
        {/* Photo */}
        <div className="w-28 flex-shrink-0" style={{ height: 130 }}>
          <img
            src={breed.photo}
            alt={breed.name}
            className="w-full h-full object-cover"
            onError={e => {
              e.target.onerror = null;
              e.target.src = 'https://placedog.net/400/400?id=200';
            }}
          />
        </div>
        {/* Text */}
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <div className="inline-block bg-white/20 text-white text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full mb-2">
              Singapore's Own
            </div>
            <h3 className="font-display text-lg font-bold text-white leading-tight">
              {breed.name}
            </h3>
            <p className="text-white/70 text-xs font-semibold">Mixed breed · Street-rescued</p>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {breed.temperament.slice(0, 3).map(tag => (
              <span key={tag} className="bg-white/20 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
            <span className="bg-gray-600/50 text-white/80 text-[9px] font-bold px-2 py-0.5 rounded-full">
              Not HDB
            </span>
          </div>
        </div>
        {/* Arrow */}
        <div className="flex items-center pr-4">
          <span className="text-white/60 text-xl">›</span>
        </div>
      </div>
    </button>
  );
}

// ── Section header ───────────────────────────────────────────────────────────
function SectionHeader({ title, count, countColor }) {
  const colors = {
    green: 'bg-green-100 text-green-700',
    gray:  'bg-gray-100 text-gray-500',
    amber: 'bg-amber-100 text-amber-700',
  };
  return (
    <div className="flex items-center justify-between mb-3">
      <h3 className="font-display text-base font-bold text-gray-900">{title}</h3>
      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${colors[countColor] ?? colors.gray}`}>
        {count} breed{count !== 1 ? 's' : ''}
      </span>
    </div>
  );
}

// ── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ onClear }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="text-5xl mb-4">🔍</span>
      <p className="font-display font-bold text-gray-800 text-lg mb-1">No breeds match</p>
      <p className="text-gray-400 text-sm mb-5">Try adjusting your filters or search</p>
      <button
        onClick={onClear}
        className="px-6 py-2.5 rounded-2xl bg-[#FF6B35] text-white font-bold text-sm active:scale-95 transition-all"
      >
        Clear Filters
      </button>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function BreedGuide() {
  const [filters, setFilters]         = useState(INITIAL_FILTERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBreed, setSelectedBreed] = useState(null);

  const activeFilterCount = useMemo(() => {
    return Object.entries(filters).filter(([, v]) => v !== false && v !== null).length;
  }, [filters]);

  const handleChipPress = (chip) => {
    if (chip.type === 'toggle') {
      setFilters(prev => ({ ...prev, [chip.key]: !prev[chip.key] }));
    } else {
      setFilters(prev => ({
        ...prev,
        [chip.key]: prev[chip.key] === chip.value ? null : chip.value,
      }));
    }
  };

  const isChipActive = (chip) => {
    if (chip.type === 'toggle') return filters[chip.key] === true;
    return filters[chip.key] === chip.value;
  };

  const handleClearFilters = () => {
    setFilters(INITIAL_FILTERS);
    setSearchQuery('');
  };

  const filteredBreeds = useMemo(() => {
    return breedsData.filter(breed => {
      if (filters.hdbOnly && !breed.hdbApproved) return false;
      if (filters.firstTimeFriendly && !breed.firstTimeFriendly) return false;
      if (filters.heatTolerant && breed.heatTolerance < 4) return false;
      if (filters.energyLevel && !rangeMap[filters.energyLevel].includes(breed.energyLevel)) return false;
      if (filters.groomingNeeds && !rangeMap[filters.groomingNeeds].includes(breed.groomingNeeds)) return false;
      if (filters.trainability && !rangeMap[filters.trainability].includes(breed.trainability)) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          breed.name.toLowerCase().includes(q) ||
          breed.temperament.some(t => t.toLowerCase().includes(q)) ||
          breed.suitabilityTags.some(t => t.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [filters, searchQuery]);

  const featuredBreeds = filteredBreeds.filter(b => b.category === 'featured');
  const hdbBreeds      = filteredBreeds.filter(b => b.category === 'hdb');
  const nonHdbBreeds   = filteredBreeds.filter(b => b.category === 'non-hdb');

  return (
    <>
      <div className="flex-1 overflow-y-auto">
        {/* Search bar */}
        <div className="px-4 pt-1 pb-3">
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search breeds or traits..."
              className="w-full bg-gray-100 rounded-2xl pl-10 pr-10 py-3 text-sm font-semibold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B35] transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg leading-none"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Filter chips */}
        <div className="px-4 pb-2">
          <div
            className="flex gap-2 pb-1 overflow-x-auto"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {FILTER_CHIPS.map((chip, i) => {
              const active = isChipActive(chip);
              return (
                <button
                  key={`${chip.key}-${chip.value ?? 'toggle'}-${i}`}
                  onClick={() => handleChipPress(chip)}
                  style={{ touchAction: 'manipulation' }}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 ${
                    active
                      ? 'bg-[#FF6B35] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {chip.label}
                </button>
              );
            })}
            {activeFilterCount > 0 && (
              <button
                onClick={handleClearFilters}
                style={{ touchAction: 'manipulation' }}
                className="flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold bg-white border-2 border-gray-200 text-gray-500 hover:bg-gray-50 transition-all duration-200"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Results count */}
        {(activeFilterCount > 0 || searchQuery) && (
          <div className="px-4 mb-1">
            <p className="text-xs text-gray-400 font-semibold">
              {filteredBreeds.length} breed{filteredBreeds.length !== 1 ? 's' : ''} match{filteredBreeds.length === 1 ? 'es' : ''} your search
            </p>
          </div>
        )}

        {/* Content */}
        <div className="px-4 pb-28">

          {/* Singapore Special */}
          {featuredBreeds.length > 0 && (
            <section className="mb-6">
              <SingaporeSpecialCard
                breed={featuredBreeds[0]}
                onTap={() => setSelectedBreed(featuredBreeds[0])}
              />
            </section>
          )}

          {/* HDB Approved section */}
          {hdbBreeds.length > 0 && (
            <section className="mb-6">
              <SectionHeader title="HDB Approved Breeds" count={hdbBreeds.length} countColor="green" />
              <div className="grid grid-cols-2 gap-3">
                {hdbBreeds.map(breed => (
                  <BreedCard
                    key={breed.id}
                    breed={breed}
                    onTap={() => setSelectedBreed(breed)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Non-HDB section */}
          {nonHdbBreeds.length > 0 && (
            <section className="mb-6">
              <SectionHeader title="Private Housing Only" count={nonHdbBreeds.length} countColor="gray" />
              <div className="bg-orange-50 border border-orange-100 rounded-2xl p-3 mb-3">
                <p className="text-xs text-orange-700 font-semibold leading-snug">
                  ⚠️ These breeds require a condo or landed property. Tap any breed to see why they are not HDB-eligible.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {nonHdbBreeds.map(breed => (
                  <BreedCard
                    key={breed.id}
                    breed={breed}
                    onTap={() => setSelectedBreed(breed)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Empty state */}
          {filteredBreeds.length === 0 && (
            <EmptyState onClear={handleClearFilters} />
          )}
        </div>
      </div>

      {/* Breed detail modal */}
      {selectedBreed && (
        <BreedDetailModal
          breed={selectedBreed}
          onClose={() => setSelectedBreed(null)}
        />
      )}
    </>
  );
}
