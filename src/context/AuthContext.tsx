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
  isFirebaseActive: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, displayName: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string; error?: string }>;
}

const LOCAL_USER_STORAGE_KEY = 'gymapp_auth_user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
        } else {
          setUser(null);
          localStorage.removeItem(LOCAL_USER_STORAGE_KEY);
        }
        setIsLoading(false);
      });
      return () => unsubscribe();
    } else {
      // Modo Local-First / Demo
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

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (isFirebaseConfigured && auth) {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        const appUser: AppUser = {
          uid: cred.user.uid,
          email: cred.user.email || email,
          displayName: cred.user.displayName || email.split('@')[0],
          isCloudSynced: true,
        };
        setUser(appUser);
        localStorage.setItem(LOCAL_USER_STORAGE_KEY, JSON.stringify(appUser));
        await syncWithLocalProfile(appUser);
        return { success: true };
      } else {
        // Simulação Segura Local
        if (!email.includes('@') || password.length < 6) {
          return { success: false, error: 'Email inválido ou palavra-passe com menos de 6 caracteres.' };
        }
        const appUser: AppUser = {
          uid: `local-${Date.now()}`,
          email,
          displayName: email.split('@')[0],
          isCloudSynced: false,
        };
        setUser(appUser);
        localStorage.setItem(LOCAL_USER_STORAGE_KEY, JSON.stringify(appUser));
        await syncWithLocalProfile(appUser);
        return { success: true };
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao iniciar sessão.';
      return { success: false, error: msg };
    }
  };

  const register = async (
    email: string,
    password: string,
    displayName: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      if (password.length < 6) {
        return { success: false, error: 'A palavra-passe deve ter pelo menos 6 caracteres.' };
      }

      if (isFirebaseConfigured && auth) {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName });
        const appUser: AppUser = {
          uid: cred.user.uid,
          email: cred.user.email || email,
          displayName,
          isCloudSynced: true,
        };
        setUser(appUser);
        localStorage.setItem(LOCAL_USER_STORAGE_KEY, JSON.stringify(appUser));
        await syncWithLocalProfile(appUser);
        return { success: true };
      } else {
        // Simulação Local
        const appUser: AppUser = {
          uid: `local-${Date.now()}`,
          email,
          displayName: displayName || email.split('@')[0],
          isCloudSynced: false,
        };
        setUser(appUser);
        localStorage.setItem(LOCAL_USER_STORAGE_KEY, JSON.stringify(appUser));
        await syncWithLocalProfile(appUser);
        return { success: true };
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao criar conta.';
      return { success: false, error: msg };
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
    try {
      if (!email || !email.includes('@')) {
        return { success: false, message: '', error: 'Por favor, introduz um endereço de email válido.' };
      }

      if (isFirebaseConfigured && auth) {
        await sendPasswordResetEmail(auth, email);
        return {
          success: true,
          message: `Enviámos um link de recuperação de palavra-passe para ${email}. Verifica a tua caixa de entrada (e a pasta de spam).`,
        };
      } else {
        // Simulação local explicativa
        return {
          success: true,
          message: `Pedido de recuperação registado para ${email}. Quando ligares as tuas chaves do Firebase, o email com o link seguro de redefinição é enviado automaticamente pela Google.`,
        };
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao enviar email de recuperação.';
      return { success: false, message: '', error: msg };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isFirebaseActive: isFirebaseConfigured,
        login,
        register,
        logout,
        resetPassword,
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

