// Wake Lock API - Mantém o ecrã do telemóvel (Android & iOS) ligado durante o treino ativo

let wakeLockSentinel: WakeLockSentinel | null = null;

export async function requestScreenWakeLock(): Promise<boolean> {
  if (typeof window === 'undefined' || !('wakeLock' in navigator)) {
    return false;
  }

  try {
    wakeLockSentinel = await navigator.wakeLock.request('screen');
    wakeLockSentinel.addEventListener('release', () => {
      wakeLockSentinel = null;
    });
    return true;
  } catch (err) {
    console.warn('Wake Lock não pôde ser ativado:', err);
    return false;
  }
}

export async function releaseScreenWakeLock(): Promise<void> {
  if (wakeLockSentinel) {
    try {
      await wakeLockSentinel.release();
    } catch {
      // Silencia
    }
    wakeLockSentinel = null;
  }
}
