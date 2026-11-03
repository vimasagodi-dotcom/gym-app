import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import type { WorkoutRoutine } from '../../types/routine';
import { useWorkout } from '../../context/WorkoutContext';
import { useAuth } from '../../context/AuthContext';
import { syncRoutineToCloud } from '../../services/cloudSync';
import { DIFFICULTY_LABELS_PT } from '../../types/exercise';
import { RoutineEditor } from './RoutineEditor';
import { SmartPlanOnboardingModal } from '../onboarding/SmartPlanOnboardingModal';
import { Plus, Play, Calendar, Edit3, Copy, Trash2, Layers, Sparkles } from 'lucide-react';

export const RoutinesView: React.FC = () => {
  const { startRoutineWorkout, startQuickWorkout } = useWorkout();
  const { user } = useAuth();
  const [editingRoutine, setEditingRoutine] = useState<WorkoutRoutine | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isSmartModalOpen, setIsSmartModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'my_routines' | 'templates'>('my_routines');

  const allRoutines = useLiveQuery(() => db.routines.toArray()) || [];
  const exercisesDb = useLiveQuery(() => db.exercises.toArray()) || [];
  const exerciseMap = new Map(exercisesDb.map((e) => [e.id, e]));

  const myRoutines = allRoutines.filter((r) => !r.isTemplate);
  const templateRoutines = allRoutines.filter((r) => r.isTemplate);

  const displayedRoutines = activeTab === 'my_routines' ? myRoutines : templateRoutines;

  const handleDuplicate = async (routine: WorkoutRoutine) => {
    const duplicated: WorkoutRoutine = {
      ...routine,
      id: `routine-${Date.now()}`,
      title: `${routine.title} (O Meu Plano)`,
      isTemplate: false,
      currentWeek: 1,
      userId: user?.uid || 'default-user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.routines.add(duplicated);
    if (user?.uid) {
      syncRoutineToCloud(user.uid, duplicated).catch(() => {});
    }
    setActiveTab('my_routines');
  };

  const handleSetRoutineWeek = async (routine: WorkoutRoutine, wk: 1 | 2 | 3 | 4) => {
    await db.routines.update(routine.id, { currentWeek: wk });
    if (user?.uid) {
      syncRoutineToCloud(user.uid, { ...routine, currentWeek: wk }).catch(() => {});
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tens a certeza que desejas eliminar este plano?')) {
      await db.routines.delete(id);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-3.5 sm:px-4 py-3 sm:py-4 pb-28 space-y-5 animate-fade-in">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
            Planos de Treino
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Organiza os teus ciclos, rotinas e dias de treino
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            type="button"
            onClick={() => startQuickWorkout('Treino Rápido')}
            className="flex-1 sm:flex-none px-3 py-2 bg-[#121215] hover:bg-[#1a1a20] text-slate-200 border border-white/[0.08] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
          >
            <Play size={13} className="text-amber-400 fill-amber-400" /> Treino Livre
          </button>
          <button
            type="button"
            onClick={() => setIsSmartModalOpen(true)}
            className="flex-1 sm:flex-none px-3 py-2 bg-[#121215] hover:bg-[#1a1a20] border border-white/[0.08] text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            <Sparkles size={14} className="text-amber-400" /> Gerar Auto
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingRoutine(null);
              setIsEditorOpen(true);
            }}
            className="w-full sm:w-auto px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            <Plus size={15} /> Novo Plano
          </button>
        </div>
      </div>

      {/* Seletor de Abas (Os Meus Planos vs Biblioteca de Templates) */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('my_routines')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'my_routines'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Os Meus Planos ({myRoutines.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'templates'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Modelos Recomendados ({templateRoutines.length})
        </button>
      </div>

      {/* Lista de Rotinas */}
      <div className="space-y-4">
        {displayedRoutines.map((routine) => (
          <div
            key={routine.id}
            className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4 hover:border-slate-700 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-bold text-slate-100">{routine.title}</h3>
                  {routine.isTemplate && (
                    <span className="px-2 py-0.5 bg-sky-500/15 border border-sky-500/30 text-sky-400 text-[10px] font-bold rounded-full">
                      Modelo Base
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-xl">
                  {routine.description}
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-slate-400 font-semibold">
                  <span className="flex items-center gap-1">
                    <Calendar size={13} className="text-amber-400" /> {routine.days.length} dias de treino
                  </span>
                  <span>•</span>
                  <span className="text-slate-400">
                    Nível {DIFFICULTY_LABELS_PT[routine.level] || routine.level}
                  </span>
                </div>

                {/* Seletor de Semana de Periodização (Bloco de 4 Semanas) */}
                {!routine.isTemplate && (
                  <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                      Ciclo de 4 Semanas:
                    </span>
                    {([1, 2, 3, 4] as const).map((wk) => {
                      const activeWk = routine.currentWeek || 1;
                      return (
                        <button
                          key={wk}
                          type="button"
                          onClick={() => handleSetRoutineWeek(routine, wk)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border ${
                            activeWk === wk
                              ? 'bg-amber-500 text-slate-950 border-amber-500'
                              : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          Semana {wk}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleDuplicate(routine)}
                  className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl"
                  title="Duplicar Plano"
                >
                  <Copy size={16} />
                </button>
                {!routine.isTemplate && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingRoutine(routine);
                        setIsEditorOpen(true);
                      }}
                      className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-xl"
                      title="Editar Plano"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(routine.id)}
                      className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl"
                      title="Eliminar Plano"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Dias de Treino do Plano */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
              {routine.days.map((day) => {
                return (
                  <div
                    key={day.id}
                    className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5 flex flex-col justify-between gap-3 group hover:border-amber-500/40 transition-all"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-200 group-hover:text-amber-400 transition-colors">
                        {day.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                        {day.exercises
                          .map((e) => exerciseMap.get(e.exerciseId)?.namePt || 'Exercício')
                          .slice(0, 3)
                          .join(', ')}
                        {day.exercises.length > 3 ? ` + ${day.exercises.length - 3} mais` : ''}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => startRoutineWorkout(routine, day)}
                      className="w-full py-2 bg-amber-500/15 hover:bg-amber-500 group-hover:bg-amber-500 text-amber-400 group-hover:text-slate-950 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95"
                    >
                      <Play size={13} className="fill-current" /> Iniciar Este Treino
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {displayedRoutines.length === 0 && (
          <div className="text-center py-16 text-slate-500 bg-slate-900/40 border border-slate-800/60 rounded-3xl">
            <Layers size={40} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm font-semibold text-slate-300">
              Ainda não criaste planos personalizados.
            </p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Podes criar um plano do zero ou duplicar um dos nossos modelos comprovados no separador ao lado!
            </p>
          </div>
        )}
      </div>

      {/* Editor Modal */}
      {isEditorOpen && (
        <RoutineEditor
          initialRoutine={editingRoutine}
          onClose={() => {
            setIsEditorOpen(false);
            setEditingRoutine(null);
          }}
          onSave={() => {}}
        />
      )}

      {/* Modal de Gerador Inteligente */}
      <SmartPlanOnboardingModal
        isOpen={isSmartModalOpen}
        onClose={() => setIsSmartModalOpen(false)}
        onPlanApplied={() => {
          setIsSmartModalOpen(false);
          setActiveTab('my_routines');
        }}
      />
    </div>
  );
};
