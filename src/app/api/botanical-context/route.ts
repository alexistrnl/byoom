import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/pocketbase';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Récupérer l'userId depuis le cookie PocketBase
    const cookieStore = await cookies();
    const pbCookie = cookieStore.get('pb_auth');
    
    if (!pbCookie) {
      return NextResponse.json({ authenticated: false });
    }

    const authData = JSON.parse(decodeURIComponent(pbCookie.value));
    const userId = authData?.model?.id;
    
    if (!userId) {
      return NextResponse.json({ authenticated: false });
    }

    const adminPb = await getAdminClient();

    // Récupérer les plantes de l'utilisateur
    const userPlants = await adminPb.collection('user_plants').getList(
      1, 50, {
        filter: `user = "${userId}"`,
        expand: 'plant',
        requestKey: null,
      }
    );

    // Récupérer les derniers diagnostics
    const diagnoses = await adminPb.collection('diagnoses').getList(
      1, 10, {
        filter: `user = "${userId}"`,
        sort: '-created',
        requestKey: null,
      }
    );

    // Récupérer infos utilisateur
    const user = await adminPb.collection('users').getOne(userId, {
      requestKey: null
    });

    // Construire le résumé
    const plantsData = userPlants.items.map((up: any) => ({
      nickname: up.nickname,
      common_name: up.expand?.plant?.common_name,
      scientific_name: up.expand?.plant?.scientific_name,
      health_score: up.health_score || 0,
      last_watered: up.last_watered,
      last_diagnosed: diagnoses.items
        .find((d: any) => d.user_plant === up.id)?.created || null,
    }));

    return NextResponse.json({
      authenticated: true,
      user: {
        level: user.level,
        points_total: user.points_total,
        plant_count: userPlants.totalItems,
      },
      plants: plantsData,
    });
  } catch (e: any) {
    console.error('Erreur botanical-context:', e);
    return NextResponse.json({ authenticated: false });
  }
}
