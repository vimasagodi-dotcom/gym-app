import React, { useState, useMemo } from 'react';
import type { WorkoutSession } from '../../types/workout';
import type { Exercise } from '../../types/exercise';
import type { WorkoutRoutine } from '../../types/routine';
import { DayWorkoutDetailModal } from './DayWorkoutDetailModal';
import { db } from '../../db/db';
import { useAuth } from '../../context/AuthContext';
import { syncRoutineToCloud } from '../../services/cloudSync';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Award,
  Sparkles,
} from 'lucide-react';

interface WorkoutCalendarProps {
  sessions: WorkoutSession[];
  exercises: Exercise[];
  activeRoutine?: WorkoutRoutine | null;
  onStartRoutine?: (routineId: string) => void;
}

export const WorkoutCalendar: React.FC<WorkoutCalendarProps> = ({
  sessions,
  exercises,
  activeRoutine,
  onStartRoutine,
}) => {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDaySessions, setSelectedDaySessions] = useState<{
    date: Date;
    sessions: WorkoutSession[];
  } | null>(null);

  // Mês e Ano atuais da visualização
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' });

  // Mapeia sessões completadas por string YYYY-MM-DD
  const sessionsByDate = useMemo(() => {
    const map = new Map<string, WorkoutSession[]>();
    for (const s of sessions) {
      if (!s.completedAt && !s.startedAt) continue;
      const d = new Date(s.completedAt || s.startedAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate()
      ).padStart(2, '0')}`;
      const list = map.get(key) || [];
      list.push(s);
      map.set(key, list);
    }
    return map;
  }, [sessions]);

  // Total de treinos e volume no mês visível
  const monthStats = useMemo(() => {
    let count = 0;
    let volume = 0;
    for (const s of sessions) {
      const d = new Date(s.completedAt || s.startedAt);
      if (d.getFullYear() === year && d.getMonth() === month) {
        count += 1;
        volume += s.totalVolumeKg || 0;
      }
    }
    return { count, volume };
  }, [sessions, year, month]);

  // Geração da grelha de dias do mês (começando na Segunda-feira)
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Dia da semana do 1º dia (0=Dom, 1=Seg... -> converter para 0=Seg, 6=Dom)
    const startDayIndex = (firstDayOfMonth.getDay() + 6) % 7;
    const totalDays = lastDayOfMonth.getDate();

    const days: Array<{
      date: Date;
      isCurrentMonth: boolean;
      dateKey: string;
      isToday: boolean;
      sessions: WorkoutSession[];
    }> = [];

    const todayKey = new Date().toISOString().slice(0, 10);

    // Dias do mês anterior para preencher a primeira linha
    for (let i = startDayIndex - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate()
      ).padStart(2, '0')}`;
      days.push({
        date: d,
        isCurrentMonth: false,
        dateKey,
        isToday: dateKey === todayKey,
        sessions: sessionsByDate.get(dateKey) || [],
      });
    }

    // Dias do mês atual
    for (let dayNum = 1; dayNum <= totalDays; dayNum++) {
      const d = new Date(year, month, dayNum);
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate()
      ).padStart(2, '0')}`;
      days.push({
        date: d,
        isCurrentMonth: true,
        dateKey,
        isToday: dateKey === todayKey,
        sessions: sessionsByDate.get(dateKey) || [],
      });
    }

    // Dias do mês seguinte para completar até múltiplo de 7 (geralmente 35 ou 42 dias)
    const remainingDays = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remainingDays; i++) {
      const d = new Date(year, month + 1, i);
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate()
      ).padStart(2, '0')}`;
      days.push({
        date: d,
        isCurrentMonth: false,
        dateKey,
        isToday: dateKey === todayKey,
        sessions: sessionsByDate.get(dateKey) || [],
      });
    }

    return days;
  }, [year, month, sessionsByDate]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleGoToToday = () => {
    setCurrentDate(new Date());
  };

  // Cálculo da semana do bloco de 4 semanas
  const { user } = useAuth();
  const currentWeek = activeRoutine?.currentWeek || 1;

  const handleSelectWeek = async (wk: 1 | 2 | 3 | 4) => {
    if (!activeRoutine) return;
    await db.routines.update(activeRoutine.id, { currentWeek: wk });
    if (user?.uid) {
      syncRoutineToCloud(user.uid, { ...activeRoutine, currentWeek: wk }).catch(() => {});
    }
  };

  return (
    <div className="bg-[#111114] border border-white/[0.08] rounded-3xl p-4 sm:p-5 space-y-4 shadow-xl">
      {/* Barra de Título & Navegação do Calendário */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-lime-400/15 text-lime-400 flex items-center justify-center">
            <CalendarIcon size={16} />
          </span>
          <div>
            <h3 className="text-sm font-bold text-slate-100 capitalize">{monthName}</h3>
            <span className="text-[11px] text-slate-400">
              {monthStats.count === 1
                ? '1 treino concluído'
                : `${monthStats.count} treinos concluídos este mês`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleGoToToday}
            className="px-2 py-1 bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 rounded-lg text-[11px] font-semibold transition-colors mr-1"
          >
            Hoje
          </button>
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-white/[0.08] rounded-lg transition-colors"
            title="Mês anterior"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-white/[0.08] rounded-lg transition-colors"
            title="Mês seguinte"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Cartão de Bloco de Periodização de 4 Semanas */}
      <div className="bg-[#18181c] border border-white/[0.06] rounded-2xl p-3 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-200">
            <Sparkles size={13} className="text-lime-400" />
            <span>Ciclo de 4 Semanas: Semana {currentWeek} de 4</span>
          </div>
          <span className="text-[10px] text-lime-400 font-semibold">
            {currentWeek === 1
              ? '4x10 Reps (Volume Base)'
              : currentWeek === 2
              ? '4x8 Reps (+2.5% Carga)'
              : currentWeek === 3
              ? '4x6 Reps (Pico de Força)'
              : '3x8 Reps (Semana de Deload)'}
          </span>
        </div>

        {/* 4 Botões Interativos de Progresso das Semanas */}
        <div className="grid grid-cols-4 gap-1.5 pt-1">
          {([1, 2, 3, 4] as const).map((wk) => (
            <button
              key={wk}
              type="button"
              onClick={() => handleSelectWeek(wk)}
              title={`Mudar para a Semana ${wk} do Ciclo de 4 Semanas`}
              className={`py-1.5 px-1 rounded-lg text-[10px] font-bold transition-all border ${
                wk < currentWeek
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                  : wk === currentWeek
                  ? 'bg-lime-400 text-slate-950 border-lime-400 shadow-[0_0_10px_rgba(190,242,100,0.3)]'
                  : 'bg-white/[0.04] border-white/[0.08] text-slate-400 hover:text-slate-200'
              }`}
            >
              Semana {wk}
            </button>
          ))}
        </div>
      </div>

      {/* Grelha do Calendário */}
      <div className="space-y-1">
        {/* Cabeçalho dos Dias da Semana (Seg a Dom) */}
        <div className="grid grid-cols-7 text-center text-[11px] font-bold text-slate-400 pb-1">
          <span>Seg</span>
          <span>Ter</span>
          <span>Qua</span>
          <span>Qui</span>
          <span>Sex</span>
          <span>Sáb</span>
          <span>Dom</span>
        </div>

        {/* Dias do Mês */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((item) => {
            const hasWorkout = item.sessions.length > 0;
            const hasPr = item.sessions.some((s) => s.prsAchieved && s.prsAchieved.length > 0);

            return (
              <button
                type="button"
                key={item.dateKey}
                onClick={() => setSelectedDaySessions({ date: item.date, sessions: item.sessions })}
                className={`relative min-h-[46px] sm:min-h-[52px] p-1 rounded-xl flex flex-col items-center justify-between text-xs transition-all border ${
                  hasWorkout
                    ? 'bg-lime-400/10 border-lime-400/40 text-slate-100 hover:bg-lime-400/20 shadow-sm'
                    : item.isToday
                    ? 'bg-white/[0.08] border-white/30 text-white font-bold'
                    : item.isCurrentMonth
                    ? 'bg-[#18181c]/60 border-white/[0.04] text-slate-300 hover:bg-white/[0.06]'
                    : 'bg-transparent border-transparent text-slate-600 hover:text-slate-400'
                }`}
              >
                {/* Número do Dia */}
                <span
                  className={`text-[11px] font-semibold ${
                    item.isToday
                      ? 'w-5 h-5 rounded-full bg-lime-400 text-slate-950 flex items-center justify-center font-bold'
                      : ''
                  }`}
                >
                  {item.date.getDate()}
                </span>

                {/* Marcadores de Treino / PR */}
                {hasWorkout ? (
                  <div className="flex items-center gap-1 pb-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" />
                    {hasPr && <Award size={10} className="text-amber-400" />}
                  </div>
                ) : (
                  <div className="h-1.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legenda & Resumo Rápido */}
      <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-[11px] text-slate-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-lime-400" /> Dia Treinado
          </span>
          <span className="flex items-center gap-1.5">
            <Award size={12} className="text-amber-400" /> Recorde Batido
          </span>
        </div>

        <span className="text-slate-300 font-semibold">Toca num dia para ver o treino</span>
      </div>

      {/* Modal de Detalhe do Treino do Dia Clicado */}
      {selectedDaySessions && (
        <DayWorkoutDetailModal
          isOpen={true}
          date={selectedDaySessions.date}
          sessions={selectedDaySessions.sessions}
          exercises={exercises}
          onClose={() => setSelectedDaySessions(null)}
          onStartRoutine={onStartRoutine}
        />
      )}
    </div>
  );
};
