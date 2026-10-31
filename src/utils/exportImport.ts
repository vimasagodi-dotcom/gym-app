import { db } from '../db/db';

export async function exportDatabaseToJson(): Promise<string> {
  const users = await db.users.toArray();
  const exercises = await db.exercises.toArray();
  const routines = await db.routines.toArray();
  const workoutSessions = await db.workoutSessions.toArray();
  const personalRecords = await db.personalRecords.toArray();
  const bodyMetrics = await db.bodyMetrics.toArray();

  const exportData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    users,
    exercises,
    routines,
    workoutSessions,
    personalRecords,
    bodyMetrics,
  };

  return JSON.stringify(exportData, null, 2);
}

export async function importDatabaseFromJson(jsonString: string): Promise<boolean> {
  try {
    const data = JSON.parse(jsonString);
    if (!data.version) {
      throw new Error('Formato de backup inválido.');
    }

    await db.transaction('rw', [db.users, db.exercises, db.routines, db.workoutSessions, db.personalRecords, db.bodyMetrics], async () => {
      if (Array.isArray(data.users) && data.users.length > 0) {
        await db.users.clear();
        await db.users.bulkAdd(data.users);
      }
      if (Array.isArray(data.exercises) && data.exercises.length > 0) {
        await db.exercises.clear();
        await db.exercises.bulkAdd(data.exercises);
      }
      if (Array.isArray(data.routines) && data.routines.length > 0) {
        await db.routines.clear();
        await db.routines.bulkAdd(data.routines);
      }
      if (Array.isArray(data.workoutSessions)) {
        await db.workoutSessions.clear();
        if (data.workoutSessions.length > 0) {
          await db.workoutSessions.bulkAdd(data.workoutSessions);
        }
      }
      if (Array.isArray(data.personalRecords)) {
        await db.personalRecords.clear();
        if (data.personalRecords.length > 0) {
          await db.personalRecords.bulkAdd(data.personalRecords);
        }
      }
      if (Array.isArray(data.bodyMetrics)) {
        await db.bodyMetrics.clear();
        if (data.bodyMetrics.length > 0) {
          await db.bodyMetrics.bulkAdd(data.bodyMetrics);
        }
      }
    });

    return true;
  } catch (error) {
    console.error('Erro ao importar backup:', error);
    return false;
  }
}
