'use client';

import { createContext, useContext, useEffect, useState, useRef, useCallback, ReactNode } from 'react';
import PocketBase from 'pocketbase';
import type { User } from '../types/pocketbase';

const PB_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';

interface PocketBaseContextType {
  pb: PocketBase;
  user: User | null;
  loading: boolean;
  initialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const PocketBaseContext = createContext<PocketBaseContextType | undefined>(undefined);

export function PocketBaseProvider({ children }: { children: ReactNode }) {
  const [pb] = useState(() => new PocketBase(PB_URL));
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const isLoadingUserRef = useRef(false);
  const initializedRef = useRef(false);

  const loadUser = useCallback(async () => {
    // Éviter les appels multiples simultanés
    if (isLoadingUserRef.current) return;
    
    // Vérifier que l'auth est valide avant l'appel
    if (!pb.authStore.isValid || !pb.authStore.model) {
      setUser(null);
      return;
    }

    isLoadingUserRef.current = true;
    try {
      const authData = pb.authStore.model;
      if (authData && pb.authStore.isValid) {
        const userData = await pb.collection('users').getOne(authData.id, { requestKey: null });
        setUser(userData as User);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'utilisateur:', error);
      // Ne nettoyer l'auth que si c'est une erreur d'authentification
      if (error instanceof Error && (error.message.includes('401') || error.message.includes('403'))) {
        pb.authStore.clear();
        setUser(null);
      }
    } finally {
      isLoadingUserRef.current = false;
    }
  }, [pb]);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Vérifier si l'auth est valide avant de charger
        if (pb.authStore.isValid && pb.authStore.model) {
          await loadUser();
        } else {
          // Si le token existe mais n'est pas valide, le nettoyer
          if (pb.authStore.model) {
            pb.authStore.clear();
          }
        }
      } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error);
        pb.authStore.clear();
      } finally {
        if (mounted) {
          setLoading(false);
          setInitialized(true);
          initializedRef.current = true;
        }
      }
    };

    initializeAuth();

    // Écouter les changements d'auth (seulement après l'initialisation)
    const unsubscribe = pb.authStore.onChange((token, model) => {
      if (!initializedRef.current) return; // Ignorer les changements avant l'initialisation
      
      if (model && pb.authStore.isValid) {
        // Ne charger que si on n'est pas déjà en train de charger
        if (!isLoadingUserRef.current) {
          loadUser();
        }
      } else {
        setUser(null);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [pb, loadUser]);

  const login = async (email: string, password: string) => {
    isLoadingUserRef.current = true;
    try {
      await pb.collection('users').authWithPassword(email, password);
      // Vérifier que l'auth est valide après le login
      if (pb.authStore.isValid) {
        await loadUser();
      }
    } catch (error) {
      isLoadingUserRef.current = false;
      throw error;
    } finally {
      isLoadingUserRef.current = false;
    }
  };

  const logout = () => {
    pb.authStore.clear();
    setUser(null);
  };

  const refresh = async () => {
    // Vérifier que l'auth est valide avant de rafraîchir
    if (pb.authStore.isValid) {
      await loadUser();
    }
  };

  return (
    <PocketBaseContext.Provider value={{ pb, user, loading, initialized, login, logout, refresh }}>
      {children}
    </PocketBaseContext.Provider>
  );
}

export function usePocketBase() {
  const context = useContext(PocketBaseContext);
  if (context === undefined) {
    throw new Error('usePocketBase must be used within a PocketBaseProvider');
  }
  return context;
}
