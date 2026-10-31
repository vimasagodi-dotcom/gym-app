import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import type { Exercise, MuscleGroup, EquipmentType } from '../../types/exercise';
import { MUSCLE_GROUPS_INFO } from '../../types/exercise';
import { MuscleDiagram } from '../anatomy/MuscleDiagram';
import { MuscleSelector } from '../anatomy/MuscleSelector';
import { ExerciseDetailModal } from './ExerciseDetailModal';
import { useUser } from '../../context/ThemeContext';
import { Search, Dumbbell, Sparkles, ChevronRight } from 'lucide-react';

export const ExerciseList: React.FC = () => {
  const { silhouette } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentType | 'all'>('all');
  const [activeModalExercise, setActiveModalExercise] = useState<Exercise | null>(null);
  const [showBodyFilter, setShowBodyFilter] = useState(false);

  const exercises = useLiveQuery(() => db.exercises.toArray()) || [];

  const filtered = exercises.filter((ex) => {
    const matchesSearch =
      ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ex.namePt.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMuscle =
      !selectedMuscle ||
      ex.primaryMuscles.includes(selectedMuscle) ||
      ex.secondaryMuscles.includes(selectedMuscle);

    const matchesEquipment =
      selectedEquipment === 'all' || ex.equipment === selectedEquipment;

    return matchesSearch && matchesMuscle && matchesEquipment;
  });

  const equipmentList: EquipmentType[] = [
    'barbell',
    'dumbbell',
    'machine',
    'cable',
    'bodyweight',
    'smith',
    'band',
    'kettlebell',
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 pb-28 space-y-4 animate-fade-in">
      {/* Topo / Header da página */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight">
            Base de Exercícios
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {exercises.length} exercícios anatómicos disponíveis
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowBodyFilter(!showBodyFilter)}
          className={`px-3 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
            showBodyFilter
              ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
          }`}
        >
          <Sparkles size={15} />
          {showBodyFilter ? 'Esconder Mapa' : 'Filtrar no Corpo'}
        </button>
      </div>

      {/* Mapa do Corpo Humano Interativo (Filtro Anatómico) */}
      {showBodyFilter && (
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-3xl p-4 shadow-xl text-center animate-slide-down">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            Clica num músculo no corpo para filtrar
          </div>
          <div className="flex justify-center my-2">
            <MuscleDiagram
              selectedMuscle={selectedMuscle}
              onSelectMuscle={(m) => setSelectedMuscle(selectedMuscle === m ? null : m)}
              silhouette={silhouette}
              view="both"
              size="md"
              interactive={true}
            />
          </div>
          {selectedMuscle && (
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-amber-500/15 border border-amber-500/30 rounded-full text-xs font-bold text-amber-400">
              Músculo selecionado: {MUSCLE_GROUPS_INFO[selectedMuscle]?.namePt}
              <button
                type="button"
                onClick={() => setSelectedMuscle(null)}
                className="hover:text-slate-100 ml-1"
              >
                ×
              </button>
            </div>
          )}
        </div>
      )}

      {/* Barra de Pesquisa e Filtros */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Pesquisar por nome do exercício (ex: Supino, Curl, Agachamento...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 shadow-sm"
          />
        </div>

        {/* Seletor Rápido de Músculos em Chips */}
        <MuscleSelector
          selectedMuscle={selectedMuscle}
          onSelectMuscle={setSelectedMuscle}
        />

        {/* Filtro de Equipamento */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            type="button"
            onClick={() => setSelectedEquipment('all')}
            className={`px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition-all ${
              selectedEquipment === 'all'
                ? 'bg-slate-200 text-slate-900 font-bold'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            Todos Equipamentos
          </button>
          {equipmentList.map((eq) => (
            <button
              key={eq}
              type="button"
              onClick={() => setSelectedEquipment(eq)}
              className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap capitalize transition-all ${
                selectedEquipment === eq
                  ? 'bg-slate-200 text-slate-900 font-bold'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {eq}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Exercícios Filtrados */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
        {filtered.map((exercise) => {
          const primaryNames = exercise.primaryMuscles
            .map((m) => MUSCLE_GROUPS_INFO[m]?.namePt || m)
            .join(', ');

          return (
            <div
              key={exercise.id}
              onClick={() => setActiveModalExercise(exercise)}
              className="bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 rounded-3xl p-4 cursor-pointer transition-all active:scale-[0.99] group shadow-sm flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Mini Diagrama Anatómico no Cartão */}
                <div className="w-12 h-14 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center justify-center shrink-0 p-1">
                  <MuscleDiagram
                    primaryMuscles={exercise.primaryMuscles}
                    secondaryMuscles={exercise.secondaryMuscles}
                    silhouette={silhouette}
                    view="anterior"
                    size="sm"
                    interactive={false}
                  />
                </div>

                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-100 group-hover:text-amber-400 transition-colors truncate">
                    {exercise.namePt}
                  </h3>
                  <p className="text-[11px] text-slate-400 truncate">{exercise.name}</p>
                  <div className="flex items-center gap-1.5 mt-1.5 text-[10px]">
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-400 font-bold">
                      {primaryNames}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 capitalize">
                      {exercise.equipment}
                    </span>
                  </div>
                </div>
              </div>

              <div className="w-8 h-8 rounded-xl bg-slate-800/60 text-slate-400 group-hover:text-amber-400 group-hover:bg-slate-800 flex items-center justify-center shrink-0 transition-colors">
                <ChevronRight size={16} />
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-slate-500">
          <Dumbbell size={40} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm font-medium">Nenhum exercício encontrado com estes critérios.</p>
        </div>
      )}

      {/* Modal de Detalhe Completo do Exercício */}
      <ExerciseDetailModal
        exercise={activeModalExercise}
        onClose={() => setActiveModalExercise(null)}
      />
    </div>
  );
};
