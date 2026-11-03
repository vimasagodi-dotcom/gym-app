import React from 'react';
import type { WorkoutSession } from '../../types/workout';
import type { Exercise } from '../../types/exercise';
import { useUser } from '../../context/ThemeContext';
import { formatDuration, formatWeight } from '../../utils/formulas';
import {
  X,
  Calendar,
  Clock,
  Dumbbell,
  Award,
  Flame,
  CheckCircle2,
  Play,
  Layers,
} from 'lucide-react';

interface DayWorkoutDetailModalProps {
  date: Date | null;
  sessions: WorkoutSession[];
  exercises: Exercise[];
  isOpen: boolean;
  onClose: () => void;
  onStartRoutine?: (routineId: string) => void;
}

export const DayWorkoutDetailModal: React.FC<DayWorkoutDetailModalProps> = ({
  date,
  sessions,
  exercises,
  isOpen,
  onClose,
  onStartRoutine,
}) => {
  const { unit } = useUser();

  if (!isOpen || !date) return null;

  const exerciseMap = new Map(exercises.map((e) => [e.id, e]));

  // Formatação da data em Português de Portugal
  const dateFormatted = date.toLocaleDateString('pt-PT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-fade-in">
      <div className="bg-[#111114] border border-white/[0.1] rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-scale-up">
        {/* Cabeçalho */}
        <div className="p-4 border-b border-white/[0.08] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-lime-400/15 text-lime-400 flex items-center justify-center">
              <Calendar size={16} />
            </span>
            <div>
              <h2 className="text-sm font-bold text-slate-100 capitalize">{dateFormatted}</h2>
              <span className="text-[11px] text-slate-400">
                {sessions.length === 1
                  ? '1 treino registado no calendário'
                  : sessions.length > 1
                  ? `${sessions.length} treinos registados neste dia`
                  : 'Nenhum treino registado neste dia'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-white/[0.08] rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Lista de Treinos do Dia */}
        <div className="overflow-y-auto flex-1 p-4 space-y-4">
          {sessions.length === 0 ? (
            <div className="text-center py-12 text-slate-500 bg-[#18181c] border border-white/[0.06] rounded-2xl p-6">
              <Dumbbell size={36} className="mx-auto mb-2 text-slate-600" />
              <p className="text-xs font-semibold text-slate-300">
                Não há registo de treino para este dia.
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Foi um dia de descanso ou recuperação muscular ativa.
              </p>
            </div>
          ) : (
            sessions.map((session, sIdx) => {
              const sessionStart = new Date(session.startedAt);
              const timeString = sessionStart.toLocaleTimeString('pt-PT', {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={session.id || sIdx}
                  className="bg-[#18181c] border border-white/[0.08] rounded-2xl p-4 space-y-3.5 shadow-sm"
                >
                  {/* Título & Badges */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-bold text-lime-400">{timeString}</span>
                        {session.periodizationWeek && (
                          <span className="px-2 py-0.5 bg-lime-400/10 border border-lime-400/25 text-lime-400 text-[10px] font-bold rounded-full">
                            Semana {session.periodizationWeek} de 4
                          </span>
                        )}
                        {session.prsAchieved && session.prsAchieved.length > 0 && (
                          <span className="px-2 py-0.5 bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-bold rounded-full flex items-center gap-1">
                            <Award size={11} /> {session.prsAchieved.length} PRs
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-slate-100 mt-1">{session.name}</h3>
                    </div>

                    {session.routineId && onStartRoutine && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onStartRoutine(session.routineId!);
                        }}
                        className="px-3 py-1 bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all shrink-0"
                      >
                        <Play size={12} className="fill-current" />
                        <span>Treinar Novamente</span>
                      </button>
                    )}
                  </div>

                  {/* Estatísticas Rápidas do Treino */}
                  <div className="grid grid-cols-3 gap-2 bg-[#111114] p-2.5 rounded-xl border border-white/[0.06] text-center">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Duração</span>
                      <span className="text-xs font-bold text-slate-200 flex items-center justify-center gap-1 mt-0.5">
                        <Clock size={12} className="text-slate-400" />
                        {formatDuration(session.durationSeconds)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Volume Total</span>
                      <span className="text-xs font-bold text-lime-400 flex items-center justify-center gap-1 mt-0.5">
                        <Flame size={12} className="text-lime-400" />
                        {formatWeight(session.totalVolumeKg, unit)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Séries Concluídas</span>
                      <span className="text-xs font-bold text-slate-200 flex items-center justify-center gap-1 mt-0.5">
                        <CheckCircle2 size={12} className="text-emerald-400" />
                        {session.totalSetsCompleted}
                      </span>
                    </div>
                  </div>

                  {/* Lista de Exercícios Realizados com Séries e Cargas */}
                  <div className="space-y-2 pt-1">
                    <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Layers size={13} className="text-lime-400" />
                      <span>Exercícios & Cargas Registadas</span>
                    </span>

                    <div className="space-y-2">
                      {session.exercises.map((exLog, exIdx) => {
                        const meta = exerciseMap.get(exLog.exerciseId);
                        const completedSets = exLog.sets.filter((s) => s.isCompleted);

                        return (
                          <div
                            key={exLog.id || exIdx}
                            className="bg-[#111114]/70 border border-white/[0.04] p-2.5 rounded-xl text-xs space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-slate-200">
                                {meta?.namePt || meta?.name || 'Exercício'}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {completedSets.length} séries
                              </span>
                            </div>

                            {/* Séries em formato compacto */}
                            <div className="flex flex-wrap gap-1.5 pt-0.5">
                              {completedSets.map((set, sIdx) => (
                                <span
                                  key={set.id || sIdx}
                                  className="px-2 py-0.5 bg-[#18181c] border border-white/[0.08] rounded-md text-[11px] font-mono text-slate-300 flex items-center gap-1"
                                >
                                  <span className="text-[9px] text-slate-500 font-sans">S{sIdx + 1}:</span>
                                  <span className="font-bold text-lime-400">
                                    {set.weightKg} {unit}
                                  </span>
                                  <span className="text-slate-400">× {set.reps}</span>
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Rodapé */}
        <div className="p-3 border-t border-white/[0.08] flex justify-end bg-[#09090b]/80 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-[#18181c] hover:bg-white/10 text-slate-200 text-xs font-semibold rounded-lg transition-all"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
