import React, { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import { useWorkout } from '../../context/WorkoutContext';
import { useUser } from '../../context/ThemeContext';
import { formatWeight } from '../../utils/formulas';
import { WeeklyMuscleMap } from '../analytics/WeeklyMuscleMap';
import { SmartPlanOnboardingModal } from '../onboarding/SmartPlanOnboardingModal';
import {
  Flame,
  Play,
  Award,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface DashboardViewProps {
  onNavigateToTab: (tab: 'routines' | 'exercises' | 'analytics' | 'history') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigateToTab }) => {
  const { startRoutineWorkout, startQuickWorkout } = useWorkout();
  const { unit, profile } = useUser();
  const [isOnboardingOpen, setIsOnboardingOpen] = React.useState(false);

  const sessions = useLiveQuery(() => db.workoutSessions.orderBy('startedAt').reverse().toArray()) || [];
  const routines = useLiveQuery(() => db.routines.toArray()) || [];
  const exercises = useLiveQuery(() => db.exercises.toArray()) || [];
  const prs = useLiveQuery(() => db.personalRecords.orderBy('date').reverse().limit(3).toArray()) || [];

  const completedSessions = useMemo(() => sessions.filter((s) => s.completedAt !== undefined), [sessions]);

  // Cálculo de Treinos e Volume desta semana vs semana anterior
  const stats = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay() || 7;
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(startOfWeek.getDate() - day + 1);

    const startOfPrevWeek = new Date(startOfWeek);
    startOfPrevWeek.setDate(startOfPrevWeek.getDate() - 7);

    let thisWeekVolume = 0;
    let thisWeekCount = 0;
    let prevWeekVolume = 0;
    let prevWeekCount = 0;

    for (const s of completedSessions) {
      const sDate = new Date(s.startedAt);
      if (sDate >= startOfWeek) {
        thisWeekVolume += s.totalVolumeKg;
        thisWeekCount += 1;
      } else if (sDate >= startOfPrevWeek && sDate < startOfWeek) {
        prevWeekVolume += s.totalVolumeKg;
        prevWeekCount += 1;
      }
    }

    const volumeDiffPercent =
      prevWeekVolume > 0
        ? Math.round(((thisWeekVolume - prevWeekVolume) / prevWeekVolume) * 100)
        : 0;

    // Cálculo simplificado de Streak de dias/semanas
    const streak = completedSessions.length > 0 ? Math.min(completedSessions.length, 12) : 0;

    return {
      thisWeekVolume,
      thisWeekCount,
      prevWeekVolume,
      volumeDiffPercent,
      streak,
    };
  }, [completedSessions]);

  // Encontra o próximo treino planeado da rotina ativa do utilizador
  const nextWorkout = useMemo(() => {
    if (routines.length === 0) return null;
    const activeRoutine = routines.find((r) => !r.isTemplate) || routines[0];
    if (!activeRoutine || activeRoutine.days.length === 0) return null;

    // Determina qual o próximo dia com base na última sessão
    const lastSession = completedSessions[0];
    let nextDay = activeRoutine.days[0];

    if (lastSession?.routineDayId) {
      const currentDayIndex = activeRoutine.days.findIndex((d) => d.id === lastSession.routineDayId);
      if (currentDayIndex >= 0 && currentDayIndex < activeRoutine.days.length - 1) {
        nextDay = activeRoutine.days[currentDayIndex + 1];
      }
    }

    return {
      routine: activeRoutine,
      day: nextDay,
    };
  }, [routines, completedSessions]);

  const exerciseMap = useMemo(() => new Map(exercises.map((e) => [e.id, e])), [exercises]);

  return (
    <div className="max-w-4xl mx-auto p-4 pb-28 space-y-6 animate-fade-in">
      {/* 1. Header de Boas-Vindas Clean */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <span className="text-[11px] font-semibold text-slate-400 tracking-wide uppercase">
            Visão Geral • {profile.name}
          </span>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight mt-0.5">
            Pronto para treinar?
          </h1>
        </div>

        {/* Streak Badge & Botão Inteligente */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsOnboardingOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 rounded-xl text-xs font-medium text-slate-200 transition-all active:scale-95"
            title="Gerar plano personalizado com base nas tuas métricas"
          >
            <Sparkles size={14} className="text-amber-400" />
            <span className="hidden sm:inline">Plano Auto</span>
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl">
            <Flame size={15} className="text-amber-400 fill-amber-400" />
            <span className="text-xs font-semibold text-slate-200 font-mono">
              {stats.streak}d
            </span>
          </div>
        </div>
      </div>

      {/* Banner de Boas-vindas para calibração inicial se ainda não completou */}
      {!profile.hasCompletedOnboarding && (
        <div className="bg-[#121215] border border-white/[0.08] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 uppercase tracking-wide">
              <Sparkles size={14} /> Calibração Inicial do Atleta
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-md leading-relaxed">
              Define os teus objetivos e características para obteres um plano Full-Body, Upper/Lower ou PPL à medida.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsOnboardingOpen(true)}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all active:scale-95 shrink-0"
          >
            Configurar
          </button>
        </div>
      )}

      {/* 2. Próximo Treino em Destaque */}
      {nextWorkout ? (
        <div className="relative overflow-hidden bg-[#111114] border border-white/[0.08] rounded-2xl p-5 shadow-lg">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[10px] font-semibold tracking-wider uppercase text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                Próximo Treino
              </span>
              <h2 className="text-xl font-bold text-slate-100 mt-2 tracking-tight">
                {nextWorkout.day.name}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Plano: {nextWorkout.routine.title}
              </p>
            </div>

            <button
              type="button"
              onClick={() => startRoutineWorkout(nextWorkout.routine, nextWorkout.day)}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-2 transition-all shrink-0"
            >
              <Play size={14} className="fill-current" /> Iniciar
            </button>
          </div>

          {/* Mini pré-visualização dos exercícios */}
          <div className="mt-4 pt-3.5 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
            <div className="truncate max-w-sm">
              <span className="font-medium text-slate-300">Exercícios: </span>
              {nextWorkout.day.exercises
                .map((e) => exerciseMap.get(e.exerciseId)?.namePt || 'Exercício')
                .slice(0, 3)
                .join(', ')}
              {nextWorkout.day.exercises.length > 3 ? ` + ${nextWorkout.day.exercises.length - 3}` : ''}
            </div>
            <button
              type="button"
              onClick={() => onNavigateToTab('routines')}
              className="text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 shrink-0 ml-2"
            >
              Ver rotinas <ArrowRight size={13} />
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-[#111114] border border-white/[0.08] rounded-2xl p-5 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-100">Começar Treino Livre</h3>
            <p className="text-xs text-slate-400 mt-0.5">Sem plano definido? Regista na hora.</p>
          </div>
          <button
            type="button"
            onClick={() => startQuickWorkout()}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5"
          >
            <Play size={13} className="fill-current" /> Iniciar Agora
          </button>
        </div>
      )}

      {/* 3. Cards de Métricas Semanais */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-[#111114] border border-white/[0.07] rounded-xl p-4">
          <span className="text-[11px] font-medium text-slate-400 tracking-tight block">
            Treinos esta semana
          </span>
          <div className="flex items-baseline gap-1 mt-1.5">
            <span className="text-2xl font-bold text-slate-100 font-mono">
              {stats.thisWeekCount}
            </span>
            <span className="text-xs text-slate-500">sessões</span>
          </div>
        </div>

        <div className="bg-[#111114] border border-white/[0.07] rounded-xl p-4">
          <span className="text-[11px] font-medium text-slate-400 tracking-tight block">
            Volume Semanal
          </span>
          <div className="flex items-baseline gap-1 mt-1.5">
            <span className="text-2xl font-bold text-slate-100 font-mono">
              {formatWeight(stats.thisWeekVolume, unit)}
            </span>
          </div>
          {stats.volumeDiffPercent !== 0 && (
            <span
              className={`text-[10px] font-medium mt-1 block ${
                stats.volumeDiffPercent > 0 ? 'text-emerald-400' : 'text-slate-500'
              }`}
            >
              {stats.volumeDiffPercent > 0 ? `+${stats.volumeDiffPercent}%` : `${stats.volumeDiffPercent}%`} vs semana anterior
            </span>
          )}
        </div>

        <div className="col-span-2 sm:col-span-1 bg-[#111114] border border-white/[0.07] rounded-xl p-4">
          <span className="text-[11px] font-medium text-slate-400 tracking-tight block">
            Treinos Totais
          </span>
          <div className="flex items-baseline gap-1 mt-1.5">
            <span className="text-2xl font-bold text-slate-100 font-mono">
              {completedSessions.length}
            </span>
            <span className="text-xs text-slate-500">concluídos</span>
          </div>
        </div>
      </div>

      {/* 4. Mapa Muscular Semanal */}
      <WeeklyMuscleMap sessions={sessions} exercises={exercises} />

      {/* 5. PRs Recentes Conquistados */}
      {prs.length > 0 && (
        <div className="bg-[#111114] border border-white/[0.08] rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wide flex items-center gap-2">
              <Award size={15} className="text-amber-400" />
              Recordes Pessoais Recentes
            </h3>
            <button
              type="button"
              onClick={() => onNavigateToTab('analytics')}
              className="text-xs font-medium text-amber-400 hover:text-amber-300"
            >
              Ver todos
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {prs.map((pr) => {
              const meta = exerciseMap.get(pr.exerciseId);
              return (
                <div
                  key={pr.id}
                  className="bg-[#18181c] border border-white/[0.06] rounded-xl p-3 flex flex-col justify-between"
                >
                  <span className="text-xs font-medium text-slate-200 truncate">
                    {meta?.namePt || 'Exercício'}
                  </span>
                  <div className="flex items-baseline justify-between mt-2">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">
                      {pr.type === 'max_weight' ? 'Carga Máx' : '1RM Est.'}
                    </span>
                    <span className="text-sm font-bold text-amber-400 font-mono">
                      {formatWeight(pr.value, unit)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal de Calibração Inteligente */}
      <SmartPlanOnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onPlanApplied={() => setIsOnboardingOpen(false)}
      />
    </div>
  );
};
