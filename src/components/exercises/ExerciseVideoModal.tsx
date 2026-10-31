import React, { useState } from 'react';
import type { Exercise } from '../../types/exercise';
import {
  X,
  ExternalLink,
  Play,
  Pause,
  CheckCircle2,
  ArrowRightCircle,
  AlertOctagon,
  Film,
} from 'lucide-react';

interface ExerciseVideoModalProps {
  exercise: Exercise | null;
  isOpen: boolean;
  onClose: () => void;
}

// Base CDN global gratuita do jsDelivr com GIFs de execução contínua
const GIF_BASE_URL = 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0';

// Mapeamento direto dos 42 exercícios para GIFs animados fluidos (200-400KB cada)
export const EXERCISE_GIFS_MAP: Record<string, string> = {
  // Peito
  'barbell-bench-press': `${GIF_BASE_URL}/pectorals/barbell-bench-press.gif`,
  'incline-dumbbell-press': `${GIF_BASE_URL}/pectorals/dumbbell-incline-bench-press.gif`,
  'cable-crossover': `${GIF_BASE_URL}/pectorals/cable-middle-fly.gif`,
  'push-ups': `${GIF_BASE_URL}/pectorals/push-up.gif`,
  'chest-dips': `${GIF_BASE_URL}/pectorals/chest-dip.gif`,
  'machine-chest-press': `${GIF_BASE_URL}/pectorals/lever-chest-press.gif`,

  // Costas
  'lat-pulldown': `${GIF_BASE_URL}/lats/cable-pulldown.gif`,
  'barbell-bent-over-row': `${GIF_BASE_URL}/upper-back/barbell-bent-over-row.gif`,
  'pull-ups': `${GIF_BASE_URL}/lats/pull-up.gif`,
  'seated-cable-row': `${GIF_BASE_URL}/upper-back/cable-seated-row.gif`,
  'one-arm-dumbbell-row': `${GIF_BASE_URL}/upper-back/dumbbell-one-arm-bent-over-row.gif`,
  'deadlift': `${GIF_BASE_URL}/glutes/barbell-deadlift.gif`,
  'lat-pullover-cable': `${GIF_BASE_URL}/lats/cable-straight-arm-pulldown.gif`,

  // Ombros
  'overhead-barbell-press': `${GIF_BASE_URL}/delts/barbell-standing-wide-military-press.gif`,
  'dumbbell-lateral-raise': `${GIF_BASE_URL}/delts/dumbbell-lateral-raise.gif`,
  'seated-dumbbell-shoulder-press': `${GIF_BASE_URL}/delts/dumbbell-seated-shoulder-press.gif`,
  'face-pulls': `${GIF_BASE_URL}/delts/cable-standing-rear-delt-row-with-rope.gif`,

  // Bicípites & Antebraços
  'barbell-bicep-curl': `${GIF_BASE_URL}/biceps/barbell-curl.gif`,
  'dumbbell-incline-curl': `${GIF_BASE_URL}/biceps/dumbbell-incline-biceps-curl.gif`,
  'hammer-curl': `${GIF_BASE_URL}/biceps/dumbbell-hammer-curl.gif`,
  'ez-bar-preacher-curl': `${GIF_BASE_URL}/biceps/barbell-preacher-curl.gif`,
  'wrist-curl': `${GIF_BASE_URL}/forearms/barbell-wrist-curl.gif`,

  // Tricípites
  'tricep-rope-pushdown': `${GIF_BASE_URL}/triceps/cable-pushdown.gif`,
  'skull-crushers': `${GIF_BASE_URL}/triceps/barbell-lying-triceps-extension.gif`,
  'overhead-cable-tricep-extension': `${GIF_BASE_URL}/triceps/cable-overhead-triceps-extension-rope-attachment.gif`,

  // Abdominais & Core
  'hanging-leg-raise': `${GIF_BASE_URL}/abs/hanging-straight-leg-raise.gif`,
  'cable-woodchopper': `${GIF_BASE_URL}/abs/cable-twist.gif`,
  'plank': `${GIF_BASE_URL}/abs/weighted-front-plank.gif`,
  'ab-wheel-rollout': `${GIF_BASE_URL}/abs/wheel-rollerout.gif`,

  // Glúteos & Pernas
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
  const [isGifFrozen, setIsGifFrozen] = useState(false);
  const [gifLoadFailed, setGifLoadFailed] = useState(false);

  if (!isOpen || !exercise) return null;

  const gifUrl = EXERCISE_GIFS_MAP[exercise.id];
  const directVideoId = EXERCISE_YOUTUBE_MAP[exercise.id];

  // URL para abrir diretamente na aplicação do YouTube sem qualquer bloqueio
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
      <div className="bg-[#111114] border border-white/[0.1] rounded-2xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-scale-up">
        {/* Cabeçalho */}
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
                Demonstração em GIF Animado & Biomecânica
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

        {/* Conteúdo Principal */}
        <div className="overflow-y-auto flex-1 p-4 space-y-4">
          {/* DISPLAY DO GIF ANIMADO EM LOOP CONTÍNUO */}
          <div className="space-y-3">
            <div className="relative w-full aspect-square sm:aspect-[4/3] bg-white rounded-xl overflow-hidden border border-white/[0.1] flex items-center justify-center shadow-inner">
              {gifUrl && !gifLoadFailed ? (
                <img
                  key={gifUrl + (isGifFrozen ? '-frozen' : '')}
                  src={gifUrl}
                  alt={`Execução de ${exercise.namePt}`}
                  onError={() => setGifLoadFailed(true)}
                  className="w-full h-full object-contain p-1"
                />
              ) : (
                <div className="text-center p-6 text-slate-700 text-xs flex flex-col items-center gap-2">
                  <Film size={28} className="text-slate-500" />
                  <span>Demonstração animada a carregar...</span>
                </div>
              )}

              {/* Badge Dinâmica de Animação Ativa */}
              <div className="absolute top-2.5 left-2.5 bg-black/80 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1.5 shadow">
                <span className="w-2 h-2 rounded-full bg-lime-400 animate-ping" />
                <span className="text-slate-200">GIF Animado</span>
              </div>

              {/* Botão de Pausa / Recarregar */}
              <button
                type="button"
                onClick={() => setIsGifFrozen(!isGifFrozen)}
                className="absolute bottom-2.5 right-2.5 bg-black/80 hover:bg-black text-slate-200 backdrop-blur-md border border-white/15 px-2.5 py-1 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-all"
              >
                {isGifFrozen ? <Play size={11} className="fill-current" /> : <Pause size={11} />}
                <span>{isGifFrozen ? 'Reproduzir' : 'Congelar'}</span>
              </button>
            </div>

            {/* Atalho para Abrir Vídeo no YouTube (Sem bloqueios de embed) */}
            <a
              href={youtubeDirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-3 bg-red-600/15 hover:bg-red-600/25 border border-red-500/30 text-red-300 hover:text-red-200 rounded-xl text-xs font-bold flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-red-600 text-white flex items-center justify-center shrink-0">
                  <Play size={12} className="fill-current ml-0.5" />
                </span>
                <span>Ver Vídeo com Áudio na App do YouTube</span>
              </div>
              <ExternalLink size={14} className="text-red-400 group-hover:translate-x-0.5 transition-transform" />
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
            <ExternalLink size={13} /> YouTube Oficial
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