import { useMemo, useState } from 'react';
import { computePostAdoptionRiskScore, getRiskBand } from '../utils/postAdoptionRisk.js';

const defaultForm = {
  petAdjustment: 3,
  routineConsistency: 3,
  ownerStress: 3,
  behaviorConcerns: 1,
  petEnergyDemand: 'medium',
  notes: '',
};

function SelectField({ label, value, onChange, options }) {
  return (
    <label className="block">
      <p className="text-xs text-gray-500 font-semibold mb-1">{label}</p>
      <select
        value={value}
        onChange={onChange}
        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function PostAdoptionCheckin({ likedAnimals, userProfile, postAdoptionData, onUpdate }) {
  const [adoptedAnimalId, setAdoptedAnimalId] = useState(postAdoptionData?.adoptedAnimalId ?? likedAnimals[0]?.id ?? '');
  const [form, setForm] = useState(defaultForm);

  const adoptedAnimal = useMemo(
    () => likedAnimals.find((a) => a.id === adoptedAnimalId) ?? null,
    [likedAnimals, adoptedAnimalId],
  );

  if (likedAnimals.length === 0) return null;

  const checkIns = postAdoptionData?.checkIns ?? [];
  const latestRiskScore = postAdoptionData?.latestRiskScore ?? null;
  const riskBand = latestRiskScore === null ? null : getRiskBand(latestRiskScore);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!adoptedAnimalId) return;

    const checkIn = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      adoptedAnimalId,
      ...form,
    };

    const latestRisk = computePostAdoptionRiskScore(userProfile, checkIn);
    onUpdate({
      adoptedAnimalId,
      latestRiskScore: latestRisk,
      latestRiskBand: getRiskBand(latestRisk).label,
      checkIns: [checkIn, ...checkIns].slice(0, 12),
    });

    setForm(defaultForm);
  };

  return (
    <div className="mx-4 mb-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display font-bold text-gray-900 text-base">Post-adoption check-in</h3>
          <p className="text-xs text-gray-500 mt-0.5">Layer 3 MVP: early retention risk signal</p>
        </div>
        {riskBand && (
          <div className={`px-2.5 py-1 rounded-full border text-[11px] font-bold ${riskBand.bg} ${riskBand.color}`}>
            {riskBand.label} · {latestRiskScore}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 mt-4">
        <SelectField
          label="Which matched animal was adopted?"
          value={adoptedAnimalId}
          onChange={(e) => setAdoptedAnimalId(e.target.value)}
          options={likedAnimals.map((a) => ({ value: a.id, label: `${a.name} (${a.breed})` }))}
        />

        <div className="grid grid-cols-2 gap-2">
          <SelectField
            label="Pet adjusting?"
            value={form.petAdjustment}
            onChange={(e) => setForm((prev) => ({ ...prev, petAdjustment: Number(e.target.value) }))}
            options={[
              { value: 1, label: '1 - Very hard' },
              { value: 2, label: '2 - Difficult' },
              { value: 3, label: '3 - Mixed' },
              { value: 4, label: '4 - Good' },
              { value: 5, label: '5 - Great' },
            ]}
          />
          <SelectField
            label="Routine consistency"
            value={form.routineConsistency}
            onChange={(e) => setForm((prev) => ({ ...prev, routineConsistency: Number(e.target.value) }))}
            options={[
              { value: 1, label: '1 - Very inconsistent' },
              { value: 2, label: '2 - Inconsistent' },
              { value: 3, label: '3 - Sometimes' },
              { value: 4, label: '4 - Mostly' },
              { value: 5, label: '5 - Consistent' },
            ]}
          />
          <SelectField
            label="Owner stress"
            value={form.ownerStress}
            onChange={(e) => setForm((prev) => ({ ...prev, ownerStress: Number(e.target.value) }))}
            options={[
              { value: 1, label: '1 - Very low' },
              { value: 2, label: '2 - Low' },
              { value: 3, label: '3 - Medium' },
              { value: 4, label: '4 - High' },
              { value: 5, label: '5 - Very high' },
            ]}
          />
          <SelectField
            label="Behavior concerns"
            value={form.behaviorConcerns}
            onChange={(e) => setForm((prev) => ({ ...prev, behaviorConcerns: Number(e.target.value) }))}
            options={[
              { value: 1, label: '1 - None' },
              { value: 2, label: '2 - Mild' },
              { value: 3, label: '3 - Some' },
              { value: 4, label: '4 - Frequent' },
              { value: 5, label: '5 - Severe' },
            ]}
          />
        </div>

        <SelectField
          label={`${adoptedAnimal?.name ?? 'Pet'} energy demand`}
          value={form.petEnergyDemand}
          onChange={(e) => setForm((prev) => ({ ...prev, petEnergyDemand: e.target.value }))}
          options={[
            { value: 'low', label: 'Low' },
            { value: 'medium', label: 'Medium' },
            { value: 'high', label: 'High' },
          ]}
        />

        <label className="block">
          <p className="text-xs text-gray-500 font-semibold mb-1">Optional notes</p>
          <textarea
            value={form.notes}
            onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 min-h-[72px]"
            placeholder="e.g. barking at night, potty accidents, hard to leave alone"
          />
        </label>

        <button
          type="submit"
          className="w-full bg-[#4CAF78] text-white text-sm font-bold py-2.5 rounded-xl hover:bg-green-600 active:scale-95 transition-all"
        >
          Save check-in
        </button>
      </form>
    </div>
  );
}
