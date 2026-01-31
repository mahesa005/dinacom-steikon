import { NextRequest, NextResponse } from 'next/server';
import { getGrafikPertumbuhan } from '@/lib/db';

// GET /api/bayi/[id]/grafik - Get grafik pertumbuhan
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '12');

    const grafik = await getGrafikPertumbuhan(id, limit);

    return NextResponse.json({
      success: true,
      data: grafik,
      count: grafik.length,
    });
  } catch (error) {
    console.error('Get grafik error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data grafik' },
      { status: 500 }
    );
  }
}
