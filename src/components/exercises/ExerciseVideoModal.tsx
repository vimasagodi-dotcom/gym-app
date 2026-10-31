import React, { useState, useEffect } from 'react';
import type { Exercise } from '../../types/exercise';
import {
  X,
  ExternalLink,
  Play,
  Pause,
  CheckCircle2,
  ArrowRightCircle,
  AlertOctagon,
  Sparkles,
  Camera,
} from 'lucide-react';

interface ExerciseVideoModalProps {
  exercise: Exercise | null;
  isOpen: boolean;
  onClose: () => void;
}

// Base CDN com GIFs de animação contínua
const GIF_BASE_URL = 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0';

// Mapeamento de GIFs animados fluidos
export const EXERCISE_GIFS_MAP: Record<string, string> = {
  'barbell-bench-press': `${GIF_BASE_URL}/pectorals/barbell-bench-press.gif`,
  'incline-dumbbell-press': `${GIF_BASE_URL}/pectorals/dumbbell-incline-bench-press.gif`,
  'cable-crossover': `${GIF_BASE_URL}/pectorals/cable-middle-fly.gif`,
  'push-ups': `${GIF_BASE_URL}/pectorals/push-up.gif`,
  'chest-dips': `${GIF_BASE_URL}/pectorals/chest-dip.gif`,
  'machine-chest-press': `${GIF_BASE_URL}/pectorals/lever-chest-press.gif`,
  'lat-pulldown': `${GIF_BASE_URL}/lats/cable-pulldown.gif`,
  'barbell-bent-over-row': `${GIF_BASE_URL}/upper-back/barbell-bent-over-row.gif`,
  'pull-ups': `${GIF_BASE_URL}/lats/pull-up.gif`,
  'seated-cable-row': `${GIF_BASE_URL}/upper-back/cable-seated-row.gif`,
  'one-arm-dumbbell-row': `${GIF_BASE_URL}/upper-back/dumbbell-one-arm-bent-over-row.gif`,
  'deadlift': `${GIF_BASE_URL}/glutes/barbell-deadlift.gif`,
  'lat-pullover-cable': `${GIF_BASE_URL}/lats/cable-straight-arm-pulldown.gif`,
  'overhead-barbell-press': `${GIF_BASE_URL}/delts/barbell-standing-wide-military-press.gif`,
  'dumbbell-lateral-raise': `${GIF_BASE_URL}/delts/dumbbell-lateral-raise.gif`,
  'seated-dumbbell-shoulder-press': `${GIF_BASE_URL}/delts/dumbbell-seated-shoulder-press.gif`,
  'face-pulls': `${GIF_BASE_URL}/delts/cable-standing-rear-delt-row-with-rope.gif`,
  'barbell-bicep-curl': `${GIF_BASE_URL}/biceps/barbell-curl.gif`,
  'dumbbell-incline-curl': `${GIF_BASE_URL}/biceps/dumbbell-incline-biceps-curl.gif`,
  'hammer-curl': `${GIF_BASE_URL}/biceps/dumbbell-hammer-curl.gif`,
  'ez-bar-preacher-curl': `${GIF_BASE_URL}/biceps/barbell-preacher-curl.gif`,
  'wrist-curl': `${GIF_BASE_URL}/forearms/barbell-wrist-curl.gif`,
  'tricep-rope-pushdown': `${GIF_BASE_URL}/triceps/cable-pushdown.gif`,
  'skull-crushers': `${GIF_BASE_URL}/triceps/barbell-lying-triceps-extension.gif`,
  'overhead-cable-tricep-extension': `${GIF_BASE_URL}/triceps/cable-overhead-triceps-extension-rope-attachment.gif`,
  'hanging-leg-raise': `${GIF_BASE_URL}/abs/hanging-straight-leg-raise.gif`,
  'cable-woodchopper': `${GIF_BASE_URL}/abs/cable-twist.gif`,
  'plank': `${GIF_BASE_URL}/abs/weighted-front-plank.gif`,
  'ab-wheel-rollout': `${GIF_BASE_URL}/abs/wheel-rollerout.gif`,
  'barbell-hip-thrust': `${GIF_BASE_URL}/glutes/barbell-glute-bridge-two-legs-on-bench-male.gif`,
  'cable-glute-kickback': `${GIF_BASE_URL}/glutes/cable-standing-hip-extension.gif`,
  'bulgarian-split-squat': `${GIF_BASE_URL}/quads/barbell-single-leg-split-squat.gif`,
  'barbell-back-squat': `${GIF_BASE_URL}/quads/barbell-wide-squat.gif`,
  'leg-press-45': `${GIF_BASE_URL}/glutes/lever-horizontal-one-leg-press.gif`,
  'leg-extension': `${GIF_BASE_URL}/quads/lever-leg-extension.gif`,
  'goblet-squat': `${GIF_BASE_URL}/quads/dumbbell-goblet-squat.gif`,
  'romanian-deadlift': `${GIF_BASE_URL}/glutes/barbell-romanian-deadlift.gif`,
  'seated-leg-curl': `${GIF_BASE_URL}/hamstrings/lever-seated-leg-curl.gif`,
  'lying-leg-curl': `${GIF_BASE_URL}/hamstrings/lever-lying-leg-curl.gif`,
  'standing-calf-raise': `${GIF_BASE_URL}/calves/barbell-standing-calf-raise.gif`,
  'seated-calf-raise': `${GIF_BASE_URL}/calves/lever-seated-calf-raise.gif`,
  'dumbbell-lunges': `${GIF_BASE_URL}/glutes/dumbbell-lunge.gif`,
};

