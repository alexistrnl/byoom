import OpenAI from 'openai';
import type { Plant } from './types/pocketbase';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Types pour les réponses IA
export interface PlantIdentificationResult {
  common_name: string;
  scientific_name: string;
  family: string;
  confidence: number;
  difficulty: number;
  brief_description: string;
  care_tips: {
    watering: string;
    light: string;
    soil: string;
    temperature: string;
    humidity: string;
  };
  edible: boolean;
  toxic_to_pets: boolean;
  tags: string[];
}

export interface DiagnosisResult {
  health_score: number;
  overall_status: 'saine' | 'attention' | 'malade' | 'critique';
  issues: Array<{
    type: string;
    severity: 'faible' | 'modéré' | 'grave';
    description: string;
    solution: string;
  }>;
  immediate_actions: string[];
  prevention_tips: string[];
}

export interface CompatibilityResult {
  compatible: boolean;
  reason: string;
  details: {
    light_compatibility: string;
    water_compatibility: string;
    ph_compatibility: string;
    common_pests: string;
  };
}

/**
 * Identifie une plante à partir d'une image
 * @param imageBase64 - Image encodée en base64 (sans préfixe data URL)
 * @param mimeType - Type MIME de l'image (par défaut: 'image/jpeg')
 */
export async function identifyPlant(imageBase64: string, mimeType: string = 'image/jpeg'): Promise<PlantIdentificationResult> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `Tu es un botaniste expert. Analyse cette image et identifie la plante.

RÈGLE IMPORTANTE - difficulty (entier 1 à 5) :
- 1 = très facile : ZZ, pothos, cactus, snake plant, philodendron
- 2 = facile : monstera, ficus, aloe vera, spider plant
- 3 = moyen : orchidée phalaenopsis, palmier, fougère
- 4 = difficile : orchidées exotiques, plantes carnivores
- 5 = expert : bonsaï avancé, plantes tropicales très exigeantes
La majorité des plantes communes = 1 ou 2. Sois strict.

RÈGLES ULTRA-PRÉCISES POUR care_tips (spécifiques à CETTE espèce) :

"watering" : DOIT inclure :
- Fréquence EXACTE : ex "1x/semaine en été, 1x/3 semaines en hiver" ou "Tous les 5-7 jours en période de croissance"
- Volume précis : ex "jusqu'à ce que l'eau s'écoule par le bas du pot" ou "50-100ml selon la taille du pot"
- Méthode : arrosage par le haut/bas, eau à température ambiante, etc.
- Signes spécifiques de sur-arrosage pour CETTE plante : ex "feuilles jaunes et molles, pourriture des racines"
- Signes spécifiques de sous-arrosage pour CETTE plante : ex "feuilles qui s'enroulent, terreau qui se décolle du pot"

"light" : DOIT inclure :
- Exposition précise : nombre d'heures de lumière directe/indirecte par jour
- Orientation fenêtre : nord/sud/est/ouest selon les besoins
- Distance maximale de la fenêtre en mètres : ex "max 2m d'une fenêtre sud"
- Ce qui se passe si trop de lumière pour CETTE espèce : ex "brûlures foliaires, décoloration"
- Ce qui se passe si pas assez de lumière pour CETTE espèce : ex "étiolement, perte de couleur, chute des feuilles"

"soil" : DOIT inclure :
- Composition EXACTE du terreau idéal avec proportions : ex "60% terreau universel + 30% perlite + 10% écorces de pin" ou "50% terreau plantes vertes + 50% sable grossier"
- pH idéal : ex "pH 6.0-6.5 (légèrement acide)"
- Fréquence de rempotage : ex "Tous les 2 ans au printemps"
- Signes qu'il faut rempoter : ex "racines qui sortent du pot, croissance ralentie, terreau qui sèche très vite"

"temperature" : DOIT inclure :
- Plage RÉELLE de cette espèce (pas 15-25°C générique) : ex "18-24°C en été, 12-18°C en hiver"
- Température minimale absolue tolérée : ex "minimum 10°C, risque de dommages en dessous"
- Température maximale tolérée : ex "jusqu'à 30°C si humidité élevée"
- Sensibilité aux courants d'air : ex "très sensible, éviter les courants d'air froid"
- Sensibilité aux radiateurs : ex "maintenir à 1m minimum des radiateurs"

"humidity" : DOIT inclure :
- Taux d'humidité idéal en % : ex "60-70% d'humidité relative"
- Si humidité requise, méthodes concrètes :
  * Brumisation : fréquence exacte (ex "2x/jour le matin et soir")
  * Plateau de galets : instructions précises
  * Humidificateur : type et distance recommandée
- Si tolère air sec : le dire clairement : ex "Tolère très bien l'air sec (30-40%), aucune exigence particulière"

Réponds UNIQUEMENT en JSON valide :
{
  "common_name": "Nom commun en français",
  "scientific_name": "Nom scientifique",
  "family": "Famille botanique",
  "confidence": 0-100,
  "difficulty": 1,
  "brief_description": "2-3 phrases",
  "care_tips": {
    "watering": "...",
    "light": "...",
    "soil": "...",
    "temperature": "...",
    "humidity": "..."
  },
  "edible": true/false,
  "toxic_to_pets": true/false,
  "tags": ["tag1", "tag2"]
}`,
      },
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: {
              url: `data:${mimeType};base64,${imageBase64}`,
            },
          },
        ],
      },
    ],
    response_format: { type: 'json_object' },
    max_tokens: 2000,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('Aucune réponse de l\'IA');
  }

  return JSON.parse(content) as PlantIdentificationResult;
}

