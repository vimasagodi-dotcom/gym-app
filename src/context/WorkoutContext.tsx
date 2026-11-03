import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { db } from '../db/db';
import type { WorkoutSession, WorkoutExerciseLog, ExerciseSetLog, PersonalRecord, SetType } from '../types/workout';
import type { WorkoutRoutine, RoutineDay } from '../types/routine';
import { calculate1RM } from '../utils/formulas';
import { playRestCompleteSound, playCheckSound } from '../utils/sound';
import { requestScreenWakeLock, releaseScreenWakeLock } from '../utils/wakeLock';

interface WorkoutContextType {
  activeSession: WorkoutSession | null;
  isActive: boolean;
  activeExerciseIndex: number;
  // Timer de descanso
  isRestTimerActive: boolean;
  restTimerSeconds: number;
  restTimerTotal: number;
  // Ações de sessão
  startRoutineWorkout: (routine: WorkoutRoutine, day: RoutineDay) => Promise<void>;
  startQuickWorkout: (name?: string) => Promise<void>;
  cancelWorkout: () => void;
  finishWorkout: () => Promise<WorkoutSession | null>;
  // Ações de exercícios
  addExerciseToWorkout: (exerciseId: string) => void;
  removeExerciseFromWorkout: (exerciseIndex: number) => void;
  reorderExercises: (fromIndex: number, toIndex: number) => void;
  setActiveExerciseIndex: (index: number) => void;
  // Ações de séries
  updateSet: (exerciseIndex: number, setIndex: number, field: keyof ExerciseSetLog, value: unknown) => void;
  toggleSetCompleted: (exerciseIndex: number, setIndex: number) => void;
  addSetToExercise: (exerciseIndex: number, type?: SetType) => void;
  removeSetFromExercise: (exerciseIndex: number, setIndex: number) => void;
  // Controlo do temporizador
  startRestTimer: (durationSeconds?: number) => void;
  stopRestTimer: () => void;
  adjustRestTimer: (deltaSeconds: number) => void;
  // Histórico anterior para sobrecarga progressiva
  previousExerciseLogs: Record<string, WorkoutExerciseLog>;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

const ACTIVE_WORKOUT_STORAGE_KEY = 'gymapp_active_workout_state';

export const WorkoutProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(() => {
    try {
      const saved = localStorage.getItem(ACTIVE_WORKOUT_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeExerciseIndex, setActiveExerciseIndex] = useState<number>(0);

  // Timer de descanso
  const [isRestTimerActive, setIsRestTimerActive] = useState<boolean>(false);
  const [restTimerSeconds, setRestTimerSeconds] = useState<number>(0);
  const [restTimerTotal, setRestTimerTotal] = useState<number>(90);

  // Cache com os registos da última sessão para cada exercício
  const [previousExerciseLogs, setPreviousExerciseLogs] = useState<Record<string, WorkoutExerciseLog>>({});

  // Salva no localStorage e gere Wake Lock para manter a tela do telemóvel acesa
  useEffect(() => {
    if (activeSession) {
      localStorage.setItem(ACTIVE_WORKOUT_STORAGE_KEY, JSON.stringify(activeSession));
      requestScreenWakeLock();
    } else {
      localStorage.removeItem(ACTIVE_WORKOUT_STORAGE_KEY);
      releaseScreenWakeLock();
    }
  }, [activeSession]);

  // Carrega histórico dos últimos treinos para comparação direta
  const loadPreviousHistory = useCallback(async (exerciseIds: string[]) => {
    try {
      const pastSessions = await db.workoutSessions
        .orderBy('startedAt')
        .reverse()
        .filter((s) => s.completedAt !== undefined)
        .limit(20)
        .toArray();

      const lastLogsMap: Record<string, WorkoutExerciseLog> = {};

      for (const exId of exerciseIds) {
        for (const session of pastSessions) {
          const found = session.exercises.find((e) => e.exerciseId === exId);
          if (found && found.sets.some((s) => s.isCompleted)) {
            lastLogsMap[exId] = found;
            break;
          }
        }
      }

      setPreviousExerciseLogs(lastLogsMap);
    } catch (err) {
      console.error('Erro ao carregar histórico passado:', err);
    }
  }, []);

  // Ao montar ou mudar sessão, carrega histórico
  useEffect(() => {
    if (activeSession && activeSession.exercises.length > 0) {
      const ids = activeSession.exercises.map((e) => e.exerciseId);
      loadPreviousHistory(ids);
    }
  }, [activeSession?.exercises.length, loadPreviousHistory]);

  // Temporizador de descanso (Interval em background)
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isRestTimerActive && restTimerSeconds > 0) {
      interval = setInterval(() => {
        setRestTimerSeconds((prev) => {
          if (prev <= 1) {
            setIsRestTimerActive(false);
            playRestCompleteSound();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRestTimerActive, restTimerSeconds]);

  // Controlo de Duração da Sessão Ativa
  useEffect(() => {
    let durationInterval: ReturnType<typeof setInterval> | null = null;

    if (activeSession && !activeSession.completedAt) {
      durationInterval = setInterval(() => {
        setActiveSession((prev) => {
          if (!prev) return null;
          const startTime = new Date(prev.startedAt).getTime();
          const now = Date.now();
          const elapsed = Math.max(0, Math.floor((now - startTime) / 1000));
          return { ...prev, durationSeconds: elapsed };
        });
      }, 1000);
    }

    return () => {
      if (durationInterval) clearInterval(durationInterval);
    };
  }, [activeSession?.startedAt, activeSession?.completedAt]);

  const startRestTimer = useCallback((durationSeconds = 90) => {
    setRestTimerTotal(durationSeconds);
    setRestTimerSeconds(durationSeconds);
    setIsRestTimerActive(true);
  }, []);

  const stopRestTimer = useCallback(() => {
    setIsRestTimerActive(false);
    setRestTimerSeconds(0);
  }, []);

  const adjustRestTimer = useCallback((deltaSeconds: number) => {
    setRestTimerSeconds((prev) => Math.max(0, prev + deltaSeconds));
  }, []);

  // Iniciar treino a partir de uma rotina com Periodização Automática de 4 Semanas
  const startRoutineWorkout = async (routine: WorkoutRoutine, day: RoutineDay) => {
    const week = (routine.currentWeek || 1) as 1 | 2 | 3 | 4;

    const exerciseLogs: WorkoutExerciseLog[] = day.exercises.map((item, idx) => {
      // Cálculo dinâmico de reps e RPE com base na semana do bloco de 4 semanas
      let targetReps = item.targetRepsMin || 10;
      let targetRpe = item.targetRpe || 8;

      if (week === 2) {
        // Semana 2: Intensificação (-2 reps, +carga)
        targetReps = Math.max(8, targetReps - 2);
        targetRpe = 8.5;
      } else if (week === 3) {
        // Semana 3: Sobrecarga Máxima / Pico de Força (-4 reps, carga máxima)
        targetReps = Math.max(6, targetReps - 4);
        targetRpe = 9;
      } else if (week === 4) {
        // Semana 4: Deload & Recuperação Articular
        targetReps = 8;
        targetRpe = 6.5;
      }

      const defaultSets: ExerciseSetLog[] = [];
      const numSets = week === 4 ? Math.max(2, (item.targetSets || 3) - 1) : item.targetSets || 3;

      for (let i = 1; i <= numSets; i++) {
        defaultSets.push({
          id: `set-${Date.now()}-${idx}-${i}`,
          setNumber: i,
          type: 'normal',
          weightKg: 0,
          reps: targetReps,
          rpe: targetRpe,
          isCompleted: false,
        });
      }

      return {
        id: `we-${Date.now()}-${idx}`,
        exerciseId: item.exerciseId,
        order: item.order || idx + 1,
        notes: item.notes,
        sets: defaultSets,
        restSeconds: item.restSeconds || 90,
      };
    });

    const newSession: WorkoutSession = {
      id: `workout-${Date.now()}`,
      userId: routine.userId || 'default-user',
      routineId: routine.id,
      routineDayId: day.id,
      name: `${routine.title} - ${day.name}`,
      startedAt: new Date().toISOString(),
      durationSeconds: 0,
      totalVolumeKg: 0,
      totalSetsCompleted: 0,
      totalRepsCompleted: 0,
      periodizationWeek: week,
      exercises: exerciseLogs,
      prsAchieved: [],
    };

    setActiveSession(newSession);
    setActiveExerciseIndex(0);
    await loadPreviousHistory(exerciseLogs.map((e) => e.exerciseId));
  };

  // Iniciar treino rápido livre
  const startQuickWorkout = async (name = 'Treino Rápido Livre') => {
    const newSession: WorkoutSession = {
      id: `workout-${Date.now()}`,
      userId: 'default-user',
      name,
      startedAt: new Date().toISOString(),
      durationSeconds: 0,
      totalVolumeKg: 0,
      totalSetsCompleted: 0,
      totalRepsCompleted: 0,
      exercises: [],
      prsAchieved: [],
    };

    setActiveSession(newSession);
    setActiveExerciseIndex(0);
  };

  const cancelWorkout = () => {
    setActiveSession(null);
    stopRestTimer();
    localStorage.removeItem(ACTIVE_WORKOUT_STORAGE_KEY);
  };

  const addExerciseToWorkout = (exerciseId: string) => {
    if (!activeSession) return;

    // Busca última carga usada nesse exercício se houver no histórico
    const lastLog = previousExerciseLogs[exerciseId];
    const initialWeight = lastLog?.sets?.[0]?.weightKg || 0;
    const initialReps = lastLog?.sets?.[0]?.reps || 10;

    const newExerciseLog: WorkoutExerciseLog = {
      id: `we-${Date.now()}-${activeSession.exercises.length + 1}`,
      exerciseId,
      order: activeSession.exercises.length + 1,
      restSeconds: 90,
      sets: [
        {
          id: `set-${Date.now()}-1`,
          setNumber: 1,
          type: 'normal',
          weightKg: initialWeight,
          reps: initialReps,
          rpe: 8,
          isCompleted: false,
        },
      ],
    };

    setActiveSession((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        exercises: [...prev.exercises, newExerciseLog],
      };
    });

    loadPreviousHistory([exerciseId]);
  };

  const removeExerciseFromWorkout = (exerciseIndex: number) => {
    setActiveSession((prev) => {
      if (!prev) return null;
      const updated = [...prev.exercises];
      updated.splice(exerciseIndex, 1);
      return { ...prev, exercises: updated };
    });
    if (activeExerciseIndex >= exerciseIndex && activeExerciseIndex > 0) {
      setActiveExerciseIndex((prev) => prev - 1);
    }
  };

  const reorderExercises = (fromIndex: number, toIndex: number) => {
    setActiveSession((prev) => {
      if (!prev) return null;
      const updated = [...prev.exercises];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return { ...prev, exercises: updated };
    });
  };

  const updateSet = (exerciseIndex: number, setIndex: number, field: keyof ExerciseSetLog, value: unknown) => {
    setActiveSession((prev) => {
      if (!prev) return null;
      const updatedExercises = [...prev.exercises];
      const targetEx = { ...updatedExercises[exerciseIndex] };
      const updatedSets = [...targetEx.sets];

      updatedSets[setIndex] = {
        ...updatedSets[setIndex],
        [field]: value,
      };

      targetEx.sets = updatedSets;
      updatedExercises[exerciseIndex] = targetEx;
      return { ...prev, exercises: updatedExercises };
    });
  };

  const toggleSetCompleted = async (exerciseIndex: number, setIndex: number) => {
    if (!activeSession) return;
    const exercise = activeSession.exercises[exerciseIndex];
    if (!exercise) return;
    const targetSet = exercise.sets[setIndex];
    if (!targetSet) return;

    const nextCompleted = !targetSet.isCompleted;

    if (nextCompleted) {
      playCheckSound();

      // Inicia temporizador de descanso configurado para o exercício
      const restSecs = exercise.restSeconds || 90;
      startRestTimer(restSecs);
    }

    updateSet(exerciseIndex, setIndex, 'isCompleted', nextCompleted);
    if (nextCompleted) {
      updateSet(exerciseIndex, setIndex, 'completedAt', new Date().toISOString());
    }
  };

  const addSetToExercise = (exerciseIndex: number, type: SetType = 'normal') => {
    setActiveSession((prev) => {
      if (!prev) return null;
      const updatedExercises = [...prev.exercises];
      const targetEx = { ...updatedExercises[exerciseIndex] };
      const lastSet = targetEx.sets[targetEx.sets.length - 1];

      const newSet: ExerciseSetLog = {
        id: `set-${Date.now()}-${targetEx.sets.length + 1}`,
        setNumber: targetEx.sets.length + 1,
        type,
        weightKg: lastSet ? lastSet.weightKg : 0,
        reps: lastSet ? lastSet.reps : 10,
        rpe: lastSet?.rpe || 8,
        isCompleted: false,
      };

      targetEx.sets = [...targetEx.sets, newSet];
      updatedExercises[exerciseIndex] = targetEx;
      return { ...prev, exercises: updatedExercises };
    });
  };

  const removeSetFromExercise = (exerciseIndex: number, setIndex: number) => {
    setActiveSession((prev) => {
      if (!prev) return null;
      const updatedExercises = [...prev.exercises];
      const targetEx = { ...updatedExercises[exerciseIndex] };
      const updatedSets = [...targetEx.sets];
      updatedSets.splice(setIndex, 1);
      // Re-numera as séries
      targetEx.sets = updatedSets.map((s, idx) => ({ ...s, setNumber: idx + 1 }));
      updatedExercises[exerciseIndex] = targetEx;
      return { ...prev, exercises: updatedExercises };
    });
  };

  // Finalizar Treino e Gravar Permanentemente no IndexedDB
  const finishWorkout = async (): Promise<WorkoutSession | null> => {
    if (!activeSession) return null;

    stopRestTimer();

    let totalVolume = 0;
    let completedSetsCount = 0;
    let completedRepsCount = 0;
    const prsDetected: PersonalRecord[] = [];

    // Busca recordes anteriores de todos os exercícios desta sessão
    for (const ex of activeSession.exercises) {
      const completedSets = ex.sets.filter((s) => s.isCompleted);
      for (const set of completedSets) {
        totalVolume += set.weightKg * set.reps;
        completedSetsCount += 1;
        completedRepsCount += set.reps;

        // Verifica PR de peso máximo
        const currentMaxWeightPr = await db.personalRecords
          .where({ exerciseId: ex.exerciseId, type: 'max_weight' })
          .first();

        if (!currentMaxWeightPr || set.weightKg > currentMaxWeightPr.value) {
          const newPr: PersonalRecord = {
            id: `pr-weight-${Date.now()}-${ex.exerciseId}`,
            userId: activeSession.userId,
            exerciseId: ex.exerciseId,
            type: 'max_weight',
            value: set.weightKg,
            weight: set.weightKg,
            reps: set.reps,
            workoutSessionId: activeSession.id,
            date: new Date().toISOString(),
          };
          prsDetected.push(newPr);
          await db.personalRecords.put(newPr);
        }

        // Verifica PR de 1RM estimada
        const est1rm = calculate1RM(set.weightKg, set.reps);
        const current1rmPr = await db.personalRecords
          .where({ exerciseId: ex.exerciseId, type: 'estimated_1rm' })
          .first();

        if (!current1rmPr || est1rm > current1rmPr.value) {
          const newPr: PersonalRecord = {
            id: `pr-1rm-${Date.now()}-${ex.exerciseId}`,
            userId: activeSession.userId,
            exerciseId: ex.exerciseId,
            type: 'estimated_1rm',
            value: est1rm,
            weight: set.weightKg,
            reps: set.reps,
            workoutSessionId: activeSession.id,
            date: new Date().toISOString(),
          };
          prsDetected.push(newPr);
          await db.personalRecords.put(newPr);
        }
      }
    }

    // Gestão do Avanço da Semana no Bloco de Periodização de 4 Semanas
    let currentWeek: 1 | 2 | 3 | 4 = (activeSession.periodizationWeek || 1) as 1 | 2 | 3 | 4;
    if (activeSession.routineId) {
      try {
        const routine = await db.routines.get(activeSession.routineId);
        if (routine && routine.days.length > 0) {
          currentWeek = (routine.currentWeek || 1) as 1 | 2 | 3 | 4;
          const dayIndex = routine.days.findIndex((d) => d.id === activeSession.routineDayId);
          // Se for o último dia da rotina nessa semana, avança a semana do bloco
          if (dayIndex >= 0 && dayIndex === routine.days.length - 1) {
            const nextWeek = currentWeek >= 4 ? 1 : ((currentWeek + 1) as 1 | 2 | 3 | 4);
            await db.routines.update(routine.id, { currentWeek: nextWeek });
          }
        }
      } catch (err) {
        console.warn('Erro ao atualizar semana da rotina:', err);
      }
    }

    const finalSession: WorkoutSession = {
      ...activeSession,
      completedAt: new Date().toISOString(),
      totalVolumeKg: Math.round(totalVolume),
      totalSetsCompleted: completedSetsCount,
      totalRepsCompleted: completedRepsCount,
      prsAchieved: prsDetected,
      periodizationWeek: currentWeek,
    };

    // Guarda na base de dados IndexedDB
    await db.workoutSessions.add(finalSession);

    // Limpa estado ativo
    setActiveSession(null);
    localStorage.removeItem(ACTIVE_WORKOUT_STORAGE_KEY);

    return finalSession;
  };

  return (
    <WorkoutContext.Provider
      value={{
        activeSession,
        isActive: !!activeSession,
        activeExerciseIndex,
        isRestTimerActive,
        restTimerSeconds,
        restTimerTotal,
        startRoutineWorkout,
        startQuickWorkout,
        cancelWorkout,
        finishWorkout,
        addExerciseToWorkout,
        removeExerciseFromWorkout,
        reorderExercises,
        setActiveExerciseIndex,
        updateSet,
        toggleSetCompleted,
        addSetToExercise,
        removeSetFromExercise,
        startRestTimer,
        stopRestTimer,
        adjustRestTimer,
        previousExerciseLogs,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
};

export const useWorkout = (): WorkoutContextType => {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
};