// Base com fotografias reais HD de ginásio
const PHOTO_BASE_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';

export const EXERCISE_PHOTOS_MAP: Record<string, [string, string]> = {
  'barbell-bench-press': ['Barbell_Bench_Press_-_Medium_Grip/0.jpg', 'Barbell_Bench_Press_-_Medium_Grip/1.jpg'],
  'incline-dumbbell-press': ['Incline_Dumbbell_Press/0.jpg', 'Incline_Dumbbell_Press/1.jpg'],
  'cable-crossover': ['Cable_Crossover/0.jpg', 'Cable_Crossover/1.jpg'],
  'push-ups': ['Pushups/0.jpg', 'Pushups/1.jpg'],
  'chest-dips': ['Dips_-_Chest_Version/0.jpg', 'Dips_-_Chest_Version/1.jpg'],
  'lat-pulldown': ['Wide-Grip_Lat_Pulldown/0.jpg', 'Wide-Grip_Lat_Pulldown/1.jpg'],
  'barbell-bent-over-row': ['Bent_Over_Barbell_Row/0.jpg', 'Bent_Over_Barbell_Row/1.jpg'],
  'pull-ups': ['Pullups/0.jpg', 'Pullups/1.jpg'],
  'seated-cable-row': ['Seated_Cable_Rows/0.jpg', 'Seated_Cable_Rows/1.jpg'],
  'one-arm-dumbbell-row': ['One-Arm_Dumbbell_Row/0.jpg', 'One-Arm_Dumbbell_Row/1.jpg'],
  'deadlift': ['Barbell_Deadlift/0.jpg', 'Barbell_Deadlift/1.jpg'],
  'overhead-barbell-press': ['Standing_Military_Press/0.jpg', 'Standing_Military_Press/1.jpg'],
  'dumbbell-lateral-raise': ['Side_Lateral_Raise/0.jpg', 'Side_Lateral_Raise/1.jpg'],
  'seated-dumbbell-shoulder-press': ['Dumbbell_Shoulder_Press/0.jpg', 'Dumbbell_Shoulder_Press/1.jpg'],
  'face-pulls': ['Face_Pull/0.jpg', 'Face_Pull/1.jpg'],
  'barbell-bicep-curl': ['Barbell_Curl/0.jpg', 'Barbell_Curl/1.jpg'],
  'dumbbell-incline-curl': ['Incline_Dumbbell_Curl/0.jpg', 'Incline_Dumbbell_Curl/1.jpg'],
  'hammer-curl': ['Hammer_Curls/0.jpg', 'Hammer_Curls/1.jpg'],
  'tricep-rope-pushdown': ['Triceps_Pushdown_-_Rope_Attachment/0.jpg', 'Triceps_Pushdown_-_Rope_Attachment/1.jpg'],
  'skull-crushers': ['Lying_Triceps_Press/0.jpg', 'Lying_Triceps_Press/1.jpg'],
  'overhead-cable-tricep-extension': ['Standing_Overhead_Barbell_Triceps_Extension/0.jpg', 'Standing_Overhead_Barbell_Triceps_Extension/1.jpg'],
  'wrist-curl': ['Palms-Up_Barbell_Wrist_Curl_Over_A_Bench/0.jpg', 'Palms-Up_Barbell_Wrist_Curl_Over_A_Bench/1.jpg'],
  'hanging-leg-raise': ['Hanging_Leg_Raise/0.jpg', 'Hanging_Leg_Raise/1.jpg'],
  'cable-woodchopper': ['Standing_Cable_Wood_Chop/0.jpg', 'Standing_Cable_Wood_Chop/1.jpg'],
  'plank': ['Plank/0.jpg', 'Plank/1.jpg'],
  'ab-wheel-rollout': ['Ab_Roller/0.jpg', 'Ab_Roller/1.jpg'],
  'barbell-hip-thrust': ['Barbell_Glute_Bridge/0.jpg', 'Barbell_Glute_Bridge/1.jpg'],
  'cable-glute-kickback': ['Glute_Kickback/0.jpg', 'Glute_Kickback/1.jpg'],
  'bulgarian-split-squat': ['Split_Squat_with_Dumbbells/0.jpg', 'Split_Squat_with_Dumbbells/1.jpg'],
  'barbell-back-squat': ['Barbell_Full_Squat/0.jpg', 'Barbell_Full_Squat/1.jpg'],
  'leg-press-45': ['Leg_Press/0.jpg', 'Leg_Press/1.jpg'],
  'leg-extension': ['Leg_Extensions/0.jpg', 'Leg_Extensions/1.jpg'],
  'goblet-squat': ['Goblet_Squat/0.jpg', 'Goblet_Squat/1.jpg'],
  'romanian-deadlift': ['Romanian_Deadlift/0.jpg', 'Romanian_Deadlift/1.jpg'],
  'seated-leg-curl': ['Seated_Leg_Curl/0.jpg', 'Seated_Leg_Curl/1.jpg'],
  'lying-leg-curl': ['Lying_Leg_Curls/0.jpg', 'Lying_Leg_Curls/1.jpg'],
  'standing-calf-raise': ['Standing_Calf_Raises/0.jpg', 'Standing_Calf_Raises/1.jpg'],
  'seated-calf-raise': ['Seated_Calf_Raise/0.jpg', 'Seated_Calf_Raise/1.jpg'],
  'dumbbell-lunges': ['Dumbbell_Lunges/0.jpg', 'Dumbbell_Lunges/1.jpg'],
  'ez-bar-preacher-curl': ['Preacher_Curl/0.jpg', 'Preacher_Curl/1.jpg'],
  'machine-chest-press': ['Leverage_Chest_Press/0.jpg', 'Leverage_Chest_Press/1.jpg'],
  'lat-pullover-cable': ['Straight-Arm_Pulldown/0.jpg', 'Straight-Arm_Pulldown/1.jpg'],
};

