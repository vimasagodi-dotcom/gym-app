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
    <div className="max-w-4xl mx-auto p-4 pb-28 space-y-5 animate-fade-in">
      {/* 1. Header de Boas-Vindas */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
            Olá, {profile.name}
          </span>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight">
            Pronto para treinar?
          </h1>
        </div>

        {/* Streak Badge & Botão Inteligente */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsOnboardingOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-amber-500/20 to-sky-500/20 hover:from-amber-500/30 hover:to-sky-500/30 border border-amber-500/40 rounded-2xl text-xs font-black text-amber-400 shadow-sm transition-all active:scale-95"
            title="Gerar plano personalizado com base nas tuas métricas"
          >
            <Sparkles size={15} />
            <span className="hidden sm:inline">Plano Inteligente</span>
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/15 border border-amber-500/30 rounded-2xl">
            <Flame size={18} className="text-amber-400 fill-amber-400 animate-pulse" />
            <div className="text-left">
              <span className="text-[10px] uppercase font-bold text-slate-400 block leading-none">
                Streak
              </span>
              <span className="text-xs font-black text-amber-400 font-mono">
                {stats.streak} dias
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Banner de Boas-vindas para calibração inicial se ainda não completou */}
      {!profile.hasCompletedOnboarding && (
        <div className="bg-gradient-to-r from-amber-500/20 via-slate-900 to-slate-900 border border-amber-500/40 rounded-3xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-black text-amber-400 uppercase tracking-wider">
              <Sparkles size={14} /> Calibração Inicial do Atleta
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-md">
              Insere a tua altura, peso corporal e objetivo para receberes um plano Full-Body, Upper/Lower ou PPL calibrado à tua medida!
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsOnboardingOpen(true)}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all active:scale-95 shrink-0"
          >
            Calibrar Meu Treino
          </button>
        </div>
      )}

      {/* 2. Próximo Treino em Destaque */}
      {nextWorkout ? (
        <div className="relative overflow-hidden bg-gradient-to-br from-amber-500/20 via-slate-900 to-slate-900 border border-amber-500/30 rounded-3xl p-5 shadow-xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="px-2.5 py-0.5 bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider rounded-full">
                Próximo Treino
              </span>
              <h2 className="text-xl font-black text-slate-100 mt-2">
                {nextWorkout.day.name}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Plano: {nextWorkout.routine.title}
              </p>
            </div>

            <button
              type="button"
              onClick={() => startRoutineWorkout(nextWorkout.routine, nextWorkout.day)}
              className="px-5 py-3 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 text-xs font-black rounded-2xl flex items-center gap-2 shadow-lg shadow-amber-500/30 transition-all shrink-0"
            >
              <Play size={16} className="fill-current" /> Iniciar
            </button>
          </div>

          {/* Mini pré-visualização dos exercícios */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <div className="truncate max-w-sm">
              <span className="font-semibold text-slate-300">Exercícios: </span>
              {nextWorkout.day.exercises
                .map((e) => exerciseMap.get(e.exerciseId)?.namePt || 'Exercício')
                .slice(0, 3)
                .join(', ')}
              {nextWorkout.day.exercises.length > 3 ? ` + ${nextWorkout.day.exercises.length - 3}` : ''}
            </div>
            <button
              type="button"
              onClick={() => onNavigateToTab('routines')}
              className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 shrink-0 ml-2"
            >
              Ver rotinas <ArrowRight size={13} />
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-100">Começa um Treino Rápido</h3>
            <p className="text-xs text-slate-400 mt-0.5">Sem plano definido? Regista na hora.</p>
          </div>
          <button
            type="button"
            onClick={() => startQuickWorkout()}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md"
          >
            <Play size={14} className="fill-current" /> Iniciar Agora
          </button>
        </div>
      )}

      {/* 3. Cards de Métricas Semanais */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Treinos esta semana
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-slate-100 font-mono">
              {stats.thisWeekCount}
            </span>
            <span className="text-xs text-slate-500 font-medium">sessões</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Volume Semanal
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-slate-100 font-mono">
              {formatWeight(stats.thisWeekVolume, unit)}
            </span>
          </div>
          {stats.volumeDiffPercent !== 0 && (
            <span
              className={`text-[10px] font-bold mt-0.5 block ${
                stats.volumeDiffPercent > 0 ? 'text-emerald-400' : 'text-slate-500'
              }`}
            >
              {stats.volumeDiffPercent > 0 ? `+${stats.volumeDiffPercent}%` : `${stats.volumeDiffPercent}%`} vs semana anterior
            </span>
          )}
        </div>

        <div className="col-span-2 sm:col-span-1 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Treinos Totais
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-slate-100 font-mono">
              {completedSessions.length}
            </span>
            <span className="text-xs text-slate-500 font-medium">concluídos</span>
          </div>
        </div>
      </div>

      {/* 4. Mapa Muscular Semanal */}
      <WeeklyMuscleMap sessions={sessions} exercises={exercises} />

      {/* 5. PRs Recentes Conquistados */}
      {prs.length > 0 && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Award size={16} className="text-amber-400" />
              Recordes Pessoais Recentes
            </h3>
            <button
              type="button"
              onClick={() => onNavigateToTab('analytics')}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300"
            >
              Ver todos
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {prs.map((pr) => {
              const meta = exerciseMap.get(pr.exerciseId);
              return (
                <div
                  key={pr.id}
                  className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3 flex flex-col justify-between"
                >
                  <span className="text-xs font-bold text-slate-200 truncate">
                    {meta?.namePt || 'Exercício'}
                  </span>
                  <div className="flex items-baseline justify-between mt-2">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">
                      {pr.type === 'max_weight' ? 'Carga Máx' : '1RM Est.'}
                    </span>
                    <span className="text-sm font-black text-amber-400 font-mono">
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
