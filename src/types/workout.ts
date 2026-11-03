export type SetType = 'warmup' | 'normal' | 'failure' | 'drop';

export interface ExerciseSetLog {
  id: string;
  setNumber: number;
  type: SetType;
  weightKg: number;
  reps: number;
  rpe?: number; // Rate of Perceived Exertion (1 to 10)
  rir?: number; // Reps In Reserve (0 to 5)
  isCompleted: boolean;
  completedAt?: string;
  isPersonalRecord?: boolean;
}

export interface WorkoutExerciseLog {
  id: string; // unique item id inside session
  exerciseId: string;
  order: number;
  notes?: string;
  sets: ExerciseSetLog[];
  restSeconds?: number;
}

export interface PersonalRecord {
  id: string;
  userId: string;
  exerciseId: string;
  type: 'max_weight' | 'max_volume' | 'estimated_1rm';
  value: number;
  reps?: number;
  weight?: number;
  workoutSessionId: string;
  date: string;
}

export interface WorkoutSession {
  id: string;
  userId: string;
  routineId?: string;
  routineDayId?: string;
  name: string; // e.g. "Push Day" or "Treino Rápido"
  startedAt: string; // ISO date
  completedAt?: string; // ISO date (undefined if in progress)
  durationSeconds: number;
  totalVolumeKg: number;
  totalSetsCompleted: number;
  totalRepsCompleted: number;
  notes?: string;
  rating?: number; // 1-5 estrelas de sensação
  exercises: WorkoutExerciseLog[];
  prsAchieved?: PersonalRecord[];
  periodizationWeek?: 1 | 2 | 3 | 4;
}

export interface ActiveWorkoutState {
  session: WorkoutSession;
  activeExerciseIndex: number;
  activeSetIndex: number;
  isRestTimerActive: boolean;
  restTimerRemaining: number;
  restTimerTotal: number;
  restTimerExerciseId?: string;
}
