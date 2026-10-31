import type { WorkoutRoutine, RoutineDay, RoutineExercise } from '../types/routine';
import type { FitnessGoal, ExperienceLevel, AvatarSilhouette } from '../types/user';

export interface OnboardingParams {
  heightCm: number;
  weightKg: number;
  silhouette: AvatarSilhouette;
  goal: FitnessGoal;
  experience: ExperienceLevel;
  daysPerWeek: number; // 3, 4, 5, 6
}

export interface RecommendedPlanResult {
  routine: WorkoutRoutine;
  recommendedRestSeconds: number;
  targetRepsRange: { min: number; max: number };
  targetSetsPerExercise: number;
  explanation: string;
}

export function generateSmartWorkoutPlan(params: OnboardingParams): RecommendedPlanResult {
  const { goal, experience, daysPerWeek } = params;

  // 1. Calibrar séries, reps e descansos de acordo com o Objetivo
  let targetRepsMin = 8;
  let targetRepsMax = 12;
  let defaultSets = 3;
  let restSeconds = 90;
  let goalLabel = 'Hipertrofia Muscular';

  if (goal === 'strength') {
    targetRepsMin = 4;
    targetRepsMax = 6;
    defaultSets = experience === 'beginner' ? 3 : 4;
    restSeconds = 150;
    goalLabel = 'Força Máxima';
  } else if (goal === 'endurance') {
    targetRepsMin = 15;
    targetRepsMax = 20;
    defaultSets = 3;
    restSeconds = 60;
    goalLabel = 'Resistência Muscular';
  } else if (goal === 'weight_loss') {
    targetRepsMin = 10;
    targetRepsMax = 15;
    defaultSets = 3;
    restSeconds = 60;
    goalLabel = 'Definição e Perda de Gordura';
  } else {
    // Hipertrofia ou General Fitness
    targetRepsMin = 8;
    targetRepsMax = 12;
    defaultSets = experience === 'advanced' ? 4 : 3;
    restSeconds = 90;
    goalLabel = 'Hipertrofia Muscular';
  }

  // 2. Determinar a arquitetura de divisão com base na frequência semanal
  let routineTitle = '';
  let routineDesc = '';
  let days: RoutineDay[] = [];

  const createExercise = (
    exId: string,
    order: number,
    customSets?: number,
    customMinReps?: number,
    customMaxReps?: number
  ): RoutineExercise => ({
    id: `re-${Date.now()}-${order}-${Math.random().toString(36).substring(2, 7)}`,
    exerciseId: exId,
    order,
    targetSets: customSets || defaultSets,
    targetRepsMin: customMinReps || targetRepsMin,
    targetRepsMax: customMaxReps || targetRepsMax,
    restSeconds,
  });

  if (daysPerWeek <= 3) {
    // 3 DIAS: FULL BODY A / B / C
    routineTitle = `Full Body 3x — ${goalLabel} (${experience.toUpperCase()})`;
    routineDesc = `Treino de corpo inteiro de alta frequência 3x por semana, ideal para maximizar a síntese proteica e progressão com exercícios multiarticulares pesados.`;

    days = [
      {
        id: `fb-day-a-${Date.now()}`,
        name: 'Dia A: Full Body (Foco Agachamento & Supino)',
        description: 'Pernas anteriores, peitoral pesado, dorsal e core.',
        order: 1,
        exercises: [
          createExercise('barbell-back-squat', 1, defaultSets + 1),
          createExercise('barbell-bench-press', 2, defaultSets + 1),
          createExercise('seated-cable-row', 3),
          createExercise('dumbbell-lateral-raise', 4),
          createExercise('lying-leg-curl', 5),
          createExercise('hanging-leg-raise', 6),
        ],
      },
      {
        id: `fb-day-b-${Date.now()}`,
        name: 'Dia B: Full Body (Foco Peso Morto & OHP)',
        description: 'Cadeia posterior, ombros pesados, dorsais e braços.',
        order: 2,
        exercises: [
          createExercise('deadlift', 1, defaultSets),
          createExercise('overhead-barbell-press', 2, defaultSets),
          createExercise('lat-pulldown', 3),
          createExercise('leg-press-45', 4),
          createExercise('barbell-bicep-curl', 5),
          createExercise('tricep-rope-pushdown', 6),
        ],
      },
      {
        id: `fb-day-c-${Date.now()}`,
        name: 'Dia C: Full Body (Foco Hipertrofia & Hip Thrust)',
        description: 'Quadríceps, glúteos, peitoral inclinado e braços.',
        order: 3,
        exercises: [
          createExercise('barbell-hip-thrust', 1, defaultSets),
          createExercise('incline-dumbbell-press', 2),
          createExercise('pull-ups', 3),
          createExercise('bulgarian-split-squat', 4),
          createExercise('skull-crushers', 5),
          createExercise('standing-calf-raise', 6),
        ],
      },
    ];
  } else if (daysPerWeek === 4) {
    // 4 DIAS: UPPER / LOWER
    routineTitle = `Upper / Lower 4x — ${goalLabel} (${experience.toUpperCase()})`;
    routineDesc = `Divisão padrão ouro de 4 dias. Treina cada grupo muscular 2 vezes por semana com equilíbrio perfeito entre recuperação e volume.`;

    days = [
      {
        id: `ul-u1-${Date.now()}`,
        name: 'Upper A (Superior: Força & Compostos)',
        description: 'Foco em supino plano, remada curvada e press militar.',
        order: 1,
        exercises: [
          createExercise('barbell-bench-press', 1, defaultSets + 1),
          createExercise('barbell-bent-over-row', 2, defaultSets + 1),
          createExercise('overhead-barbell-press', 3),
          createExercise('lat-pulldown', 4),
          createExercise('tricep-rope-pushdown', 5),
          createExercise('barbell-bicep-curl', 6),
        ],
      },
      {
        id: `ul-l1-${Date.now()}`,
        name: 'Lower A (Inferior: Foco Quadríceps & Agachamento)',
        description: 'Agachamento às costas, flexoras e gémeos.',
        order: 2,
        exercises: [
          createExercise('barbell-back-squat', 1, defaultSets + 1),
          createExercise('romanian-deadlift', 2),
          createExercise('leg-press-45', 3),
          createExercise('seated-leg-curl', 4),
          createExercise('standing-calf-raise', 5),
        ],
      },
      {
        id: `ul-u2-${Date.now()}`,
        name: 'Upper B (Superior: Hipertrofia & Abertura)',
        description: 'Supino inclinado com halteres, elevações e deltoides.',
        order: 3,
        exercises: [
          createExercise('incline-dumbbell-press', 1),
          createExercise('pull-ups', 2),
          createExercise('cable-crossover', 3),
          createExercise('dumbbell-lateral-raise', 4),
          createExercise('dumbbell-incline-curl', 5),
          createExercise('skull-crushers', 6),
        ],
      },
      {
        id: `ul-l2-${Date.now()}`,
        name: 'Lower B (Inferior: Foco Glúteos & Posterior)',
        description: 'Hip thrust, peso morto romeno e pernas unilaterais.',
        order: 4,
        exercises: [
          createExercise('deadlift', 1, defaultSets),
          createExercise('barbell-hip-thrust', 2, defaultSets + 1),
          createExercise('bulgarian-split-squat', 3),
          createExercise('lying-leg-curl', 4),
          createExercise('seated-calf-raise', 5),
        ],
      },
    ];
  } else {
    // 5 OU 6 DIAS: PUSH / PULL / LEGS (PPL) OU ARNOLD SPLIT
    const isArnold = daysPerWeek >= 5 && goal === 'hypertrophy' && experience !== 'beginner';

    if (isArnold) {
      routineTitle = `Arnold Split — ${goalLabel} (${daysPerWeek}x Semana)`;
      routineDesc = `A lendária divisão do Arnold: Peito & Costas num dia, Ombros & Braços no seguinte, Pernas no terceiro. Volume monstruoso e pump inigualável.`;

      days = [
        {
          id: `arnold-1-${Date.now()}`,
          name: 'Dia 1: Peito & Costas (Superséries Antagonistas)',
          description: 'Abertura total da caixa torácica e densidade dorsal.',
          order: 1,
          exercises: [
            createExercise('barbell-bench-press', 1, 4),
            createExercise('barbell-bent-over-row', 2, 4),
            createExercise('incline-dumbbell-press', 3, 3),
            createExercise('lat-pulldown', 4, 3),
            createExercise('cable-crossover', 5, 3),
          ],
        },
        {
          id: `arnold-2-${Date.now()}`,
          name: 'Dia 2: Ombros & Braços (Bícep & Trícep)',
          description: 'Press militar, laterais, curl pesado e extensão de tríceps.',
          order: 2,
          exercises: [
            createExercise('overhead-barbell-press', 1, 4),
            createExercise('dumbbell-lateral-raise', 2, 4),
            createExercise('barbell-bicep-curl', 3, 3),
            createExercise('skull-crushers', 4, 3),
            createExercise('hammer-curl', 5, 3),
            createExercise('tricep-rope-pushdown', 6, 3),
          ],
        },
        {
          id: `arnold-3-${Date.now()}`,
          name: 'Dia 3: Pernas & Gémeos',
          description: 'Agachamento pesado, flexores e panturrilha.',
          order: 3,
          exercises: [
            createExercise('barbell-back-squat', 1, 4),
            createExercise('romanian-deadlift', 2, 4),
            createExercise('leg-press-45', 3, 3),
            createExercise('seated-leg-curl', 4, 3),
            createExercise('standing-calf-raise', 5, 4),
          ],
        },
        {
          id: `arnold-4-${Date.now()}`,
          name: 'Dia 4: Peito & Costas (Foco Isolamento)',
          description: 'Aberturas no cabo, elevações na barra fixa e remadas unilaterais.',
          order: 4,
          exercises: [
            createExercise('incline-dumbbell-press', 1, 4),
            createExercise('pull-ups', 2, 4),
            createExercise('seated-cable-row', 3, 3),
            createExercise('chest-dips', 4, 3),
          ],
        },
        {
          id: `arnold-5-${Date.now()}`,
          name: 'Dia 5: Ombros, Braços & Pernas Posterior',
          description: 'Laterais intensas, super braços e flexoras.',
          order: 5,
          exercises: [
            createExercise('seated-dumbbell-shoulder-press', 1, 4),
            createExercise('face-pulls', 2, 4),
            createExercise('barbell-hip-thrust', 3, 4),
            createExercise('dumbbell-incline-curl', 4, 3),
            createExercise('overhead-cable-tricep-extension', 5, 3),
          ],
        },
      ];
    } else {
      routineTitle = `PPL Pro (${daysPerWeek}x) — ${goalLabel}`;
      routineDesc = `A divisão Push/Pull/Legs profissional calibrada para ${daysPerWeek} sessões semanais. Ótimo estímulo por grupo muscular com volume semanal de 12 a 16 séries.`;

      days = [
        {
          id: `ppl-1-${Date.now()}`,
          name: 'Push A (Peito Pesado, Ombros & Tríceps)',
          description: 'Supino com barra, press militar e fundos.',
          order: 1,
          exercises: [
            createExercise('barbell-bench-press', 1, 4),
            createExercise('incline-dumbbell-press', 2, 3),
            createExercise('dumbbell-lateral-raise', 3, 4),
            createExercise('tricep-rope-pushdown', 4, 3),
            createExercise('chest-dips', 5, 3),
          ],
        },
        {
          id: `ppl-2-${Date.now()}`,
          name: 'Pull A (Costas Densidade, Bíceps & Posterior Ombro)',
          description: 'Remadas pesadas, puxadas e curls.',
          order: 2,
          exercises: [
            createExercise('barbell-bent-over-row', 1, 4),
            createExercise('lat-pulldown', 2, 4),
            createExercise('face-pulls', 3, 3),
            createExercise('barbell-bicep-curl', 4, 3),
            createExercise('hammer-curl', 5, 3),
          ],
        },
        {
          id: `ppl-3-${Date.now()}`,
          name: 'Legs A (Agachamento, Glúteos & Isquiotibiais)',
          description: 'Agachamento com barra, RDL e panturrilha.',
          order: 3,
          exercises: [
            createExercise('barbell-back-squat', 1, 4),
            createExercise('romanian-deadlift', 2, 4),
            createExercise('leg-press-45', 3, 3),
            createExercise('seated-leg-curl', 4, 3),
            createExercise('standing-calf-raise', 5, 4),
          ],
        },
        {
          id: `ppl-4-${Date.now()}`,
          name: 'Push B (Peito Superior, Ombros Laterais & Tríceps)',
          description: 'Foco na porção clavicular do peito e cabeça longa do tríceps.',
          order: 4,
          exercises: [
            createExercise('incline-dumbbell-press', 1, 4),
            createExercise('machine-chest-press', 2, 3),
            createExercise('dumbbell-lateral-raise', 3, 4),
            createExercise('skull-crushers', 4, 3),
            createExercise('overhead-cable-tricep-extension', 5, 3),
          ],
        },
        {
          id: `ppl-5-${Date.now()}`,
          name: 'Pull B (Largura de Dorsal & Bíceps)',
          description: 'Pull-ups, remada sentada no cabo e curls inclinados.',
          order: 5,
          exercises: [
            createExercise('pull-ups', 1, 4),
            createExercise('seated-cable-row', 2, 4),
            createExercise('lat-pullover-cable', 3, 3),
            createExercise('dumbbell-incline-curl', 4, 3),
            createExercise('ez-bar-preacher-curl', 5, 3),
          ],
        },
      ];
    }
  }

  const explanation = `Plano calibrado para ${params.weightKg} kg e ${params.heightCm} cm com foco em ${goalLabel}: ${defaultSets} séries de ${targetRepsMin}-${targetRepsMax} repetições com descansos de ${restSeconds}s para assegurar tensão mecânica ótima.`;

  return {
    routine: {
      id: `smart-routine-${Date.now()}`,
      userId: 'default-user',
      title: routineTitle,
      description: routineDesc,
      level: experience,
      daysPerWeek,
      isTemplate: false,
      days,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    recommendedRestSeconds: restSeconds,
    targetRepsRange: { min: targetRepsMin, max: targetRepsMax },
    targetSetsPerExercise: defaultSets,
    explanation,
  };
}
