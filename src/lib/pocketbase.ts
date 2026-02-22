import PocketBase from 'pocketbase';
import type { User, Plant, UserPlant, Diagnosis, Compatibility, Badge, ActivityLog } from './types/pocketbase';

// URL de votre instance PocketBase (à configurer via variable d'environnement)
const PB_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';

// Instance admin singleton (côté serveur uniquement)
let adminClient: PocketBase | null = null;
let adminAuthPromise: Promise<void> | null = null;

/**
 * Crée une instance fraîche de PocketBase sans authentification.
 * Côté serveur, on crée toujours une nouvelle instance pour éviter les problèmes
 * de token d'auth qui peuvent causer des erreurs 403 sur les collections publiques.
 */
export function getPocketBaseClient(): PocketBase {
  const pb = new PocketBase(PB_URL);
  
  // Côté serveur, s'assurer qu'il n'y a pas de token d'auth stocké
  if (typeof window === 'undefined') {
    pb.authStore.clear();
  }
  
  return pb;
}

/**
 * Retourne un client PocketBase authentifié en tant que superuser.
 * Cette fonction est uniquement disponible côté serveur et utilise les
 * credentials admin depuis les variables d'environnement.
 * 
 * L'authentification est mise en cache pour éviter de se ré-authentifier
 * à chaque appel.
 */
export async function getAdminClient(): Promise<PocketBase> {
  // Vérifier qu'on est côté serveur
  if (typeof window !== 'undefined') {
    throw new Error('getAdminClient() ne peut être utilisé que côté serveur');
  }

  const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL;
  const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error(
      'POCKETBASE_ADMIN_EMAIL et POCKETBASE_ADMIN_PASSWORD doivent être définis dans les variables d\'environnement'
    );
  }

  // Si on a déjà un client authentifié et valide, le retourner
  if (adminClient && adminClient.authStore.isValid) {
    return adminClient;
  }

  // Si une authentification est en cours, attendre qu'elle se termine
  if (adminAuthPromise) {
    await adminAuthPromise;
    if (adminClient && adminClient.authStore.isValid) {
      return adminClient;
    }
  }

  // Créer une nouvelle instance et s'authentifier
  adminClient = new PocketBase(PB_URL);
  
  // Créer une promesse d'authentification pour éviter les authentifications multiples simultanées
  adminAuthPromise = adminClient.admins.authWithPassword(adminEmail, adminPassword)
    .then(() => {
      adminAuthPromise = null;
    })
    .catch((error) => {
      adminClient = null;
      adminAuthPromise = null;
      throw new Error(`Erreur d'authentification admin PocketBase: ${error.message}`);
    });

  await adminAuthPromise;
  
  return adminClient;
}

// Helpers pour les collections
export const pb = {
  // Users
  users: () => getPocketBaseClient().collection('users'),
  
  // Plants
  plants: () => getPocketBaseClient().collection('plants'),
  
  // User Plants
  userPlants: () => getPocketBaseClient().collection('user_plants'),
  
  // Diagnoses
  diagnoses: () => getPocketBaseClient().collection('diagnoses'),
  
  // Compatibilities
  compatibilities: () => getPocketBaseClient().collection('compatibilities'),
  
  // Badges
  badges: () => getPocketBaseClient().collection('badges'),
  
  // Activity Log
  activityLog: () => getPocketBaseClient().collection('activity_log'),
};

// Types d'aide pour les réponses PocketBase
export type PbResponse<T> = T & {
  id: string;
  created: string;
  updated: string;
};
