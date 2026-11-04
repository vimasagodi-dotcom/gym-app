import React, { useState, useRef, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import { useUser } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useWorkout } from '../../context/WorkoutContext';
import { WorkoutCalendar } from '../dashboard/WorkoutCalendar';
import type { AvatarSilhouette, FitnessGoal } from '../../types/user';
import { exportDatabaseToJson, importDatabaseFromJson } from '../../utils/exportImport';
import {
  User,
  Settings,
  Scale,
  Moon,
  Sun,
  Download,
  Upload,
  Check,
  Shield,
  Cloud,
  HardDrive,
  LogOut,
  RefreshCw,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { profile, updateProfile, setUnitSystem, setSilhouette, toggleTheme } = useUser();
  const { user, logout, isFirebaseActive, isSyncing, syncNow } = useAuth();
  const { startRoutineWorkout } = useWorkout();

  const [nameInput, setNameInput] = useState(user?.displayName || profile.name);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dados para o Calendário de Treinos no Perfil do Utilizador
  const sessions = useLiveQuery(() => db.workoutSessions.orderBy('startedAt').reverse().toArray()) || [];
  const routines = useLiveQuery(() => db.routines.toArray()) || [];
  const exercises = useLiveQuery(() => db.exercises.toArray()) || [];

  const completedSessions = useMemo(
    () => sessions.filter((s) => s.completedAt !== undefined),
    [sessions]
  );

  const activeRoutine = useMemo(() => {
    if (routines.length === 0) return null;
    return routines.find((r) => !r.isTemplate) || routines[0];
  }, [routines]);

  const handleStartRoutineFromId = (routineId: string) => {
    const routine = routines.find((r) => r.id === routineId);
    if (routine && routine.days.length > 0) {
      startRoutineWorkout(routine, routine.days[0]);
    }
  };

  const handleSaveName = async () => {
    await updateProfile({ name: nameInput });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleExport = async () => {
    const jsonStr = await exportDatabaseToJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `iron_atlas_copia_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const success = await importDatabaseFromJson(content);
      if (success) {
        setImportStatus('Cópia de segurança restaurada com sucesso! A recarregar...');
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setImportStatus('Erro ao importar cópia de segurança. Ficheiro inválido.');
      }
    };
    reader.readAsText(file);
  };

  const silhouettes: { id: AvatarSilhouette; label: string; desc: string }[] = [
    { id: 'neutral', label: 'Neutro', desc: 'Silhueta equilibrada' },
    { id: 'male', label: 'Masculino', desc: 'Ombros mais largos' },
    { id: 'female', label: 'Feminino', desc: 'Anca e cintura destacadas' },
  ];

  const goals: { id: FitnessGoal; label: string }[] = [
    { id: 'hypertrophy', label: 'Hipertrofia Muscular' },
    { id: 'strength', label: 'Ganho de Força' },
    { id: 'endurance', label: 'Resistência Muscular' },
    { id: 'weight_loss', label: 'Perda de Peso e Definição' },
    { id: 'general_fitness', label: 'Condicionamento Geral' },
  ];

  return (
    <div className="max-w-xl mx-auto px-3.5 py-3 pb-28 safe-area-pt space-y-4 animate-fade-in">
      {/* 1. Cabeçalho do Perfil */}
      <div className="pt-1">
        <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
          O Meu Perfil
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Calendário de atividade, conta e preferências de treino
        </p>
      </div>

      {/* 2. Cartão de Conta & Sincronização do Utilizador */}
      {user && (
        <div className="bg-[#111114] border border-white/[0.08] rounded-3xl p-4 shadow-lg space-y-3.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-lime-400/15 border border-lime-400/35 text-lime-400 font-black text-lg flex items-center justify-center shrink-0">
                {(user.displayName || profile.name || 'A').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-bold text-slate-100 truncate">
                  {user.displayName || profile.name}
                </h2>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
                <div className="flex items-center gap-1.5 text-[10px] font-semibold mt-1">
                  {isFirebaseActive ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Cloud size={11} /> Sincronizado na Nuvem
                    </span>
                  ) : (
                    <span className="text-lime-400 flex items-center gap-1">
                      <HardDrive size={11} /> Guardado no Telemóvel
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 text-rose-400 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 active:scale-95 transition-all"
            >
              <LogOut size={13} />
              <span>Sair</span>
            </button>
          </div>

          {isFirebaseActive && (
            <button
              type="button"
              disabled={isSyncing}
              onClick={() => syncNow()}
              className="w-full py-2.5 bg-[#18181c] hover:bg-[#22222a] border border-white/[0.08] text-lime-400 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
            >
              <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
              <span>{isSyncing ? 'A sincronizar com a nuvem...' : 'Sincronizar Treinos e Calendário Agora'}</span>
            </button>
          )}
        </div>
      )}

      {/* 3. CALENDÁRIO INTERATIVO DE TREINOS E CICLO DE 4 SEMANAS (No Perfil do Utilizador) */}
      <WorkoutCalendar
        sessions={completedSessions}
        exercises={exercises}
        activeRoutine={activeRoutine}
        onStartRoutine={handleStartRoutineFromId}
      />

      {/* 4. Dados do Atleta & Objetivo */}
      <div className="bg-[#111114] border border-white/[0.08] rounded-3xl p-4 sm:p-5 shadow-lg space-y-4">
        <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <User size={15} className="text-lime-400" /> Dados do Atleta
        </h2>

        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1.5">
            Nome de Exibição
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="flex-1 min-h-[44px] bg-[#18181c] border border-white/[0.1] rounded-2xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-lime-400"
              placeholder="O teu nome"
            />
            <button
              type="button"
              onClick={handleSaveName}
              className="px-4 min-h-[44px] bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs rounded-2xl transition-all shrink-0"
            >
              {savedSuccess ? 'Guardado!' : 'Guardar'}
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-2">
            Objetivo Principal de Treino
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {goals.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => updateProfile({ goal: g.id })}
                className={`p-3 rounded-2xl text-xs font-bold text-left transition-all border ${
                  profile.goal === g.id
                    ? 'bg-lime-400/15 border-lime-400 text-lime-400'
                    : 'bg-[#18181c] border-white/[0.06] text-slate-300 hover:bg-[#222228]'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Silhueta do Diagrama Muscular */}
      <div className="bg-[#111114] border border-white/[0.08] rounded-3xl p-4 sm:p-5 shadow-lg space-y-3">
        <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Settings size={15} className="text-lime-400" />
          Silhueta do Mapa Anatómico
        </h2>

        <div className="grid grid-cols-3 gap-2">
          {silhouettes.map((s) => {
            const isSelected = profile.avatarSilhouette === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSilhouette(s.id)}
                className={`p-3 rounded-2xl text-left transition-all border ${
                  isSelected
                    ? 'bg-lime-400/15 border-lime-400 text-lime-400'
                    : 'bg-[#18181c] border-white/[0.06] text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-100">{s.label}</span>
                  {isSelected && <Check size={14} className="text-lime-400" />}
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block leading-tight">{s.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. Preferências do Ginásio (Unidades & Tema) */}
      <div className="bg-[#111114] border border-white/[0.08] rounded-3xl p-4 sm:p-5 shadow-lg space-y-4">
        <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Scale size={15} className="text-lime-400" /> Preferências do Ginásio
        </h2>

        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold text-slate-200 block">Unidade de Peso</span>
            <span className="text-[11px] text-slate-500">Quilogramas (kg) ou Libras (lbs)</span>
          </div>

          <div className="flex items-center gap-1 bg-[#18181c] p-1 rounded-2xl border border-white/[0.08]">
            <button
              type="button"
              onClick={() => setUnitSystem('kg')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                profile.unitSystem === 'kg'
                  ? 'bg-lime-400 text-slate-950'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              kg
            </button>
            <button
              type="button"
              onClick={() => setUnitSystem('lbs')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                profile.unitSystem === 'lbs'
                  ? 'bg-lime-400 text-slate-950'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              lbs
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
          <div>
            <span className="text-xs font-bold text-slate-200 block">Aparência</span>
            <span className="text-[11px] text-slate-500">Tema escuro ou claro</span>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#18181c] border border-white/[0.08] rounded-2xl text-xs font-bold text-slate-200"
          >
            {profile.theme === 'dark' ? (
              <>
                <Moon size={14} className="text-lime-400" /> Escuro
              </>
            ) : (
              <>
                <Sun size={14} className="text-amber-500" /> Claro
              </>
            )}
          </button>
        </div>
      </div>

      {/* 7. Cópia de Segurança Local */}
      <div className="bg-[#111114] border border-white/[0.08] rounded-3xl p-4 sm:p-5 shadow-lg space-y-3">
        <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Shield size={15} className="text-lime-400" />
          Cópia de Segurança Manual
        </h2>

        {importStatus && (
          <div className="p-3 bg-lime-400/15 border border-lime-400/30 rounded-2xl text-xs font-bold text-lime-300">
            {importStatus}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={handleExport}
            className="min-h-[44px] p-2.5 bg-[#18181c] hover:bg-[#222228] border border-white/[0.08] rounded-2xl flex items-center justify-center gap-1.5 text-xs font-bold text-slate-200 transition-all"
          >
            <Download size={15} className="text-lime-400" /> Exportar JSON
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="min-h-[44px] p-2.5 bg-[#18181c] hover:bg-[#222228] border border-white/[0.08] rounded-2xl flex items-center justify-center gap-1.5 text-xs font-bold text-slate-200 transition-all"
          >
            <Upload size={15} className="text-sky-400" /> Restaurar JSON
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
};
