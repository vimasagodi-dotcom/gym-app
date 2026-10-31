import React from 'react';
import type { ExerciseSetLog, SetType } from '../../types/workout';
import { useUser } from '../../context/ThemeContext';
import { formatWeight, fromKg, toKg } from '../../utils/formulas';
import { Check, Trash2 } from 'lucide-react';

interface ExerciseSetRowProps {
  setLog: ExerciseSetLog;
  setIndex: number;
  previousSet?: { weightKg: number; reps: number };
  onUpdate: (field: keyof ExerciseSetLog, value: unknown) => void;
  onToggleComplete: () => void;
  onDelete: () => void;
}

export const ExerciseSetRow: React.FC<ExerciseSetRowProps> = ({
  setLog,
  setIndex,
  previousSet,
  onUpdate,
  onToggleComplete,
  onDelete,
}) => {
  const { unit } = useUser();

  const setTypeLabels: Record<SetType, { label: string; badge: string; color: string }> = {
    normal: { label: 'Normal', badge: `${setIndex + 1}`, color: 'bg-slate-800 text-slate-200 border border-slate-700/80' },
    warmup: { label: 'Aquecimento', badge: 'W', color: 'bg-amber-500/20 text-amber-400 font-bold border border-amber-500/40' },
    drop: { label: 'Drop Set', badge: 'D', color: 'bg-indigo-500/20 text-indigo-400 font-bold border border-indigo-500/40' },
    failure: { label: 'Falha', badge: 'F', color: 'bg-rose-500/20 text-rose-400 font-bold border border-rose-500/40' },
  };

  const currentTypeInfo = setTypeLabels[setLog.type] || setTypeLabels.normal;

  const cycleSetType = () => {
    const types: SetType[] = ['normal', 'warmup', 'drop', 'failure'];
    const nextIdx = (types.indexOf(setLog.type) + 1) % types.length;
    onUpdate('type', types[nextIdx]);
  };

  const displayWeight = fromKg(setLog.weightKg, unit);

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    const safeKg = isNaN(val) ? 0 : toKg(val, unit);
    onUpdate('weightKg', Math.max(0, safeKg));
  };

  const handleRepsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    onUpdate('reps', isNaN(val) ? 0 : Math.max(0, val));
  };

  const handleRpeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onUpdate('rpe', isNaN(val) ? undefined : Math.min(10, Math.max(1, val)));
  };

  return (
    <div
      className={`grid grid-cols-12 gap-2 items-center py-2 px-2.5 rounded-2xl transition-all ${
        setLog.isCompleted
          ? 'bg-emerald-500/15 border border-emerald-500/30'
          : 'bg-slate-900/80 border border-slate-800/90 hover:bg-slate-900'
      }`}
    >
      {/* 1. Indicador / Tipo de Série (Hitbox >= 44px) */}
      <div className="col-span-2 flex items-center">
        <button
          type="button"
          onClick={cycleSetType}
          title={`Tipo: ${currentTypeInfo.label}. Clica para alternar.`}
          className={`min-w-[44px] min-h-[44px] w-11 h-11 rounded-2xl flex items-center justify-center text-xs font-black transition-transform active:scale-90 ${currentTypeInfo.color}`}
        >
          {currentTypeInfo.badge}
        </button>
      </div>

      {/* 2. Histórico da Sessão Anterior (Linha de referência visual) */}
      <div className="col-span-2 text-center">
        {previousSet ? (
          <div className="flex flex-col items-center">
            <span className="text-[9px] uppercase font-bold text-slate-500">Último</span>
            <span className="text-xs font-mono font-bold text-slate-300">
              {formatWeight(previousSet.weightKg, unit)}
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              × {previousSet.reps} reps
            </span>
          </div>
        ) : (
          <span className="text-xs text-slate-600 font-mono">-</span>
        )}
      </div>

      {/* 3. Input de Peso (com inputMode="decimal" para smartphone) */}
      <div className="col-span-3">
        <div className="relative flex items-center">
          <input
            type="number"
            inputMode="decimal"
            step="0.5"
            min="0"
            value={displayWeight === 0 ? '' : displayWeight}
            placeholder="0"
            onChange={handleWeightChange}
            className="w-full min-h-[44px] text-center bg-slate-950 border border-slate-700/80 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl py-2 px-1 text-base font-black text-slate-100 font-mono outline-none"
          />
          <span className="absolute right-2 text-[10px] font-black text-slate-500 pointer-events-none uppercase">
            {unit}
          </span>
        </div>
      </div>

      {/* 4. Input de Repetições (com inputMode="numeric") */}
      <div className="col-span-2">
        <input
          type="number"
          inputMode="numeric"
          min="0"
          value={setLog.reps === 0 ? '' : setLog.reps}
          placeholder="0"
          onChange={handleRepsChange}
          className="w-full min-h-[44px] text-center bg-slate-950 border border-slate-700/80 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl py-2 px-1 text-base font-black text-slate-100 font-mono outline-none"
        />
      </div>

      {/* 5. RPE Opcional */}
      <div className="col-span-1 text-center">
        <input
          type="number"
          inputMode="decimal"
          step="0.5"
          min="1"
          max="10"
          value={setLog.rpe ?? ''}
          placeholder="RPE"
          onChange={handleRpeChange}
          className="w-full min-h-[44px] text-center bg-slate-950/50 border border-slate-800 rounded-xl py-1 text-xs text-slate-300 font-mono outline-none focus:border-slate-600"
          title="RPE (Esforço Percebido de 1 a 10)"
        />
      </div>

      {/* 6. Botão de Conclusão da Série (Grande, tátil >= 44px) */}
      <div className="col-span-2 flex items-center justify-end gap-1">
        <button
          type="button"
          onClick={onToggleComplete}
          className={`min-w-[44px] min-h-[44px] w-11 h-11 rounded-2xl flex items-center justify-center transition-all active:scale-90 shadow-md ${
            setLog.isCompleted
              ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-emerald-500/40 ring-2 ring-emerald-400/50'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700'
          }`}
          title={setLog.isCompleted ? 'Desmarcar série' : 'Concluir série e iniciar descanso'}
        >
          <Check size={22} className={setLog.isCompleted ? 'stroke-[3.5]' : 'stroke-[2]'} />
        </button>

        <button
          type="button"
          onClick={onDelete}
          className="p-1.5 text-slate-600 hover:text-rose-400 rounded-lg transition-colors"
          title="Eliminar série"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
};
