export type UnitSystem = 'kg' | 'lbs';
export type AvatarSilhouette = 'male' | 'female' | 'neutral';
export type FitnessGoal = 'hypertrophy' | 'strength' | 'endurance' | 'general_fitness' | 'weight_loss';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

export interface UserProfile {
  id: string; // e.g. "default-user"
  name: string;
  email?: string;
  avatarSilhouette: AvatarSilhouette;
  unitSystem: UnitSystem;
  goal: FitnessGoal;
  experienceLevel?: ExperienceLevel;
  heightCm?: number;
  weightKg?: number;
  daysPerWeek?: number; // 3, 4, 5, 6
  hasCompletedOnboarding?: boolean;
  defaultRestSeconds: number; // e.g. 90
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  theme: 'dark' | 'light';
  createdAt: string;
  updatedAt: string;
}
