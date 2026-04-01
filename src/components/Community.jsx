import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { COMMUNITIES, EVENTS, SHELTERS } from '../data/communityData.js';
import CommunityGroup from './CommunityGroup.jsx';

const TYPE_FILTERS = [
  { id: 'all',   label: 'All' },
  { id: 'breed', label: 'Breed' },
  { id: 'mbti',  label: 'MBTI' },
  { id: 'topic', label: 'Topics' },
];

// ── Group card (2-per-row grid) ───────────────────────────────────────────────
function GroupCard({ community, isJoined, onTap }) {
  return (
    <button
      onClick={onTap}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 text-left active:scale-95 transition-all duration-200 hover:shadow-md"
    >
      <div className="text-3xl text-center mb-2">{community.emoji}</div>
      <p className="font-display font-bold text-gray-900 text-sm leading-tight mb-1 line-clamp-1">{community.name}</p>
      <p className="text-[10px] text-gray-400 leading-snug mb-2 line-clamp-2">{community.description}</p>
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-gray-400 font-semibold">
          {community.memberCount?.toLocaleString()} members
        </span>
        {isJoined && (
          <span className="text-[9px] font-extrabold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
            Joined ✓
          </span>
        )}
      </div>
    </button>
  );
}

// ── Joined group chip (horizontal scroll) ─────────────────────────────────────
function JoinedChip({ community, onTap }) {
  return (
    <button
      onClick={onTap}
      className="flex-shrink-0 flex items-center gap-2 bg-white border-2 border-[#FF6B35]/30 rounded-2xl px-3 py-2 active:scale-95 transition-all shadow-sm hover:border-[#FF6B35]/60"
    >
      <span className="text-lg">{community.emoji}</span>
      <div className="text-left">
        <p className="text-xs font-bold text-gray-800 leading-tight">{community.name}</p>
        <p className="text-[9px] text-gray-400">{community.memberCount?.toLocaleString()} members</p>
      </div>
    </button>
  );
}

// ── Event card ────────────────────────────────────────────────────────────────
function EventCard({ event }) {
  return (
    <div className="flex-shrink-0 w-56 bg-white rounded-2xl border border-gray-100 shadow-sm p-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="bg-[#FF6B35] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
          {event.dateShort}
        </span>
        <span className="text-[10px] text-gray-400 font-semibold">{event.organizer}</span>
      </div>
      <p className="font-display font-bold text-gray-900 text-sm leading-tight mb-1">{event.title}</p>
      <p className="text-[10px] text-gray-400 mb-2 leading-snug">📍 {event.location}</p>
      <button
        onClick={() => window.open(event.organizerUrl, '_blank', 'noopener,noreferrer')}
        className="text-xs font-bold text-[#FF6B35] hover:underline active:scale-95 transition-all"
      >
        Find out more →
      </button>
    </div>
  );
}

// ── Shelter card ──────────────────────────────────────────────────────────────
function ShelterCard({ shelter }) {
  const links = [
    shelter.website  && { label: '🌐', url: shelter.website,  title: 'Website' },
    shelter.telegram && { label: '📱', url: shelter.telegram, title: 'Telegram' },
    shelter.facebook && { label: '👍', url: shelter.facebook, title: 'Facebook' },
  ].filter(Boolean);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-3 flex items-center gap-3">
      <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">
        {shelter.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-display font-bold text-gray-900 text-sm">{shelter.name}</p>
        <p className="text-[10px] text-gray-400 leading-snug line-clamp-2">{shelter.description}</p>
      </div>
      <div className="flex flex-col gap-1 flex-shrink-0">
        {links.map(link => (
          <button
            key={link.label}
            onClick={() => window.open(link.url, '_blank', 'noopener,noreferrer')}
            title={link.title}
            className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center text-sm hover:bg-gray-200 active:scale-95 transition-all"
          >
            {link.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Section header ────────────────────────────────────────────────────────────
function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-3">
      <h3 className="font-display font-bold text-gray-900 text-base">{title}</h3>
      {subtitle && <p className="text-xs text-gray-400 font-semibold">{subtitle}</p>}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Community({ userProfile, joinedCommunities, onJoinedChange }) {
  const { currentUser } = useAuth();
  const [filter,        setFilter]        = useState('all');
  const [selectedGroup, setSelectedGroup] = useState(null);

  const filteredCommunities = filter === 'all'
    ? COMMUNITIES
    : COMMUNITIES.filter(c => c.type === filter);

  const joinedGroups = COMMUNITIES.filter(c => joinedCommunities.includes(c.id));

  const handleJoinToggle = (communityId, joined) => {
    if (joined) {
      onJoinedChange(prev => [...prev, communityId]);
    } else {
      onJoinedChange(prev => prev.filter(id => id !== communityId));
    }
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 pt-2 pb-28">

          {/* My Communities — horizontal scroll */}
          {joinedGroups.length > 0 && (
            <section className="mb-6">
              <SectionHeader title="My Communities" subtitle="Groups you've joined" />
              <div
                className="flex gap-2 pb-1"
                style={{ overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {joinedGroups.map(c => (
                  <JoinedChip
                    key={c.id}
                    community={c}
                    onTap={() => setSelectedGroup(c)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Discover Communities */}
          <section className="mb-6">
            <SectionHeader
              title="Discover Communities"
              subtitle={`${COMMUNITIES.length} groups for Singapore dog owners`}
            />

            {/* Filter chips */}
            <div className="flex gap-2 mb-3">
              {TYPE_FILTERS.map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${
                    filter === f.id
                      ? 'bg-[#FF6B35] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* 2-col grid */}
            <div className="grid grid-cols-2 gap-3">
              {filteredCommunities.map(c => (
                <GroupCard
                  key={c.id}
                  community={c}
                  isJoined={joinedCommunities.includes(c.id)}
                  onTap={() => setSelectedGroup(c)}
                />
              ))}
            </div>
          </section>

          {/* Upcoming Events */}
          <section className="mb-6">
            <SectionHeader title="📅 Upcoming Events" subtitle="Dog-friendly events in Singapore" />
            <div
              className="flex gap-3 pb-2"
              style={{ overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {EVENTS.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </section>

          {/* Shelter Spotlight */}
          <section>
            <SectionHeader title="🏠 Shelter Spotlight" subtitle="Follow Singapore shelters for real-time adoption updates" />
            {SHELTERS.map(shelter => (
              <ShelterCard key={shelter.id} shelter={shelter} />
            ))}
          </section>

        </div>
      </div>

      {/* CommunityGroup overlay */}
      {selectedGroup && (
        <CommunityGroup
          community={selectedGroup}
          currentUser={currentUser}
          isJoined={joinedCommunities.includes(selectedGroup.id)}
          onJoinToggle={(joined) => handleJoinToggle(selectedGroup.id, joined)}
          onClose={() => setSelectedGroup(null)}
        />
      )}
    </>
  );
}
