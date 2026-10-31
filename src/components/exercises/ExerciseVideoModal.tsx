import React, { useState } from 'react';
import type { Exercise } from '../../types/exercise';
import { X, ExternalLink, Play, CheckCircle2, ArrowRightCircle, AlertOctagon, RefreshCw } from 'lucide-react';

interface ExerciseVideoModalProps {
  exercise: Exercise | null;
  isOpen: boolean;
  onClose: () => void;
}

// Mapeamento direto de vídeos tutoriais curados de alta qualidade no YouTube (IDs diretos)
export const EXERCISE_YOUTUBE_MAP: Record<string, string> = {
  // Peito
  'barbell-bench-press': 'rT7DgCr-3pg',
  'incline-dumbbell-press': '8iPEnn-ltC8',
  'cable-crossover': 'taI4XduLpOk',
  'push-ups': 'IODxDxX7oi4',
  'chest-dips': '2z8JmcrW-As',
  'machine-chest-press': 'sqOw22EiAzs',

  // Costas
  'lat-pulldown': 'CAwf7n6Luuc',
  'barbell-bent-over-row': 'FWJR5Ve8gkQ',
  'pull-ups': 'eGo4IYlbE5g',
  'seated-cable-row': 'GZbfZ033f74',
  'one-arm-dumbbell-row': 'pYcpY20QaE8',
  'deadlift': 'op9kVnSso6Q',
  'lat-pullover-cable': 'r3JkvdVbJ5w',

  // Ombros
  'overhead-barbell-press': '2yjwXTZQDDI',
  'dumbbell-lateral-raise': '3VcKaXpzqRo',
  'seated-dumbbell-shoulder-press': 'qEwKCR5JCog',
  'face-pulls': 'rep-qVOkqgk',

  // Bicípites & Antebraços
  'barbell-bicep-curl': 'ykJmrZ5v0Oo',
  'dumbbell-incline-curl': 'soxrZlIl35U',
  'hammer-curl': 'zC3nLlEvin4',
  'ez-bar-preacher-curl': 'fIWP-FRFNU0',
  'wrist-curl': '3Vdc74mUPn0',

  // Tricípites
  'tricep-rope-pushdown': 'vB5OHsJ3EME',
  'skull-crushers': 'd_KZxkY_0aw',
  'overhead-cable-tricep-extension': 'ns-RGsbYeKA',

  // Abdominais & Core
  'hanging-leg-raise': 'hdng3Nm1x_E',
  'cable-woodchopper': 'pZapR5fbcsc',
  'plank': 'ASdvN_XEl_c',
  'ab-wheel-rollout': 'rqiTPdK1cWg',

  // Glúteos & Pernas
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
  const [iframeLoaded, setIframeLoaded] = useState(false);

  if (!isOpen || !exercise) return null;

  const directVideoId = EXERCISE_YOUTUBE_MAP[exercise.id];

  // URL para incorporação no player No-Cookie
  const embedUrl = directVideoId
    ? `https://www.youtube-nocookie.com/embed/${directVideoId}?autoplay=1&mute=1&playsinline=1&rel=0&modestbranding=1`
    : `https://www.youtube-nocookie.com/embed?listType=search&list=${encodeURIComponent(
        `${exercise.name} technique form guide`
      )}&autoplay=1&mute=1`;

  // URL direta para abrir na aplicação ou site do YouTube
  const youtubeDirectUrl = directVideoId
    ? `https://www.youtube.com/watch?v=${directVideoId}`
    : `https://www.youtube.com/results?search_query=${encodeURIComponent(
        `${exercise.namePt} como fazer execucao tecnica correta`
      )}`;

  // Divide as instruções em fases biomecânicas
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
                Demonstração em Vídeo & Guia Biomecânico
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

        {/* Player de Vídeo Responsivo (16:9) */}
        <div className="relative w-full aspect-video bg-black shrink-0 overflow-hidden group">
          {!iframeLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0c] text-slate-400 text-xs gap-2">
              <RefreshCw size={16} className="animate-spin text-lime-400" />
              <span>A carregar vídeo demonstrativo...</span>
            </div>
          )}

          <iframe
            src={embedUrl}
            title={`Demonstração de ${exercise.namePt}`}
            className="w-full h-full border-0 relative z-10"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onLoad={() => setIframeLoaded(true)}
          />

          {/* Atalho flutuante para abrir diretamente na app do YouTube */}
          <a
            href={youtubeDirectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-2 right-2 z-20 px-2.5 py-1 bg-black/75 hover:bg-black/95 text-slate-200 text-[11px] font-semibold rounded-md border border-white/20 backdrop-blur-sm flex items-center gap-1.5 transition-all shadow"
            title="Abrir no YouTube em ecrã inteiro"
          >
            <ExternalLink size={12} />
            <span>YouTube</span>
          </a>
        </div>

        {/* Guia Biomecânico em 3 Fases Táticas */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1 text-xs">
          {/* Fase 1: Posição Inicial & Pega */}
          <div className="bg-[#18181c] border border-emerald-500/25 rounded-xl p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 uppercase tracking-wide">
              <CheckCircle2 size={14} className="shrink-0" />
              <span>1. Posicionamento Inicial</span>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed pl-5">
              {setupPhase || 'Posiciona os pés e a postura de forma firme antes de iniciar o movimento.'}
            </p>
          </div>

          {/* Fase 2: Execução & Trajetória */}
          <div className="bg-[#18181c] border border-sky-500/25 rounded-xl p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-sky-400 uppercase tracking-wide">
              <ArrowRightCircle size={14} className="shrink-0" />
              <span>2. Trajetória & Controlo</span>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed pl-5">
              {executionPhase || 'Controla a descida (fase excêntrica) e foca na contração máxima do músculo alvo.'}
            </p>
          </div>

          {/* Fase 3: Erros Críticos a Evitar */}
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

        {/* Rodapé com atalho e fecho */}
        <div className="p-3 border-t border-white/[0.08] flex items-center justify-between bg-[#09090b]/80 shrink-0">
          <a
            href={youtubeDirectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-slate-400 hover:text-lime-400 flex items-center gap-1.5 py-1 px-2 rounded-lg transition-colors"
          >
            <ExternalLink size={13} /> Ver na app YouTube
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