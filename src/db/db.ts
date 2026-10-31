import Dexie, { type Table } from 'dexie';
import type { Exercise } from '../types/exercise';
import type { WorkoutRoutine } from '../types/routine';
import type { WorkoutSession, PersonalRecord } from '../types/workout';
import type { BodyMetricLog } from '../types/metrics';
import type { UserProfile } from '../types/user';

export class GymDatabase extends Dexie {
  users!: Table<UserProfile, string>;
  exercises!: Table<Exercise, string>;
  routines!: Table<WorkoutRoutine, string>;
  workoutSessions!: Table<WorkoutSession, string>;
  personalRecords!: Table<PersonalRecord, string>;
  bodyMetrics!: Table<BodyMetricLog, string>;

  constructor() {
    super('GymAppDatabase');

    this.version(1).stores({
      users: 'id, email',
      exercises: 'id, name, namePt, equipment, movementType, difficulty, *primaryMuscles, *secondaryMuscles, userId, isCustom',
      routines: 'id, userId, title, category, isTemplate, createdAt',
      workoutSessions: 'id, userId, routineId, startedAt, completedAt, totalVolumeKg',
      personalRecords: 'id, userId, exerciseId, type, [exerciseId+type], date',
      bodyMetrics: 'id, userId, date, createdAt',
    });
  }
}

export const db = new GymDatabase();
