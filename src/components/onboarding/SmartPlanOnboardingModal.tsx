import React, { useState } from 'react';
import { useUser } from '../../context/ThemeContext';
import { generateSmartWorkoutPlan, type OnboardingParams, type RecommendedPlanResult } from '../../utils/planRecommender';
import { db } from '../../db/db';
import type { FitnessGoal, ExperienceLevel, AvatarSilhouette } from '../../types/user';
import { Sparkles, X, Check, ArrowRight, ArrowLeft } from 'lucide-react';

interface SmartPlanOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanApplied?: () => void;
}

export const SmartPlanOnboardingModal: React.FC<SmartPlanOnboardingModalProps> = ({
  isOpen,
  onClose,
  onPlanApplied,
}) => {
  const { profile, updateProfile } = useUser();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Estados dos parâmetros
  const [heightCm, setHeightCm] = useState<number>(profile.heightCm || 175);
  const [weightKg, setWeightKg] = useState<number>(profile.weightKg || 74);
  const [silhouette, setSilhouette] = useState<AvatarSilhouette>(profile.avatarSilhouette || 'neutral');
  const [goal, setGoal] = useState<FitnessGoal>(profile.goal || 'hypertrophy');
  const [experience, setExperience] = useState<ExperienceLevel>(profile.experienceLevel || 'intermediate');
  const [daysPerWeek, setDaysPerWeek] = useState<number>(profile.daysPerWeek || 4);

  const [generatedResult, setGeneratedResult] = useState<RecommendedPlanResult | null>(null);

  if (!isOpen) return null;

  const handleGenerate = () => {
    const params: OnboardingParams = {
      heightCm,
      weightKg,
      silhouette,
      goal,
      experience,
      daysPerWeek,
    };
    const result = generateSmartWorkoutPlan(params);
    setGeneratedResult(result);
    setStep(4);
  };

  const handleApplyPlan = async () => {
    if (!generatedResult) return;

    // 1. Atualizar perfil com novos dados biométricos
    await updateProfile({
      heightCm,
      weightKg,
      avatarSilhouette: silhouette,
      goal,
      experienceLevel: experience,
      daysPerWeek,
      defaultRestSeconds: generatedResult.recommendedRestSeconds,
      hasCompletedOnboarding: true,
    });

    // 2. Gravar rotina na base de dados IndexedDB
    await db.routines.put(generatedResult.routine);

    if (onPlanApplied) {
      onPlanApplied();
    }
    onClose();
  };

  const goalsList: { id: FitnessGoal; label: string; desc: string }[] = [
    { id: 'hypertrophy', label: 'Hipertrofia Muscular', desc: 'Ganho de massa magra, volume e densidade (8-12 reps)' },
    { id: 'strength', label: 'Força Máxima', desc: 'Cargas elevadas, tensão mecânica máxima e descanso longo (4-6 reps)' },
    { id: 'weight_loss', label: 'Definição & Perda de Gordura', desc: 'Volume moderado-alto com intervalos densos para queima calórica (10-15 reps)' },
    { id: 'endurance', label: 'Resistência Muscular', desc: 'Resistência ao lactato e condicionamento físico geral (15-20 reps)' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-scale-up">
        {/* Topo / Progresso */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-500/15 text-amber-400 rounded-xl">
              <Sparkles size={18} />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                Criador de Treino Inteligente
              </h2>
              <span className="text-xs text-slate-400">Passo {step} de 4</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Conteúdo com Scroll */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* PASSO 1: DADOS BIOMÉTRICOS & SILHUETA */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h3 className="text-sm font-bold text-slate-200">
                  Os teus dados biométricos
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Usados para calibrar o volume e intensidade das séries recomendadas.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    Altura (cm)
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={heightCm}
                    onChange={(e) => setHeightCm(parseFloat(e.target.value) || 170)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-base font-bold font-mono text-slate-100 outline-none focus:border-amber-400"
                    placeholder="175"
                  />
                </div>

                <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    Peso Corporal (kg)
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={weightKg}
                    onChange={(e) => setWeightKg(parseFloat(e.target.value) || 70)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-base font-bold font-mono text-slate-100 outline-none focus:border-amber-400"
                    placeholder="75"
                  />
                </div>
              </div>

              {/* Escolha da Silhueta Visual */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2">
                  Silhueta de Preferência (Diagrama Muscular)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['neutral', 'male', 'female'] as const).map((sil) => (
                    <button
                      key={sil}
                      type="button"
                      onClick={() => setSilhouette(sil)}
                      className={`p-3 rounded-2xl text-xs font-bold capitalize transition-all border ${
                        silhouette === sil
                          ? 'bg-amber-500/20 border-amber-500 text-amber-400 shadow-sm'
                          : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      {sil === 'neutral' ? 'Atlético Neutro' : sil === 'male' ? 'Masculino V-Taper' : 'Feminino'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PASSO 2: OBJETIVO & NÍVEL DE EXPERIÊNCIA */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h3 className="text-sm font-bold text-slate-200">
                  Qual é o teu objetivo principal?
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Determina a faixa ideal de repetições e tempo de descanso entre séries.
                </p>
              </div>

              <div className="space-y-2">
                {goalsList.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setGoal(g.id)}
                    className={`w-full p-3.5 rounded-2xl text-left transition-all border flex items-center justify-between ${
                      goal === g.id
                        ? 'bg-amber-500/15 border-amber-500 text-slate-100'
                        : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold">{g.label}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{g.desc}</div>
                    </div>
                    {goal === g.id && <Check size={18} className="text-amber-400 shrink-0 ml-2" />}
                  </button>
                ))}
              </div>

              {/* Nível de Experiência */}
              <div className="pt-2">
                <label className="text-xs font-bold text-slate-300 block mb-2">
                  Nível de Experiência com Cargas
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['beginner', 'intermediate', 'advanced'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setExperience(lvl)}
                      className={`p-3 rounded-2xl text-xs font-bold capitalize transition-all border ${
                        experience === lvl
                          ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                          : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      {lvl === 'beginner' ? 'Principiante' : lvl === 'intermediate' ? 'Intermédio' : 'Avançado'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PASSO 3: DISPONIBILIDADE SEMANAL */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h3 className="text-sm font-bold text-slate-200">
                  Quantos dias por semana podes treinar?
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  O motor seleciona a divisão arquitetural ótima com base no teu tempo.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { days: 3, label: '3 Dias / semana', split: 'Full Body 3x (A / B / C)', desc: 'Frequência total com estímulo máximo por sessão' },
                  { days: 4, label: '4 Dias / semana', split: 'Upper / Lower (Superior / Inferior)', desc: 'Equilíbrio de referência para síntese proteica' },
                  { days: 5, label: '5 Dias / semana', split: 'PPL Pro ou Arnold Split', desc: 'Volume alto com isolamento preciso de cada músculo' },
                  { days: 6, label: '6 Dias / semana', split: 'Push / Pull / Legs 6x', desc: 'Frequência máxima e hipertrofia acelerada' },
                ].map((item) => (
                  <button
                    key={item.days}
                    type="button"
                    onClick={() => setDaysPerWeek(item.days)}
                    className={`p-4 rounded-2xl text-left transition-all border flex flex-col justify-between ${
                      daysPerWeek === item.days
                        ? 'bg-amber-500/15 border-amber-500 text-slate-100 shadow-md'
                        : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <span className="text-sm font-black text-amber-400 block font-mono">{item.label}</span>
                      <span className="text-xs font-bold text-slate-200 mt-1 block">{item.split}</span>
                      <span className="text-[11px] text-slate-500 mt-1 block">{item.desc}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* PASSO 4: PRÉ-VISUALIZAÇÃO DO PLANO GERADO */}
          {step === 4 && generatedResult && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4">
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">
                  Plano Personalizado Calibrado
                </span>
                <h3 className="text-lg font-black text-slate-100 mt-1">
                  {generatedResult.routine.title}
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {generatedResult.explanation}
                </p>
                <div className="flex items-center gap-3 mt-3 text-xs font-mono font-bold text-amber-400">
                  <span>Faixa: {generatedResult.targetRepsRange.min}-{generatedResult.targetRepsRange.max} reps</span>
                  <span>•</span>
                  <span>Descanso: {generatedResult.recommendedRestSeconds}s</span>
                </div>
              </div>

              {/* Lista dos Dias do Plano */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Estrutura dos Dias de Treino ({generatedResult.routine.days.length} dias)
                </span>
                <div className="space-y-2">
                  {generatedResult.routine.days.map((day) => (
                    <div
                      key={day.id}
                      className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3 text-xs"
                    >
                      <div className="font-bold text-slate-100">{day.name}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{day.description}</div>
                      <div className="mt-2 text-[10px] text-amber-400/90 font-medium">
                        {day.exercises.length} exercícios programados
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé de Navegação */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-950/60">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
              className="px-4 py-2.5 text-xs font-bold text-slate-400 hover:text-slate-200 flex items-center gap-1.5"
            >
              <ArrowLeft size={16} /> Voltar
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s + 1) as 2 | 3)}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md transition-all active:scale-95"
            >
              Avançar <ArrowRight size={16} />
            </button>
          ) : step === 3 ? (
            <button
              type="button"
              onClick={handleGenerate}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all active:scale-95"
            >
              <Sparkles size={16} /> Gerar o Meu Plano
            </button>
          ) : (
            <button
              type="button"
              onClick={handleApplyPlan}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 text-xs font-black rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition-all"
            >
              <Check size={16} className="stroke-[3]" /> Aplicar Plano Recomendado
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
