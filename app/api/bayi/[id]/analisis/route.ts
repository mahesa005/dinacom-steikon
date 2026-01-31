import { NextRequest, NextResponse } from 'next/server';
import { createHasilAnalisis, getHasilAnalisisByBayiId } from '@/lib/db';

// GET /api/bayi/[id]/analisis - Get hasil analisis by bayi ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const hasilAnalisis = await getHasilAnalisisByBayiId(id);

    return NextResponse.json({
      success: true,
      data: hasilAnalisis,
      count: hasilAnalisis.length,
    });
  } catch (error) {
    console.error('Get hasil analisis error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil hasil analisis' },
      { status: 500 }
    );
  }
}

// POST /api/bayi/[id]/analisis - Create hasil analisis baru
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validasi required fields
    const requiredFields = ['jenisAnalisis', 'hasilPrediksi', 'dataInput'];

    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null || body[field] === '') {
        return NextResponse.json(
          { success: false, error: `Field ${field} wajib diisi` },
          { status: 400 }
        );
      }
    }

    const analisis = await createHasilAnalisis({
      bayiId: id,
      jenisAnalisis: body.jenisAnalisis,
      hasilPrediksi: body.hasilPrediksi,
      tingkatKepercayaan: body.tingkatKepercayaan,
      dataInput: body.dataInput,
      rekomendasiTindakan: body.rekomendasiTindakan,
      catatanAI: body.catatanAI,
    });

    return NextResponse.json({
      success: true,
      message: 'Hasil analisis berhasil disimpan',
      data: analisis,
    });
  } catch (error) {
    console.error('Create hasil analisis error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menyimpan hasil analisis' },
      { status: 500 }
    );
  }
}
