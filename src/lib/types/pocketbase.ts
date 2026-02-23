// Types TypeScript pour les collections PocketBase

export interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  display_name?: string;
  points_total: number;
  level: number;
  badges: string[];
  profile_public: boolean;
  bio?: string;
  created: string;
  updated: string;
}

export interface Plant {
  id: string;
  common_name: string;
  scientific_name: string;
  family: string;
  description: string;
  brief_description?: string;
  history?: string;
  fun_facts?: string[] | string; // JSON array or string
  uses?: string;
  difficulty: number; // 1-5
  watering_frequency: string;
  light_needs: "faible" | "moyen" | "fort" | "direct";
  humidity: "faible" | "moyen" | "élevé";
  temperature_min: number;
  temperature_max: number;
  soil_type: string;
  toxic_to_pets: boolean;
  toxic_to_humans: boolean;
  edible: boolean;
  recipes: string[];
  pruning_advice?: string;
  bonsai_compatible: boolean;
  bonsai_tips?: string;
  cover_image?: string;
  tags: string[];
  ai_generated: boolean;
  verified: boolean;
  created: string;
  updated: string;
}

export interface UserPlant {
  id: string;
  user: string; // relation to users
  plant: string; // relation to plants
  nickname?: string;
  acquisition_date: string;
  location?: string;
  photos: string[];
  notes?: string;
  health_score: number; // 0-100
  last_watered?: string;
  last_fertilized?: string;
  last_repotted?: string;
  public_visible: boolean;
  points_earned: number;
  streak_days: number;
  created: string;
  updated: string;
}

export interface Diagnosis {
  id: string;
  user_plant: string; // relation to user_plants
  user: string; // relation to users
  image: string;
  ai_analysis: string;
  health_status: "saine" | "attention" | "malade" | "critique";
  issues_detected: Array<{
    type: string;
    severity: "faible" | "modéré" | "grave";
    description: string;
    solution: string;
  }>;
  recommendations: string[];
  points_awarded: number;
  created: string;
}

export interface Compatibility {
  id: string;
  plant_a: string; // relation to plants
  plant_b: string; // relation to plants
  compatible: boolean;
  reason: string;
  ai_generated: boolean;
  created: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition_type: "streak" | "collection" | "diagnosis" | "level" | "special";
  condition_value: number;
  xp_reward: number;
  created: string;
}

export interface ActivityLog {
  id: string;
  user: string; // relation to users
  type: "diagnosis" | "watering" | "photo" | "identification" | "streak";
  user_plant?: string; // relation to user_plants
  points: number;
  created: string;
}
