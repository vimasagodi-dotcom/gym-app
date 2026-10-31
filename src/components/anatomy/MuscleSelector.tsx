import React from 'react';
import type { MuscleGroup } from '../../types/exercise';
import { MUSCLE_GROUPS_INFO } from '../../types/exercise';

interface MuscleSelectorProps {
  selectedMuscle: MuscleGroup | null;
  onSelectMuscle: (muscle: MuscleGroup | null) => void;
  className?: string;
}

export const MuscleSelector: React.FC<MuscleSelectorProps> = ({
  selectedMuscle,
  onSelectMuscle,
  className = '',
}) => {
  const muscleGroups = Object.values(MUSCLE_GROUPS_INFO);

  return (
    <div className={`muscle-selector-bar ${className}`}>
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        <button
          type="button"
          onClick={() => onSelectMuscle(null)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
            selectedMuscle === null
              ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm shadow-amber-500/30'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border border-slate-700/60'
          }`}
        >
          Todos os Músculos
        </button>

        {muscleGroups.map((group) => {
          const isSelected = selectedMuscle === group.id;
          return (
            <button
              key={group.id}
              type="button"
              onClick={() => onSelectMuscle(isSelected ? null : group.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm shadow-amber-500/30'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border border-slate-700/60'
              }`}
            >
              {group.namePt}
            </button>
          );
        })}
      </div>
    </div>
  );
};
