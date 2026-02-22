import type { User, UserPlant, Diagnosis, ActivityLog } from './types/pocketbase';
import PocketBase from 'pocketbase';
import { getAdminClient } from './pocketbase';

// Points XP par action
export const XP_REWARDS = {
  IDENTIFY_NEW_PLANT: 50,
  DIAGNOSIS_HEALTHY: 30,
  DIAGNOSIS_PROBLEM: 20,
  DAILY_PHOTO: 10,
  STREAK_7_DAYS: 100,
  STREAK_30_DAYS: 500,
  FIRST_REPOT: 25,
  WATERING: 5,
  COMPATIBILITY_TEST: 15,
  PROFILE_COMPLETE: 50,
} as const;

// Niveaux
export const LEVELS = [
  { name: 'Graine', min: 0, max: 199 },
  { name: 'Pousse', min: 200, max: 499 },
  { name: 'Plante', min: 500, max: 999 },
  { name: 'Arbuste', min: 1000, max: 2499 },
  { name: 'Arbre', min: 2500, max: 4999 },
  { name: 'Forêt', min: 5000, max: 9999 },
  { name: 'Jardinier Pro', min: 10000, max: Infinity },
] as const;

/**
 * Calcule le niveau à partir des points XP
 */
export function calculateLevel(points: number): { level: number; name: string; nextLevelPoints: number } {
  for (let i = 0; i < LEVELS.length; i++) {
    const level = LEVELS[i];
    if (points >= level.min && points <= level.max) {
      const nextLevel = LEVELS[i + 1];
      return {
        level: i + 1,
        name: level.name,
        nextLevelPoints: nextLevel ? nextLevel.min : level.max,
      };
    }
  }
  return {
    level: LEVELS.length,
    name: LEVELS[LEVELS.length - 1].name,
    nextLevelPoints: Infinity,
  };
}

/**
 * Ajoute des points XP à un utilisateur
 * Utilise getAdminClient() pour les opérations d'écriture côté serveur
 */
export async function addPoints(
  userId: string,
  points: number,
  activityType: ActivityLog['type'],
  userPlantId?: string
): Promise<void> {
  console.log('addPoints appelé pour userId:', userId, 'points:', points, 'activityType:', activityType);

  // Utiliser getAdminClient() côté serveur uniquement (cette fonction est appelée depuis les routes API)
  if (typeof window !== 'undefined') {
    throw new Error('addPoints() ne peut être appelée que côté serveur');
  }

  try {
    const adminPb = await getAdminClient();
    console.log('getAdminClient() réussi, adminPb obtenu');

    // Lire l'utilisateur
    const user = await adminPb.collection('users').getOne(userId, { requestKey: null });
    console.log('user complet:', JSON.stringify(user));

    // Calculer les nouveaux points en utilisant la notation avec crochets pour les champs custom
    const currentPoints = Number(user['points_total']) || 0;
    const newPoints = currentPoints + points;
    const { level } = calculateLevel(newPoints);

    console.log('points calculés - actuel:', currentPoints, '+ ajout:', points, '= nouveau:', newPoints);
    console.log('nouveau niveau:', level);

    // Mettre à jour avec les clés en string et requestKey: null
    const updated = await adminPb.collection('users').update(
      userId,
      {
        'points_total': newPoints,
        'level': level,
      },
      { requestKey: null }
    );
    console.log('updated complet:', JSON.stringify(updated));

    // Enregistrer dans l'historique d'activité
    await adminPb.collection('activity_log').create({
      user: userId,
      type: activityType,
      user_plant: userPlantId || undefined,
      points,
    });
    console.log('activity_log créé avec succès');
  } catch (error) {
    console.error('Erreur dans addPoints():', error);
    throw error;
  }
}

/**
 * Vérifie et met à jour le streak d'une plante
 */
export async function updateStreak(userPlantId: string): Promise<number> {
  const pb = typeof window === 'undefined' 
    ? await getAdminClient()
    : new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090');

  const userPlant = await pb.collection('user_plants').getOne(userPlantId);
  const today = new Date().toISOString().split('T')[0];
  const lastPhotoDate = userPlant.updated?.split('T')[0];

  let newStreak = userPlant.streak_days || 0;

  if (lastPhotoDate === today) {
    // Déjà mis à jour aujourd'hui
    return newStreak;
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (lastPhotoDate === yesterdayStr) {
    // Streak continue
    newStreak += 1;
  } else {
    // Streak rompu, recommencer à 1
    newStreak = 1;
  }

  await pb.collection('user_plants').update(userPlantId, {
    streak_days: newStreak,
  });

  // Vérifier les badges de streak
  const user = await pb.collection('users').getOne(userPlant.user);
  if (newStreak === 7 && !user.badges?.includes('streak_7')) {
    await addPoints(user.id, XP_REWARDS.STREAK_7_DAYS, 'streak', userPlantId);
    // TODO: Ajouter le badge
  }
  if (newStreak === 30 && !user.badges?.includes('streak_30')) {
    await addPoints(user.id, XP_REWARDS.STREAK_30_DAYS, 'streak', userPlantId);
    // TODO: Ajouter le badge
  }

  return newStreak;
}

/**
 * Vérifie et accorde des badges
 */
export async function checkBadges(userId: string): Promise<string[]> {
  const pb = typeof window === 'undefined' 
    ? await getAdminClient()
    : new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090');

  const user = await pb.collection('users').getOne(userId);
  const userPlants = await pb.collection('user_plants').getList(1, 1000, {
    filter: `user = "${userId}"`,
  });

  const newBadges: string[] = [];

  // Badge "Première Pousse" - première plante identifiée
  if (userPlants.totalItems >= 1 && !user.badges?.includes('first_plant')) {
    newBadges.push('first_plant');
  }

  // Badge "Collectionneur" - 10 plantes
  if (userPlants.totalItems >= 10 && !user.badges?.includes('collector')) {
    newBadges.push('collector');
  }

  // Badge "Photographe" - 50 photos
  const totalPhotos = userPlants.items.reduce(
    (sum, plant) => sum + (plant.photos?.length || 0),
    0
  );
  if (totalPhotos >= 50 && !user.badges?.includes('photographer')) {
    newBadges.push('photographer');
  }

  if (newBadges.length > 0) {
    await pb.collection('users').update(userId, {
      badges: [...(user.badges || []), ...newBadges],
    });
  }

  return newBadges;
}
