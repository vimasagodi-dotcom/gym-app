import React, { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import { useWorkout } from '../../context/WorkoutContext';
import { useUser } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { formatWeight } from '../../utils/formulas';
import { WeeklyMuscleMap } from '../analytics/WeeklyMuscleMap';
import { SmartPlanOnboardingModal } from '../onboarding/SmartPlanOnboardingModal';
import type { NavTab } from '../common/BottomNav';
import {
  Flame,
  Play,
  Award,
  ArrowRight,
  Sparkles,
  Calendar,
  Cloud,
  Dumbbell,
} from 'lucide-react';

interface DashboardViewProps {
  onNavigateToTab: (tab: NavTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigateToTab }) => {
  const { startRoutineWorkout, startQuickWorkout } = useWorkout();
  const { unit, profile } = useUser();
  const { user, isFirebaseActive } = useAuth();

  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

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

    for (const s of completedSessions) {
      const sDate = new Date(s.startedAt);
      if (sDate >= startOfWeek) {
        thisWeekVolume += s.totalVolumeKg;
        thisWeekCount += 1;
      } else if (sDate >= startOfPrevWeek && sDate < startOfWeek) {
        prevWeekVolume += s.totalVolumeKg;
      }
    }

    const volumeDiffPercent =
      prevWeekVolume > 0
        ? Math.round(((thisWeekVolume - prevWeekVolume) / prevWeekVolume) * 100)
        : 0;

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

  return (
    <div className="max-w-xl mx-auto px-3.5 py-3 pb-28 safe-area-pt space-y-4 animate-fade-in">
      {/* 1. Cabeçalho Compacto Mobile-First */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 tracking-wide uppercase truncate">
            <span className="text-lime-400 font-bold truncate">
              Olá, {user?.displayName || profile.name}
            </span>
            {isFirebaseActive && (
              <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[9px] font-bold flex items-center gap-0.5 shrink-0">
                <Cloud size={9} /> Cloud
              </span>
            )}
          </div>
          <h1 className="text-xl font-black text-slate-100 tracking-tight mt-0.5 truncate">
            Pronto para treinar?
          </h1>
        </div>

        {/* Atalhos Rápidos no Topo: Calendário no Perfil + Streak */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => onNavigateToTab('settings')}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#18181c] hover:bg-[#222228] border border-white/[0.08] rounded-xl text-xs font-semibold text-slate-200 transition-all active:scale-95"
            title="Abrir Perfil e Calendário de Treinos"
          >
            <Calendar size={14} className="text-lime-400 shrink-0" />
            <span>Calendário</span>
          </button>

          <div className="flex items-center gap-1 px-2.5 py-2 bg-[#111114] border border-white/[0.08] rounded-xl">
            <Flame size={14} className="text-lime-400 fill-lime-400 shrink-0" />
            <span className="text-xs font-bold text-slate-200 font-mono">
              {stats.streak}d
            </span>
          </div>
        </div>
      </div>

      {/* 2. Cartão Principal: Próximo Treino (Otimizado para 1 Polegar no Telemóvel) */}
      {nextWorkout ? (
        <div className="bg-[#111114] border border-white/[0.1] rounded-3xl p-4 sm:p-5 shadow-xl space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold tracking-wider uppercase text-lime-400 bg-lime-400/10 border border-lime-400/25 px-2.5 py-0.5 rounded-full">
                Próximo Treino
              </span>
              <span className="text-[11px] font-bold text-slate-400">
                Semana {activeRoutine?.currentWeek || 1} de 4
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-black text-slate-100 tracking-tight leading-snug pt-0.5">
              {nextWorkout.day.name}
            </h2>
            <p className="text-xs text-slate-400 truncate">
              Plano: {nextWorkout.routine.title}
            </p>
          </div>

          {/* Lista compacta de exercícios do dia */}
          <div className="flex flex-wrap gap-1.5">
            {nextWorkout.day.exercises.slice(0, 4).map((e) => (
              <span
                key={e.id}
                className="px-2.5 py-1 bg-[#18181c] border border-white/[0.06] rounded-lg text-[11px] text-slate-300 font-medium truncate max-w-[160px]"
              >
                {exerciseMap.get(e.exerciseId)?.namePt || 'Exercício'}
              </span>
            ))}
            {nextWorkout.day.exercises.length > 4 && (
              <span className="px-2 py-1 bg-[#18181c] border border-white/[0.06] rounded-lg text-[11px] text-lime-400 font-bold">
                +{nextWorkout.day.exercises.length - 4}
              </span>
            )}
          </div>

          {/* Botão Grande Tátil para Iniciar Treino */}
          <button
            type="button"
            onClick={() => startRoutineWorkout(nextWorkout.routine, nextWorkout.day)}
            className="w-full min-h-[48px] bg-lime-400 hover:bg-lime-300 active:scale-[0.98] text-slate-950 text-sm font-black rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-lime-400/15"
          >
            <Play size={16} className="fill-current" />
            <span>Iniciar Este Treino Agora</span>
          </button>

          {/* Ações Rápidas Secundárias */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsOnboardingOpen(true)}
              className="py-2.5 px-3 bg-[#18181c] hover:bg-[#202026] border border-white/[0.07] rounded-xl text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              <Sparkles size={13} className="text-lime-400 shrink-0" />
              <span>Plano 4 Semanas</span>
            </button>
            <button
              type="button"
              onClick={() => startQuickWorkout('Treino Livre')}
              className="py-2.5 px-3 bg-[#18181c] hover:bg-[#202026] border border-white/[0.07] rounded-xl text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              <Dumbbell size={13} className="text-slate-400 shrink-0" />
              <span>Treino Livre</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-[#111114] border border-white/[0.08] rounded-3xl p-5 space-y-3">
          <div>
            <h3 className="text-base font-bold text-slate-100">Começar Treino</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Inicia um treino livre ou gera o teu plano inteligente de 4 semanas.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setIsOnboardingOpen(true)}
              className="min-h-[46px] bg-lime-400 hover:bg-lime-300 text-slate-950 text-xs font-bold rounded-2xl flex items-center justify-center gap-1.5"
            >
              <Sparkles size={14} /> Gerar Plano
            </button>
            <button
              type="button"
              onClick={() => startQuickWorkout()}
              className="min-h-[46px] bg-[#18181c] border border-white/[0.08] text-slate-200 text-xs font-bold rounded-2xl flex items-center justify-center gap-1.5"
            >
              <Play size={13} className="fill-current" /> Treino Livre
            </button>
          </div>
        </div>
      )}

      {/* 3. Grelha Compacta de Métricas (3 Colunas no Telemóvel) */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-[#111114] border border-white/[0.07] rounded-2xl p-3 text-center">
          <span className="text-[10px] font-semibold text-slate-400 uppercase block truncate">
            Esta Semana
          </span>
          <span className="text-xl font-black text-slate-100 font-mono mt-1 block">
            {stats.thisWeekCount}
          </span>
          <span className="text-[10px] text-slate-500 block">treinos</span>
        </div>

        <div className="bg-[#111114] border border-white/[0.07] rounded-2xl p-3 text-center">
          <span className="text-[10px] font-semibold text-slate-400 uppercase block truncate">
            Volume (7d)
          </span>
          <span className="text-base sm:text-xl font-black text-lime-400 font-mono mt-1 block truncate">
            {formatWeight(stats.thisWeekVolume, unit)}
          </span>
          <span className="text-[10px] text-slate-500 block">
            {stats.volumeDiffPercent > 0 ? `+${stats.volumeDiffPercent}%` : 'acumulado'}
          </span>
        </div>

        <div className="bg-[#111114] border border-white/[0.07] rounded-2xl p-3 text-center">
          <span className="text-[10px] font-semibold text-slate-400 uppercase block truncate">
            Total
          </span>
          <span className="text-xl font-black text-slate-100 font-mono mt-1 block">
            {completedSessions.length}
          </span>
          <span className="text-[10px] text-slate-500 block">concluídos</span>
        </div>
      </div>

      {/* 4. Mapa Muscular Semanal */}
      <WeeklyMuscleMap sessions={sessions} exercises={exercises} />

      {/* 5. Recordes Pessoais Recentes */}
      {prs.length > 0 && (
        <div className="bg-[#111114] border border-white/[0.08] rounded-3xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
              <Award size={15} className="text-amber-400" />
              Recordes Pessoais Recentes
            </h3>
            <button
              type="button"
              onClick={() => onNavigateToTab('analytics')}
              className="text-xs font-semibold text-lime-400 hover:text-lime-300 flex items-center gap-0.5"
            >
              Ver todos <ArrowRight size={12} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {prs.map((pr) => {
              const meta = exerciseMap.get(pr.exerciseId);
              return (
                <div
                  key={pr.id}
                  className="bg-[#18181c] border border-white/[0.06] rounded-2xl p-3 flex items-center justify-between sm:flex-col sm:items-start gap-2"
                >
                  <span className="text-xs font-semibold text-slate-200 truncate">
                    {meta?.namePt || 'Exercício'}
                  </span>
                  <div className="flex items-baseline gap-2 shrink-0">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">
                      {pr.type === 'max_weight' ? 'Máx' : '1RM'}
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

      {/* Modal de Plano de 4 Semanas */}
      <SmartPlanOnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onPlanApplied={() => setIsOnboardingOpen(false)}
      />
    </div>
  );
};
