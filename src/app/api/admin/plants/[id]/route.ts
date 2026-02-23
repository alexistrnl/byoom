import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/pocketbase';

export const dynamic = 'force-dynamic';

// Supprimer toute vérification d'email/cookie
// L'admin est protégé côté page (client), pas côté API
// pour simplifier le développement local

// GET : Récupère une plante
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const adminPb = await getAdminClient();

    const plant = await adminPb.collection('plants').getOne(id, {
      requestKey: null,
    });

    return NextResponse.json({ plant });
  } catch (error: any) {
    console.error('Erreur admin plants GET:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// PATCH : Met à jour une plante
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const formData = await request.formData();
    const adminPb = await getAdminClient();

    // Préparer les données
    const data: any = {};

    // Champs texte
    if (formData.has('common_name')) data.common_name = formData.get('common_name') as string;
    if (formData.has('scientific_name')) data.scientific_name = formData.get('scientific_name') as string;
    if (formData.has('family')) data.family = formData.get('family') as string;
    if (formData.has('brief_description')) data.brief_description = formData.get('brief_description') as string;
    if (formData.has('history')) data.history = formData.get('history') as string;
    if (formData.has('uses')) data.uses = formData.get('uses') as string;
    if (formData.has('watering_frequency')) data.watering_frequency = formData.get('watering_frequency') as string;
    if (formData.has('light_needs')) data.light_needs = formData.get('light_needs') as string;
    if (formData.has('soil_type')) data.soil_type = formData.get('soil_type') as string;
    if (formData.has('humidity')) data.humidity = formData.get('humidity') as string;

    // Champs numériques
    if (formData.has('difficulty')) data.difficulty = parseInt(formData.get('difficulty') as string);
    if (formData.has('temperature_min')) data.temperature_min = parseInt(formData.get('temperature_min') as string);
    if (formData.has('temperature_max')) data.temperature_max = parseInt(formData.get('temperature_max') as string);

    // Champs booléens
    if (formData.has('edible')) data.edible = formData.get('edible') === 'true';
    if (formData.has('toxic_to_pets')) data.toxic_to_pets = formData.get('toxic_to_pets') === 'true';
    if (formData.has('toxic_to_humans')) data.toxic_to_humans = formData.get('toxic_to_humans') === 'true';
    if (formData.has('bonsai_compatible')) data.bonsai_compatible = formData.get('bonsai_compatible') === 'true';

    // Parse fun_facts
    if (formData.has('fun_facts')) {
      const funFactsStr = formData.get('fun_facts') as string;
      try {
        data.fun_facts = JSON.parse(funFactsStr);
      } catch {
        data.fun_facts = [];
      }
    }

    // Parse tags
    if (formData.has('tags')) {
      const tagsStr = formData.get('tags') as string;
      try {
        data.tags = JSON.parse(tagsStr);
      } catch {
        data.tags = tagsStr.split(',').map((t) => t.trim()).filter(Boolean);
      }
    }

    // Gérer l'image (seulement si une nouvelle image est fournie)
    const coverImage = formData.get('cover_image') as File | null;
    if (coverImage && coverImage.size > 0) {
      data.cover_image = coverImage;
    }

    const plant = await adminPb.collection('plants').update(id, data);

    return NextResponse.json({ plant });
  } catch (error: any) {
    console.error('Erreur admin plants PATCH:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// DELETE : Supprime une plante
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const adminPb = await getAdminClient();

    await adminPb.collection('plants').delete(id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erreur admin plants DELETE:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}
