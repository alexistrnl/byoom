// Helper pour vérifier le statut premium
export function isPremium(user: any): boolean {
  if (!user) return false;
  if (user.subscription_plan !== 'premium') return false;
  if (user.subscription_status !== 'active') return false;
  if (user.subscription_end_date) {
    return new Date(user.subscription_end_date) > new Date();
  }
  return true;
}

// Limites freemium
export const FREEMIUM_LIMITS = {
  maxPlants: 2,
  diagnosisPerMonth: 1,
  chatMessagesPerDay: 5,
};