// IDs de vídeos no YouTube para abrir na app oficial
export const EXERCISE_YOUTUBE_MAP: Record<string, string> = {
  'barbell-bench-press': 'rT7DgCr-3pg',
  'incline-dumbbell-press': '8iPEnn-ltC8',
  'cable-crossover': 'taI4XduLpOk',
  'push-ups': 'IODxDxX7oi4',
  'chest-dips': '2z8JmcrW-As',
  'machine-chest-press': 'sqOw22EiAzs',
  'lat-pulldown': 'CAwf7n6Luuc',
  'barbell-bent-over-row': 'FWJR5Ve8gkQ',
  'pull-ups': 'eGo4IYlbE5g',
  'seated-cable-row': 'GZbfZ033f74',
  'one-arm-dumbbell-row': 'pYcpY20QaE8',
  'deadlift': 'op9kVnSso6Q',
  'lat-pullover-cable': 'r3JkvdVbJ5w',
  'overhead-barbell-press': '2yjwXTZQDDI',
  'dumbbell-lateral-raise': '3VcKaXpzqRo',
  'seated-dumbbell-shoulder-press': 'qEwKCR5JCog',
  'face-pulls': 'rep-qVOkqgk',
  'barbell-bicep-curl': 'ykJmrZ5v0Oo',
  'dumbbell-incline-curl': 'soxrZlIl35U',
  'hammer-curl': 'zC3nLlEvin4',
  'ez-bar-preacher-curl': 'fIWP-FRFNU0',
  'wrist-curl': '3Vdc74mUPn0',
  'tricep-rope-pushdown': 'vB5OHsJ3EME',
  'skull-crushers': 'd_KZxkY_0aw',
  'overhead-cable-tricep-extension': 'ns-RGsbYeKA',
  'hanging-leg-raise': 'hdng3Nm1x_E',
  'cable-woodchopper': 'pZapR5fbcsc',
  'plank': 'ASdvN_XEl_c',
  'ab-wheel-rollout': 'rqiTPdK1cWg',
  'barbell-hip-thrust': 'SEdqd1n0cvg',
  'cable-glute-kickback': 'NLdeg_g29n4',
  'bulgarian-split-squat': '2C-uNgKwPLE',
  'barbell-back-squat': 'bEv6CCg2BC8',
  'leg-press-45': 'IZxyjW7MPJQ',
  'leg-extension': 'YyvSfV-77S4',
  'goblet-squat': 'MeIiIdtwXT4',
  'romanian-deadlift': 'JCXUYuzwNrM',
  'seated-leg-curl': '1Tq3QdYUuHs',
  'lying-leg-curl': 'ELOCsoDSmrg',
  'standing-calf-raise': '-M4-G8p8fmc',
  'seated-calf-raise': 'JbyjNymZOt0',
  'dumbbell-lunges': 'D7KaRcUTQeE',
};

