import { useState, useEffect } from 'react';
import {
  collection, addDoc, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase.js';

const POST_TYPES = [
  { id: 'update',    label: '📝 Update',    placeholder: 'Share an update about your dog...' },
  { id: 'question',  label: '❓ Question',  placeholder: 'Ask the community a question...' },
  { id: 'story',     label: '🌟 Story',     placeholder: 'Share your adoption story or an inspiring moment...' },
  { id: 'milestone', label: '🎉 Milestone', placeholder: 'Celebrate a milestone with your dog...' },
];

// ── Milestone text suggestion ─────────────────────────────────────────────────
function getMilestoneSuggestion(adoptionDateStr) {
  if (!adoptionDateStr) return '';
  const then = new Date(adoptionDateStr);
  const now  = new Date();
  const days = Math.floor((now - then) / (1000 * 60 * 60 * 24));
  if (days <= 0) return '';
  if (days <= 10)  return `🎉 Day ${days}! We're still getting settled, but the love is already unconditional.`;
  if (days <= 35)  return `🎉 1 month anniversary! One month ago I adopted my dog from a Singapore shelter — best decision ever.`;
  if (days <= 375) return `🎉 1 year anniversary! 365 days of walks, cuddles, and learning together. Grateful every day.`;
  return `🎉 ${Math.floor(days / 365)} year${Math.floor(days / 365) > 1 ? 's' : ''} together! Time flies when you're making memories.`;
}

// ── Main component ────────────────────────────────────────────────────────────
export default function NewPostModal({ communityId, currentUser, onClose, onPosted }) {
  const [type,         setType]         = useState('update');
  const [text,         setText]         = useState('');
  const [adoptionDate, setAdoptionDate] = useState('');
  const [posting,      setPosting]      = useState(false);
  const [visible,      setVisible]      = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 30);
    return () => clearTimeout(t);
  }, []);

  // Auto-fill milestone suggestion when adoption date changes
  useEffect(() => {
    if (type === 'milestone' && adoptionDate) {
      const suggestion = getMilestoneSuggestion(adoptionDate);
      if (suggestion) setText(suggestion);
    }
  }, [adoptionDate, type]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 320);
  };

  const handlePost = async () => {
    const trimmed = text.trim();
    if (!trimmed || posting) return;
    setPosting(true);

    try {
      const authorName   = currentUser.displayName || currentUser.email.split('@')[0];
      const authorLetter = (currentUser.displayName || currentUser.email)[0].toUpperCase();

      await addDoc(collection(db, 'communities', communityId, 'posts'), {
        uid:          currentUser.uid,
        authorName,
        authorLetter,
        type,
        text:         trimmed,
        photoUrl:     null,
        timestamp:    serverTimestamp(),
        likes:        [],
        replyCount:   0,
      });

      onPosted();
    } catch (err) {
      console.error('Failed to post:', err);
      setPosting(false);
    }
  };

  const currentType  = POST_TYPES.find(t => t.id === type) ?? POST_TYPES[0];
  const canPost      = text.trim().length > 0 && !posting;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end justify-center"
      style={{ zIndex: 500 }}
      onClick={handleClose}
    >
      <div
        className={`w-full max-w-[430px] bg-white rounded-t-[28px] transition-all duration-320 ${
          visible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
        style={{ maxHeight: '90vh', overflowY: 'auto', transition: 'transform 0.32s cubic-bezier(0.32,0.72,0,1), opacity 0.32s ease' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Pull handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <h2 className="font-display font-bold text-gray-900">New Post</h2>
          <button
            onClick={handleClose}
            className="text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>

        <div className="px-5 py-4">
          {/* Post type selector */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {POST_TYPES.map(pt => (
              <button
                key={pt.id}
                onClick={() => { setType(pt.id); if (pt.id !== 'milestone') setText(''); }}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${
                  type === pt.id
                    ? 'bg-[#FF6B35] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {pt.label}
              </button>
            ))}
          </div>

          {/* Milestone date picker */}
          {type === 'milestone' && (
            <div className="mb-3 bg-green-50 border border-green-200 rounded-2xl p-3">
              <p className="text-xs font-bold text-green-700 mb-1.5">📅 When did you adopt?</p>
              <input
                type="date"
                value={adoptionDate}
                onChange={e => setAdoptionDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full bg-white border border-green-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4CAF78] transition"
              />
              <p className="text-[10px] text-green-600 mt-1">We'll suggest milestone text based on this date</p>
            </div>
          )}

          {/* Text area */}
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={currentType.placeholder}
            rows={5}
            className="w-full bg-gray-50 rounded-2xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B35] resize-none transition mb-3"
          />

          {/* Post button */}
          <button
            onClick={handlePost}
            disabled={!canPost}
            className="w-full py-4 rounded-2xl font-bold text-sm bg-[#FF6B35] text-white shadow disabled:opacity-40 active:scale-95 transition-all duration-200 mb-2"
          >
            {posting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>
    </div>
  );
}
