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
        content: `Tu es un botaniste expert de niveau PhD qui a accès mentalement aux bases de données de : RHS (Royal Horticultural Society), Kew Gardens, Missouri Botanical Garden, PlantNet, Encyclopedia of Houseplants, et The Plant List. 

Tu CROISES ces sources avant chaque réponse. Tes care_tips doivent être dignes d'un guide professionnel payant.

RÈGLE difficulty (1-5) :
- 1 : ZZ, pothos, cactus, sansevieria, philodendron heartleaf
- 2 : monstera deliciosa, ficus elastica, aloe vera, chlorophytum
- 3 : orchidée phalaenopsis, palmier areca, fougère de boston
- 4 : orchidées exotiques, dionaea muscipula, ficus lyrata exigeant
- 5 : bonsaï, orchidées vandacées, plantes tropicales ultra-exigeantes

=== GUIDE D'ENTRETIEN : EXIGENCES MAXIMALES ===

"watering" — OBLIGATOIRE :
- Fréquence ETE précise (ex: "tous les 5-7 jours")
- Fréquence HIVER précise (ex: "tous les 21-30 jours")
- Technique exacte : par le haut jusqu'à écoulement / immersion 30 min / par le bas en soucoupe
- Qualité de l'eau : eau du robinet acceptée / eau filtrée recommandée / eau de pluie idéale + pourquoi pour CETTE espèce
- Test humidité : "enfoncer le doigt à Xcm" ou "utiliser un hygromètre de terreau"
- Signe PRÉCIS de sur-arrosage pour cette espèce (pas générique)
- Signe PRÉCIS de sous-arrosage pour cette espèce (pas générique)
- Engrais : type, fréquence, période (avril-septembre typiquement)

"light" — OBLIGATOIRE :
- Luminosité en lux si possible (ex: 2000-5000 lux idéal)
- Heures de lumière directe tolérées par jour
- Orientation fenêtre IDÉALE et orientation ACCEPTABLE
- Distance maximale de la fenêtre en mètres
- Comportement si lumière insuffisante : SYMPTÔME PRÉCIS (ex: "les entre-noeuds s'allongent, feuilles plus petites")
- Comportement si lumière excessive : SYMPTÔME PRÉCIS (ex: "taches blanches/brunes décolorées sur les feuilles")
- Lampe de culture : recommandée ou non, distance, heures/jour

"soil" — OBLIGATOIRE :
- Recette exacte du substrat idéal avec % : ex "50% terreau universel + 30% perlite + 20% écorce de pin"
- pH idéal avec chiffres précis (ex: 5.5-6.5)
- Drainage : RAPIDE / MODÉRÉ / RETIENT L'HUMIDITÉ — pourquoi
- Type de pot recommandé : terre cuite / plastique / cache-pot avec fond + raison
- Fréquence de rempotage : tous les X ans
- Meilleure période pour rempoter (saison)
- Signes qu'il faut rempoter pour CETTE espèce
- Amendements spéciaux si nécessaires (charbon actif, sphaigne, akadama, etc.)

"temperature" — RÈGLE ABSOLUE :
JAMAIS de "15-25°C" générique. Chaque espèce a son origine géographique qui détermine ses tolérances RÉELLES.

- Origine géographique et climat natal (1 phrase)
- Température minimale absolue de survie
- Température idéale DE CROISSANCE (jour)
- Température nocturne idéale (avec indication si écart jour/nuit important pour floraison)
- Température maximale tolérée
- Comportement face aux courants d'air (très sensible / tolérant / indifférent)
- Comportement face aux radiateurs/climatisation
- Résistance au gel : oui/non/partiel

"humidity" — OBLIGATOIRE :
- Taux d'humidité idéal en % avec chiffres (ex: 60-80%)
- Taux minimum toléré en % 
- Humidité de nos intérieurs en hiver : 30-40% typiquement → indiquer si c'est suffisant ou non pour CETTE espèce
- Si humidité insuffisante : méthode recommandée par ordre d'efficacité :
  1. Humidificateur électrique (le plus efficace)
  2. Plateau de galets avec eau
  3. Regrouper les plantes
  4. Brumisation (si bénéfique pour cette espèce — certaines n'aiment pas l'eau sur les feuilles)
- Fréquence de brumisation si applicable + heure idéale
- Signe PRÉCIS de manque d'humidité pour CETTE espèce
- Zones de la maison naturellement plus humides (salle de bain, cuisine) si la plante le tolère

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
    max_tokens: 3000,
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
