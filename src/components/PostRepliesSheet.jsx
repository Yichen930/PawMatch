import { useState, useEffect, useRef } from 'react';
import {
  collection, query, orderBy, onSnapshot,
  addDoc, updateDoc, doc, increment, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase.js';

// ── Relative time helper ──────────────────────────────────────────────────────
function relativeTime(ts) {
  if (!ts) return '';
  const now  = Date.now();
  const secs = Math.floor((now - ts.toMillis()) / 1000);
  if (secs < 60)  return 'just now';
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

// ── Reply row ─────────────────────────────────────────────────────────────────
function ReplyRow({ reply }) {
  return (
    <div className="flex items-start gap-2.5 py-3 border-b border-gray-50 last:border-0">
      <div className="w-7 h-7 rounded-full bg-[#FF6B35]/20 flex items-center justify-center text-[#FF6B35] text-xs font-black flex-shrink-0">
        {reply.authorLetter}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs font-bold text-gray-800">{reply.authorName}</span>
          <span className="text-[10px] text-gray-400">{relativeTime(reply.timestamp)}</span>
        </div>
        <p className="text-sm text-gray-600 leading-snug">{reply.text}</p>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function PostRepliesSheet({ post, communityId, currentUser, onClose }) {
  const [replies,    setReplies]   = useState([]);
  const [replyText,  setReplyText] = useState('');
  const [posting,    setPosting]   = useState(false);
  const [visible,    setVisible]   = useState(false);
  const bottomRef = useRef(null);

  // Slide-in animation
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 30);
    return () => clearTimeout(t);
  }, []);

  // Real-time replies subscription
  useEffect(() => {
    const q = query(
      collection(db, 'communities', communityId, 'posts', post.id, 'replies'),
      orderBy('timestamp', 'asc')
    );
    const unsub = onSnapshot(q, snap => {
      setReplies(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [communityId, post.id]);

  // Scroll to bottom when new reply arrives
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [replies.length]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 320);
  };

  const handleSend = async () => {
    const text = replyText.trim();
    if (!text || posting) return;
    setPosting(true);
    const authorName   = currentUser.displayName || currentUser.email.split('@')[0];
    const authorLetter = (currentUser.displayName || currentUser.email)[0].toUpperCase();
    try {
      const repliesRef = collection(db, 'communities', communityId, 'posts', post.id, 'replies');
      await addDoc(repliesRef, {
        uid: currentUser.uid,
        authorName,
        authorLetter,
        text,
        timestamp: serverTimestamp(),
      });
      await updateDoc(
        doc(db, 'communities', communityId, 'posts', post.id),
        { replyCount: increment(1) }
      );
      setReplyText('');
    } catch (err) {
      console.error('Failed to post reply:', err);
    } finally {
      setPosting(false);
    }
  };

  const typeConfig = {
    update:    { label: 'Update',    color: 'bg-blue-100 text-blue-700' },
    question:  { label: 'Question',  color: 'bg-amber-100 text-amber-700' },
    story:     { label: 'Story',     color: 'bg-purple-100 text-purple-700' },
    milestone: { label: 'Milestone', color: 'bg-green-100 text-green-700' },
  };
  const tc = typeConfig[post.type] ?? typeConfig.update;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end justify-center"
      style={{ zIndex: 500 }}
      onClick={handleClose}
    >
      <div
        className={`w-full max-w-[430px] bg-white rounded-t-[28px] flex flex-col transition-all duration-320 ${
          visible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
        style={{ maxHeight: '82vh', transition: 'transform 0.32s cubic-bezier(0.32,0.72,0,1), opacity 0.32s ease' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Pull handle */}
        <div className="flex justify-center pt-3 pb-2 flex-shrink-0">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-3 border-b border-gray-100 flex-shrink-0">
          <h2 className="font-display font-bold text-gray-900">Replies</h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 active:scale-95 transition-all"
          >
            ✕
          </button>
        </div>

        {/* Original post summary */}
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-full bg-[#FF6B35] flex items-center justify-center text-white text-[10px] font-black">
              {post.authorLetter}
            </div>
            <span className="text-xs font-bold text-gray-700">{post.authorName}</span>
            <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${tc.color}`}>{tc.label}</span>
          </div>
          <p className="text-sm text-gray-600 leading-snug line-clamp-2">{post.text}</p>
        </div>

        {/* Reply list */}
        <div className="flex-1 overflow-y-auto px-5">
          {replies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <span className="text-3xl mb-2">💬</span>
              <p className="text-sm font-bold text-gray-500">No replies yet</p>
              <p className="text-xs text-gray-400">Be the first to respond!</p>
            </div>
          ) : (
            replies.map(r => <ReplyRow key={r.id} reply={r} />)
          )}
          <div ref={bottomRef} />
        </div>

        {/* Reply input */}
        <div className="flex-shrink-0 border-t border-gray-100 px-4 py-3 flex items-center gap-3 bg-white">
          <div className="w-7 h-7 rounded-full bg-[#FF6B35] flex items-center justify-center text-white text-xs font-black flex-shrink-0">
            {(currentUser.displayName || currentUser.email)[0].toUpperCase()}
          </div>
          <input
            type="text"
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Write a reply..."
            className="flex-1 bg-gray-100 rounded-2xl px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B35] transition"
          />
          <button
            onClick={handleSend}
            disabled={!replyText.trim() || posting}
            className="flex-shrink-0 px-4 py-2 rounded-2xl text-sm font-bold bg-[#FF6B35] text-white disabled:opacity-40 active:scale-95 transition-all duration-200"
          >
            {posting ? '...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}
