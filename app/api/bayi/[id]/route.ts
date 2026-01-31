import { NextRequest, NextResponse } from 'next/server';
import { getBayiById, updateBayi, deleteBayi } from '@/lib/db';

// GET /api/bayi/[id] - Get bayi by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bayi = await getBayiById(id);

    if (!bayi) {
      return NextResponse.json(
        { success: false, error: 'Bayi tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: bayi,
    });
  } catch (error) {
    console.error('Get bayi error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data bayi' },
      { status: 500 }
    );
  }
}

// PATCH /api/bayi/[id] - Update bayi
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const bayi = await updateBayi(id, body);

    return NextResponse.json({
      success: true,
      message: 'Data bayi berhasil diupdate',
      data: bayi,
    });
  } catch (error) {
    console.error('Update bayi error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengupdate data bayi' },
      { status: 500 }
    );
  }
}

// DELETE /api/bayi/[id] - Delete bayi
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteBayi(id);

    return NextResponse.json({
      success: true,
      message: 'Data bayi berhasil dihapus',
    });
  } catch (error) {
    console.error('Delete bayi error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus data bayi' },
      { status: 500 }
    );
  }
}
