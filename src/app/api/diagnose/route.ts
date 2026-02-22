import { NextRequest, NextResponse } from 'next/server';
import { diagnosePlant } from '@/lib/openai';
import { getAdminClient } from '@/lib/pocketbase';
import { addPoints, XP_REWARDS, updateStreak } from '@/lib/gamification';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    const userPlantId = formData.get('userPlantId') as string;
    const userId = formData.get('userId') as string;

    if (!imageFile || !userPlantId || !userId) {
      return NextResponse.json(
        { error: 'Image, userPlantId et userId requis' },
        { status: 400 }
      );
    }

    // Obtenir le client admin pour les opérations d'écriture
    const adminPb = await getAdminClient();

    // Récupérer la plante de l'utilisateur
    const userPlant = await adminPb.collection('user_plants').getOne(userPlantId, {
      expand: 'plant',
      requestKey: null,
    });
    const plant = userPlant.expand?.plant as any;

    // Convertir l'image en base64
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');

    // Récupérer le type MIME du fichier
    const mimeType = imageFile.type || 'image/jpeg';

    // Diagnostiquer avec l'IA
    const diagnosis = await diagnosePlant(
      base64,
      plant.common_name,
      plant.scientific_name,
      mimeType
    );

    // Déterminer les points XP
    const hasIssues = diagnosis.issues.length > 0;
    const xpAwarded = hasIssues
      ? XP_REWARDS.DIAGNOSIS_PROBLEM
      : XP_REWARDS.DIAGNOSIS_HEALTHY;

    // Créer l'enregistrement de diagnostic
    const diagnosisRecord = await adminPb.collection('diagnoses').create({
      user_plant: userPlantId,
      user: userId,
      image: '', // TODO: Upload vers PocketBase storage
      ai_analysis: JSON.stringify(diagnosis),
      health_status: diagnosis.overall_status,
      issues_detected: diagnosis.issues,
      recommendations: diagnosis.immediate_actions,
      points_awarded: xpAwarded,
    }, { requestKey: null });

    // Mettre à jour le score de santé de la plante
    await adminPb.collection('user_plants').update(userPlantId, {
      health_score: diagnosis.health_score,
    }, { requestKey: null });

    // Ajouter les points XP
    await addPoints(userId, xpAwarded, 'diagnosis', userPlantId);

    // Mettre à jour le streak si la plante est saine
    if (diagnosis.overall_status === 'saine') {
      await updateStreak(userPlantId);
    }

    return NextResponse.json({
      success: true,
      diagnosis: {
        health_score: diagnosis.health_score,
        overall_status: diagnosis.overall_status,
        issues: diagnosis.issues,
        immediate_actions: diagnosis.immediate_actions,
        prevention_tips: diagnosis.prevention_tips,
      },
      xpAwarded,
    });
  } catch (error) {
    console.error('Erreur lors du diagnostic:', error);
    return NextResponse.json(
      { error: 'Erreur lors du diagnostic de la plante' },
      { status: 500 }
    );
  }
}
