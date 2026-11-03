import React, { useState, useRef } from 'react';
import { useUser } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { AuthModal } from '../auth/AuthModal';
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
  KeyRound,
  Cloud,
  HardDrive,
  LogOut,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { profile, updateProfile, setUnitSystem, setSilhouette, toggleTheme } = useUser();
  const { user, logout, isFirebaseActive } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [nameInput, setNameInput] = useState(profile.name);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    a.download = `gymapp_backup_${new Date().toISOString().split('T')[0]}.json`;
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
        setImportStatus('Backup restaurado com sucesso! A recarregar...');
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setImportStatus('Erro ao importar backup. Ficheiro inválido.');
      }
    };
    reader.readAsText(file);
  };

  const silhouettes: { id: AvatarSilhouette; label: string; desc: string }[] = [
    { id: 'neutral', label: 'Neutro', desc: 'Silhueta atlética equilibrada' },
    { id: 'male', label: 'Masculino', desc: 'Silhueta com ombros mais largos' },
    { id: 'female', label: 'Feminino', desc: 'Silhueta com anca e cintura destacadas' },
  ];

  const goals: { id: FitnessGoal; label: string }[] = [
    { id: 'hypertrophy', label: 'Hipertrofia Muscular' },
    { id: 'strength', label: 'Ganho de Força' },
    { id: 'endurance', label: 'Resistência Muscular' },
    { id: 'weight_loss', label: 'Perda de Peso e Definição' },
    { id: 'general_fitness', label: 'Condicionamento Geral' },
  ];

  return (
    <div className="max-w-3xl mx-auto p-4 pb-28 space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-slate-100 tracking-tight">
          Definições & Perfil
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Personaliza a app para o teu estilo de treino no ginásio
        </p>
      </div>

      {/* 0. Conta & Sincronização */}
      <div className="bg-[#111114] border border-white/[0.08] rounded-3xl p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-lime-400/15 text-lime-400 flex items-center justify-center">
              <KeyRound size={16} />
            </span>
            <div>
              <h2 className="text-sm font-bold text-slate-100">Conta & Sincronização</h2>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                {isFirebaseActive ? (
                  <>
                    <Cloud size={11} className="text-emerald-400" />
                    <span>Nuvem Firebase Conectada</span>
                  </>
                ) : (
                  <>
                    <HardDrive size={11} className="text-lime-400" />
                    <span>Armazenamento Local Ativo</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAuthModalOpen(true)}
            className="px-3.5 py-1.5 bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs rounded-xl transition-all"
          >
            {user ? 'Gerir Conta' : 'Iniciar Sessão'}
          </button>
        </div>

        {user ? (
          <div className="bg-[#18181c] p-3 rounded-2xl flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-200 truncate">{user.displayName}</p>
              <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 py-1 px-2 rounded-lg"
            >
              <LogOut size={13} /> Sair
            </button>
          </div>
        ) : (
          <p className="text-xs text-slate-400 leading-relaxed">
            Inicia sessão para sincronizar os teus treinos no calendário e recuperar o acesso em caso de perda de dispositivo.
          </p>
        )}
      </div>

      {/* 1. Perfil do Atleta */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4">
        <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <User size={16} className="text-amber-400" /> Perfil do Utilizador
        </h2>

        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">
            Nome do Atleta
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-2xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-400"
              placeholder="O teu nome"
            />
            <button
              type="button"
              onClick={handleSaveName}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-2xl transition-all"
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
                    ? 'bg-amber-500/15 border-amber-500 text-amber-400'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Personalização do Diagrama Anatómico (Avatar / Silhueta) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-3">
        <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Settings size={16} className="text-amber-400" />
          Silhueta do Diagrama Muscular
        </h2>
        <p className="text-xs text-slate-400">
          Escolhe o avatar visual usado no diagrama anatómico. A base de exercícios e músculos é idêntica para todos.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {silhouettes.map((s) => {
            const isSelected = profile.avatarSilhouette === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSilhouette(s.id)}
                className={`p-4 rounded-2xl text-left transition-all border ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500 text-amber-400 shadow-md shadow-amber-500/10'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-100">{s.label}</span>
                  {isSelected && <Check size={16} className="text-amber-400" />}
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">{s.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Sistema de Unidades & Sons */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4">
        <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Scale size={16} className="text-amber-400" /> Preferências do Ginásio
        </h2>

        {/* Unidades de Carga */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-200 block">Unidade de Peso</span>
            <span className="text-[11px] text-slate-500">Quilogramas (kg) ou Libras (lbs)</span>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => setUnitSystem('kg')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                profile.unitSystem === 'kg'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              kg
            </button>
            <button
              type="button"
              onClick={() => setUnitSystem('lbs')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                profile.unitSystem === 'lbs'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              lbs
            </button>
          </div>
        </div>

        {/* Tema Escuro / Claro */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
          <div>
            <span className="text-xs font-bold text-slate-200 block">Aparência do Tema</span>
            <span className="text-[11px] text-slate-500">Escuro (recomendado para ginásio) ou Claro</span>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center gap-2 px-4 py-2 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-bold text-slate-300 hover:bg-slate-800"
          >
            {profile.theme === 'dark' ? (
              <>
                <Moon size={15} className="text-amber-400" /> Tema Escuro
              </>
            ) : (
              <>
                <Sun size={15} className="text-amber-500" /> Tema Claro
              </>
            )}
          </button>
        </div>
      </div>

      {/* 4. Cópia de Segurança e Persistência Local */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-3">
        <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Shield size={16} className="text-amber-400" />
          Cópia de Segurança & Dados Locais
        </h2>
        <p className="text-xs text-slate-400">
          Os teus dados estão guardados no IndexedDB do teu dispositivo. Podes exportar um ficheiro de backup para guardar ou transferir para outro dispositivo.
        </p>

        {importStatus && (
          <div className="p-3 bg-amber-500/15 border border-amber-500/30 rounded-2xl text-xs font-bold text-amber-400">
            {importStatus}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={handleExport}
            className="p-3 bg-slate-950/80 hover:bg-slate-800 border border-slate-800 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold text-slate-200 transition-all"
          >
            <Download size={16} className="text-amber-400" /> Exportar Backup (JSON)
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-3 bg-slate-950/80 hover:bg-slate-800 border border-slate-800 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold text-slate-200 transition-all"
          >
            <Upload size={16} className="text-sky-400" /> Restaurar Backup
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

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};
