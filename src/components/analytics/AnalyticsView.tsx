import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import { WeeklyMuscleMap } from './WeeklyMuscleMap';
import { BodyWeightTracker } from './BodyWeightTracker';
import { useUser } from '../../context/ThemeContext';
import { calculate1RM, formatWeight, fromKg } from '../../utils/formulas';
import { TrendingUp, Dumbbell } from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { unit } = useUser();
  const sessions = useLiveQuery(() => db.workoutSessions.orderBy('startedAt').toArray()) || [];
  const exercises = useLiveQuery(() => db.exercises.toArray()) || [];

  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('barbell-bench-press');

  // Filtra histórico de execuções do exercício selecionado
  const exerciseHistory = sessions
    .filter((s) => s.completedAt !== undefined)
    .map((s) => {
      const match = s.exercises.find((e) => e.exerciseId === selectedExerciseId);
      if (!match) return null;

      const completedSets = match.sets.filter((st) => st.isCompleted);
      if (completedSets.length === 0) return null;

      const maxWeight = Math.max(...completedSets.map((st) => st.weightKg));
      const est1RMs = completedSets.map((st) => calculate1RM(st.weightKg, st.reps));
      const best1RM = Math.max(...est1RMs);
      const totalVolume = completedSets.reduce((acc, st) => acc + st.weightKg * st.reps, 0);

      return {
        date: s.startedAt,
        sessionName: s.name,
        maxWeight,
        best1RM,
        totalVolume,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  // Pontos SVG para o gráfico de 1RM estimada
  const historyPoints = exerciseHistory.slice(-8);
  const minVal = historyPoints.length > 0 ? Math.min(...historyPoints.map((p) => p.best1RM)) - 2 : 50;
  const maxVal = historyPoints.length > 0 ? Math.max(...historyPoints.map((p) => p.best1RM)) + 5 : 100;
  const valRange = maxVal - minVal || 1;

  const chartSvgPoints = historyPoints
    .map((p, idx) => {
      const x = (idx / Math.max(1, historyPoints.length - 1)) * 260 + 20;
      const y = 100 - ((p.best1RM - minVal) / valRange) * 75;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="max-w-xl mx-auto px-3.5 py-3 pb-28 safe-area-pt space-y-5 animate-fade-in">
      <div className="pt-1">
        <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
          Estatísticas & Progresso
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Evolução de 1RM, volume muscular semanal e métricas corporais
        </p>
      </div>

      {/* 1. Gráfico de Progressão por Exercício (1RM & Carga Máxima) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <TrendingUp size={18} className="text-amber-400" />
              Progressão de Carga & 1RM Estimada
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Calculado pela fórmula de Epley para sobrecarga progressiva
            </p>
          </div>

          {/* Seletor de Exercício */}
          <select
            value={selectedExerciseId}
            onChange={(e) => setSelectedExerciseId(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl px-3 py-2 outline-none focus:border-amber-400"
          >
            {exercises.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.namePt}
              </option>
            ))}
          </select>
        </div>

        {historyPoints.length > 0 ? (
          <div className="space-y-4">
            {/* Gráfico Visual em SVG */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-semibold">
                <span>Evolução 1RM ({unit})</span>
                <span className="text-amber-400 font-bold font-mono">
                  Recorde Atual: {formatWeight(Math.max(...historyPoints.map((p) => p.best1RM)), unit)}
                </span>
              </div>

              <div className="h-40 w-full flex items-center justify-center">
                <svg viewBox="0 0 300 120" className="w-full h-full overflow-visible">
                  {/* Linhas de grelha subtis */}
                  <line x1="20" y1="25" x2="280" y2="25" stroke="#334155" strokeDasharray="3 3" strokeWidth="0.5" />
                  <line x1="20" y1="62" x2="280" y2="62" stroke="#334155" strokeDasharray="3 3" strokeWidth="0.5" />
                  <line x1="20" y1="100" x2="280" y2="100" stroke="#334155" strokeDasharray="3 3" strokeWidth="0.5" />

                  {/* Linha do Gráfico */}
                  {historyPoints.length > 1 && (
                    <polyline
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={chartSvgPoints}
                    />
                  )}

                  {/* Pontos com Etiquetas */}
                  {historyPoints.map((p, idx) => {
                    const x = (idx / Math.max(1, historyPoints.length - 1)) * 260 + 20;
                    const y = 100 - ((p.best1RM - minVal) / valRange) * 75;
                    return (
                      <g key={idx}>
                        <circle cx={x} cy={y} r="5" fill="#f59e0b" stroke="#090d16" strokeWidth="2.5" />
                        <text
                          x={x}
                          y={y - 8}
                          fill="#f8fafc"
                          fontSize="9.5"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          {fromKg(p.best1RM, unit)}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Tabela dos Treinos Recentes */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Histórico Recente de Execução
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {historyPoints.map((p, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="text-slate-400 font-medium block">
                        {new Date(p.date).toLocaleDateString('pt-PT')}
                      </span>
                      <span className="text-slate-200 font-bold">
                        Carga Máx: {formatWeight(p.maxWeight, unit)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-amber-400 font-bold block uppercase">
                        1RM Est.
                      </span>
                      <span className="text-sm font-black text-amber-400 font-mono">
                        {formatWeight(p.best1RM, unit)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-10 text-slate-500 bg-slate-950/30 rounded-2xl border border-slate-800/60">
            <Dumbbell size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-xs">Ainda não há sessões registadas para este exercício.</p>
          </div>
        )}
      </div>

      {/* 2. Mapa Muscular Semanal */}
      <WeeklyMuscleMap sessions={sessions} exercises={exercises} />

      {/* 3. Rastreador de Peso Corporal & Medidas */}
      <BodyWeightTracker />
    </div>
  );
};
