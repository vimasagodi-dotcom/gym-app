import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PwaInstallPrompt } from '../common/PwaInstallPrompt';
import {
  Dumbbell,
  Lock,
  Mail,
  User as UserIcon,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Cloud,
  HardDrive,
  Loader2,
  Eye,
  EyeOff,
  Calendar,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';

type AuthTab = 'login' | 'register' | 'forgot_password';

export const MandatoryAuthScreen: React.FC = () => {
  const { login, register, resetPassword, isFirebaseActive } = useAuth();

  const [activeTab, setActiveTab] = useState<AuthTab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setIsSubmitting(true);

    try {
      if (activeTab === 'login') {
        const res = await login(email, password);
        if (!res.success) {
          setFeedback({ type: 'error', message: res.error || 'Falha ao iniciar sessão.' });
        }
      } else if (activeTab === 'register') {
        const res = await register(email, password, name);
        if (!res.success) {
          setFeedback({ type: 'error', message: res.error || 'Falha ao criar conta.' });
        }
      } else if (activeTab === 'forgot_password') {
        const res = await resetPassword(email);
        if (res.success) {
          setFeedback({ type: 'success', message: res.message });
        } else {
          setFeedback({ type: 'error', message: res.error || 'Falha ao enviar email de recuperação.' });
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full bg-[#08080a] text-slate-100 flex flex-col justify-between px-4 py-6 safe-area-pt safe-area-pb overflow-y-auto">
      {/* Banner de Instalação no Telemóvel (Android / iPhone) */}
      <PwaInstallPrompt />

      <div className="w-full max-w-sm mx-auto my-auto space-y-6 pt-4 pb-6 animate-fade-in">
        {/* Identidade Visual da App */}
        <div className="text-center space-y-2.5">
          <div className="w-16 h-16 rounded-3xl bg-lime-400/15 border border-lime-400/35 text-lime-400 flex items-center justify-center mx-auto shadow-lg shadow-lime-400/10">
            <Dumbbell size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-100">
              IRON ATLAS
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Inicia sessão para aceder aos teus planos, treinos e calendário pessoal
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#111114] border border-white/[0.08] text-[11px] text-slate-300">
            {isFirebaseActive ? (
              <>
                <Cloud size={12} className="text-emerald-400" />
                <span>Sincronização Cloud Firebase Ativa</span>
              </>
            ) : (
              <>
                <HardDrive size={12} className="text-lime-400" />
                <span>Armazenamento Seguro no Telemóvel</span>
              </>
            )}
          </div>
        </div>

        {/* Cartão Principal de Autenticação Obrigatória */}
        <div className="bg-[#111114] border border-white/[0.1] rounded-3xl p-5 shadow-2xl space-y-4">
          {/* Seletor de Separadores (Iniciar Sessão vs Criar Conta) */}
          {activeTab !== 'forgot_password' ? (
            <div className="grid grid-cols-2 p-1 bg-[#18181c] border border-white/[0.08] rounded-2xl text-xs">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setFeedback(null);
                }}
                className={`py-2.5 rounded-xl font-bold transition-all ${
                  activeTab === 'login'
                    ? 'bg-lime-400 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Iniciar Sessão
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('register');
                  setFeedback(null);
                }}
                className={`py-2.5 rounded-xl font-bold transition-all ${
                  activeTab === 'register'
                    ? 'bg-lime-400 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Criar Conta
              </button>
            </div>
          ) : (
            <div className="text-center pb-1">
              <h2 className="text-sm font-bold text-slate-100">Recuperar Palavra-passe</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Introduz o teu email para receberes o link de reposição.
              </p>
            </div>
          )}

          {/* Mensagens de Erro ou Sucesso */}
          {feedback && (
            <div
              className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 ${
                feedback.type === 'success'
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
              ) : (
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
              )}
              <span className="leading-relaxed">{feedback.message}</span>
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {activeTab === 'register' && (
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  O Teu Nome
                </label>
                <div className="relative">
                  <UserIcon size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Victor Silva"
                    className="w-full min-h-[48px] bg-[#18181c] border border-white/[0.1] focus:border-lime-400 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  inputMode="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@email.com"
                  className="w-full min-h-[48px] bg-[#18181c] border border-white/[0.1] focus:border-lime-400 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-colors"
                />
              </div>
            </div>

            {activeTab !== 'forgot_password' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Palavra-passe
                  </label>
                  {activeTab === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('forgot_password');
                        setFeedback(null);
                      }}
                      className="text-xs font-semibold text-lime-400 hover:underline"
                    >
                      Recuperar palavra-passe
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete={activeTab === 'login' ? 'current-password' : 'new-password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo de 6 caracteres"
                    className="w-full min-h-[48px] bg-[#18181c] border border-white/[0.1] focus:border-lime-400 rounded-2xl pl-10 pr-11 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-200"
                    title={showPassword ? 'Ocultar palavra-passe' : 'Mostrar palavra-passe'}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full min-h-[50px] mt-2 bg-lime-400 hover:bg-lime-300 active:scale-[0.98] text-slate-950 font-black rounded-2xl text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-lime-400/20 disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <span>
                    {activeTab === 'login'
                      ? 'Entrar na Aplicação'
                      : activeTab === 'register'
                      ? 'Criar Conta e Entrar'
                      : 'Enviar Email de Recuperação'}
                  </span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {activeTab === 'forgot_password' && (
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setFeedback(null);
                }}
                className="text-xs font-semibold text-slate-400 hover:text-slate-200 py-1"
              >
                ← Voltar ao início de sessão
              </button>
            </div>
          )}
        </div>

        {/* Destaques Rápidos de Funcionalidades */}
        <div className="grid grid-cols-3 gap-2 text-center pt-1">
          <div className="bg-[#111114]/80 border border-white/[0.06] rounded-2xl p-2.5">
            <Calendar size={16} className="text-lime-400 mx-auto mb-1" />
            <span className="text-[10px] font-semibold text-slate-300 block leading-tight">
              Calendário no Perfil
            </span>
          </div>
          <div className="bg-[#111114]/80 border border-white/[0.06] rounded-2xl p-2.5">
            <TrendingUp size={16} className="text-lime-400 mx-auto mb-1" />
            <span className="text-[10px] font-semibold text-slate-300 block leading-tight">
              Ciclos de 4 Semanas
            </span>
          </div>
          <div className="bg-[#111114]/80 border border-white/[0.06] rounded-2xl p-2.5">
            <ShieldCheck size={16} className="text-lime-400 mx-auto mb-1" />
            <span className="text-[10px] font-semibold text-slate-300 block leading-tight">
              Cloud Backup
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
