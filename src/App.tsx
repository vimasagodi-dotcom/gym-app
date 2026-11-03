import React, { useState, useEffect } from 'react';
import { initializeDatabase } from './db/initializeDb';
import { AuthProvider } from './context/AuthContext';
import { UserProvider } from './context/ThemeContext';
import { WorkoutProvider, useWorkout } from './context/WorkoutContext';
import { DashboardView } from './components/dashboard/DashboardView';
import { RoutinesView } from './components/routines/RoutinesView';
import { ExerciseList } from './components/exercises/ExerciseList';
import { HistoryView } from './components/history/HistoryView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { SettingsView } from './components/settings/SettingsView';
import { ActiveWorkoutView } from './components/workout/ActiveWorkoutView';
import { RestTimerOverlay } from './components/workout/RestTimerOverlay';
import { BottomNav, type NavTab } from './components/common/BottomNav';
import { PwaInstallPrompt } from './components/common/PwaInstallPrompt';
import { AuthModal } from './components/auth/AuthModal';
import { useAuth } from './context/AuthContext';
import { Dumbbell, Loader2, LogIn, X } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { isActive } = useWorkout();
  const { user, isFirebaseActive } = useAuth();
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [dismissedLoginBanner, setDismissedLoginBanner] = useState(() => {
    return localStorage.getItem('gymapp_login_prompt_dismissed') === 'true';
  });

  // Se o utilizador iniciar um treino ativo, transita automaticamente para a aba de treino
  useEffect(() => {
    if (isActive) {
      setCurrentTab('workout');
    }
  }, [isActive]);

  const handleDismissBanner = () => {
    setDismissedLoginBanner(true);
    localStorage.setItem('gymapp_login_prompt_dismissed', 'true');
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-main)] flex flex-col font-sans w-full max-w-full overflow-x-hidden">
      {/* 1. Banner PWA de Instalação para Android & iOS */}
      <PwaInstallPrompt />

      {/* 2. Banner de Início de Sessão no Topo (como o banner de instalar, se não tiver sessão iniciada) */}
      {!user && !dismissedLoginBanner && isFirebaseActive && (
        <div className="fixed top-16 left-3 right-3 max-w-md mx-auto z-40 animate-slide-down">
          <div className="bg-[#111114]/95 backdrop-blur-xl border border-lime-400/30 rounded-xl p-3 shadow-xl text-slate-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-lime-400/15 text-lime-400 flex items-center justify-center shrink-0">
                <LogIn size={18} />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold tracking-tight text-slate-100 flex items-center gap-1.5">
                  Iniciar Sessão
                  <span className="text-[10px] px-1.5 py-0.2 bg-lime-400/20 text-lime-400 rounded-full font-mono font-bold">
                    Nuvem
                  </span>
                </h4>
                <p className="text-[11px] text-slate-400 leading-tight mt-0.5 truncate">
                  Guarda os teus treinos no calendário sem perder dados.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="px-3 py-1.5 bg-lime-400 hover:bg-lime-300 active:scale-95 text-slate-950 font-bold text-xs rounded-lg transition-all shadow-sm"
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={handleDismissBanner}
                className="p-1 text-slate-500 hover:text-slate-300 rounded-md transition-colors"
                title="Lembrar mais tarde"
              >
                <X size={15} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Visualização de Treino Ativo focado */}
      {isActive && currentTab === 'workout' ? (
        <ActiveWorkoutView />
      ) : (
        /* Navegação normal entre as páginas principais */
        <main className="flex-1 w-full max-w-full overflow-x-hidden">
          {currentTab === 'dashboard' && (
            <DashboardView onNavigateToTab={(tab) => setCurrentTab(tab)} />
          )}
          {currentTab === 'routines' && <RoutinesView />}
          {currentTab === 'exercises' && <ExerciseList />}
          {currentTab === 'history' && <HistoryView />}
          {currentTab === 'analytics' && <AnalyticsView />}
          {currentTab === 'settings' && <SettingsView />}
        </main>
      )}

      {/* Modal de Autenticação */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Temporizador de Descanso Flutuante Global com Web Audio API */}
      <RestTimerOverlay />

      {/* Barra de Navegação Inferior Mobile-First */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
      />
    </div>
  );
};

export function App() {
  const [isDbReady, setIsDbReady] = useState(false);

  useEffect(() => {
    initializeDatabase()
      .then(() => setIsDbReady(true))
      .catch((err) => {
        console.error('Falha ao inicializar o banco de dados:', err);
        setIsDbReady(true);
      });
  }, []);

  if (!isDbReady) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 p-4">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-4">
          <Dumbbell size={32} className="animate-spin-slow" />
        </div>
        <h1 className="text-xl font-bold tracking-tight">GYM OS</h1>
        <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
          <Loader2 size={13} className="animate-spin text-amber-400" /> A carregar exercícios e base de dados...
        </p>
      </div>
    );
  }

  return (
    <AuthProvider>
      <UserProvider>
        <WorkoutProvider>
          <MainAppContent />
        </WorkoutProvider>
      </UserProvider>
    </AuthProvider>
  );
}

export default App;
