import React, { useState, useEffect } from 'react';
import { initializeDatabase } from './db/initializeDb';
import { AuthProvider, useAuth } from './context/AuthContext';
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
import { MandatoryAuthScreen } from './components/auth/MandatoryAuthScreen';
import { Dumbbell, Loader2 } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { isActive } = useWorkout();
  const { user, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');

  // Se o utilizador iniciar um treino ativo, transita automaticamente para a aba de treino
  useEffect(() => {
    if (isActive) {
      setCurrentTab('workout');
    }
  }, [isActive]);

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] bg-[#08080a] flex flex-col items-center justify-center text-slate-100 p-4">
        <div className="w-16 h-16 rounded-3xl bg-lime-400/15 border border-lime-400/30 text-lime-400 flex items-center justify-center mb-4">
          <Dumbbell size={32} className="animate-spin-slow" />
        </div>
        <h1 className="text-xl font-bold tracking-tight">IRON ATLAS</h1>
        <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
          <Loader2 size={13} className="animate-spin text-lime-400" /> A verificar sessão...
        </p>
      </div>
    );
  }

  // LOGIN OBRIGATÓRIO: Se o utilizador não tiver sessão iniciada, apresenta o ecrã de autenticação
  if (!user) {
    return <MandatoryAuthScreen />;
  }

  return (
    <div className="min-h-[100dvh] bg-[var(--bg-primary)] text-[var(--text-main)] flex flex-col font-sans w-full max-w-full overflow-x-hidden">
      {/* Banner PWA de Instalação para Android & iOS */}
      <PwaInstallPrompt />

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
        console.error('Falha ao inicializar a base de dados:', err);
        setIsDbReady(true);
      });
  }, []);

  if (!isDbReady) {
    return (
      <div className="min-h-[100dvh] bg-[#08080a] flex flex-col items-center justify-center text-slate-100 p-4">
        <div className="w-16 h-16 rounded-3xl bg-lime-400/15 border border-lime-400/30 text-lime-400 flex items-center justify-center mb-4">
          <Dumbbell size={32} className="animate-spin-slow" />
        </div>
        <h1 className="text-xl font-bold tracking-tight">IRON ATLAS</h1>
        <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
          <Loader2 size={13} className="animate-spin text-lime-400" /> A carregar exercícios e base de dados...
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
