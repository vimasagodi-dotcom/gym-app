import React, { useState, useEffect } from 'react';
import { initializeDatabase } from './db/initializeDb';
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
import { Dumbbell, Loader2 } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { isActive } = useWorkout();
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');

  // Se o utilizador iniciar um treino ativo, transita automaticamente para a aba de treino
  useEffect(() => {
    if (isActive) {
      setCurrentTab('workout');
    }
  }, [isActive]);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-main)] flex flex-col font-sans">
      {/* Banner PWA de Instalação para Android & iOS */}
      <PwaInstallPrompt />
      {/* Visualização de Treino Ativo focado */}
      {isActive && currentTab === 'workout' ? (
        <ActiveWorkoutView />
      ) : (
        /* Navegação normal entre as páginas principais */
        <main className="flex-1">
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
    <UserProvider>
      <WorkoutProvider>
        <MainAppContent />
      </WorkoutProvider>
    </UserProvider>
  );
}

export default App;
