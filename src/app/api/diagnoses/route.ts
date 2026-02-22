import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/pocketbase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userPlantId = searchParams.get('userPlantId');

    if (!userPlantId) {
      return NextResponse.json({ error: 'userPlantId requis' }, { status: 400 });
    }

    const adminPb = await getAdminClient();

    // Récupérer le dernier diagnostic
    const result = await adminPb.collection('diagnoses').getList(1, 1, {
      filter: `user_plant = "${userPlantId}"`,
      sort: '-created',
      requestKey: null,
    });

    if (result.items.length === 0) {
      return NextResponse.json({ diagnosis: null });
    }

    const diagnosis = result.items[0];
    
    // Parser l'analyse IA si c'est une string
    let aiAnalysis = diagnosis.ai_analysis;
    if (typeof aiAnalysis === 'string') {
      try {
        aiAnalysis = JSON.parse(aiAnalysis);
      } catch (e) {
        console.error('Erreur parsing ai_analysis:', e);
      }
    }

    return NextResponse.json({
      diagnosis: {
        id: diagnosis.id,
        created: diagnosis.created,
        health_status: diagnosis.health_status,
        issues_detected: diagnosis.issues_detected || [],
        recommendations: diagnosis.recommendations || [],
        points_awarded: diagnosis.points_awarded || 0,
        ai_analysis: aiAnalysis,
      },
    });
  } catch (error: any) {
    console.error('Erreur lors de la récupération du diagnostic:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du diagnostic' },
      { status: 500 }
    );
  }
}
