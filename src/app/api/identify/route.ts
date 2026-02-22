import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { identifyPlant } from '@/lib/openai';
import { getAdminClient } from '@/lib/pocketbase';
import { addPoints, XP_REWARDS } from '@/lib/gamification';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    const userId = formData.get('userId') as string;

    if (!imageFile || !userId) {
      return NextResponse.json(
        { error: 'Image et userId requis' },
        { status: 400 }
      );
    }

    // Logs de debug
    console.log('Type MIME reçu:', imageFile.type);
    console.log('Taille fichier:', imageFile.size);
    console.log('Nom fichier:', imageFile.name);

    // Convertir l'image en buffer
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Convertir toute image en JPEG avec sharp pour garantir la compatibilité
    // Sharp supporte automatiquement HEIC/HEIF, PNG, WebP, etc.
    let jpegBuffer: Buffer;
    try {
      // Utiliser rotate() pour corriger l'orientation EXIF automatiquement
      jpegBuffer = await sharp(buffer)
        .rotate() // Corrige automatiquement l'orientation EXIF
        .jpeg({ quality: 90, mozjpeg: true })
        .toBuffer();
      console.log('Image convertie en JPEG avec sharp');
    } catch (error) {
      console.error('Erreur lors de la conversion avec sharp, utilisation du buffer original:', error);
      // Fallback : utiliser le buffer original si sharp échoue
      jpegBuffer = buffer;
    }

    // Convertir en base64
    const base64 = jpegBuffer.toString('base64');
    console.log('Début base64:', base64.substring(0, 50));

    // Forcer le type MIME à image/jpeg après conversion
    const mimeType = 'image/jpeg';

    // Identifier la plante avec l'IA
    const identification = await identifyPlant(base64, mimeType);

    console.log('Résultat IA complet:', JSON.stringify(identification));

    // Log de la difficulté reçue
    console.log('difficulty reçue:', identification.difficulty);

    // Obtenir le client admin pour les opérations d'écriture
    const pb = await getAdminClient();

    // Vérifier si la plante existe déjà dans la base
    let plant;
    try {
      const existingPlants = await pb.collection('plants').getList(1, 1, {
        filter: `scientific_name = "${identification.scientific_name}"`,
      });

      if (existingPlants.items.length > 0) {
        plant = existingPlants.items[0];
      } else {
        // Créer une nouvelle plante
        const plantData = {
          common_name: identification.common_name,
          scientific_name: identification.scientific_name,
          family: identification.family,
          description: identification.brief_description,
          difficulty: Number(identification.difficulty) || 2,
          watering_frequency: identification.care_tips.watering,
          light_needs: identification.care_tips.light.toLowerCase() as any,
          humidity: identification.care_tips.humidity.toLowerCase() as any,
          temperature_min: 15, // Valeurs par défaut, à améliorer avec l'IA
          temperature_max: 25,
          soil_type: identification.care_tips.soil,
          toxic_to_pets: identification.toxic_to_pets,
          toxic_to_humans: false,
          edible: identification.edible,
          recipes: [],
          bonsai_compatible: false,
          tags: identification.tags,
          ai_generated: true,
          verified: false,
        };

        plant = await pb.collection('plants').create(plantData);
      }
    } catch (error) {
      console.error('Erreur lors de la création/recherche de la plante:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la gestion de la plante' },
        { status: 500 }
      );
    }

    // Compter combien de plantes de cette espèce l'utilisateur a déjà
    const existingUserPlants = await pb.collection('user_plants').getList(1, 100, {
      filter: `user = "${userId}" && plant = "${plant.id}"`,
      requestKey: null,
    });

    // Générer un nickname unique avec un numéro si l'utilisateur a déjà cette espèce
    let nickname = identification.common_name;
    if (existingUserPlants.items.length > 0) {
      // Extraire tous les numéros utilisés dans les nicknames existants
      const usedNumbers: number[] = [];
      
      existingUserPlants.items.forEach((up: any) => {
        const currentNickname = up.nickname || '';
        // Vérifier si le nickname correspond exactement au nom commun (pas de numéro)
        if (currentNickname === identification.common_name) {
          // Cette plante n'a pas de numéro, on la comptera comme #1
          if (!usedNumbers.includes(1)) {
            usedNumbers.push(1);
          }
        } else {
          // Chercher un numéro dans le format "Nom #X" ou "Nom#X"
          const match = currentNickname.match(/#(\d+)$/);
          if (match) {
            const num = parseInt(match[1]);
            if (!usedNumbers.includes(num)) {
              usedNumbers.push(num);
            }
          }
        }
      });
      
      // Trouver le prochain numéro disponible
      let nextNumber = 1;
      if (usedNumbers.length > 0) {
        // Trier les numéros et trouver le premier disponible
        usedNumbers.sort((a, b) => a - b);
        for (let i = 1; i <= usedNumbers.length + 1; i++) {
          if (!usedNumbers.includes(i)) {
            nextNumber = i;
            break;
          }
        }
      }
      
      nickname = `${identification.common_name} #${nextNumber}`;
    }

    // Toujours créer une nouvelle user_plant (même espèce = plusieurs plantes)
    const userPlant = await pb.collection('user_plants').create({
      user: userId,
      plant: plant.id,
      nickname: nickname,
      acquisition_date: new Date().toISOString(),
      photos: [],
      health_score: 0, // 0 = pas encore diagnostiquée
      public_visible: true,
      points_earned: 0,
      streak_days: 0,
    });

    // Ajouter les points XP pour chaque nouvelle identification
    await addPoints(userId, XP_REWARDS.IDENTIFY_NEW_PLANT, 'identification', userPlant.id);

    // Upload de l'image vers PocketBase storage dans le champ 'photos'
    try {
      const formDataPB = new FormData();
      // Convertir le Buffer en Blob pour l'upload
      const blob = new Blob([new Uint8Array(jpegBuffer)], { type: 'image/jpeg' });
      formDataPB.append('photos', blob, 'plant.jpg');
      await pb.collection('user_plants').update(userPlant.id, formDataPB, { requestKey: null });
      console.log('Image uploadée avec succès vers PocketBase storage');
    } catch (uploadError) {
      console.error('Erreur lors de l\'upload de l\'image:', uploadError);
      // Ne pas faire échouer la requête si l'upload échoue
    }

    return NextResponse.json({
      success: true,
      plant: {
        id: plant.id,
        common_name: plant.common_name,
        scientific_name: plant.scientific_name,
        family: plant.family,
        confidence: identification.confidence,
      },
      userPlant: {
        id: userPlant.id,
        nickname: userPlant.nickname,
        isNew: true, // Toujours considéré comme nouveau car c'est une nouvelle instance
      },
      xpAwarded: XP_REWARDS.IDENTIFY_NEW_PLANT,
    });
  } catch (error) {
    console.error('Erreur lors de l\'identification:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'identification de la plante' },
      { status: 500 }
    );
  }
}
