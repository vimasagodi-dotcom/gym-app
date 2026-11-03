import React, { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import { useWorkout } from '../../context/WorkoutContext';
import { useUser } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { formatWeight } from '../../utils/formulas';
import { WeeklyMuscleMap } from '../analytics/WeeklyMuscleMap';
import { SmartPlanOnboardingModal } from '../onboarding/SmartPlanOnboardingModal';
import { WorkoutCalendar } from './WorkoutCalendar';
import { AuthModal } from '../auth/AuthModal';
import {
  Flame,
  Play,
  Award,
  ArrowRight,
  Sparkles,
  User as UserIcon,
  Cloud,
  HardDrive,
} from 'lucide-react';

interface DashboardViewProps {
  onNavigateToTab: (tab: 'routines' | 'exercises' | 'analytics' | 'history') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigateToTab }) => {
  const { startRoutineWorkout, startQuickWorkout } = useWorkout();
  const { unit, profile } = useUser();
  const { user, isFirebaseActive } = useAuth();

  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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

    // Cálculo de Streak de dias/semanas
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
  const activeRoutine = useMemo(() => {
    if (routines.length === 0) return null;
    return routines.find((r) => !r.isTemplate) || routines[0];
  }, [routines]);

  const nextWorkout = useMemo(() => {
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
  }, [activeRoutine, completedSessions]);

  const exerciseMap = useMemo(() => new Map(exercises.map((e) => [e.id, e])), [exercises]);

  const handleStartRoutineFromId = (routineId: string) => {
    const routine = routines.find((r) => r.id === routineId);
    if (routine && routine.days.length > 0) {
      startRoutineWorkout(routine, routine.days[0]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-3.5 sm:px-4 py-3 sm:py-4 pb-28 space-y-5 animate-fade-in">
      {/* 1. Header de Boas-Vindas & Gestão de Conta */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 tracking-wide uppercase truncate">
            <span>Visão Geral</span>
            <span>•</span>
            <span className="text-lime-400 font-bold truncate">
              {user ? user.displayName : profile.name}
            </span>
            {isFirebaseActive ? (
              <span className="px-1.5 py-0.2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[9px] font-bold flex items-center gap-0.5 ml-1">
                <Cloud size={9} /> Nuvem
              </span>
            ) : (
              <span className="px-1.5 py-0.2 bg-lime-400/10 text-lime-400 border border-lime-400/20 rounded text-[9px] font-bold flex items-center gap-0.5 ml-1">
                <HardDrive size={9} /> Local
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight mt-0.5 truncate">
            Pronto para treinar?
          </h1>
        </div>

        {/* Streak Badge & Botão de Perfil / Login */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#18181c] hover:bg-[#202026] border border-white/[0.08] hover:border-lime-400/40 rounded-xl text-xs font-semibold text-slate-200 transition-all active:scale-95"
            title={user ? 'Gerir conta e sincronização' : 'Iniciar sessão ou criar conta'}
          >
            <UserIcon size={14} className={user ? 'text-lime-400' : 'text-slate-400'} />
            <span className="hidden sm:inline">{user ? 'Conta' : 'Entrar'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsOnboardingOpen(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-[#18181c] hover:bg-[#202026] border border-white/[0.08] rounded-xl text-xs font-medium text-slate-200 transition-all active:scale-95"
            title="Gerar plano de 4 semanas personalizado"
          >
            <Sparkles size={14} className="text-lime-400 shrink-0" />
            <span className="hidden sm:inline">Plano Auto</span>
          </button>

          <div className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 bg-[#111114] border border-white/[0.08] rounded-xl">
            <Flame size={15} className="text-lime-400 fill-lime-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-200 font-mono">
              {stats.streak}d
            </span>
          </div>
        </div>
      </div>

      {/* 2. Próximo Treino em Destaque com Bloco de Periodização */}
      {nextWorkout ? (
        <div className="relative overflow-hidden bg-[#111114] border border-white/[0.08] rounded-2xl p-5 shadow-lg">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold tracking-wider uppercase text-lime-400 bg-lime-400/10 border border-lime-400/20 px-2 py-0.5 rounded-md">
                  Próximo Treino
                </span>
                {activeRoutine?.currentWeek && (
                  <span className="text-[10px] font-semibold text-slate-400">
                    Semana {activeRoutine.currentWeek} de 4
                  </span>
                )}
              </div>
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
              className="px-5 py-2.5 bg-lime-400 hover:bg-lime-300 active:scale-95 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-2 transition-all shrink-0 shadow-md"
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
              className="text-lime-400 hover:text-lime-300 font-medium flex items-center gap-1 shrink-0 ml-2"
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
            className="px-4 py-2 bg-lime-400 hover:bg-lime-300 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5"
          >
            <Play size={13} className="fill-current" /> Iniciar Agora
          </button>
        </div>
      )}

      {/* 3. CALENDÁRIO INTERATIVO DE TREINOS COM DETALHES DE DIAS E MESOCICLO */}
      <WorkoutCalendar
        sessions={completedSessions}
        exercises={exercises}
        activeRoutine={activeRoutine}
        onStartRoutine={handleStartRoutineFromId}
      />

      {/* 4. Cards de Métricas Semanais */}
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
            Treinos Totais no Histórico
          </span>
          <div className="flex items-baseline gap-1 mt-1.5">
            <span className="text-2xl font-bold text-slate-100 font-mono">
              {completedSessions.length}
            </span>
            <span className="text-xs text-slate-500">concluídos</span>
          </div>
        </div>
      </div>

      {/* 5. Mapa Muscular Semanal */}
      <WeeklyMuscleMap sessions={sessions} exercises={exercises} />

      {/* 6. PRs Recentes Conquistados */}
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
              className="text-xs font-medium text-lime-400 hover:text-lime-300"
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

      {/* Modais Globais */}
      <SmartPlanOnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onPlanApplied={() => setIsOnboardingOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};
