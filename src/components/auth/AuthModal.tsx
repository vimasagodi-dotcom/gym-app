import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Cloud,
  HardDrive,
  KeyRound,
  Loader2,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthTab = 'login' | 'register' | 'forgot_password';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { user, login, register, logout, resetPassword, isFirebaseActive } = useAuth();

  const [activeTab, setActiveTab] = useState<AuthTab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setIsSubmitting(true);

    try {
      if (activeTab === 'login') {
        const res = await login(email, password);
        if (res.success) {
          onClose();
        } else {
          setFeedback({ type: 'error', message: res.error || 'Falha ao iniciar sessão.' });
        }
      } else if (activeTab === 'register') {
        const res = await register(email, password, name);
        if (res.success) {
          onClose();
        } else {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-fade-in">
      <div className="bg-[#111114] border border-white/[0.1] rounded-3xl max-w-md w-full flex flex-col shadow-2xl overflow-hidden animate-scale-up">
        {/* Cabeçalho */}
        <div className="p-4 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-lime-400/15 text-lime-400 flex items-center justify-center">
              <KeyRound size={16} />
            </span>
            <div>
              <h2 className="text-sm font-bold text-slate-100">
                {user
                  ? 'A Tua Conta'
                  : activeTab === 'forgot_password'
                  ? 'Recuperar Palavra-passe'
                  : activeTab === 'register'
                  ? 'Criar Nova Conta'
                  : 'Iniciar Sessão'}
              </h2>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                {isFirebaseActive ? (
                  <>
                    <Cloud size={11} className="text-emerald-400" />
                    <span>Nuvem Firebase Ativa</span>
                  </>
                ) : (
                  <>
                    <HardDrive size={11} className="text-lime-400" />
                    <span>Armazenamento Local Seguro</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-white/[0.08] rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="p-5 space-y-4">
          {user ? (
            /* Estado: Já tem sessão iniciada */
            <div className="space-y-4">
              <div className="bg-[#18181c] border border-white/[0.08] p-4 rounded-2xl space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-lime-400/20 text-lime-400 font-bold text-lg flex items-center justify-center border border-lime-400/30">
                    {user.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-100 truncate">{user.displayName}</p>
                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-white/[0.06] flex items-center gap-2 text-[11px] text-emerald-400">
                  <CheckCircle2 size={13} />
                  <span>Sessão ativa e sincronizada com o calendário</span>
                </div>
              </div>

              <button
                type="button"
                onClick={async () => {
                  await logout();
                  onClose();
                }}
                className="w-full py-2.5 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 rounded-xl text-xs font-bold transition-all"
              >
                Terminar Sessão
              </button>
            </div>
          ) : (
            /* Formulário de Login / Registo / Recuperação */
            <>
              {/* Abas */}
              {activeTab !== 'forgot_password' && (
                <div className="grid grid-cols-2 p-1 bg-[#18181c] border border-white/[0.08] rounded-xl text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('login');
                      setFeedback(null);
                    }}
                    className={`py-1.5 rounded-lg font-bold transition-all ${
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
                    className={`py-1.5 rounded-lg font-bold transition-all ${
                      activeTab === 'register'
                        ? 'bg-lime-400 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Criar Conta
                  </button>
                </div>
              )}

              {/* Feedback de Erro ou Sucesso */}
              {feedback && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
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

              <form onSubmit={handleSubmit} className="space-y-3">
                {activeTab === 'register' && (
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">Nome Completo</label>
                    <div className="relative">
                      <UserIcon size={15} className="absolute left-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex: Carlos Santos"
                        className="w-full bg-[#18181c] border border-white/[0.08] focus:border-lime-400 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 outline-none transition-colors"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Email</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3 top-3 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="exemplo@email.com"
                      className="w-full bg-[#18181c] border border-white/[0.08] focus:border-lime-400 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 outline-none transition-colors"
                    />
                  </div>
                </div>

                {activeTab !== 'forgot_password' && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-semibold text-slate-300">Palavra-passe</label>
                      {activeTab === 'login' && (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('forgot_password');
                            setFeedback(null);
                          }}
                          className="text-[10px] text-lime-400 hover:underline"
                        >
                          Esqueceste-te da senha?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3 top-3 text-slate-400" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        className="w-full bg-[#18181c] border border-white/[0.08] focus:border-lime-400 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 outline-none transition-colors"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-lime-400 hover:bg-lime-300 active:scale-[0.98] text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <>
                      <span>
                        {activeTab === 'login'
                          ? 'Entrar no Gym OS'
                          : activeTab === 'register'
                          ? 'Criar Minha Conta'
                          : 'Enviar Link de Recuperação'}
                      </span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </form>

              {activeTab === 'forgot_password' && (
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('login');
                      setFeedback(null);
                    }}
                    className="text-xs text-slate-400 hover:text-slate-200"
                  >
                    ← Voltar ao início de sessão
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

