import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/pocketbase';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const userPlantId = searchParams.get('userPlantId');

  try {
    const adminPb = await getAdminClient();
    
    if (type === 'diagnosis' && userPlantId) {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const diagnoses = await adminPb.collection('diagnoses').getList(1, 1, {
        filter: `user_plant = "${userPlantId}" && created >= "${startOfMonth.toISOString()}"`,
        requestKey: null,
      });

      return NextResponse.json({ 
        allowed: diagnoses.totalItems === 0,
        count: diagnoses.totalItems,
        limit: 1,
      });
    }

    return NextResponse.json({ allowed: true });
  } catch (error) {
    return NextResponse.json({ allowed: true });
  }
}
