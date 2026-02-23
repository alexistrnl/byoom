import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/pocketbase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    console.log('ID reçu:', id);
    
    if (!id || id === 'null' || id === 'undefined') {
      return NextResponse.json(
        { error: 'ID de plante requis' },
        { status: 400 }
      );
    }

    const adminPb = await getAdminClient();

    // Récupérer le userPlant avec la plante
    const userPlant = await adminPb.collection('user_plants').getOne(id, {
      expand: 'plant',
      requestKey: null,
    });

    const plant = userPlant.expand?.plant;

    // Récupérer le dernier diagnostic
    let lastDiagnosis = null;
    try {
      const diagnoses = await adminPb.collection('diagnoses').getList(1, 1, {
        filter: `user_plant = "${id}"`,
        sort: '-created',
        requestKey: null,
      });
      if (diagnoses.items.length > 0) {
        lastDiagnosis = diagnoses.items[0];
      }
    } catch (e) {
      // Pas de diagnostic, c'est ok
    }

    return NextResponse.json({ userPlant, plant, lastDiagnosis });
  } catch (error: any) {
    console.error('Erreur user-plants API:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    if (!id || id === 'null' || id === 'undefined') {
      return NextResponse.json(
        { error: 'ID de plante requis' },
        { status: 400 }
      );
    }

    const adminPb = await getAdminClient();

    // Vérifier que la plante existe
    const userPlant = await adminPb.collection('user_plants').getOne(id, {
      requestKey: null,
    });

    // Mettre à jour uniquement le nickname si fourni
    const updateData: any = {};
    if (body.nickname !== undefined) {
      updateData.nickname = body.nickname;
    }

    // Mettre à jour la plante
    const updated = await adminPb.collection('user_plants').update(id, updateData, {
      requestKey: null,
    });

    return NextResponse.json({ success: true, userPlant: updated });
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}
