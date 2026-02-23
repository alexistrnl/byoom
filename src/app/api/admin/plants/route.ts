import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/pocketbase';

export const dynamic = 'force-dynamic';

// Supprimer toute vérification d'email/cookie
// L'admin est protégé côté page (client), pas côté API
// pour simplifier le développement local

// GET : Liste toutes les plantes
export async function GET(request: NextRequest) {
  try {
    const adminPb = await getAdminClient();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('perPage') || '50');

    const result = await adminPb.collection('plants').getList(page, perPage, {
      sort: 'common_name',
      requestKey: null,
    });

    return NextResponse.json({
      items: result.items,
      totalItems: result.totalItems,
      page,
      perPage,
      totalPages: result.totalPages,
    });
  } catch (error: any) {
    console.error('Erreur admin plants GET:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// POST : Crée une nouvelle plante
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const adminPb = await getAdminClient();

    // Préparer les données
    const data: any = {
      common_name: formData.get('common_name') as string,
      scientific_name: formData.get('scientific_name') as string,
      family: formData.get('family') as string,
      brief_description: formData.get('brief_description') as string || '',
      history: formData.get('history') as string || '',
      uses: formData.get('uses') as string || '',
      difficulty: parseInt(formData.get('difficulty') as string) || 1,
      watering_frequency: formData.get('watering_frequency') as string || '',
      light_needs: formData.get('light_needs') as string || 'moyen',
      soil_type: formData.get('soil_type') as string || '',
      temperature_min: parseInt(formData.get('temperature_min') as string) || 15,
      temperature_max: parseInt(formData.get('temperature_max') as string) || 25,
      humidity: formData.get('humidity') as string || 'moyen',
      edible: formData.get('edible') === 'true',
      toxic_to_pets: formData.get('toxic_to_pets') === 'true',
      toxic_to_humans: formData.get('toxic_to_humans') === 'false',
      bonsai_compatible: formData.get('bonsai_compatible') === 'true',
      ai_generated: false,
      verified: true,
    };

    // Parse fun_facts
    const funFactsStr = formData.get('fun_facts') as string;
    if (funFactsStr) {
      try {
        data.fun_facts = JSON.parse(funFactsStr);
      } catch {
        data.fun_facts = [];
      }
    } else {
      data.fun_facts = [];
    }

    // Parse tags
    const tagsStr = formData.get('tags') as string;
    if (tagsStr) {
      try {
        data.tags = JSON.parse(tagsStr);
      } catch {
        data.tags = tagsStr.split(',').map((t) => t.trim()).filter(Boolean);
      }
    } else {
      data.tags = [];
    }

    // Gérer l'image
    const coverImage = formData.get('cover_image') as File | null;
    if (coverImage && coverImage.size > 0) {
      data.cover_image = coverImage;
    }

    const plant = await adminPb.collection('plants').create(data);

    return NextResponse.json({ plant });
  } catch (error: any) {
    console.error('Erreur admin plants POST:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}
