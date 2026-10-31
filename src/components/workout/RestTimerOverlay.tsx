import React, { useState } from 'react';
import { useWorkout } from '../../context/WorkoutContext';
import { formatDuration } from '../../utils/formulas';
import { Timer, Plus, Minus, X, Maximize2, Minimize2, BellRing } from 'lucide-react';

export const RestTimerOverlay: React.FC = () => {
  const {
    isRestTimerActive,
    restTimerSeconds,
    restTimerTotal,
    stopRestTimer,
    adjustRestTimer,
  } = useWorkout();

  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  if (!isRestTimerActive && restTimerSeconds === 0) {
    return null;
  }

  const progressPercent = restTimerTotal > 0
    ? Math.max(0, Math.min(100, ((restTimerTotal - restTimerSeconds) / restTimerTotal) * 100))
    : 0;

  // Visual Expandido (Modal focado ou Card grande)
  if (isExpanded) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-fade-in">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl relative">
          <button
            type="button"
            onClick={() => setIsExpanded(false)}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-100 rounded-full hover:bg-slate-800"
            title="Minimizar temporizador"
          >
            <Minimize2 size={20} />
          </button>

          <div className="flex items-center justify-center gap-2 text-amber-400 text-sm font-semibold tracking-wide uppercase mb-3">
            <BellRing size={18} className="animate-pulse" />
            Descanso Ativo
          </div>

          {/* Círculo de contagem */}
          <div className="relative w-44 h-44 mx-auto my-4 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="44"
                className="stroke-slate-800"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="44"
                className="stroke-amber-500 transition-all duration-1000 ease-linear"
                strokeWidth="8"
                strokeDasharray="276.46"
                strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-extrabold text-slate-100 font-mono tracking-tight">
                {formatDuration(restTimerSeconds)}
              </span>
              <span className="text-xs text-slate-400 mt-1">de {restTimerTotal}s</span>
            </div>
          </div>

          {/* Botões Grandes táteis para ginásio */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            <button
              type="button"
              onClick={() => adjustRestTimer(-15)}
              className="py-3 px-4 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-bold rounded-2xl flex items-center justify-center gap-1.5 transition-all text-sm"
            >
              <Minus size={18} /> -15s
            </button>
            <button
              type="button"
              onClick={() => adjustRestTimer(15)}
              className="py-3 px-4 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-bold rounded-2xl flex items-center justify-center gap-1.5 transition-all text-sm"
            >
              <Plus size={18} /> +15s
            </button>
          </div>

          <button
            type="button"
            onClick={stopRestTimer}
            className="w-full mt-3 py-3.5 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold rounded-2xl transition-all shadow-lg shadow-amber-500/20 text-base"
          >
            Pular Descanso & Treinar
          </button>
        </div>
      </div>
    );
  }

  // Visual Barra Flutuante Compacta
  return (
    <div className="fixed bottom-20 left-4 right-4 max-w-lg mx-auto z-40 animate-slide-up">
      <div className="bg-slate-900/95 backdrop-blur-md border border-amber-500/40 shadow-xl shadow-amber-500/10 rounded-2xl p-3 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          className="flex items-center gap-3 text-left flex-1"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <Timer size={22} className="animate-spin-slow" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Descanso
            </div>
            <div className="text-xl font-bold font-mono text-amber-400 tracking-tight">
              {formatDuration(restTimerSeconds)}
            </div>
          </div>
        </button>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => adjustRestTimer(-15)}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl active:scale-95 transition-all"
            title="-15 segundos"
          >
            <Minus size={16} />
          </button>
          <button
            type="button"
            onClick={() => adjustRestTimer(15)}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl active:scale-95 transition-all"
            title="+15 segundos"
          >
            <Plus size={16} />
          </button>
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl active:scale-95 transition-all"
            title="Expandir"
          >
            <Maximize2 size={16} />
          </button>
          <button
            type="button"
            onClick={stopRestTimer}
            className="p-2.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 rounded-xl active:scale-95 transition-all ml-1"
            title="Fechar descanso"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
