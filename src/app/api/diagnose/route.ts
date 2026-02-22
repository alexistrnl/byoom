import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { diagnosePlant } from '@/lib/openai';
import { getAdminClient } from '@/lib/pocketbase';
import { addPoints, XP_REWARDS, updateStreak } from '@/lib/gamification';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    const userPlantId = formData.get('userPlantId') as string;
    const userId = formData.get('userId') as string;
    const observations = (formData.get('observations') as string) || '';

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

    // Convertir en base64 pour l'IA
    const base64 = jpegBuffer.toString('base64');

    // Forcer le type MIME à image/jpeg après conversion
    const mimeType = 'image/jpeg';

    // Diagnostiquer avec l'IA
    const diagnosis = await diagnosePlant(
      base64,
      plant.common_name,
      plant.scientific_name,
      mimeType,
      observations
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

    // Upload de l'image vers PocketBase storage dans le champ 'photos'
    try {
      const formDataPB = new FormData();
      // Convertir le Buffer en Blob pour l'upload
      const blob = new Blob([new Uint8Array(jpegBuffer)], { type: 'image/jpeg' });
      formDataPB.append('photos', blob, 'diagnosis.jpg');
      await adminPb.collection('user_plants').update(userPlantId, formDataPB, { requestKey: null });
      console.log('Image de diagnostic uploadée avec succès vers PocketBase storage');
    } catch (uploadError) {
      console.error('Erreur lors de l\'upload de l\'image:', uploadError);
      // Ne pas faire échouer la requête si l'upload échoue
    }

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
