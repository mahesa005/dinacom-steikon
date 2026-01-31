import { NextRequest, NextResponse } from 'next/server';
import { createHistoryKontrol, getHistoryKontrolByBayiId } from '@/lib/db';

// GET /api/bayi/[id]/kontrol - Get history kontrol by bayi ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const history = await getHistoryKontrolByBayiId(id);

    return NextResponse.json({
      success: true,
      data: history,
      count: history.length,
    });
  } catch (error) {
    console.error('Get history kontrol error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil history kontrol' },
      { status: 500 }
    );
  }
}

// POST /api/bayi/[id]/kontrol - Create history kontrol baru
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validasi required fields
    const requiredFields = [
      'tanggalKontrol', 'umurBulan', 'beratBadan', 'tinggiBadan'
    ];

    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null) {
        return NextResponse.json(
          { success: false, error: `Field ${field} wajib diisi` },
          { status: 400 }
        );
      }
    }

    // Convert tanggalKontrol ke Date
    body.tanggalKontrol = new Date(body.tanggalKontrol);
    body.bayiId = id;

    const kontrol = await createHistoryKontrol(body);

    return NextResponse.json({
      success: true,
      message: 'History kontrol berhasil ditambahkan',
      data: kontrol,
    });
  } catch (error) {
    console.error('Create history kontrol error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menambahkan history kontrol' },
      { status: 500 }
    );
  }
}
