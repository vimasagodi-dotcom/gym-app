import React from 'react';
import { useWorkout } from '../../context/WorkoutContext';
import {
  Home,
  Layers,
  Dumbbell,
  History,
  TrendingUp,
  Settings,
} from 'lucide-react';

export type NavTab = 'dashboard' | 'routines' | 'workout' | 'exercises' | 'history' | 'analytics' | 'settings';

interface BottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab }) => {
  const { isActive, activeSession } = useWorkout();

  const navItems = [
    { id: 'dashboard', label: 'Início', icon: Home },
    { id: 'routines', label: 'Planos', icon: Layers },
    { id: 'exercises', label: 'Exercícios', icon: Dumbbell },
    { id: 'history', label: 'Histórico', icon: History },
    { id: 'analytics', label: 'Progresso', icon: TrendingUp },
    { id: 'settings', label: 'Perfil', icon: Settings },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#09090b]/95 backdrop-blur-xl border-t border-white/[0.08] px-1 py-1.5 safe-area-pb">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {navItems.map((item) => {
          const isSelected = currentTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-0.5 rounded-lg transition-all active:scale-95 min-w-0 ${
                isSelected
                  ? 'text-amber-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon size={19} className={isSelected ? 'stroke-[2.2]' : 'stroke-[1.6]'} />
                {isSelected && (
                  <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-amber-400" />
                )}
              </div>
              <span className="text-[9px] sm:text-[10px] mt-1 tracking-tight text-center truncate max-w-full block">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Botão de Treino em Curso Flutuante (se houver treino ativo e o utilizador estiver noutra tab) */}
      {isActive && currentTab !== 'workout' && (
        <div className="fixed bottom-16 left-4 right-4 max-w-sm mx-auto z-40 animate-slide-up">
          <button
            type="button"
            onClick={() => onSelectTab('workout')}
            className="w-full bg-amber-500 text-slate-950 font-bold p-3 rounded-xl flex items-center justify-between shadow-lg shadow-black/40 active:scale-95 transition-all"
          >
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-950" />
              </span>
              <span className="text-xs uppercase tracking-wide font-extrabold truncate max-w-[200px]">
                Treino em Curso: {activeSession?.name}
              </span>
            </div>
            <span className="text-xs font-mono font-bold bg-slate-950/15 px-2.5 py-1 rounded-lg">
              Voltar →
            </span>
          </button>
        </div>
      )}
    </nav>
  );
};
