import React, { useMemo } from 'react';
import type { WorkoutSession } from '../../types/workout';
import type { Exercise, MuscleGroup } from '../../types/exercise';
import { MUSCLE_GROUPS_INFO } from '../../types/exercise';
import { MuscleDiagram } from '../anatomy/MuscleDiagram';
import { useUser } from '../../context/ThemeContext';
import { Activity, ShieldAlert } from 'lucide-react';

interface WeeklyMuscleMapProps {
  sessions: WorkoutSession[];
  exercises: Exercise[];
}

export const WeeklyMuscleMap: React.FC<WeeklyMuscleMapProps> = ({
  sessions,
  exercises,
}) => {
  const { silhouette } = useUser();
  const exerciseMap = useMemo(() => new Map(exercises.map((e) => [e.id, e])), [exercises]);

  // Filtra treinos dos últimos 7 dias
  const weeklyMuscleSets = useMemo(() => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentSessions = sessions.filter(
      (s) => s.completedAt && new Date(s.startedAt) >= sevenDaysAgo
    );

    const counts: Record<MuscleGroup, number> = {
      chest: 0,
      upper_back: 0,
      lats: 0,
      lower_back: 0,
      shoulders: 0,
      biceps: 0,
      triceps: 0,
      forearms: 0,
      abs: 0,
      glutes: 0,
      quads: 0,
      hamstrings: 0,
      calves: 0,
    };

    for (const session of recentSessions) {
      for (const exLog of session.exercises) {
        const meta = exerciseMap.get(exLog.exerciseId);
        if (!meta) continue;

        const completedCount = exLog.sets.filter((s) => s.isCompleted).length;

        // Primários recebem o peso total da série
        for (const m of meta.primaryMuscles) {
          counts[m] = (counts[m] || 0) + completedCount;
        }

        // Secundários recebem 0.5 série de ativação
        for (const m of meta.secondaryMuscles) {
          counts[m] = (counts[m] || 0) + Math.round(completedCount * 0.5 * 10) / 10;
        }
      }
    }

    return counts;
  }, [sessions, exerciseMap]);

  // Lista dos músculos mais e menos trabalhados
  const muscleEntries = Object.entries(weeklyMuscleSets) as [MuscleGroup, number][];
  muscleEntries.sort((a, b) => b[1] - a[1]);

  const primaryWorkedMuscles = muscleEntries.filter(([, sets]) => sets >= 8).map(([m]) => m);
  const secondaryWorkedMuscles = muscleEntries.filter(([, sets]) => sets >= 3 && sets < 8).map(([m]) => m);
  const neglectedMuscles = muscleEntries.filter(([, sets]) => sets < 3);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Activity size={18} className="text-amber-400" />
            Mapa de Volume Muscular Semanal
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Séries diretas e indiretas acumuladas nos últimos 7 dias
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Diagrama Anatómico Heatmap */}
        <div className="md:col-span-5 bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 flex flex-col items-center justify-center">
          <MuscleDiagram
            primaryMuscles={primaryWorkedMuscles}
            secondaryMuscles={secondaryWorkedMuscles}
            silhouette={silhouette}
            view="both"
            size="md"
            interactive={false}
          />
          <div className="flex items-center gap-3 mt-3 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
              <span className="text-slate-300">Ótimo (≥8)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-400/60" />
              <span className="text-slate-400">Moderado (3-7)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
              <span className="text-slate-500">Baixo (&lt;3)</span>
            </div>
          </div>
        </div>

        {/* Barras de Séries por Grupo Muscular */}
        <div className="md:col-span-7 space-y-2">
          {muscleEntries.slice(0, 8).map(([muscleId, sets]) => {
            const info = MUSCLE_GROUPS_INFO[muscleId];
            const percent = Math.min(100, (sets / 16) * 100);

            return (
              <div key={muscleId} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">{info?.namePt || muscleId}</span>
                  <span className="font-mono font-bold text-slate-200">{sets} séries</span>
                </div>
                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      sets >= 10
                        ? 'bg-amber-400'
                        : sets >= 5
                        ? 'bg-amber-500/80'
                        : sets > 0
                        ? 'bg-slate-600'
                        : 'bg-transparent'
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}

          {neglectedMuscles.length > 0 && (
            <div className="mt-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-start gap-2 text-xs text-slate-400">
              <ShieldAlert size={16} className="text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-300">Atenção ao desequilíbrio: </span>
                {neglectedMuscles.slice(0, 3).map(([m]) => MUSCLE_GROUPS_INFO[m]?.namePt).join(', ')}{' '}
                tiveram pouco ou nenhum estímulo esta semana.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