export const ExerciseVideoModal: React.FC<ExerciseVideoModalProps> = ({
  exercise,
  isOpen,
  onClose,
}) => {
  const [viewMode, setViewMode] = useState<'gif' | 'photo'>('gif');
  const [isPaused, setIsPaused] = useState(false);
  const [photoStep, setPhotoStep] = useState<0 | 1>(0);

  // Ciclo automático para o modo de fotografia real
  useEffect(() => {
    if (!isOpen || viewMode !== 'photo' || isPaused) return;

    const interval = setInterval(() => {
      setPhotoStep((prev) => (prev === 0 ? 1 : 0));
    }, 1200);

    return () => clearInterval(interval);
  }, [isOpen, viewMode, isPaused]);

  if (!isOpen || !exercise) return null;

  const gifUrl = EXERCISE_GIFS_MAP[exercise.id];
  const photos = EXERCISE_PHOTOS_MAP[exercise.id];
  const directVideoId = EXERCISE_YOUTUBE_MAP[exercise.id];

  const currentPhotoUrl = photos ? `${PHOTO_BASE_URL}${photos[photoStep]}` : null;

  const youtubeDirectUrl = directVideoId
    ? `https://www.youtube.com/watch?v=${directVideoId}`
    : `https://www.youtube.com/results?search_query=${encodeURIComponent(
        `${exercise.namePt} execucao tecnica correta`
      )}`;

  // Divide as instruções em 3 fases táticas
  const fullInstructions = exercise.instructionsPt || '';
  const sentences = fullInstructions.split('. ').filter(Boolean);
  const setupPhase =
    sentences.slice(0, 2).join('. ') +
    (sentences.length > 0 && !sentences.slice(0, 2).join('. ').endsWith('.') ? '.' : '');
  const executionPhase = sentences.slice(2).join('. ') || setupPhase;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-fade-in">
      <div className="bg-[#111114] border border-white/[0.1] rounded-2xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-scale-up">
        {/* Cabeçalho Onyx */}
        <div className="p-3.5 sm:p-4 border-b border-white/[0.08] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-8 h-8 rounded-lg bg-lime-400/15 text-lime-400 flex items-center justify-center shrink-0">
              <Play size={16} className="fill-current ml-0.5" />
            </span>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-slate-100 truncate">
                {exercise.namePt}
              </h2>
              <span className="text-[11px] text-slate-400 truncate block">
                Demonstração Técnica Visual & Biomecânica
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-white/[0.08] rounded-lg transition-colors shrink-0"
            title="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Seletor de Modo de Visualização (GIF Animado vs Fotografia Real HD) */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06] bg-[#0d0d10] shrink-0 text-xs">
          <div className="flex items-center gap-1.5 bg-[#18181c] p-0.5 rounded-lg border border-white/[0.08]">
            <button
              type="button"
              onClick={() => setViewMode('gif')}
              className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1.5 ${
                viewMode === 'gif'
                  ? 'bg-lime-400 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles size={12} />
              <span>Animação 3D</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('photo')}
              className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1.5 ${
                viewMode === 'photo'
                  ? 'bg-lime-400 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Camera size={12} />
              <span>Fotos Reais HD</span>
            </button>
          </div>

          {/* Indicador de Status / Pausa */}
          <button
            type="button"
            onClick={() => setIsPaused(!isPaused)}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-lime-400 transition-colors py-1 px-2 rounded-md hover:bg-white/[0.04]"
          >
            {isPaused ? <Play size={12} className="fill-current" /> : <Pause size={12} />}
            <span>{isPaused ? 'Reproduzir' : 'Pausar'}</span>
          </button>
        </div>

        {/* Conteúdo Principal com Barra de Rolagem */}
        <div className="overflow-y-auto flex-1 p-4 space-y-4">
          {/* MOLDURA STUDIO ONYX PARA A DEMONSTRAÇÃO */}
          <div className="space-y-3">
            <div className="relative w-full aspect-[4/3] bg-gradient-to-b from-[#18181c] via-[#121216] to-[#0a0a0c] rounded-2xl overflow-hidden border border-white/[0.1] shadow-2xl flex items-center justify-center p-3 group">
              {/* Ecrã de Imagem Interno com cantos arredondados e acabamento de estúdio */}
              <div className="relative w-full h-full rounded-xl overflow-hidden bg-white/95 flex items-center justify-center shadow-lg border border-black/10">
                {viewMode === 'gif' ? (
                  gifUrl ? (
                    <img
                      key={gifUrl + (isPaused ? '-paused' : '')}
                      src={gifUrl}
                      alt={`Animação de ${exercise.namePt}`}
                      className="w-full h-full object-contain p-2"
                    />
                  ) : (
                    <div className="text-slate-600 text-xs">Animação não disponível</div>
                  )
                ) : (
                  currentPhotoUrl && (
                    <img
                      key={currentPhotoUrl}
                      src={currentPhotoUrl}
                      alt={`Foto real de ${exercise.namePt}`}
                      className="w-full h-full object-contain transition-opacity duration-300"
                    />
                  )
                )}

                {/* Badge Flutuante no Canto Superior Esquerdo */}
                <div className="absolute top-2.5 left-2.5 bg-black/80 backdrop-blur-md border border-white/15 px-2.5 py-1 rounded-md text-[10px] font-bold text-slate-200 flex items-center gap-1.5 shadow">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isPaused ? 'bg-amber-400' : 'bg-lime-400 animate-pulse'
                    }`}
                  />
                  <span>
                    {viewMode === 'gif'
                      ? isPaused
                        ? 'Movimento Pausado'
                        : 'Loop Contínuo 3D'
                      : photoStep === 0
                      ? '1. Posição Inicial'
                      : '2. Contração Máxima'}
                  </span>
                </div>

                {/* Seletor Manual de Fase no Modo Foto */}
                {viewMode === 'photo' && (
                  <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 bg-black/80 backdrop-blur-md border border-white/15 p-0.5 rounded-lg">
                    <button
                      type="button"
                      onClick={() => {
                        setIsPaused(true);
                        setPhotoStep(0);
                      }}
                      className={`px-2 py-0.5 text-[9px] font-bold rounded ${
                        photoStep === 0
                          ? 'bg-lime-400 text-black'
                          : 'text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      Início
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsPaused(true);
                        setPhotoStep(1);
                      }}
                      className={`px-2 py-0.5 text-[9px] font-bold rounded ${
                        photoStep === 1
                          ? 'bg-lime-400 text-black'
                          : 'text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      Pico
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Cartão de Acesso Direto ao YouTube com Áudio e Explicação Humana */}
            <a
              href={youtubeDirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-3 bg-[#18181c] hover:bg-[#202026] border border-white/[0.08] hover:border-lime-400/40 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-between transition-all group shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-md bg-red-600/90 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Play size={12} className="fill-current ml-0.5" />
                </span>
                <div>
                  <div className="font-bold text-slate-100 text-[11px] group-hover:text-lime-400 transition-colors">
                    Ver Tutorial em Vídeo Completo (YouTube)
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Abre na aplicação com áudio e instruções de treinador
                  </div>
                </div>
              </div>
              <ExternalLink size={14} className="text-slate-400 group-hover:text-lime-400 group-hover:translate-x-0.5 transition-all" />
            </a>
          </div>

          {/* Guia Biomecânico em 3 Fases Táticas */}
          <div className="space-y-2.5 pt-1">
            {/* Fase 1: Posicionamento */}
            <div className="bg-[#18181c] border border-emerald-500/25 rounded-xl p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 uppercase tracking-wide">
                <CheckCircle2 size={14} className="shrink-0" />
                <span>1. Posicionamento Inicial</span>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed pl-5">
                {setupPhase || 'Posiciona os pés e a postura de forma firme antes de iniciar o movimento.'}
              </p>
            </div>

            {/* Fase 2: Execução */}
            <div className="bg-[#18181c] border border-sky-500/25 rounded-xl p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-sky-400 uppercase tracking-wide">
                <ArrowRightCircle size={14} className="shrink-0" />
                <span>2. Trajetória & Controlo</span>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed pl-5">
                {executionPhase || 'Controla a descida (fase excêntrica) e foca na contração máxima do músculo alvo.'}
              </p>
            </div>

            {/* Fase 3: Erros Críticos */}
            {exercise.tips && exercise.tips.length > 0 && (
              <div className="bg-[#18181c] border border-rose-500/25 rounded-xl p-3 space-y-1.5">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-rose-400 uppercase tracking-wide">
                  <AlertOctagon size={14} className="shrink-0" />
                  <span>3. Erros Críticos a Evitar</span>
                </div>
                <ul className="space-y-1 pl-5">
                  {exercise.tips.map((tip, i) => (
                    <li key={i} className="text-slate-300 text-xs flex items-start gap-1.5">
                      <span className="text-rose-400 font-bold">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Rodapé com botão de fecho */}
        <div className="p-3 border-t border-white/[0.08] flex items-center justify-between bg-[#09090b]/80 shrink-0">
          <a
            href={youtubeDirectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-slate-400 hover:text-lime-400 flex items-center gap-1.5 py-1 px-2 rounded-lg transition-colors"
          >
            <ExternalLink size={13} /> Abrir YouTube
          </a>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-lime-400 hover:bg-lime-300 active:scale-95 text-slate-950 text-xs font-bold rounded-lg transition-all"
          >
            Voltar ao Treino
          </button>
        </div>
      </div>
    </div>
  );
};