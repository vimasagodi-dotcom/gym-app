import React, { useState } from 'react';
import type { Exercise } from '../../types/exercise';
import { EQUIPMENT_LABELS_PT, DIFFICULTY_LABELS_PT } from '../../types/exercise';
import { MuscleDiagram } from '../anatomy/MuscleDiagram';
import { ExerciseVideoModal } from './ExerciseVideoModal';
import { useUser } from '../../context/ThemeContext';
import { useWorkout } from '../../context/WorkoutContext';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import { formatWeight } from '../../utils/formulas';
import { X, Award, Dumbbell, Sparkles, BookOpen, Play, Zap } from 'lucide-react';

interface ExerciseDetailModalProps {
  exercise: Exercise | null;
  onClose: () => void;
}

export const ExerciseDetailModal: React.FC<ExerciseDetailModalProps> = ({
  exercise,
  onClose,
}) => {
  const { silhouette, unit } = useUser();
  const { isActive, addExerciseToWorkout, startQuickWorkout } = useWorkout();
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const prs = useLiveQuery(
    () => (exercise ? db.personalRecords.where('exerciseId').equals(exercise.id).toArray() : []),
    [exercise?.id]
  ) || [];

  if (!exercise) return null;

  const maxWeightPr = prs.find((p) => p.type === 'max_weight');
  const est1rmPr = prs.find((p) => p.type === 'estimated_1rm');

  const handleTrainThisExercise = async () => {
    if (isActive) {
      addExerciseToWorkout(exercise.id);
      onClose();
    } else {
      await startQuickWorkout(`Treino: ${exercise.namePt}`);
      setTimeout(() => {
        addExerciseToWorkout(exercise.id);
      }, 50);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-scale-up">
        {/* Topo com Botão Fechar */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-500/15 text-amber-400 rounded-xl">
              <Dumbbell size={18} />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-100">{exercise.namePt}</h2>
              <span className="text-xs text-slate-400">{exercise.name}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Conteúdo com Scroll */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Diagrama Anatómico Destacado */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-3xl p-4 flex flex-col items-center justify-center">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Ativação Muscular
            </div>
            <MuscleDiagram
              primaryMuscles={exercise.primaryMuscles}
              secondaryMuscles={exercise.secondaryMuscles}
              silhouette={silhouette}
              view="both"
              size="md"
              interactive={false}
            />
            <div className="flex items-center gap-4 mt-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-orange-500" />
                <span className="text-slate-300 font-medium">Primário</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-orange-400/60" />
                <span className="text-slate-400 font-medium">Secundário</span>
              </div>
            </div>
          </div>

          {/* Badges de Informação */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-800/50 p-2.5 rounded-2xl border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Equipamento</span>
              <span className="text-xs font-bold text-slate-200 mt-0.5 block">
                {EQUIPMENT_LABELS_PT[exercise.equipment] || exercise.equipment}
              </span>
            </div>
            <div className="bg-slate-800/50 p-2.5 rounded-2xl border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Movimento</span>
              <span className="text-xs font-bold text-slate-200 mt-0.5 block">
                {exercise.movementType === 'compound' ? 'Composto' : 'Isolado'}
              </span>
            </div>
            <div className="bg-slate-800/50 p-2.5 rounded-2xl border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Dificuldade</span>
              <span className="text-xs font-bold text-slate-200 mt-0.5 block">
                {DIFFICULTY_LABELS_PT[exercise.difficulty] || exercise.difficulty}
              </span>
            </div>
          </div>

          {/* Botões de Ação Principal: Demonstração 3D e Treinar Este Exercício */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setIsVideoModalOpen(true)}
              className="py-3 px-4 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/35 text-amber-400 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-sm"
            >
              <Play size={15} className="fill-current" /> Ver Animação 3D & Fotos
            </button>

            <button
              type="button"
              onClick={handleTrainThisExercise}
              className="py-3 px-4 bg-lime-400 hover:bg-lime-300 text-slate-950 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-sm"
            >
              <Zap size={15} className="fill-current" />
              {isActive ? 'Adicionar ao Treino Ativo' : 'Treinar Este Exercício'}
            </button>
          </div>

          {/* Recordes Pessoais Registados para este exercício */}
          <div className="bg-slate-800/30 border border-slate-800/80 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
              <Award size={16} /> Recordes Pessoais (PR)
            </div>
            {maxWeightPr || est1rmPr ? (
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Maior Carga Levantada</span>
                  <span className="text-base font-bold text-slate-100 font-mono">
                    {maxWeightPr ? formatWeight(maxWeightPr.value, unit) : '-'}
                  </span>
                  {maxWeightPr?.reps && (
                    <span className="text-xs text-slate-400 ml-1">({maxWeightPr.reps} reps)</span>
                  )}
                </div>
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">1RM Estimada Máxima</span>
                  <span className="text-base font-bold text-amber-400 font-mono">
                    {est1rmPr ? formatWeight(est1rmPr.value, unit) : '-'}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">
                Ainda não registaste nenhuma série deste exercício.
              </p>
            )}
          </div>

          {/* Instruções de Execução */}
          {exercise.instructionsPt && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase tracking-wider">
                <BookOpen size={16} className="text-amber-400" /> Como Executar
              </div>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/30 p-3.5 rounded-2xl border border-slate-800/80">
                {exercise.instructionsPt}
              </p>
            </div>
          )}

          {/* Dicas e Cuidados */}
          {exercise.tips && exercise.tips.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase tracking-wider">
                <Sparkles size={16} className="text-amber-400" /> Dicas Importantes
              </div>
              <ul className="space-y-1.5">
                {exercise.tips.map((tip, i) => (
                  <li key={i} className="text-xs text-slate-300 flex items-start gap-2 bg-slate-800/20 p-2.5 rounded-xl border border-slate-800/50">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Modal Dedicado de Vídeo e Técnica */}
      <ExerciseVideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        exercise={exercise}
      />
    </div>
  );
};
