import React, { useState } from 'react';
import { db } from '../../db/db';
import type { WorkoutRoutine, RoutineDay, RoutineExercise } from '../../types/routine';
import { EQUIPMENT_LABELS_PT } from '../../types/exercise';
import { useAuth } from '../../context/AuthContext';
import { syncRoutineToCloud } from '../../services/cloudSync';
import { ExercisePickerModal } from '../workout/ExercisePickerModal';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus, Trash2, Save, X } from 'lucide-react';

interface RoutineEditorProps {
  initialRoutine?: WorkoutRoutine | null;
  onClose: () => void;
  onSave: () => void;
}

export const RoutineEditor: React.FC<RoutineEditorProps> = ({
  initialRoutine,
  onClose,
  onSave,
}) => {
  const { user } = useAuth();
  const [title, setTitle] = useState(initialRoutine?.title || 'O Meu Novo Plano');
  const [description, setDescription] = useState(initialRoutine?.description || 'Plano de hipertrofia personalizado');
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>(initialRoutine?.level || 'intermediate');

  const [days, setDays] = useState<RoutineDay[]>(
    initialRoutine?.days || [
      {
        id: `day-${Date.now()}-1`,
        name: 'Dia 1: Treino A',
        description: 'Primeiro dia de treino',
        order: 1,
        exercises: [],
      },
    ]
  );

  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const exercisesDb = useLiveQuery(() => db.exercises.toArray()) || [];
  const exerciseMap = new Map(exercisesDb.map((e) => [e.id, e]));

  const addDay = () => {
    const newDay: RoutineDay = {
      id: `day-${Date.now()}-${days.length + 1}`,
      name: `Dia ${days.length + 1}: Treino`,
      order: days.length + 1,
      exercises: [],
    };
    setDays([...days, newDay]);
    setSelectedDayIndex(days.length);
  };

  const removeDay = (idx: number) => {
    if (days.length <= 1) return;
    const updated = [...days];
    updated.splice(idx, 1);
    setDays(updated);
    if (selectedDayIndex >= idx && selectedDayIndex > 0) {
      setSelectedDayIndex(selectedDayIndex - 1);
    }
  };

  const addExerciseToCurrentDay = (exerciseId: string) => {
    const updatedDays = [...days];
    const targetDay = { ...updatedDays[selectedDayIndex] };

    const newEx: RoutineExercise = {
      id: `re-${Date.now()}-${targetDay.exercises.length + 1}`,
      exerciseId,
      order: targetDay.exercises.length + 1,
      targetSets: 3,
      targetRepsMin: 8,
      targetRepsMax: 12,
      restSeconds: 90,
    };

    targetDay.exercises = [...targetDay.exercises, newEx];
    updatedDays[selectedDayIndex] = targetDay;
    setDays(updatedDays);
  };

  const removeExerciseFromCurrentDay = (exerciseIdx: number) => {
    const updatedDays = [...days];
    const targetDay = { ...updatedDays[selectedDayIndex] };
    targetDay.exercises.splice(exerciseIdx, 1);
    updatedDays[selectedDayIndex] = targetDay;
    setDays(updatedDays);
  };

  const updateExerciseField = (
    exerciseIdx: number,
    field: keyof RoutineExercise,
    value: unknown
  ) => {
    const updatedDays = [...days];
    const targetDay = { ...updatedDays[selectedDayIndex] };
    targetDay.exercises[exerciseIdx] = {
      ...targetDay.exercises[exerciseIdx],
      [field]: value,
    };
    updatedDays[selectedDayIndex] = targetDay;
    setDays(updatedDays);
  };

  const handleSave = async () => {
    if (!title.trim()) return;

    const routineToSave: WorkoutRoutine = {
      id: initialRoutine ? initialRoutine.id : `routine-${Date.now()}`,
      userId: user?.uid || initialRoutine?.userId || 'default-user',
      title,
      description,
      level,
      daysPerWeek: days.length,
      currentWeek: initialRoutine?.currentWeek || 1,
      category: 'custom',
      days,
      createdAt: initialRoutine?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.routines.put(routineToSave);
    if (user?.uid) {
      syncRoutineToCloud(user.uid, routineToSave).catch(() => {});
    }
    onSave();
    onClose();
  };

  const currentDay = days[selectedDayIndex] || days[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-scale-up">
        {/* Cabeçalho */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-100">
            {initialRoutine ? 'Editar Plano de Treino' : 'Criar Novo Plano de Treino'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Conteúdo com scroll */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Informações Básicas do Plano */}
          <div className="space-y-3 bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">
                Nome da Rotina
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-400"
                placeholder="Ex: ABC Hipertrofia Pesada"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">
                Descrição ou Objetivo
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-400"
                placeholder="Ex: Foco em peito e braços 3x na semana"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">
                Nível de Dificuldade
              </label>
              <div className="flex gap-2">
                {(['beginner', 'intermediate', 'advanced'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setLevel(lvl)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold capitalize transition-all border ${
                      level === lvl
                        ? 'bg-amber-500 text-slate-950 border-amber-500'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {lvl === 'beginner' ? 'Principiante' : lvl === 'intermediate' ? 'Intermédio' : 'Avançado'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Abas dos Dias de Treino */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Dias de Treino ({days.length})
              </span>
              <button
                type="button"
                onClick={addDay}
                className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
              >
                <Plus size={14} /> Adicionar Dia
              </button>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {days.map((day, idx) => (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => setSelectedDayIndex(idx)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    idx === selectedDayIndex
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {day.name}
                </button>
              ))}
            </div>
          </div>

          {/* Editor do Dia Selecionado */}
          {currentDay && (
            <div className="space-y-3 bg-slate-950/40 border border-slate-800/80 rounded-2xl p-4">
              <div className="flex items-center justify-between gap-3">
                <input
                  type="text"
                  value={currentDay.name}
                  onChange={(e) => {
                    const updated = [...days];
                    updated[selectedDayIndex].name = e.target.value;
                    setDays(updated);
                  }}
                  className="bg-transparent border-b border-slate-700 px-1 py-1 text-sm font-bold text-slate-100 focus:outline-none focus:border-amber-400 flex-1"
                  placeholder="Nome do Dia (ex: Empurrar — Peito / Tricípites)"
                />
                {days.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeDay(selectedDayIndex)}
                    className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg text-xs flex items-center gap-1"
                  >
                    <Trash2 size={14} /> Eliminar Dia
                  </button>
                )}
              </div>

              {/* Lista de Exercícios do Dia */}
              <div className="space-y-2 mt-3">
                {currentDay.exercises.map((item, exIdx) => {
                  const meta = exerciseMap.get(item.exerciseId);
                  return (
                    <div
                      key={item.id}
                      className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div className="flex-1">
                        <span className="text-xs font-bold text-slate-200">
                          {exIdx + 1}. {meta?.namePt || meta?.name || 'Exercício'}
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          {meta?.equipment ? EQUIPMENT_LABELS_PT[meta.equipment] || meta.equipment : ''}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <div className="flex items-center gap-1">
                          <span className="text-slate-400">Séries:</span>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={item.targetSets}
                            onChange={(e) =>
                              updateExerciseField(
                                exIdx,
                                'targetSets',
                                parseInt(e.target.value, 10) || 3
                              )
                            }
                            className="w-12 bg-slate-950 border border-slate-700 rounded-lg py-1 px-1.5 text-center font-mono font-bold text-slate-100"
                          />
                        </div>

                        <div className="flex items-center gap-1">
                          <span className="text-slate-400">Reps:</span>
                          <input
                            type="number"
                            min="1"
                            value={item.targetRepsMin}
                            onChange={(e) =>
                              updateExerciseField(
                                exIdx,
                                'targetRepsMin',
                                parseInt(e.target.value, 10) || 8
                              )
                            }
                            className="w-12 bg-slate-950 border border-slate-700 rounded-lg py-1 px-1.5 text-center font-mono font-bold text-slate-100"
                          />
                          <span className="text-slate-500">-</span>
                          <input
                            type="number"
                            min="1"
                            value={item.targetRepsMax}
                            onChange={(e) =>
                              updateExerciseField(
                                exIdx,
                                'targetRepsMax',
                                parseInt(e.target.value, 10) || 12
                              )
                            }
                            className="w-12 bg-slate-950 border border-slate-700 rounded-lg py-1 px-1.5 text-center font-mono font-bold text-slate-100"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => removeExerciseFromCurrentDay(exIdx)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setIsPickerOpen(true)}
                  className="w-full py-2.5 border border-dashed border-slate-700 hover:border-amber-400 text-slate-400 hover:text-amber-400 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Plus size={15} /> Adicionar Exercício a este dia
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé com Botão Guardar */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-end gap-3 bg-slate-950/60">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-bold text-slate-400 hover:text-slate-200"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all"
          >
            <Save size={16} /> Guardar Plano
          </button>
        </div>
      </div>

      {/* Modal para escolher exercício */}
      <ExercisePickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelectExercise={addExerciseToCurrentDay}
      />
    </div>
  );
};
