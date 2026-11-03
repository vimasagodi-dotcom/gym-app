import React, { useState } from 'react';
import { useWorkout } from '../../context/WorkoutContext';
import { useUser } from '../../context/ThemeContext';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import { MuscleDiagram } from '../anatomy/MuscleDiagram';
import { ExerciseSetRow } from './ExerciseSetRow';
import { ExercisePickerModal } from './ExercisePickerModal';
import { WorkoutSummaryModal } from './WorkoutSummaryModal';
import { ExerciseVideoModal } from '../exercises/ExerciseVideoModal';
import { formatDuration } from '../../utils/formulas';
import { EQUIPMENT_LABELS_PT } from '../../types/exercise';
import type { WorkoutSession } from '../../types/workout';
import {
  Clock,
  Plus,
  Dumbbell,
  Trash2,
  AlertTriangle,
  ArrowRight,
  Info,
  Play,
  TrendingUp,
} from 'lucide-react';

export const ActiveWorkoutView: React.FC = () => {
  const {
    activeSession,
    activeExerciseIndex,
    setActiveExerciseIndex,
    updateSet,
    toggleSetCompleted,
    addSetToExercise,
    removeSetFromExercise,
    addExerciseToWorkout,
    removeExerciseFromWorkout,
    finishWorkout,
    cancelWorkout,
    previousExerciseLogs,
  } = useWorkout();

  const { silhouette } = useUser();
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [completedSummary, setCompletedSummary] = useState<WorkoutSession | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  // Busca lista de todos os exercícios cadastrados na DB para mapear nomes e músculos
  const exercisesDb = useLiveQuery(() => db.exercises.toArray()) || [];
  const exerciseMap = new Map(exercisesDb.map((e) => [e.id, e]));

  if (!activeSession) return null;

  const currentExerciseLog = activeSession.exercises[activeExerciseIndex];
  const currentExerciseMeta = currentExerciseLog ? exerciseMap.get(currentExerciseLog.exerciseId) : null;
  const previousLog = currentExerciseLog ? previousExerciseLogs[currentExerciseLog.exerciseId] : null;

  const handleFinish = async () => {
    const summary = await finishWorkout();
    if (summary) {
      setCompletedSummary(summary);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-28 text-slate-100 flex flex-col animate-fade-in">
      {/* 1. Barra de Topo do Treino Ativo (com Safe Area para iPhone Notch / Dynamic Island) */}
      <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 safe-area-pt flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/15 border border-amber-500/30 rounded-full text-amber-400 font-mono text-sm font-bold">
            <Clock size={15} className="animate-spin-slow" />
            {formatDuration(activeSession.durationSeconds)}
          </div>
          <span className="text-xs text-slate-400 font-medium truncate max-w-[150px] sm:max-w-xs">
            {activeSession.name}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowCancelConfirm(true)}
            className="px-3 py-1.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleFinish}
            className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-500/20"
          >
            Terminar
          </button>
        </div>
      </header>

      {/* 2. Lista Horizontal de Exercícios (Tabs de navegação) */}
      <div className="px-4 py-3 bg-slate-900/60 border-b border-slate-800/80 overflow-x-auto scrollbar-none flex items-center gap-2">
        {activeSession.exercises.map((ex, idx) => {
          const meta = exerciseMap.get(ex.exerciseId);
          const isSelected = idx === activeExerciseIndex;
          const completedSetsCount = ex.sets.filter((s) => s.isCompleted).length;
          const isAllDone = ex.sets.length > 0 && completedSetsCount === ex.sets.length;

          return (
            <button
              key={ex.id}
              type="button"
              onClick={() => setActiveExerciseIndex(idx)}
              className={`px-3.5 py-2 rounded-2xl flex items-center gap-2 shrink-0 transition-all text-xs font-bold ${
                isSelected
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25 scale-[1.02]'
                  : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800 border border-slate-700/60'
              }`}
            >
              <span>{idx + 1}.</span>
              <span className="truncate max-w-[130px]">{meta?.namePt || meta?.name || 'Exercício'}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  isSelected
                    ? 'bg-slate-950 text-amber-400'
                    : isAllDone
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-slate-700 text-slate-300'
                }`}
              >
                {completedSetsCount}/{ex.sets.length}
              </span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => setIsPickerOpen(true)}
          className="px-3.5 py-2 rounded-2xl border border-dashed border-slate-700 hover:border-amber-400 text-slate-400 hover:text-amber-400 flex items-center gap-1.5 shrink-0 text-xs font-bold transition-all"
        >
          <Plus size={15} /> Exercício
        </button>
      </div>

      {/* 3. Conteúdo do Exercício Atual */}
      {currentExerciseLog && currentExerciseMeta ? (
        <div className="flex-1 max-w-2xl w-full mx-auto p-4 space-y-4">
          {/* Cartão de Detalhe e Diagrama Anatómico */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-4 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-slate-100">
                  {currentExerciseMeta.namePt}
                </h2>
                <button
                  type="button"
                  onClick={() => setIsVideoModalOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/35 text-amber-400 rounded-lg text-xs font-semibold transition-all active:scale-95 shadow-sm"
                  title="Ver vídeo demonstrativo e biomecânica"
                >
                  <Play size={12} className="fill-current" />
                  <span>Ver Vídeo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowInstructions(!showInstructions)}
                  className="p-1 text-slate-400 hover:text-amber-400"
                  title="Ver instruções de execução"
                >
                  <Info size={17} />
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-1">{currentExerciseMeta.name}</p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-3">
                <span className="px-2.5 py-1 rounded-full bg-slate-800 text-[11px] font-semibold text-slate-300 border border-slate-700/60">
                  {EQUIPMENT_LABELS_PT[currentExerciseMeta.equipment] || currentExerciseMeta.equipment}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-slate-800 text-[11px] font-semibold text-slate-300 border border-slate-700/60">
                  {currentExerciseMeta.movementType === 'compound' ? 'Composto' : 'Isolado'}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-[11px] font-bold text-amber-400 border border-amber-500/20">
                  Descanso: {currentExerciseLog.restSeconds || 90}s
                </span>
              </div>
            </div>

            {/* Mini Diagrama Anatómico Interativo com Músculos Primários e Secundários em Destaque */}
            <div className="shrink-0 bg-slate-950/60 p-2 rounded-2xl border border-slate-800/80 flex items-center justify-center">
              <MuscleDiagram
                primaryMuscles={currentExerciseMeta.primaryMuscles}
                secondaryMuscles={currentExerciseMeta.secondaryMuscles}
                silhouette={silhouette}
                view="both"
                size="sm"
                interactive={false}
              />
            </div>
          </div>

          {/* Guia Inteligente de Sobrecarga Progressiva / Periodização */}
          {(activeSession.periodizationWeek || previousLog) && (
            <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl px-4 py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <TrendingUp size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-amber-300">
                    {activeSession.periodizationWeek === 1 && 'Semana 1/4 — Base e Volume (4×10, RPE 8)'}
                    {activeSession.periodizationWeek === 2 && 'Semana 2/4 — Intensificação (-2 reps, +Carga, RPE 8.5)'}
                    {activeSession.periodizationWeek === 3 && 'Semana 3/4 — Sobrecarga Máxima (-4 reps, Recorde, RPE 9)'}
                    {activeSession.periodizationWeek === 4 && 'Semana 4/4 — Deload de Recuperação (65% da carga, RPE 6.5)'}
                    {!activeSession.periodizationWeek && 'Meta de Sobrecarga Progressiva'}
                  </p>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    {previousLog?.sets?.[0]
                      ? `Último treino: ${previousLog.sets[0].weightKg} kg × ${previousLog.sets[0].reps} repetições. Clica na coluna "Anterior" para copiar.`
                      : 'Primeiro registo deste exercício — define a tua carga base de referência.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Instruções retráteis */}
          {showInstructions && currentExerciseMeta.instructionsPt && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs text-slate-300 space-y-2 animate-fade-in">
              <p className="font-semibold text-amber-400">Instruções:</p>
              <p>{currentExerciseMeta.instructionsPt}</p>
              {currentExerciseMeta.tips && currentExerciseMeta.tips.length > 0 && (
                <ul className="list-disc pl-4 space-y-1 text-slate-400 mt-2">
                  {currentExerciseMeta.tips.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* 4. Tabela de Séries */}
          <div className="space-y-2">
            {/* Cabeçalho da Tabela */}
            <div className="grid grid-cols-12 gap-2 px-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <div className="col-span-2">Série</div>
              <div className="col-span-2 text-center">Anterior</div>
              <div className="col-span-3 text-center">Carga</div>
              <div className="col-span-2 text-center">Reps</div>
              <div className="col-span-1 text-center">RPE</div>
              <div className="col-span-2 text-center">Feito</div>
            </div>

            {/* Linhas de Série */}
            {currentExerciseLog.sets.map((set, setIdx) => {
              const prevSet = previousLog?.sets?.[setIdx];
              return (
                <ExerciseSetRow
                  key={set.id}
                  setLog={set}
                  setIndex={setIdx}
                  previousSet={prevSet ? { weightKg: prevSet.weightKg, reps: prevSet.reps } : undefined}
                  onUpdate={(field, val) => updateSet(activeExerciseIndex, setIdx, field, val)}
                  onToggleComplete={() => toggleSetCompleted(activeExerciseIndex, setIdx)}
                  onDelete={() => removeSetFromExercise(activeExerciseIndex, setIdx)}
                />
              );
            })}
          </div>

          {/* Botões de Ação para Séries */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => addSetToExercise(activeExerciseIndex, 'normal')}
              className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 active:scale-[0.98] border border-slate-800 rounded-2xl text-xs font-bold text-slate-200 flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <Plus size={16} /> Adicionar Série
            </button>
            <button
              type="button"
              onClick={() => addSetToExercise(activeExerciseIndex, 'warmup')}
              className="px-3 py-3 bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-800 rounded-2xl text-xs font-bold transition-all"
              title="Adicionar série de aquecimento"
            >
              + Aquecimento
            </button>
            <button
              type="button"
              onClick={() => addSetToExercise(activeExerciseIndex, 'drop')}
              className="px-3 py-3 bg-slate-900 hover:bg-slate-800 text-indigo-400 border border-slate-800 rounded-2xl text-xs font-bold transition-all"
              title="Adicionar dropset"
            >
              + Drop
            </button>
          </div>

          {/* Remover ou Navegar Exercício */}
          <div className="pt-6 flex items-center justify-between border-t border-slate-900">
            <button
              type="button"
              onClick={() => removeExerciseFromWorkout(activeExerciseIndex)}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 p-2"
            >
              <Trash2 size={15} /> Remover Exercício
            </button>

            {activeExerciseIndex < activeSession.exercises.length - 1 && (
              <button
                type="button"
                onClick={() => setActiveExerciseIndex(activeExerciseIndex + 1)}
                className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 p-2"
              >
                Próximo Exercício <ArrowRight size={15} />
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Caso a sessão esteja vazia (Treino livre iniciado sem exercícios ainda) */
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 text-amber-400 flex items-center justify-center mb-4">
            <Dumbbell size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-100">Treino em Branco</h2>
          <p className="text-sm text-slate-400 mt-1 max-w-xs">
            Adiciona os exercícios que vais realizar para começar a registar as séries.
          </p>
          <button
            type="button"
            onClick={() => setIsPickerOpen(true)}
            className="mt-6 px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-2xl text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
          >
            <Plus size={18} /> Adicionar Primeiro Exercício
          </button>
        </div>
      )}

      {/* Modal de Cancelamento com Confirmação */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl">
            <AlertTriangle size={36} className="text-rose-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-100">Cancelar Treino?</h3>
            <p className="text-xs text-slate-400 mt-1">
              Os dados deste treino ativo serão descartados e não serão gravados no teu histórico.
            </p>
            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowCancelConfirm(false)}
                className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl"
              >
                Voltar ao Treino
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCancelConfirm(false);
                  cancelWorkout();
                }}
                className="py-2.5 bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold rounded-xl"
              >
                Sim, Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Seleção de Exercício */}
      <ExercisePickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelectExercise={(exerciseId) => {
          addExerciseToWorkout(exerciseId);
          setActiveExerciseIndex(activeSession.exercises.length);
        }}
      />

      {/* Modal de Resumo de Fim de Treino */}
      <WorkoutSummaryModal
        session={completedSummary}
        onClose={() => setCompletedSummary(null)}
      />

      {/* Modal de Demonstração em Vídeo e Biomecânica */}
      <ExerciseVideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        exercise={currentExerciseMeta || null}
      />
    </div>
  );
};