/**
 * Diagnostique la santé d'une plante à partir d'une image
 * @param imageBase64 - Image encodée en base64 (sans préfixe data URL)
 * @param plantName - Nom de la plante
 * @param plantScientificName - Nom scientifique de la plante (optionnel)
 * @param mimeType - Type MIME de l'image (par défaut: 'image/jpeg')
 * @param observations - Observations de l'utilisateur (optionnel)
 */
export async function diagnosePlant(
  imageBase64: string,
  plantName: string,
  plantScientificName?: string,
  mimeType: string = 'image/jpeg',
  observations?: string
): Promise<DiagnosisResult> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `Tu es un phytopathologiste expert. Analyse cette photo d'une plante 
nommée ${plantName}${plantScientificName ? ` (${plantScientificName})` : ''} et identifie tout problème visible.

IMPORTANT - Approche probabiliste pour le champ "type" :
Pour chaque problème, si plusieurs causes sont possibles, indique la plus probable entre parenthèses avec le mot 'probable' ou 'possible'. Reste toujours scientifiquement prudent et ne jamais affirmer avec certitude sans preuve visuelle claire.

Exemples de format pour "type" :
- "Taches foliaires (probable infection fongique)"
- "Jaunissement des feuilles (possible carence en azote)"
- "Flétrissement (arrosage insuffisant ou excès)"
- "Chute des feuilles (stress hydrique probable)"

RÈGLES ULTRA-PRÉCISES POUR LES SOLUTIONS :

Pour chaque "solution" dans "issues", tu DOIS répondre à ces 4 questions :
1. QUOI faire exactement : produit spécifique (nom commercial si possible), geste précis, outil nécessaire
2. QUAND le faire : immédiatement / dans X jours / à la prochaine saison / conditions météo
3. COMMENT : dosage exact, technique précise, durée du traitement, fréquence
4. COMMENT SAVOIR si ça marche : signe de guérison attendu, délai avant amélioration visible

Exemple de BONNE solution :
"Retirer immédiatement les feuilles touchées avec des ciseaux désinfectés à l'alcool à 70°. Appliquer un fongicide à base de cuivre (ex: bouillie bordelaise) dilué à 2% (20ml pour 1L d'eau) sur toutes les feuilles, dessus et dessous, tous les 7 jours pendant 3 semaines. Améliorer la ventilation en espaçant les plantes. Signe de guérison : pas de nouvelles taches après 2 semaines, feuilles existantes ne s'aggravent pas."

Exemple de MAUVAISE solution (trop vague) :
"Traiter avec un fongicide et améliorer les conditions." ❌

Pour "immediate_actions" : 
- Actions à faire dans les 24h maximum
- Très concrètes et actionnables : ex "Isoler la plante à 2m minimum des autres", "Réduire l'arrosage à 1x/2 semaines immédiatement", "Retirer les feuilles mortes avec des gants"

Pour "prevention_tips" :
- Habitudes à adopter avec fréquence précise : ex "Vérifier l'humidité du terreau avec un doigt 2x/semaine", "Nettoyer les feuilles avec un chiffon humide 1x/mois", "Fertiliser avec un engrais équilibré 1x/mois d'avril à septembre"

Réponds UNIQUEMENT en JSON valide :
{
  "health_score": 0-100,
  "overall_status": "saine|attention|malade|critique",
  "issues": [
    {
      "type": "Nom du problème (cause probable si incertaine)",
      "severity": "faible|modéré|grave",
      "description": "explication détaillée du problème visible",
      "solution": "Solution ultra-précise avec QUOI/QUAND/COMMENT/COMMENT SAVOIR"
    }
  ],
  "immediate_actions": ["action concrète dans les 24h", "autre action urgente"],
  "prevention_tips": ["habitude avec fréquence précise", "autre conseil préventif"]
}`,
      },
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: {
              url: `data:${mimeType};base64,${imageBase64}`,
            },
          },
          ...(observations
            ? [
                {
                  type: 'text' as const,
                  text: `Observations de l'utilisateur : ${observations}`,
                },
              ]
            : []),
        ],
      },
    ],
    response_format: { type: 'json_object' },
    max_tokens: 3000,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('Aucune réponse de l\'IA');
  }

  return JSON.parse(content) as DiagnosisResult;
}

