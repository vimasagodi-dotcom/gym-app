export interface RoutineExercise {
  id: string; // unique item id inside routine
  exerciseId: string;
  order: number;
  targetSets: number;
  targetRepsMin: number;
  targetRepsMax: number;
  targetRpe?: number;
  restSeconds?: number;
  notes?: string;
  isSupersetWithNext?: boolean;
}

export interface RoutineDay {
  id: string;
  name: string; // e.g. "Dia A - Push (Peito, Ombros e Tricípite)"
  description?: string;
  order: number;
  exercises: RoutineExercise[];
}

export interface WorkoutRoutine {
  id: string;
  userId: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  daysPerWeek: number;
  isTemplate?: boolean;
  category?: 'ppl' | 'upper_lower' | 'full_body' | 'bro_split' | 'custom';
  days: RoutineDay[];
  createdAt: string;
  updatedAt: string;
}
