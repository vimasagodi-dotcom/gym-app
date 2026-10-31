import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import type { WorkoutSession } from '../../types/workout';
import { useUser } from '../../context/ThemeContext';
import { formatDuration, formatWeight } from '../../utils/formulas';
import { Trophy, Clock, Dumbbell, Award, CheckCircle } from 'lucide-react';

interface WorkoutSummaryModalProps {
  session: WorkoutSession | null;
  onClose: () => void;
}

export const WorkoutSummaryModal: React.FC<WorkoutSummaryModalProps> = ({
  session,
  onClose,
}) => {
  const { unit } = useUser();

  useEffect(() => {
    if (session) {
      // Dispara confetti de comemoração de treino concluído
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#38bdf8', '#10b981', '#f43f5e'],
      });
    }
  }, [session]);

  if (!session) return null;

  const hasPrs = session.prsAchieved && session.prsAchieved.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 text-center shadow-2xl animate-scale-up relative overflow-hidden">
        {/* Glow de fundo */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center mb-4">
          <Trophy size={32} />
        </div>

        <h2 className="text-2xl font-black text-slate-100 tracking-tight">
          Treino Concluído!
        </h2>
        <p className="text-sm text-slate-400 mt-1 font-medium">{session.name}</p>

        {/* Estatísticas Chave */}
        <div className="grid grid-cols-3 gap-3 my-6">
          <div className="bg-slate-800/50 border border-slate-800 rounded-2xl p-3 flex flex-col items-center">
            <Clock size={18} className="text-amber-400 mb-1" />
            <span className="text-xs text-slate-400">Duração</span>
            <span className="text-base font-bold text-slate-100 font-mono mt-0.5">
              {formatDuration(session.durationSeconds)}
            </span>
          </div>

          <div className="bg-slate-800/50 border border-slate-800 rounded-2xl p-3 flex flex-col items-center">
            <Dumbbell size={18} className="text-sky-400 mb-1" />
            <span className="text-xs text-slate-400">Volume</span>
            <span className="text-base font-bold text-slate-100 font-mono mt-0.5">
              {formatWeight(session.totalVolumeKg, unit)}
            </span>
          </div>

          <div className="bg-slate-800/50 border border-slate-800 rounded-2xl p-3 flex flex-col items-center">
            <CheckCircle size={18} className="text-emerald-400 mb-1" />
            <span className="text-xs text-slate-400">Séries</span>
            <span className="text-base font-bold text-slate-100 font-mono mt-0.5">
              {session.totalSetsCompleted}
            </span>
          </div>
        </div>

        {/* PRs Alcançados */}
        {hasPrs && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-left">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-2">
              <Award size={16} />
              {session.prsAchieved!.length} Novos Recordes Pessoais!
            </div>
            <div className="space-y-1.5">
              {session.prsAchieved!.map((pr) => (
                <div key={pr.id} className="text-xs text-slate-200 flex items-center justify-between">
                  <span className="font-semibold text-slate-300">
                    {pr.type === 'max_weight' ? 'Maior Carga' : 'Maior 1RM Estimada'}
                  </span>
                  <span className="font-bold text-amber-400 font-mono">
                    {formatWeight(pr.value, unit)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="w-full py-4 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold rounded-2xl transition-all shadow-lg shadow-amber-500/25 text-base"
        >
          Guardar no Histórico
        </button>
      </div>
    </div>
  );
};
