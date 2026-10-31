import React from 'react';
import type { Exercise } from '../../types/exercise';
import { X, ExternalLink, Play, CheckCircle2, ArrowRightCircle, AlertOctagon } from 'lucide-react';

interface ExerciseVideoModalProps {
  exercise: Exercise | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ExerciseVideoModal: React.FC<ExerciseVideoModalProps> = ({
  exercise,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !exercise) return null;

  // Query otimizada para o YouTube
  const searchQuery = encodeURIComponent(`${exercise.name} exercise form technique`);
  const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
    `${exercise.namePt} como fazer execucao tecnica correta`
  )}`;

  // Iframe de demonstração direta no YouTube No-Cookie
  const embedUrl = `https://www.youtube-nocookie.com/embed?listType=search&list=${searchQuery}&autoplay=1&mute=1`;

  // Divide as instruções em fases (Posicionamento e Movimento)
  const fullInstructions = exercise.instructionsPt || '';
  const sentences = fullInstructions.split('. ').filter(Boolean);
  const setupPhase = sentences.slice(0, 2).join('. ') + (sentences.length > 0 && !sentences.slice(0, 2).join('. ').endsWith('.') ? '.' : '');
  const executionPhase = sentences.slice(2).join('. ') || setupPhase;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-fade-in">
      <div className="bg-[#111114] border border-white/[0.1] rounded-2xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-scale-up">
        {/* Cabeçalho */}
        <div className="p-3.5 sm:p-4 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
              <Play size={16} className="fill-current ml-0.5" />
            </span>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-slate-100 truncate">
                {exercise.namePt}
              </h2>
              <span className="text-[11px] text-slate-400 truncate block">
                Demonstração Técnica & Biomecânica
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
        <div className="relative w-full aspect-video bg-black shrink-0">
          <iframe
            src={embedUrl}
            title={`Demonstração de ${exercise.namePt}`}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* Guia Visual em 3 Fases Táticas */}
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

        {/* Rodapé com atalho para a app oficial do YouTube */}
        <div className="p-3 border-t border-white/[0.08] flex items-center justify-between bg-[#09090b]/80 shrink-0">
          <a
            href={youtubeSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1.5 py-1 px-2 rounded-lg transition-colors"
          >
            <ExternalLink size={13} /> Ver na app YouTube
          </a>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 text-xs font-bold rounded-lg transition-all"
          >
            Voltar ao Treino
          </button>
        </div>
      </div>
    </div>
  );
};
