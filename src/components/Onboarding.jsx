import { useState } from 'react';

const QUESTIONS = [
  {
    id: 1,
    question: 'How do you recharge?',
    subtitle: 'Think about what energizes you most.',
    options: [
      { label: 'Alone time', value: 'I', emoji: '🧘', desc: 'I need quiet time to feel like myself again' },
      { label: 'With others', value: 'E', emoji: '🎉', desc: 'Being around people fills me with energy' },
    ],
  },
  {
    id: 2,
    question: 'How do you make decisions?',
    subtitle: 'When it really matters, what guides you?',
    options: [
      { label: 'Logic & facts', value: 'T', emoji: '🧠', desc: 'I weigh the evidence and decide rationally' },
      { label: 'Feelings & values', value: 'F', emoji: '❤️', desc: 'I listen to my heart and consider everyone' },
    ],
  },
  {
    id: 3,
    question: 'How do you prefer your day?',
    subtitle: 'Picture your ideal Tuesday.',
    options: [
      { label: 'Planned & structured', value: 'J', emoji: '📋', desc: 'I love a good schedule and checking boxes' },
      { label: 'Go with the flow', value: 'P', emoji: '🌊', desc: 'I like seeing where the day takes me' },
    ],
  },
  {
    id: 4,
    question: 'How do you take in information?',
    subtitle: 'What do you naturally focus on?',
    options: [
      { label: 'Details & routine', value: 'S', emoji: '🔍', desc: 'I notice specifics and trust what I know works' },
      { label: 'Big picture & ideas', value: 'N', emoji: '💡', desc: 'I love patterns, possibilities, and new concepts' },
    ],
  },
  {
    id: 5,
    question: 'How active is your lifestyle?',
    subtitle: 'Be honest — your future pet will thank you.',
    options: [
      { label: 'Very active', value: 'very_active', emoji: '🏃', desc: 'Hikes, runs, and outdoor adventures daily' },
      { label: 'Moderately active', value: 'moderately_active', emoji: '🚶', desc: 'Regular walks and weekend outings' },
      { label: 'Homebody', value: 'homebody', emoji: '🛋️', desc: 'I prefer cozy indoor time over outdoor adventures' },
    ],
  },
  {
    id: 6,
    question: 'Where do you live?',
    subtitle: 'HDB rules affect which pets you can keep.',
    hdbNote: 'HDB only allows specific small dog breeds. We\'ll filter your matches so you only see pets you can legally own.',
    options: [
      { label: 'HDB Flat', value: 'hdb', emoji: '🏢', desc: 'Only HDB-approved breeds allowed — we\'ll filter for you' },
      { label: 'Private Condo', value: 'condo', emoji: '🏙️', desc: 'Most pets welcome, subject to condo rules' },
      { label: 'Landed Property', value: 'landed', emoji: '🏡', desc: 'Plenty of space for dogs of any size' },
    ],
  },
  {
    id: 7,
    question: 'How much time can you dedicate daily?',
    subtitle: 'For play, walks, grooming, and bonding.',
    options: [
      { label: '1–2 hours', value: '1_2_hrs', emoji: '⏰', desc: 'I\'m busy but committed to quality time' },
      { label: '3–4 hours', value: '3_4_hrs', emoji: '⌚', desc: 'A good chunk of my day is for my pet' },
      { label: '5+ hours', value: '5_plus_hrs', emoji: '🕰️', desc: 'My pet is my priority and my partner' },
    ],
  },
  {
    id: 8,
    question: 'Any experience with pets?',
    subtitle: 'Honesty leads to the best match.',
    options: [
      { label: 'First timer', value: 'first_timer', emoji: '🌱', desc: 'This will be my very first pet — so excited!' },
      { label: 'Some experience', value: 'some_experience', emoji: '🌿', desc: 'I\'ve had pets before and learned a lot' },
      { label: 'Very experienced', value: 'very_experienced', emoji: '🌳', desc: 'I\'ve raised multiple pets and know the ropes' },
    ],
  },
];

