import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/pocketbase';

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Body reçu:', body);
    
    const { name, userId } = body;
    console.log('Name:', name, 'UserId:', userId);

    if (!name?.trim() || !userId) {
      console.log('Validation échouée');
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      );
    }

    const adminPb = await getAdminClient();
    console.log('Admin client OK');

    // Vérifier si le name est déjà pris
    try {
      const existing = await adminPb.collection('users').getFirstListItem(
        `name = "${name.trim()}" && id != "${userId}"`,
        { requestKey: null }
      );
      if (existing) {
        return NextResponse.json(
          { error: 'Ce nom d\'utilisateur est déjà pris' },
          { status: 409 }
        );
      }
    } catch (e) {
      // Pas de doublon trouvé, c'est ok
    }

    const updated = await adminPb.collection('users').update(
      userId, 
      { name: name.trim() }, 
      { requestKey: null }
    );
    
    console.log('User mis à jour:', updated.name);
    return NextResponse.json({ user: updated });
    
  } catch (error: any) {
    console.error('ERREUR COMPLÈTE:', error);
    console.error('Message:', error.message);
    console.error('Response:', error.response);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