/**
 * Teste la compatibilité entre deux plantes
 */
export async function checkCompatibility(
  plantA: Plant,
  plantB: Plant
): Promise<CompatibilityResult> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `Tu es un expert en jardinage et compatibilité botanique. 
Analyse si deux plantes peuvent être cultivées ensemble.
Réponds UNIQUEMENT en JSON valide :
{
  "compatible": true/false,
  "reason": "explication générale",
  "details": {
    "light_compatibility": "...",
    "water_compatibility": "...",
    "ph_compatibility": "...",
    "common_pests": "..."
  }
}`,
      },
      {
        role: 'user',
        content: `Plante A: ${plantA.common_name} (${plantA.scientific_name})
- Lumière: ${plantA.light_needs}
- Arrosage: ${plantA.watering_frequency}
- Température: ${plantA.temperature_min}-${plantA.temperature_max}°C
- Humidité: ${plantA.humidity}

Plante B: ${plantB.common_name} (${plantB.scientific_name})
- Lumière: ${plantB.light_needs}
- Arrosage: ${plantB.watering_frequency}
- Température: ${plantB.temperature_min}-${plantB.temperature_max}°C
- Humidité: ${plantB.humidity}

Ces deux plantes sont-elles compatibles pour être cultivées ensemble ?`,
      },
    ],
    response_format: { type: 'json_object' },
    max_tokens: 800,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('Aucune réponse de l\'IA');
  }

  return JSON.parse(content) as CompatibilityResult;
}

/**
 * Génère des recettes pour une plante comestible
 */
export async function generateRecipes(plant: Plant): Promise<string[]> {
  if (!plant.edible) {
    return [];
  }

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `Tu es un chef cuisinier spécialisé en cuisine végétale. 
Génère 3-5 recettes utilisant ${plant.common_name}.
Chaque recette doit être au format JSON dans un tableau :
[
  {
    "name": "Nom de la recette",
    "ingredients": ["ingrédient1", "ingrédient2"],
    "steps": ["étape1", "étape2"],
    "prep_time": "X minutes",
    "difficulty": "facile|moyen|difficile"
  }
]`,
      },
      {
        role: 'user',
        content: `Génère des recettes pour ${plant.common_name} (${plant.scientific_name}).`,
      },
    ],
    response_format: { type: 'json_object' },
    max_tokens: 2000,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('Aucune réponse de l\'IA');
  }

  const parsed = JSON.parse(content);
  return parsed.recipes || [];
}