function computeMBTI(answers) {
  // MBTI order: E/I, S/N, T/F, J/P
  // Q1 → E/I, Q4 → S/N, Q2 → T/F, Q3 → J/P
  return `${answers[1]}${answers[4]}${answers[2]}${answers[3]}`;
}

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(-1); // -1 = welcome screen
  const [answers, setAnswers] = useState({});
  const [selected, setSelected] = useState(null);
  const [leaving, setLeaving] = useState(false);

  const question = QUESTIONS[step];
  const progress = step >= 0 ? ((step + 1) / QUESTIONS.length) * 100 : 0;

  const handleSelect = (value) => setSelected(value);

  const advance = () => {
    if (step === -1) {
      setStep(0);
      return;
    }
    if (!selected || leaving) return;

    const newAnswers = { ...answers, [question.id]: selected };
    setAnswers(newAnswers);
    setLeaving(true);

    setTimeout(() => {
      setLeaving(false);
      if (step < QUESTIONS.length - 1) {
        setStep(s => s + 1);
        setSelected(null);
      } else {
        const mbti = computeMBTI(newAnswers);
        onComplete({
          mbti,
          activityLevel: newAnswers[5],
          livingSpace:   newAnswers[6],
          timeAvailable: newAnswers[7],
          experience:    newAnswers[8],
        });
      }
    }, 280);
  };

  // ── Welcome screen ─────────────────────────────────────────────────────────
  if (step === -1) {
    return (
      <div className="min-h-screen bg-[#FFF8F0] flex flex-col items-center justify-center p-6 max-w-[430px] mx-auto">
        <div className="text-center animate-fade-scale-in">
          <div className="text-8xl mb-6 animate-pulse-ring inline-block rounded-full">🐾</div>
          <h1 className="font-display text-5xl font-bold text-[#FF6B35] mb-3">PawMatch</h1>
          <p className="text-gray-500 text-lg font-semibold mb-2">Every Singapore animal deserves a second chance</p>
          <p className="text-gray-400 text-sm max-w-xs mx-auto leading-relaxed">
            Answer 8 quick questions and we'll use your personality type to match you with animals who truly complement you.
          </p>
          <div className="flex justify-center gap-6 my-8 text-4xl">
            <span>🐕</span><span>🐈</span><span>🐕</span>
          </div>
          <button
            onClick={advance}
            className="w-full bg-[#FF6B35] text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:bg-orange-600 active:scale-95 transition-all duration-200"
          >
            Start My Quiz →
          </button>
          <p className="text-xs text-gray-400 mt-4">Takes about 2 minutes</p>
        </div>
      </div>
    );
  }

  // ── Question screen ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#FFF8F0] flex flex-col max-w-[430px] mx-auto">
      {/* Progress bar */}
      <div className="px-5 pt-10 pb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Question {step + 1} of {QUESTIONS.length}
          </span>
          <span className="text-xs font-bold text-[#FF6B35]">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-[#FF6B35] to-orange-400 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      <div
        className={`flex-1 flex flex-col px-5 pb-8 transition-all duration-280 ${
          leaving ? 'opacity-0 -translate-x-8' : 'opacity-100 translate-x-0'
        }`}
        style={{ transition: 'opacity 0.28s ease, transform 0.28s ease' }}
      >
        <div className="bg-white rounded-3xl shadow-md p-7 mb-4">
          <div className="text-5xl mb-5 text-center">{question.options[0]?.emoji}</div>
          <h2 className="font-display text-2xl font-bold text-gray-900 text-center leading-snug mb-2">
            {question.question}
          </h2>
          <p className="text-gray-400 text-sm text-center">{question.subtitle}</p>
        </div>

        {/* Options */}
        <div className="space-y-3 flex-1">
          {question.options.map(opt => {
            const isSelected = selected === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                className={`w-full text-left py-4 px-5 rounded-2xl border-2 flex items-start gap-4 transition-all duration-200 ${
                  isSelected
                    ? 'border-[#FF6B35] bg-orange-50 shadow-md scale-[1.01]'
                    : 'border-gray-200 bg-white hover:border-orange-200 hover:bg-orange-50/50'
                }`}
              >
                <span className="text-2xl mt-0.5 flex-shrink-0">{opt.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className={`font-bold text-base leading-tight ${isSelected ? 'text-[#FF6B35]' : 'text-gray-800'}`}>
                    {opt.label}
                  </p>
                  <p className={`text-xs mt-0.5 leading-snug ${isSelected ? 'text-orange-500/80' : 'text-gray-400'}`}>
                    {opt.desc}
                  </p>
                </div>
                <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center transition-all ${
                  isSelected ? 'border-[#FF6B35] bg-[#FF6B35]' : 'border-gray-300'
                }`}>
                  {isSelected && <span className="text-white text-xs font-black">✓</span>}
                </div>
              </button>
            );
          })}
        </div>

        {/* HDB info note (Q6 only) */}
        {question.hdbNote && (
          <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3 flex items-start gap-3">
            <span className="text-lg flex-shrink-0 mt-0.5">🏢</span>
            <p className="text-xs text-green-800 leading-snug font-semibold">{question.hdbNote}</p>
          </div>
        )}

        {/* Next button */}
        <button
          onClick={advance}
          disabled={!selected}
          className={`w-full mt-5 py-4 rounded-2xl font-bold text-lg transition-all duration-200 ${
            selected
              ? 'bg-[#FF6B35] text-white shadow-lg hover:bg-orange-600 active:scale-95'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {step < QUESTIONS.length - 1 ? 'Continue →' : '🐾 Find My Match!'}
        </button>
      </div>
    </div>
  );
}
