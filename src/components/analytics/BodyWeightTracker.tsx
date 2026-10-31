import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import type { BodyMetricLog } from '../../types/metrics';
import { useUser } from '../../context/ThemeContext';
import { formatWeight, fromKg, toKg, calculateMovingAverage } from '../../utils/formulas';
import { Scale, Plus, Trash2, TrendingDown, TrendingUp } from 'lucide-react';

export const BodyWeightTracker: React.FC = () => {
  const { unit } = useUser();
  const [showAddForm, setShowAddForm] = useState(false);
  const [weightInput, setWeightInput] = useState('');
  const [waistInput, setWaistInput] = useState('');
  const [armInput, setArmInput] = useState('');
  const [bodyFatInput, setBodyFatInput] = useState('');
  const [dateInput, setDateInput] = useState(new Date().toISOString().split('T')[0]);

  const metrics = useLiveQuery(() =>
    db.bodyMetrics.orderBy('date').toArray()
  ) || [];

  const handleAddMetric = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedWeight = parseFloat(weightInput);
    if (isNaN(parsedWeight) || parsedWeight <= 0) return;

    const weightKg = toKg(parsedWeight, unit);

    const newLog: BodyMetricLog = {
      id: `weight-${Date.now()}`,
      userId: 'default-user',
      date: dateInput,
      weightKg,
      waistCm: waistInput ? parseFloat(waistInput) : undefined,
      leftArmCm: armInput ? parseFloat(armInput) : undefined,
      bodyFatPercentage: bodyFatInput ? parseFloat(bodyFatInput) : undefined,
      createdAt: new Date().toISOString(),
    };

    await db.bodyMetrics.put(newLog);
    setWeightInput('');
    setWaistInput('');
    setArmInput('');
    setBodyFatInput('');
    setShowAddForm(false);
  };

  const handleDelete = async (id: string) => {
    await db.bodyMetrics.delete(id);
  };

  const latest = metrics[metrics.length - 1];
  const previous = metrics.length > 1 ? metrics[metrics.length - 2] : null;
  const weightDiff = previous && latest ? latest.weightKg - previous.weightKg : 0;

  // Pontos para o gráfico SVG de evolução de peso
  const chartPoints = metrics.slice(-12);
  const weightsArray = chartPoints.map((m) => m.weightKg);
  const movingAverages = calculateMovingAverage(weightsArray, 3);

  const minWeight = chartPoints.length > 0 ? Math.min(...chartPoints.map((m) => m.weightKg)) - 1 : 60;
  const maxWeight = chartPoints.length > 0 ? Math.max(...chartPoints.map((m) => m.weightKg)) + 1 : 80;
  const range = maxWeight - minWeight || 1;

  const pointsSvg = chartPoints
    .map((m, idx) => {
      const x = (idx / (Math.max(1, chartPoints.length - 1))) * 260 + 20;
      const y = 100 - ((m.weightKg - minWeight) / range) * 80;
      return `${x},${y}`;
    })
    .join(' ');

  const maPointsSvg = movingAverages
    .map((avg, idx) => {
      const x = (idx / (Math.max(1, movingAverages.length - 1))) * 260 + 20;
      const y = 100 - ((avg - minWeight) / range) * 80;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Scale size={18} className="text-amber-400" />
            Peso & Medidas Corporais
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Acompanha a tua composição e evolução física
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
        >
          <Plus size={15} /> Registar Peso
        </button>
      </div>

      {/* Cartão de Resumo Rápido */}
      {latest && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Peso Atual</span>
            <span className="text-xl font-black text-slate-100 font-mono">
              {formatWeight(latest.weightKg, unit)}
            </span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Variação Recente</span>
            <div className="flex items-center gap-1 font-mono text-sm font-bold mt-1">
              {weightDiff > 0 ? (
                <span className="text-rose-400 flex items-center gap-0.5">
                  <TrendingUp size={15} /> +{formatWeight(weightDiff, unit)}
                </span>
              ) : weightDiff < 0 ? (
                <span className="text-emerald-400 flex items-center gap-0.5">
                  <TrendingDown size={15} /> {formatWeight(weightDiff, unit)}
                </span>
              ) : (
                <span className="text-slate-400">Estável</span>
              )}
            </div>
          </div>

          {latest.waistCm && (
            <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Cintura</span>
              <span className="text-lg font-bold text-slate-200 font-mono">
                {latest.waistCm} cm
              </span>
            </div>
          )}

          {latest.leftArmCm && (
            <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Braço</span>
              <span className="text-lg font-bold text-slate-200 font-mono">
                {latest.leftArmCm} cm
              </span>
            </div>
          )}
        </div>
      )}

      {/* Formulário de Adicionar Registo */}
      {showAddForm && (
        <form
          onSubmit={handleAddMetric}
          className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3 animate-fade-in"
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">
                Data
              </label>
              <input
                type="date"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-100"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">
                Peso ({unit})
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="Ex: 75.5"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">
                Cintura (cm)
              </label>
              <input
                type="number"
                step="0.5"
                placeholder="Ex: 80"
                value={waistInput}
                onChange={(e) => setWaistInput(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">
                Braço (cm)
              </label>
              <input
                type="number"
                step="0.5"
                placeholder="Ex: 38"
                value={armInput}
                onChange={(e) => setArmInput(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-100 font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl"
            >
              Guardar Registo
            </button>
          </div>
        </form>
      )}

      {/* Gráfico de Evolução SVG */}
      {chartPoints.length > 1 && (
        <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-4">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            <span>Evolução de Peso & Média Móvel</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-[10px] text-amber-400">
                <span className="w-2.5 h-0.5 bg-amber-500 rounded" /> Peso Diário
              </span>
              <span className="flex items-center gap-1 text-[10px] text-sky-400">
                <span className="w-2.5 h-0.5 bg-sky-400 rounded" /> Média Móvel
              </span>
            </div>
          </div>
          <div className="h-32 w-full flex items-center justify-center">
            <svg viewBox="0 0 300 120" className="w-full h-full overflow-visible">
              {/* Linha da Média Móvel (Suavizada) */}
              {movingAverages.length > 1 && (
                <polyline
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2"
                  strokeDasharray="4 3"
                  strokeLinecap="round"
                  points={maPointsSvg}
                  opacity="0.8"
                />
              )}
              {/* Linha do peso diário */}
              <polyline
                fill="none"
                stroke="#f59e0b"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={pointsSvg}
              />
              {/* Pontos */}
              {chartPoints.map((m, idx) => {
                const x = (idx / (Math.max(1, chartPoints.length - 1))) * 260 + 20;
                const y = 100 - ((m.weightKg - minWeight) / range) * 80;
                return (
                  <g key={m.id}>
                    <circle cx={x} cy={y} r="4.5" fill="#f59e0b" stroke="#0f172a" strokeWidth="2" />
                    <text
                      x={x}
                      y={y - 8}
                      fill="#94a3b8"
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {fromKg(m.weightKg, unit)}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      )}

      {/* Lista de Registos Recentes */}
      {metrics.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Registos Gravados
          </span>
          <div className="space-y-1.5">
            {metrics.slice(-5).reverse().map((m) => (
              <div
                key={m.id}
                className="bg-slate-950/60 border border-slate-800/80 rounded-xl px-3 py-2 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-slate-400">{m.date}</span>
                  <span className="font-mono font-bold text-slate-100">{formatWeight(m.weightKg, unit)}</span>
                  {m.waistCm && <span className="text-slate-500">Cintura: {m.waistCm}cm</span>}
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(m.id)}
                  className="p-1 text-slate-600 hover:text-rose-400 rounded-lg"
                  title="Apagar registo"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
