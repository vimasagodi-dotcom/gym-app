import { db } from './db';
import { INITIAL_EXERCISES } from './seedExercises';
import { INITIAL_ROUTINES } from './seedRoutines';
import type { UserProfile } from '../types/user';
import type { WorkoutSession, PersonalRecord } from '../types/workout';
import type { BodyMetricLog } from '../types/metrics';

let initPromise: Promise<void> | null = null;

export async function initializeDatabase(): Promise<void> {
  if (initPromise) return initPromise;
  initPromise = doInitializeDatabase();
  return initPromise;
}

async function doInitializeDatabase(): Promise<void> {
  // 1. Inicializa perfil padrão do utilizador se não existir
  const userCount = await db.users.count();
  if (userCount === 0) {
    const defaultUser: UserProfile = {
      id: 'default-user',
      name: 'Atleta',
      avatarSilhouette: 'neutral', // 'male' | 'female' | 'neutral'
      unitSystem: 'kg',
      goal: 'hypertrophy',
      defaultRestSeconds: 90,
      soundEnabled: true,
      vibrationEnabled: true,
      theme: 'dark',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.users.put(defaultUser);
  }

  // 2. Popula e sincroniza os exercícios atualizados em PT-PT
  await db.exercises.bulkPut(INITIAL_EXERCISES);

  // 3. Popula rotinas pré-definidas
  const routineCount = await db.routines.count();
  if (routineCount === 0) {
    await db.routines.bulkPut(INITIAL_ROUTINES);
  } else {
    for (const r of INITIAL_ROUTINES) {
      if (r.isTemplate) {
        await db.routines.put(r);
      }
    }
  }

  // 4. Se não existirem sessões passadas, cria 2-3 sessões demonstrativas dos últimos dias
  // para permitir testar instantaneamente gráficos de 1RM, volume semanal e heatmap muscular!
  const sessionCount = await db.workoutSessions.count();
  if (sessionCount === 0) {
    const now = new Date();
    
    // Treino de há 4 dias (Push Day)
    const pushDate = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000);
    const pushSession: WorkoutSession = {
      id: 'sample-push-session',
      userId: 'default-user',
      routineId: 'ppl-classic-routine',
      name: 'Push (Peito, Ombros & Tricípites)',
      startedAt: pushDate.toISOString(),
      completedAt: new Date(pushDate.getTime() + 52 * 60 * 1000).toISOString(),
      durationSeconds: 3120, // 52 min
      totalVolumeKg: 5240,
      totalSetsCompleted: 14,
      totalRepsCompleted: 132,
      rating: 5,
      notes: 'Sensação excelente no supino, boa congestão muscular nos tricípites.',
      exercises: [
        {
          id: 's-ex-1',
          exerciseId: 'barbell-bench-press',
          order: 1,
          sets: [
            { id: 's1', setNumber: 1, type: 'warmup', weightKg: 40, reps: 12, isCompleted: true },
            { id: 's2', setNumber: 2, type: 'normal', weightKg: 70, reps: 8, rpe: 8, isCompleted: true },
            { id: 's3', setNumber: 3, type: 'normal', weightKg: 75, reps: 8, rpe: 8.5, isCompleted: true },
            { id: 's4', setNumber: 4, type: 'normal', weightKg: 80, reps: 6, rpe: 9, isCompleted: true, isPersonalRecord: true },
          ],
        },
        {
          id: 's-ex-2',
          exerciseId: 'incline-dumbbell-press',
          order: 2,
          sets: [
            { id: 's5', setNumber: 1, type: 'normal', weightKg: 24, reps: 10, rpe: 8, isCompleted: true },
            { id: 's6', setNumber: 2, type: 'normal', weightKg: 26, reps: 8, rpe: 8.5, isCompleted: true },
            { id: 's7', setNumber: 3, type: 'normal', weightKg: 28, reps: 7, rpe: 9, isCompleted: true },
          ],
        },
        {
          id: 's-ex-3',
          exerciseId: 'dumbbell-lateral-raise',
          order: 3,
          sets: [
            { id: 's8', setNumber: 1, type: 'normal', weightKg: 10, reps: 15, rpe: 8, isCompleted: true },
            { id: 's9', setNumber: 2, type: 'normal', weightKg: 10, reps: 14, rpe: 8.5, isCompleted: true },
            { id: 's10', setNumber: 3, type: 'normal', weightKg: 12, reps: 12, rpe: 9.5, isCompleted: true },
          ],
        },
        {
          id: 's-ex-4',
          exerciseId: 'tricep-rope-pushdown',
          order: 4,
          sets: [
            { id: 's11', setNumber: 1, type: 'normal', weightKg: 25, reps: 12, rpe: 8, isCompleted: true },
            { id: 's12', setNumber: 2, type: 'normal', weightKg: 30, reps: 10, rpe: 9, isCompleted: true },
            { id: 's13', setNumber: 3, type: 'normal', weightKg: 30, reps: 10, rpe: 9.5, isCompleted: true },
          ],
        },
      ],
      prsAchieved: [
        {
          id: 'pr-1',
          userId: 'default-user',
          exerciseId: 'barbell-bench-press',
          type: 'max_weight',
          value: 80,
          reps: 6,
          weight: 80,
          workoutSessionId: 'sample-push-session',
          date: pushDate.toISOString(),
        },
      ],
    };

    // Treino de há 2 dias (Pull Day)
    const pullDate = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    const pullSession: WorkoutSession = {
      id: 'sample-pull-session',
      userId: 'default-user',
      routineId: 'ppl-classic-routine',
      name: 'Pull (Costas & Bicípites)',
      startedAt: pullDate.toISOString(),
      completedAt: new Date(pullDate.getTime() + 48 * 60 * 1000).toISOString(),
      durationSeconds: 2880, // 48 min
      totalVolumeKg: 4980,
      totalSetsCompleted: 13,
      totalRepsCompleted: 118,
      rating: 4,
      notes: 'Puxadas pesadas e bom controlo de omoplatas.',
      exercises: [
        {
          id: 's-ex-5',
          exerciseId: 'lat-pulldown',
          order: 1,
          sets: [
            { id: 's14', setNumber: 1, type: 'normal', weightKg: 55, reps: 10, isCompleted: true },
            { id: 's15', setNumber: 2, type: 'normal', weightKg: 60, reps: 10, isCompleted: true },
            { id: 's16', setNumber: 3, type: 'normal', weightKg: 65, reps: 8, isCompleted: true },
          ],
        },
        {
          id: 's-ex-6',
          exerciseId: 'barbell-bent-over-row',
          order: 2,
          sets: [
            { id: 's17', setNumber: 1, type: 'normal', weightKg: 60, reps: 10, isCompleted: true },
            { id: 's18', setNumber: 2, type: 'normal', weightKg: 65, reps: 8, isCompleted: true },
            { id: 's19', setNumber: 3, type: 'normal', weightKg: 70, reps: 8, isCompleted: true },
          ],
        },
        {
          id: 's-ex-7',
          exerciseId: 'barbell-bicep-curl',
          order: 3,
          sets: [
            { id: 's20', setNumber: 1, type: 'normal', weightKg: 30, reps: 10, isCompleted: true },
            { id: 's21', setNumber: 2, type: 'normal', weightKg: 32.5, reps: 8, isCompleted: true },
            { id: 's22', setNumber: 3, type: 'normal', weightKg: 32.5, reps: 7, isCompleted: true },
          ],
        },
      ],
    };

    await db.workoutSessions.bulkPut([pushSession, pullSession]);

    // PRs correspondentes
    const initialPrs: PersonalRecord[] = [
      {
        id: 'pr-bench',
        userId: 'default-user',
        exerciseId: 'barbell-bench-press',
        type: 'max_weight',
        value: 80,
        reps: 6,
        weight: 80,
        workoutSessionId: 'sample-push-session',
        date: pushDate.toISOString(),
      },
      {
        id: 'pr-row',
        userId: 'default-user',
        exerciseId: 'barbell-bent-over-row',
        type: 'max_weight',
        value: 70,
        reps: 8,
        weight: 70,
        workoutSessionId: 'sample-pull-session',
        date: pullDate.toISOString(),
      },
    ];
    await db.personalRecords.bulkPut(initialPrs);

    // Métricas de peso inicial
    const initialMetrics: BodyMetricLog[] = [
      {
        id: 'metric-1',
        userId: 'default-user',
        date: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        weightKg: 77.8,
        bodyFatPercentage: 15.2,
        waistCm: 81,
        leftArmCm: 37,
        rightArmCm: 37.2,
        createdAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'metric-2',
        userId: 'default-user',
        date: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        weightKg: 77.4,
        bodyFatPercentage: 15.0,
        waistCm: 80.5,
        leftArmCm: 37.2,
        rightArmCm: 37.4,
        createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'metric-3',
        userId: 'default-user',
        date: now.toISOString().split('T')[0],
        weightKg: 77.1,
        bodyFatPercentage: 14.8,
        waistCm: 80,
        leftArmCm: 37.5,
        rightArmCm: 37.6,
        createdAt: now.toISOString(),
      },
    ];
    await db.bodyMetrics.bulkPut(initialMetrics);
  }
}
