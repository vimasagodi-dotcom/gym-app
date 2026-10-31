import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import { useUser } from '../../context/ThemeContext';
import { formatDuration, formatWeight } from '../../utils/formulas';
import {
  Calendar,
  Clock,
  Dumbbell,
  Award,
  ChevronDown,
  ChevronUp,
  Trash2,
  CheckCircle2,
} from 'lucide-react';

export const HistoryView: React.FC = () => {
  const { unit } = useUser();
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  const sessions = useLiveQuery(() =>
    db.workoutSessions.orderBy('startedAt').reverse().toArray()
  ) || [];

  const exercisesDb = useLiveQuery(() => db.exercises.toArray()) || [];
  const exerciseMap = new Map(exercisesDb.map((e) => [e.id, e]));

  const completedSessions = sessions.filter((s) => s.completedAt !== undefined);

  const toggleExpand = (id: string) => {
    setExpandedSessionId(expandedSessionId === id ? null : id);
  };

  const handleDeleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Desejas mesmo apagar o registo desta sessão de treino?')) {
      await db.workoutSessions.delete(id);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 pb-28 space-y-4 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-slate-100 tracking-tight">
          Histórico de Treinos
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          {completedSessions.length} treinos registados e arquivados
        </p>
      </div>

      {completedSessions.length === 0 ? (
        <div className="text-center py-20 text-slate-500 bg-slate-900/40 border border-slate-800 rounded-3xl">
          <Calendar size={42} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm font-semibold text-slate-300">Nenhum treino no histórico ainda.</p>
          <p className="text-xs text-slate-500 mt-1">Conclui o teu primeiro treino para veres aqui os teus registos!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {completedSessions.map((session) => {
            const isExpanded = expandedSessionId === session.id;
            const sessionDate = new Date(session.startedAt);
            const dateFormatted = sessionDate.toLocaleDateString('pt-PT', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });
            const timeFormatted = sessionDate.toLocaleTimeString('pt-PT', {
              hour: '2-digit',
              minute: '2-digit',
            });

            const hasPrs = session.prsAchieved && session.prsAchieved.length > 0;

            return (
              <div
                key={session.id}
                className="bg-slate-900/70 border border-slate-800 hover:border-slate-700 rounded-3xl overflow-hidden transition-all shadow-sm"
              >
                {/* Cabeçalho do Card */}
                <div
                  onClick={() => toggleExpand(session.id)}
                  className="p-4 sm:p-5 flex items-center justify-between gap-3 cursor-pointer select-none"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-amber-400 capitalize">
                        {dateFormatted} • {timeFormatted}
                      </span>
                      {hasPrs && (
                        <span className="px-2 py-0.5 bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-bold rounded-full flex items-center gap-1">
                          <Award size={12} /> {session.prsAchieved!.length} PR
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-100 truncate mt-1">
                      {session.name}
                    </h3>

                    {/* Mini Métricas */}
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-400 font-mono">
                      <span className="flex items-center gap-1">
                        <Clock size={13} className="text-slate-500" />
                        {formatDuration(session.durationSeconds)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Dumbbell size={13} className="text-slate-500" />
                        {formatWeight(session.totalVolumeKg, unit)}
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle2 size={13} className="text-slate-500" />
                        {session.totalSetsCompleted} séries
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => handleDeleteSession(session.id, e)}
                      className="p-2 text-slate-500 hover:text-rose-400 rounded-xl transition-colors"
                      title="Eliminar sessão do histórico"
                    >
                      <Trash2 size={16} />
                    </button>
                    <div className="p-1 text-slate-400">
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>
                </div>

                {/* Conteúdo Expandido com Séries Detalhadas */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-slate-800/80 space-y-4 bg-slate-950/40 animate-fade-in">
                    {session.notes && (
                      <p className="text-xs text-slate-400 bg-slate-900 p-3 rounded-2xl border border-slate-800 italic">
                        "{session.notes}"
                      </p>
                    )}

                    <div className="space-y-3">
                      {session.exercises.map((exItem, exIdx) => {
                        const meta = exerciseMap.get(exItem.exerciseId);
                        return (
                          <div
                            key={exItem.id}
                            className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3.5 space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-200">
                                {exIdx + 1}. {meta?.namePt || meta?.name || 'Exercício'}
                              </span>
                              <span className="text-[11px] text-slate-500 capitalize">
                                {meta?.equipment}
                              </span>
                            </div>

                            {/* Tabela de Séries Realizadas */}
                            <div className="grid grid-cols-4 gap-2 pt-1 text-center font-mono text-xs">
                              <div className="text-[10px] uppercase font-bold text-slate-500">Série</div>
                              <div className="text-[10px] uppercase font-bold text-slate-500">Carga</div>
                              <div className="text-[10px] uppercase font-bold text-slate-500">Reps</div>
                              <div className="text-[10px] uppercase font-bold text-slate-500">RPE</div>

                              {exItem.sets.map((s) => (
                                <React.Fragment key={s.id}>
                                  <div className="text-slate-400 font-semibold">{s.setNumber}</div>
                                  <div className="text-slate-100 font-bold">
                                    {formatWeight(s.weightKg, unit)}
                                  </div>
                                  <div className="text-slate-100">{s.reps}</div>
                                  <div className="text-slate-400">{s.rpe ?? '-'}</div>
                                </React.Fragment>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
