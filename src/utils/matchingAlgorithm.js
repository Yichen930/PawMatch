/**
 * PawMatch – Matching Algorithm
 * All scoring logic lives here so it's easy to tune independently.
 */

/**
 * Compute a 0–100 compatibility score between a user profile and an animal.
 *
 * Scoring breakdown:
 *   MBTI compatibility   – 50 pts max  (12.5 per matching dimension)
 *   Energy-level match   – 25 pts max
 *   Experience match     – 15 pts max
 *   Senior/special-needs bonus – +10 pts when base score > 60
 */
export function computeMatchScore(userProfile, animal) {
  if (!userProfile || !animal) return 0;

  let score = 0;

  // ── 1. MBTI compatibility (50 pts) ────────────────────────────────────────
  if (userProfile.mbti && animal.mbtiType) {
    const u = userProfile.mbti;   // e.g. "ENFP"
    const a = animal.mbtiType;    // e.g. "ESFJ"
    // Positions: 0=E/I, 1=S/N, 2=T/F, 3=J/P
    if (u[0] === a[0]) score += 12.5;
    if (u[1] === a[1]) score += 12.5;
    if (u[2] === a[2]) score += 12.5;
    if (u[3] === a[3]) score += 12.5;
  }

  // ── 2. Energy-level match (25 pts) ────────────────────────────────────────
  const activityToEnergy = {
    very_active: 5,
    moderately_active: 3,
    homebody: 1,
  };
  const userEnergy = activityToEnergy[userProfile.activityLevel] ?? 3;
  const energyDiff = Math.abs(userEnergy - animal.energyLevel);
  // 0 diff → 25 pts | 1 diff → 18.75 | 2 → 12.5 | 3 → 6.25 | 4+ → 0
  score += Math.max(0, 25 - energyDiff * 6.25);

  // ── 3. Experience match (15 pts) ──────────────────────────────────────────
  const expTable = {
    first_timer:     { beginner: 15, intermediate:  5, experienced:  0 },
    some_experience: { beginner: 10, intermediate: 15, experienced:  5 },
    very_experienced:{ beginner:  8, intermediate: 12, experienced: 15 },
  };
  score += expTable[userProfile.experience]?.[animal.experienceLevelNeeded] ?? 0;

  // ── 4. Senior / special-needs boost ───────────────────────────────────────
  if ((animal.age >= 7 || animal.specialNeeds) && score > 60) {
    score += 10;
  }

  return Math.min(100, Math.round(score));
}

/**
 * Return animals sorted by compatibility score (highest first).
 */
export function sortAnimalsByScore(animals, userProfile) {
  return [...animals].sort((a, b) => {
    return computeMatchScore(userProfile, b) - computeMatchScore(userProfile, a);
  });
}

/**
 * Generate match explanation bullets and an optional amber waiting note.
 *
 * Returns:
 *   {
 *     bullets:     string[]       — always exactly 3 items
 *     waitingNote: string | null  — amber line when daysInShelter > 90 or specialNeeds
 *   }
 *
 * Bullet priority:
 *   1. MBTI dimension matches (up to 4, pick highest-scoring = first matched ones)
 *   2. Energy match fallback
 *   3. Experience match fallback
 *   4. Generic fallbacks
 */
export function generateMatchReasons(userProfile, animal) {
  const candidates = [];

  if (userProfile.mbti && animal.mbtiType) {
    const u = userProfile.mbti;
    const a = animal.mbtiType;

    // E/I — index 0
    if (u[0] === a[0]) {
      candidates.push(
        u[0] === 'E'
          ? `You both recharge in similar ways — social energy and shared adventures`
          : `You both recharge in similar ways — quiet evenings and meaningful one-on-one time`,
      );
    }

    // S/N — index 1
    if (u[1] === a[1]) {
      candidates.push(
        u[1] === 'S'
          ? `You share the same approach to the world — grounded in routine and the present moment`
          : `You share the same approach to the world — curious, adaptable, and always exploring`,
      );
    }

    // T/F — index 2
    if (u[2] === a[2]) {
      candidates.push(
        u[2] === 'T'
          ? `Your bonding style aligns — built on trust and respect rather than constant reassurance`
          : `Your bonding style aligns — deep emotional attunement and loyalty`,
      );
    }

    // J/P — index 3
    if (u[3] === a[3]) {
      candidates.push(
        u[3] === 'J'
          ? `Your lifestyle fits — you both thrive with structure and predictability`
          : `Your lifestyle fits — you both love spontaneity and going wherever the day takes you`,
      );
    }
  }

  // Energy match fallback
  if (candidates.length < 3) {
    const activityToEnergy = { very_active: 5, moderately_active: 3, homebody: 1 };
    const userEnergy = activityToEnergy[userProfile.activityLevel] ?? 3;
    if (Math.abs(userEnergy - animal.energyLevel) <= 1) {
      const energyLabels = { 1: 'relaxed', 2: 'gentle', 3: 'balanced', 4: 'active', 5: 'high-energy' };
      candidates.push(
        `Your ${energyLabels[userEnergy] ?? 'balanced'} lifestyle is a perfect fit for ${animal.name}'s energy level`,
      );
    }
  }

  // Experience match fallback
  if (candidates.length < 3) {
    if (
      (userProfile.experience === 'first_timer'      && animal.experienceLevelNeeded === 'beginner') ||
      (userProfile.experience === 'some_experience'  && animal.experienceLevelNeeded === 'intermediate') ||
      (userProfile.experience === 'very_experienced' && animal.experienceLevelNeeded === 'experienced')
    ) {
      candidates.push(`${animal.name}'s care needs align perfectly with your experience level`);
    }
  }

  // Generic fallbacks — fill up to 3
  const fallbacks = [
    `${animal.name}'s personality complements yours in a meaningful way`,
    `You have the lifestyle that ${animal.name} needs to truly thrive`,
    `${animal.name} has been waiting for someone just like you`,
  ];
  let fi = 0;
  while (candidates.length < 3 && fi < fallbacks.length) {
    candidates.push(fallbacks[fi++]);
  }

  // Amber waiting note — shown separately in warm amber when shelter time is long
  const waitingNote =
    animal.daysInShelter > 90 || animal.specialNeeds
      ? `${animal.name} has been waiting ${animal.daysInShelter} days. You might be exactly who they've been hoping for.`
      : null;

  return {
    bullets: candidates.slice(0, 3),
    waitingNote,
  };
}

/**
 * Compute a display label for an MBTI type.
 */
export function getMBTILabel(mbti) {
  const labels = {
    INTJ: 'The Architect',   INTP: 'The Logician',
    ENTJ: 'The Commander',   ENTP: 'The Debater',
    INFJ: 'The Advocate',    INFP: 'The Mediator',
    ENFJ: 'The Protagonist', ENFP: 'The Campaigner',
    ISTJ: 'The Logistician', ISFJ: 'The Defender',
    ESTJ: 'The Executive',   ESFJ: 'The Consul',
    ISTP: 'The Virtuoso',    ISFP: 'The Adventurer',
    ESTP: 'The Entrepreneur',ESFP: 'The Entertainer',
  };
  return labels[mbti] ?? 'The Unique One';
}
