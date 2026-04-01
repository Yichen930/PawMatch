/**
 * Layer 3 MVP: post-adoption retention risk scoring.
 * Score range: 0 (low risk) -> 100 (high risk).
 */
export function computePostAdoptionRiskScore(userProfile, checkIn) {
  if (!checkIn) return 0;

  let risk = 0;

  // Direct check-in signals (main driver)
  risk += (5 - (checkIn.petAdjustment ?? 3)) * 8;      // max +32
  risk += (5 - (checkIn.routineConsistency ?? 3)) * 6; // max +24
  risk += ((checkIn.ownerStress ?? 3) - 1) * 6;        // max +24
  risk += ((checkIn.behaviorConcerns ?? 1) - 1) * 5;   // max +20

  // Lightweight lifestyle context from existing onboarding profile
  if (userProfile?.timeAvailable === '1_2_hrs') risk += 8;
  if (userProfile?.experience === 'first_timer') risk += 6;
  if (userProfile?.activityLevel === 'homebody' && checkIn?.petEnergyDemand === 'high') {
    risk += 10;
  }

  return Math.max(0, Math.min(100, Math.round(risk)));
}

export function getRiskBand(score) {
  if (score >= 65) return { label: 'High risk', color: 'text-red-600', bg: 'bg-red-50 border-red-200' };
  if (score >= 35) return { label: 'Moderate risk', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' };
  return { label: 'Low risk', color: 'text-green-700', bg: 'bg-green-50 border-green-200' };
}
