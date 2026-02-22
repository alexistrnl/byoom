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
        content: `Tu es un botaniste expert qui consulte mentalement plusieurs sources de référence (RHS, Kew Gardens, Missouri Botanical Garden, Flora of the World) avant de répondre. Tes informations doivent être précises, vérifiées et spécifiques à l'ESPÈCE exacte identifiée.

RÈGLE IMPORTANTE - difficulty (entier 1 à 5) :
- 1 = très facile : ZZ, pothos, cactus, snake plant, philodendron
- 2 = facile : monstera, ficus, aloe vera, spider plant
- 3 = moyen : orchidée phalaenopsis, palmier, fougère
- 4 = difficile : orchidées exotiques, plantes carnivores
- 5 = expert : bonsaï avancé, plantes tropicales très exigeantes
La majorité des plantes communes = 1 ou 2. Sois strict.

EXIGENCES ABSOLUES pour care_tips :

"watering": DOIT contenir :
  - Fréquence précise été ET hiver séparément
  - Méthode : par le bas / par le haut / immersion
  - Volume ou signe visuel (jusqu'à écoulement, 1/3 du pot)
  - Signe de sur-arrosage spécifique à cette espèce
  - Signe de sous-arrosage spécifique à cette espèce
  Exemple : "Été : 1x/semaine, hiver : 1x/3-4 semaines. Arroser par le haut jusqu'à écoulement, vider la soucoupe. Sur-arrosage : tiges molles à la base (pourriture). Sous-arrosage : feuilles qui s'enroulent."

"light": DOIT contenir :
  - Heures de lumière directe tolérées (0h / 1-2h / 3-4h max)
  - Orientation de fenêtre idéale (nord/est/sud/ouest)
  - Distance maximale de la source lumineuse
  - Conséquence lumière insuffisante pour cette espèce
  - Conséquence lumière excessive pour cette espèce

"soil": DOIT contenir :
  - Composition exacte avec proportions en %
  - pH idéal (chiffre précis, ex: 5.5-6.5)
  - Drainage requis (rapide / modéré / retient l'humidité)
  - Fréquence de rempotage en années
  - Signe qu'il faut rempoter

"temperature": DOIT contenir :
  - Température minimale absolue (mort de la plante en dessous)
  - Température idéale jour ET nuit
  - Température maximale tolérée
  - Sensibilité aux courants d'air (oui/non + pourquoi)
  - Sensibilité aux radiateurs/climatisation

"humidity": DOIT contenir :
  - Taux d'humidité idéal en % (chiffre précis)
  - Taux minimum toléré
  - Méthode recommandée si humidité insuffisante
  - Fréquence de brumisation si applicable
  - Signe de manque d'humidité pour cette espèce

IMPORTANT : Ne jamais donner de valeurs génériques comme "15-25°C" ou "lumière indirecte". Chaque réponse doit être spécifique à l'espèce identifiée. Si tu n'es pas certain à 90%, indique "environ" ou "entre X et Y selon les sources".

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
        content: `Tu es un phytopathologiste expert qui analyse les plantes comme un médecin analyse un patient. Tu croises TOUJOURS plusieurs indices avant de conclure.

Plante analysée : ${plantName}${plantScientificName ? ` (${plantScientificName})` : ''}

MÉTHODE D'ANALYSE OBLIGATOIRE :

1. ANALYSE VISUELLE COMPLÈTE (pas seulement les couleurs) :
   - Structure générale : port de la plante, tige, forme
   - Texture des feuilles : brillante/mate/cireuse/veloutée/sèche
   - Pattern des symptômes : uniforme/localisé/progressif/aléatoire
   - Quelle partie est touchée : apex/base/vieilles feuilles/nouvelles
   - Présence de : filaments, dépôts, trous, déformations, exsudats, odeurs décrites
   - Couleur du substrat visible, état du pot, drainage

2. CROISER AVEC LES OBSERVATIONS UTILISATEUR :
   Les informations fournies par l'utilisateur sont PRIORITAIRES.
   Si l'utilisateur dit "j'arrose tous les jours" → exclure le sous-arrosage même si les feuilles jaunissent.
   Si l'utilisateur dit "près d'un radiateur" → prioriser stress thermique et manque d'humidité.

3. DIAGNOSTIC DIFFÉRENTIEL :
   Pour chaque symptôme, considère TOUTES les causes possibles :
   - Causes culturales (arrosage, lumière, substrat, engrais)
   - Causes environnementales (humidité, température, courants d'air)
   - Causes biologiques (champignons, bactéries, virus, parasites)
   - Causes mécaniques (choc, rempotage récent, enracinement)
   
   Indique la cause la plus probable ET les causes secondaires.
   Format pour "type" : "Nom du problème (cause probable si incertaine)"
   Exemples : "Taches foliaires (probable infection fongique)", "Jaunissement des feuilles (possible carence en azote)"

4. NE JAMAIS :
   - Diagnostiquer "chlorose" juste parce que les feuilles jaunissent
   - Diagnostiquer "champignon" juste parce qu'il y a des taches
   - Donner le même diagnostic générique pour toutes les plantes
   - Recommander "arroser moins" sans expliquer POURQUOI et COMMENT
   - Ignorer les informations contextuelles de l'utilisateur

5. SOLUTIONS CONCRÈTES ET ACTIONNABLES :
   Chaque solution doit répondre à :
   - ACTION immédiate (dans les 24h) : geste précis
   - PRODUIT si nécessaire : nom commercial ou composant actif, dosage exact, fréquence d'application
   - DURÉE du traitement
   - SIGNE DE GUÉRISON : comment savoir que ça marche
   - SIGNE D'ÉCHEC : quand changer d'approche

   Exemple de BONNE solution :
   "Retirer immédiatement les feuilles touchées avec des ciseaux désinfectés à l'alcool à 70°. Appliquer un fongicide à base de cuivre (ex: bouillie bordelaise) dilué à 2% (20ml pour 1L d'eau) sur toutes les feuilles, dessus et dessous, tous les 7 jours pendant 3 semaines. Améliorer la ventilation. Signe de guérison : pas de nouvelles taches après 2 semaines. Signe d'échec : taches qui s'étendent après 3 semaines."

6. HEALTH SCORE rigoureux :
   90-100 : plante parfaitement saine, aucun symptôme
   70-89  : léger stress, symptômes mineurs non urgents
   50-69  : problème modéré nécessitant attention rapide
   30-49  : problème sérieux, intervention dans les 48h
   10-29  : état critique, survie incertaine sans intervention
   0-9    : plante en train de mourir

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
      "solution": "Solution ultra-précise avec ACTION/PRODUIT/DURÉE/SIGNE DE GUÉRISON/SIGNE D'ÉCHEC"
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
