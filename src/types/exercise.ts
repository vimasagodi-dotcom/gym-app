export type MuscleGroup =
  | 'chest'
  | 'upper_back'
  | 'lats'
  | 'lower_back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'abs'
  | 'glutes'
  | 'quads'
  | 'hamstrings'
  | 'calves';

export type EquipmentType =
  | 'barbell'
  | 'dumbbell'
  | 'machine'
  | 'cable'
  | 'bodyweight'
  | 'band'
  | 'smith'
  | 'kettlebell'
  | 'other';

export type MovementType = 'compound' | 'isolation';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface Exercise {
  id: string;
  name: string;
  namePt: string;
  primaryMuscles: MuscleGroup[];
  secondaryMuscles: MuscleGroup[];
  equipment: EquipmentType;
  movementType: MovementType;
  difficulty: DifficultyLevel;
  instructionsPt?: string;
  instructionsEn?: string;
  tips?: string[];
  videoUrl?: string;
  imageUrl?: string;
  isCustom?: boolean;
  userId?: string; // associado se for exercício personalizado do utilizador
  createdAt?: string;
}

export interface MuscleGroupInfo {
  id: MuscleGroup;
  namePt: string;
  nameEn: string;
  view: 'anterior' | 'posterior' | 'both';
  category: 'upper' | 'lower' | 'core';
}

export const MUSCLE_GROUPS_INFO: Record<MuscleGroup, MuscleGroupInfo> = {
  chest: { id: 'chest', namePt: 'Peito', nameEn: 'Chest', view: 'anterior', category: 'upper' },
  shoulders: { id: 'shoulders', namePt: 'Ombros', nameEn: 'Shoulders', view: 'both', category: 'upper' },
  biceps: { id: 'biceps', namePt: 'Bicípites', nameEn: 'Biceps', view: 'anterior', category: 'upper' },
  triceps: { id: 'triceps', namePt: 'Tricípites', nameEn: 'Triceps', view: 'posterior', category: 'upper' },
  forearms: { id: 'forearms', namePt: 'Antebraços', nameEn: 'Forearms', view: 'both', category: 'upper' },
  abs: { id: 'abs', namePt: 'Abdominais / Core', nameEn: 'Abs / Core', view: 'anterior', category: 'core' },
  upper_back: { id: 'upper_back', namePt: 'Parte Superior das Costas / Trapézio', nameEn: 'Upper Back / Traps', view: 'posterior', category: 'upper' },
  lats: { id: 'lats', namePt: 'Dorsais', nameEn: 'Lats', view: 'posterior', category: 'upper' },
  lower_back: { id: 'lower_back', namePt: 'Lombar', nameEn: 'Lower Back', view: 'posterior', category: 'core' },
  glutes: { id: 'glutes', namePt: 'Glúteos', nameEn: 'Glutes', view: 'posterior', category: 'lower' },
  quads: { id: 'quads', namePt: 'Quadricípites', nameEn: 'Quadriceps', view: 'anterior', category: 'lower' },
  hamstrings: { id: 'hamstrings', namePt: 'Isquiotibiais', nameEn: 'Hamstrings', view: 'posterior', category: 'lower' },
  calves: { id: 'calves', namePt: 'Gémeos', nameEn: 'Calves', view: 'both', category: 'lower' },
};

export const EQUIPMENT_LABELS_PT: Record<EquipmentType, string> = {
  barbell: 'Barra',
  dumbbell: 'Halteres',
  machine: 'Máquina',
  cable: 'Polia / Cabo',
  bodyweight: 'Peso Corporal',
  band: 'Elásticos',
  smith: 'Máquina Smith',
  kettlebell: 'Kettlebell',
  other: 'Outro Equipamento',
};

export const DIFFICULTY_LABELS_PT: Record<DifficultyLevel, string> = {
  beginner: 'Principiante',
  intermediate: 'Intermédio',
  advanced: 'Avançado',
};
