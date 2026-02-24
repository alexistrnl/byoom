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
    const adminPb = await getAdminClient();
    
    const formData = await request.formData();
    
    console.log('PATCH plant id:', id);
    console.log('FormData keys:', [...formData.keys()]);
    
    // Construire l'objet de mise à jour
    const updateData: Record<string, any> = {};
    
    // Champs texte
    const textFields = [
      'common_name', 'scientific_name', 'family', 
      'history', 'uses', 'fun_facts'
    ];
    
    for (const field of textFields) {
      const value = formData.get(field);
      if (value !== null) {
        updateData[field] = value as string;
      }
    }
    
    // Fichier image
    const coverImage = formData.get('cover_image');
    if (coverImage && coverImage instanceof File && coverImage.size > 0) {
      console.log('Image détectée:', coverImage.name, coverImage.size);
      updateData['cover_image'] = coverImage;
    }
    
    console.log('Update data keys:', Object.keys(updateData));
    
    // Utiliser le FormData natif de PocketBase pour les fichiers
    const pbFormData = new FormData();
    for (const [key, value] of Object.entries(updateData)) {
      pbFormData.append(key, value);
    }
    
    const updated = await adminPb.collection('plants').update(
      id, 
      pbFormData,
      { requestKey: null }
    );
    
    console.log('✅ Plant mise à jour:', updated.id);
    return NextResponse.json({ plant: updated });
    
  } catch (error: any) {
    console.error('Erreur PATCH plant:', error);
    console.error('Message:', error.message);
    console.error('Response:', JSON.stringify(error.response));
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
