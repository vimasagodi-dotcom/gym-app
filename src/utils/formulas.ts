/**
 * Calcula a estimativa de 1 Repetição Máxima (1RM) usando a fórmula de Brzycki:
 * 1RM = Peso * (36 / (37 - Reps))
 * Se reps == 1, 1RM = peso.
 */
export function calculateBrzycki1RM(weightKg: number, reps: number): number {
  if (reps <= 0 || weightKg <= 0) return 0;
  if (reps === 1) return weightKg;
  if (reps >= 37) return weightKg; // Previne divisão por zero ou valor negativo
  const brzycki = weightKg * (36 / (37 - reps));
  return Math.round(brzycki * 10) / 10;
}

/**
 * Fórmula de Epley: 1RM = Peso * (1 + Reps / 30)
 */
export function calculate1RM(weightKg: number, reps: number): number {
  if (reps <= 0 || weightKg <= 0) return 0;
  if (reps === 1) return weightKg;
  // Usamos Brzycki como padrão de precisão para musculação
  return calculateBrzycki1RM(weightKg, reps);
}

/**
 * Formata segundos no formato mm:ss ou hh:mm:ss
 */
export function formatDuration(seconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const hrs = Math.floor(safeSeconds / 3600);
  const mins = Math.floor((safeSeconds % 3600) / 60);
  const secs = safeSeconds % 60;

  if (hrs > 0) {
    return `${hrs}h ${mins.toString().padStart(2, '0')}m`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Formata peso de acordo com o sistema de unidades (kg ou lbs)
 */
export function formatWeight(weightKg: number, unit: 'kg' | 'lbs' = 'kg'): string {
  if (unit === 'lbs') {
    const lbs = weightKg * 2.20462;
    return `${(Math.round(lbs * 10) / 10).toFixed(1)} lbs`;
  }
  return `${weightKg % 1 === 0 ? weightKg : weightKg.toFixed(1)} kg`;
}

/**
 * Converte valor digitado para kg internamente
 */
export function toKg(value: number, unit: 'kg' | 'lbs' = 'kg'): number {
  if (unit === 'lbs') {
    return Math.round((value / 2.20462) * 10) / 10;
  }
  return value;
}

/**
 * Converte kg interno para a unidade do utilizador para exibição em inputs
 */
export function fromKg(kg: number, unit: 'kg' | 'lbs' = 'kg'): number {
  if (unit === 'lbs') {
    return Math.round(kg * 2.20462 * 10) / 10;
  }
  return kg;
}

/**
 * Calcula a média móvel (Moving Average) de uma lista de valores numéricos
 */
export function calculateMovingAverage(data: number[], windowSize = 7): number[] {
  if (!data || data.length === 0) return [];
  return data.map((_, idx, arr) => {
    const start = Math.max(0, idx - windowSize + 1);
    const window = arr.slice(start, idx + 1);
    const sum = window.reduce((acc, v) => acc + v, 0);
    return Math.round((sum / window.length) * 10) / 10;
  });
}
