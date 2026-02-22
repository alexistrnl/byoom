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

RÈGLES POUR care_tips :
- watering : DOIT TOUJOURS inclure la fréquence en semaines. Exemple : "Arroser toutes les 3-4 semaines, laisser sécher complètement entre les arrosages" ou "Arroser 1 fois par semaine en été, toutes les 2 semaines en hiver"
- humidity : Sois honnête. Si la plante tolère l'air sec, écris : "Aucune exigence particulière, tolère très bien l'air sec". Si elle nécessite de l'humidité, précise le pourcentage ou le niveau requis.

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
    max_tokens: 1000,
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
 */
export async function diagnosePlant(
  imageBase64: string,
  plantName: string,
  plantScientificName?: string,
  mimeType: string = 'image/jpeg'
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

Réponds UNIQUEMENT en JSON valide :
{
  "health_score": 0-100,
  "overall_status": "saine|attention|malade|critique",
  "issues": [
    {
      "type": "Nom du problème (cause probable si incertaine)",
      "severity": "faible|modéré|grave",
      "description": "explication",
      "solution": "action recommandée"
    }
  ],
  "immediate_actions": ["action1", "action2"],
  "prevention_tips": ["conseil1", "conseil2"]
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
    max_tokens: 1500,
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
