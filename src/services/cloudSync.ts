import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
} from 'firebase/firestore';
import { dbFirestore, isFirebaseConfigured } from './firebase';
import { db } from '../db/db';
import type { WorkoutSession, PersonalRecord } from '../types/workout';
import type { WorkoutRoutine } from '../types/routine';
import type { BodyMetricLog } from '../types/metrics';

// Remove campos undefined para compatibilidade estrita com o Firestore
function cleanUndefined<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export async function syncWorkoutToCloud(uid: string, session: WorkoutSession): Promise<void> {
  if (!isFirebaseConfigured || !dbFirestore || !uid || uid.startsWith('local-')) return;
  try {
    const ref = doc(dbFirestore, 'users', uid, 'workoutSessions', session.id);
    await setDoc(ref, cleanUndefined({ ...session, userId: uid }), { merge: true });
  } catch (err) {
    console.warn('Aviso ao sincronizar treino na nuvem:', err);
  }
}

export async function deleteWorkoutFromCloud(uid: string, sessionId: string): Promise<void> {
  if (!isFirebaseConfigured || !dbFirestore || !uid || uid.startsWith('local-')) return;
  try {
    const ref = doc(dbFirestore, 'users', uid, 'workoutSessions', sessionId);
    await deleteDoc(ref);
  } catch (err) {
    console.warn('Aviso ao eliminar treino da nuvem:', err);
  }
}

export async function syncRoutineToCloud(uid: string, routine: WorkoutRoutine): Promise<void> {
  if (!isFirebaseConfigured || !dbFirestore || !uid || uid.startsWith('local-')) return;
  try {
    const ref = doc(dbFirestore, 'users', uid, 'routines', routine.id);
    await setDoc(ref, cleanUndefined({ ...routine, userId: uid }), { merge: true });
  } catch (err) {
    console.warn('Aviso ao sincronizar plano na nuvem:', err);
  }
}

export async function syncPrToCloud(uid: string, pr: PersonalRecord): Promise<void> {
  if (!isFirebaseConfigured || !dbFirestore || !uid || uid.startsWith('local-')) return;
  try {
    const ref = doc(dbFirestore, 'users', uid, 'personalRecords', pr.id);
    await setDoc(ref, cleanUndefined({ ...pr, userId: uid }), { merge: true });
  } catch (err) {
    console.warn('Aviso ao sincronizar recorde na nuvem:', err);
  }
}

export async function syncMetricToCloud(uid: string, metric: BodyMetricLog): Promise<void> {
  if (!isFirebaseConfigured || !dbFirestore || !uid || uid.startsWith('local-')) return;
  try {
    const ref = doc(dbFirestore, 'users', uid, 'bodyMetrics', metric.id);
    await setDoc(ref, cleanUndefined({ ...metric, userId: uid }), { merge: true });
  } catch (err) {
    console.warn('Aviso ao sincronizar métrica corporal na nuvem:', err);
  }
}

/**
 * Sincronização bidirecional completa:
 * 1. Descarrega os treinos, planos e recordes guardados na conta Firebase do utilizador.
 * 2. Envia os treinos locais para a nuvem para garantir que o calendário está sempre disponível em qualquer telemóvel.
 */
export async function syncAllUserDataWithCloud(uid: string): Promise<void> {
  if (!isFirebaseConfigured || !dbFirestore || !uid || uid.startsWith('local-')) return;

  try {
    // 1. Puxar Sessões de Treino da Nuvem -> Local
    const workoutsSnap = await getDocs(collection(dbFirestore, 'users', uid, 'workoutSessions'));
    const cloudSessionIds = new Set<string>();
    for (const d of workoutsSnap.docs) {
      const data = d.data() as WorkoutSession;
      cloudSessionIds.add(data.id);
      await db.workoutSessions.put(data);
    }

    // Enviar Sessões Locais que ainda não estão na Nuvem
    const localSessions = await db.workoutSessions.toArray();
    for (const s of localSessions) {
      if (!cloudSessionIds.has(s.id)) {
        await syncWorkoutToCloud(uid, s);
      }
    }

    // 2. Puxar Planos Personalizados da Nuvem -> Local
    const routinesSnap = await getDocs(collection(dbFirestore, 'users', uid, 'routines'));
    const cloudRoutineIds = new Set<string>();
    for (const d of routinesSnap.docs) {
      const data = d.data() as WorkoutRoutine;
      cloudRoutineIds.add(data.id);
      await db.routines.put(data);
    }

    // Enviar Planos Locais Personalizados para a Nuvem
    const localRoutines = await db.routines.toArray();
    for (const r of localRoutines) {
      if (!r.isTemplate && !cloudRoutineIds.has(r.id)) {
        await syncRoutineToCloud(uid, r);
      }
    }

    // 3. Puxar Recordes Pessoais (PRs)
    const prsSnap = await getDocs(collection(dbFirestore, 'users', uid, 'personalRecords'));
    const cloudPrIds = new Set<string>();
    for (const d of prsSnap.docs) {
      const data = d.data() as PersonalRecord;
      cloudPrIds.add(data.id);
      await db.personalRecords.put(data);
    }

    const localPrs = await db.personalRecords.toArray();
    for (const pr of localPrs) {
      if (!cloudPrIds.has(pr.id)) {
        await syncPrToCloud(uid, pr);
      }
    }
  } catch (err) {
    console.warn('Sincronização com a nuvem em segundo plano:', err);
  }
}
