import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import {
  auth,
  isFirebaseConfigured,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  type User as FirebaseUser,
} from '../services/firebase';
import { syncAllUserDataWithCloud } from '../services/cloudSync';
import { db } from '../db/db';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  isCloudSynced: boolean;
}

interface AuthContextType {
  user: AppUser | null;
  isLoading: boolean;
  isSyncing: boolean;
  isFirebaseActive: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, displayName: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string; error?: string }>;
  syncNow: () => Promise<void>;
}

const LOCAL_USER_STORAGE_KEY = 'gymapp_auth_user';

// Tradutor de erros do Firebase Auth para Português de Portugal (pt-PT)
function translateFirebaseError(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  if (raw.includes('auth/invalid-credential') || raw.includes('auth/wrong-password')) {
    return 'Email ou palavra-passe incorretos. Verifica os dados ou recupera a tua palavra-passe.';
  }
  if (raw.includes('auth/user-not-found')) {
    return 'Não existe nenhuma conta registada com este endereço de email.';
  }
  if (raw.includes('auth/email-already-in-use')) {
    return 'Este endereço de email já está registado. Tenta iniciar sessão ou recuperar a palavra-passe.';
  }
  if (raw.includes('auth/weak-password')) {
    return 'A palavra-passe é demasiado fraca. Usa pelo menos 6 caracteres.';
  }
  if (raw.includes('auth/invalid-email')) {
    return 'O formato do endereço de email introduzido não é válido.';
  }
  if (raw.includes('auth/too-many-requests')) {
    return 'Demasiadas tentativas falhadas. Por segurança, aguarda alguns minutos ou redefine a palavra-passe.';
  }
  if (raw.includes('auth/operation-not-allowed')) {
    return 'O login por Email/Palavra-passe precisa de ser ativado no painel Authentication do Firebase.';
  }
  if (raw.includes('auth/network-request-failed')) {
    return 'Falha de ligação à internet. Verifica a tua rede e tenta novamente.';
  }
  return 'Não foi possível concluir a autenticação. Verifica os teus dados e tenta novamente.';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Inicialização e escuta do estado de autenticação
  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
        if (fbUser && fbUser.email) {
          const appUser: AppUser = {
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName || fbUser.email.split('@')[0],
            isCloudSynced: true,
          };
          setUser(appUser);
          localStorage.setItem(LOCAL_USER_STORAGE_KEY, JSON.stringify(appUser));
          await syncWithLocalProfile(appUser);
          setIsSyncing(true);
          await syncAllUserDataWithCloud(appUser.uid);
          setIsSyncing(false);
        } else {
          // Verifica se existe utilizador local guardado como fallback
          const stored = localStorage.getItem(LOCAL_USER_STORAGE_KEY);
          if (stored) {
            try {
              const parsed = JSON.parse(stored) as AppUser;
              if (parsed.uid.startsWith('local-')) {
                setUser(parsed);
              } else {
                setUser(null);
                localStorage.removeItem(LOCAL_USER_STORAGE_KEY);
              }
            } catch {
              setUser(null);
            }
          } else {
            setUser(null);
          }
        }
        setIsLoading(false);
      });
      return () => unsubscribe();
    } else {
      // Modo Local-First
      const stored = localStorage.getItem(LOCAL_USER_STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as AppUser;
          setUser(parsed);
          syncWithLocalProfile(parsed);
        } catch {
          localStorage.removeItem(LOCAL_USER_STORAGE_KEY);
        }
      }
      setIsLoading(false);
    }
  }, []);

  const syncWithLocalProfile = async (u: AppUser) => {
    try {
      const existing = await db.users.get('default-user');
      if (existing) {
        await db.users.update('default-user', {
          name: u.displayName,
          email: u.email,
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.warn('Erro ao sincronizar perfil local:', err);
    }
  };

  const syncNow = async () => {
    if (!user) return;
    setIsSyncing(true);
    await syncAllUserDataWithCloud(user.uid);
    setIsSyncing(false);
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim();
    if (!cleanEmail.includes('@') || password.length < 6) {
      return { success: false, error: 'Introduz um email válido e uma palavra-passe com pelo menos 6 caracteres.' };
    }

    try {
      if (isFirebaseConfigured && auth) {
        const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
        const appUser: AppUser = {
          uid: cred.user.uid,
          email: cred.user.email || cleanEmail,
          displayName: cred.user.displayName || cleanEmail.split('@')[0],
          isCloudSynced: true,
        };
        setUser(appUser);
        localStorage.setItem(LOCAL_USER_STORAGE_KEY, JSON.stringify(appUser));
        await syncWithLocalProfile(appUser);
        await syncAllUserDataWithCloud(appUser.uid);
        return { success: true };
      } else {
        const appUser: AppUser = {
          uid: `local-${Date.now()}`,
          email: cleanEmail,
          displayName: cleanEmail.split('@')[0],
          isCloudSynced: false,
        };
        setUser(appUser);
        localStorage.setItem(LOCAL_USER_STORAGE_KEY, JSON.stringify(appUser));
        await syncWithLocalProfile(appUser);
        return { success: true };
      }
    } catch (err: unknown) {
      return { success: false, error: translateFirebaseError(err) };
    }
  };

  const register = async (
    email: string,
    password: string,
    displayName: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim();
    const cleanName = displayName.trim() || cleanEmail.split('@')[0];

    if (password.length < 6) {
      return { success: false, error: 'A palavra-passe deve ter pelo menos 6 caracteres.' };
    }

    try {
      if (isFirebaseConfigured && auth) {
        const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        await updateProfile(cred.user, { displayName: cleanName });
        const appUser: AppUser = {
          uid: cred.user.uid,
          email: cred.user.email || cleanEmail,
          displayName: cleanName,
          isCloudSynced: true,
        };
        setUser(appUser);
        localStorage.setItem(LOCAL_USER_STORAGE_KEY, JSON.stringify(appUser));
        await syncWithLocalProfile(appUser);
        await syncAllUserDataWithCloud(appUser.uid);
        return { success: true };
      } else {
        const appUser: AppUser = {
          uid: `local-${Date.now()}`,
          email: cleanEmail,
          displayName: cleanName,
          isCloudSynced: false,
        };
        setUser(appUser);
        localStorage.setItem(LOCAL_USER_STORAGE_KEY, JSON.stringify(appUser));
        await syncWithLocalProfile(appUser);
        return { success: true };
      }
    } catch (err: unknown) {
      return { success: false, error: translateFirebaseError(err) };
    }
  };

  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      await firebaseSignOut(auth);
    }
    setUser(null);
    localStorage.removeItem(LOCAL_USER_STORAGE_KEY);
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; message: string; error?: string }> => {
    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, message: '', error: 'Por favor, introduz um endereço de email válido.' };
    }

    try {
      if (isFirebaseConfigured && auth) {
        await sendPasswordResetEmail(auth, cleanEmail);
        return {
          success: true,
          message: `Enviámos um email de recuperação de palavra-passe para ${cleanEmail}. Verifica a tua caixa de entrada e a pasta de correio não solicitado (Spam).`,
        };
      } else {
        return {
          success: true,
          message: `Pedido de recuperação registado para ${cleanEmail}. Verifica a tua caixa de entrada.`,
        };
      }
    } catch (err: unknown) {
      return { success: false, message: '', error: translateFirebaseError(err) };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isSyncing,
        isFirebaseActive: isFirebaseConfigured,
        login,
        register,
        logout,
        resetPassword,
        syncNow,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
};
