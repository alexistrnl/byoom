import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/pocketbase';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const adminPb = await getAdminClient();

    if (!id || id === 'null' || id === 'undefined') {
      return NextResponse.json(
        { error: 'ID de plante requis' },
        { status: 400 }
      );
    }

    const plant = await adminPb.collection('plants').getOne(id, {
      requestKey: null,
    });

    return NextResponse.json({ plant });
  } catch (error: any) {
    console.error('Erreur plants API:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}
