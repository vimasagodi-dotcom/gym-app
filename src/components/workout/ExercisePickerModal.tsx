import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import type { MuscleGroup, EquipmentType } from '../../types/exercise';
import { MUSCLE_GROUPS_INFO, EQUIPMENT_LABELS_PT } from '../../types/exercise';
import { Search, X, Plus, Dumbbell } from 'lucide-react';

interface ExercisePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExercise: (exerciseId: string) => void;
}

export const ExercisePickerModal: React.FC<ExercisePickerModalProps> = ({
  isOpen,
  onClose,
  onSelectExercise,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | 'all'>('all');
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentType | 'all'>('all');

  const exercises = useLiveQuery(() => db.exercises.toArray()) || [];

  if (!isOpen) return null;

  const filteredExercises = exercises.filter((ex) => {
    const matchesSearch =
      ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ex.namePt.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMuscle =
      selectedMuscle === 'all' ||
      ex.primaryMuscles.includes(selectedMuscle as MuscleGroup) ||
      ex.secondaryMuscles.includes(selectedMuscle as MuscleGroup);

    const matchesEquipment =
      selectedEquipment === 'all' || ex.equipment === selectedEquipment;

    return matchesSearch && matchesMuscle && matchesEquipment;
  });

  const muscleOptions = Object.values(MUSCLE_GROUPS_INFO);
  const equipmentOptions: EquipmentType[] = ['barbell', 'dumbbell', 'machine', 'cable', 'bodyweight'];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/80 backdrop-blur-sm p-0 sm:p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up">
        {/* Cabeçalho */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Dumbbell size={18} />
            </div>
            <h2 className="text-lg font-bold text-slate-100">Adicionar Exercício</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Barra de Pesquisa */}
        <div className="p-4 space-y-3 bg-slate-900/50 border-b border-slate-800/80">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Pesquisar exercício (ex: Supino, Agachamento...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Filtros em Chip */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedMuscle('all')}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedMuscle === 'all'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              Todos Músculos
            </button>
            {muscleOptions.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedMuscle(m.id)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedMuscle === m.id
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {m.namePt}
              </button>
            ))}
          </div>

          {/* Filtro de Equipamento */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedEquipment('all')}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all ${
                selectedEquipment === 'all'
                  ? 'bg-slate-300 text-slate-900 font-bold'
                  : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700'
              }`}
            >
              Todos Equipamentos
            </button>
            {equipmentOptions.map((eq) => (
              <button
                key={eq}
                type="button"
                onClick={() => setSelectedEquipment(eq)}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all ${
                  selectedEquipment === eq
                    ? 'bg-slate-300 text-slate-900 font-bold'
                    : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {EQUIPMENT_LABELS_PT[eq] || eq}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Exercícios */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredExercises.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Dumbbell size={36} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">Nenhum exercício encontrado com estes filtros.</p>
            </div>
          ) : (
            filteredExercises.map((exercise) => {
              const primaryNames = exercise.primaryMuscles
                .map((m) => MUSCLE_GROUPS_INFO[m]?.namePt || m)
                .join(', ');

              return (
                <div
                  key={exercise.id}
                  onClick={() => {
                    onSelectExercise(exercise.id);
                    onClose();
                  }}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/40 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all active:scale-[0.99] group"
                >
                  <div className="flex-1 min-w-0 pr-3">
                    <h3 className="text-sm font-semibold text-slate-100 group-hover:text-amber-400 transition-colors truncate">
                      {exercise.namePt}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                      <span className="text-amber-400/90 font-medium">{primaryNames}</span>
                      <span>•</span>
                      <span className="text-slate-500">{EQUIPMENT_LABELS_PT[exercise.equipment] || exercise.equipment}</span>
                      <span>•</span>
                      <span className="text-slate-500">{exercise.movementType === 'compound' ? 'Composto' : 'Isolado'}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="w-9 h-9 rounded-xl bg-amber-500/15 group-hover:bg-amber-500 text-amber-400 group-hover:text-slate-950 flex items-center justify-center shrink-0 transition-all"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
