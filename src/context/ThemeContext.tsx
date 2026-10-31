import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { db } from '../db/db';
import type { UserProfile, UnitSystem, AvatarSilhouette } from '../types/user';

interface UserContextType {
  profile: UserProfile;
  unit: UnitSystem;
  silhouette: AvatarSilhouette;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  setUnitSystem: (unit: UnitSystem) => Promise<void>;
  setSilhouette: (silhouette: AvatarSilhouette) => Promise<void>;
  toggleTheme: () => Promise<void>;
}

const defaultProfileState: UserProfile = {
  id: 'default-user',
  name: 'Atleta',
  avatarSilhouette: 'neutral',
  unitSystem: 'kg',
  goal: 'hypertrophy',
  defaultRestSeconds: 90,
  soundEnabled: true,
  vibrationEnabled: true,
  theme: 'dark',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile>(defaultProfileState);

  useEffect(() => {
    async function loadUser() {
      try {
        const user = await db.users.get('default-user');
        if (user) {
          setProfile(user);
          applyTheme(user.theme);
        } else {
          applyTheme('dark');
        }
      } catch (err) {
        console.error('Erro ao carregar utilizador:', err);
      }
    }
    loadUser();
  }, []);

  const applyTheme = (theme: 'dark' | 'light') => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    const updated = {
      ...profile,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    setProfile(updated);
    if (updates.theme) {
      applyTheme(updates.theme);
    }
    await db.users.put(updated);
  };

  const setUnitSystem = async (unit: UnitSystem) => {
    await updateProfile({ unitSystem: unit });
  };

  const setSilhouette = async (silhouette: AvatarSilhouette) => {
    await updateProfile({ avatarSilhouette: silhouette });
  };

  const toggleTheme = async () => {
    const newTheme = profile.theme === 'dark' ? 'light' : 'dark';
    await updateProfile({ theme: newTheme });
  };

  return (
    <UserContext.Provider
      value={{
        profile,
        unit: profile.unitSystem,
        silhouette: profile.avatarSilhouette,
        updateProfile,
        setUnitSystem,
        setSilhouette,
        toggleTheme,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
