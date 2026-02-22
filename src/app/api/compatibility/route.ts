import { NextRequest, NextResponse } from 'next/server';
import { checkCompatibility } from '@/lib/openai';
import { pb } from '@/lib/pocketbase';
import { addPoints, XP_REWARDS } from '@/lib/gamification';
import type { Plant } from '@/lib/types/pocketbase';

export async function POST(request: NextRequest) {
  try {
    const { plantAId, plantBId, userId } = await request.json();

    if (!plantAId || !plantBId || !userId) {
      return NextResponse.json(
        { error: 'plantAId, plantBId et userId requis' },
        { status: 400 }
      );
    }

    // Vérifier si le test existe déjà en cache
    const existingTests = await pb.compatibilities().getList(1, 1, {
      filter: `(plant_a = "${plantAId}" && plant_b = "${plantBId}") || (plant_a = "${plantBId}" && plant_b = "${plantAId}")`,
    });

    let compatibility;
    if (existingTests.items.length > 0) {
      compatibility = existingTests.items[0];
    } else {
      // Récupérer les deux plantes
      const plantA = await pb.plants().getOne(plantAId);
      const plantB = await pb.plants().getOne(plantBId);

      // Tester la compatibilité avec l'IA
      const result = await checkCompatibility(
        plantA as Plant,
        plantB as Plant
      );

      // Créer l'enregistrement de compatibilité
      compatibility = await pb.compatibilities().create({
        plant_a: plantAId,
        plant_b: plantBId,
        compatible: result.compatible,
        reason: result.reason,
        ai_generated: true,
      });
    }

    // Ajouter les points XP
    await addPoints(userId, XP_REWARDS.COMPATIBILITY_TEST, 'diagnosis');

    return NextResponse.json({
      success: true,
      compatibility: {
        compatible: compatibility.compatible,
        reason: compatibility.reason,
      },
      xpAwarded: XP_REWARDS.COMPATIBILITY_TEST,
    });
  } catch (error) {
    console.error('Erreur lors du test de compatibilité:', error);
    return NextResponse.json(
      { error: 'Erreur lors du test de compatibilité' },
      { status: 500 }
    );
  }
}
