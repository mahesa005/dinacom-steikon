import { NextRequest, NextResponse } from 'next/server';
import { createUser, verifyUser } from '@/lib/db';

// POST /api/auth/register - Daftar user baru
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, namaPuskesmas, provinsi, kota, kecamatan, kelurahan } = body;

    // Validasi input
    if (!username || !password || !namaPuskesmas || !provinsi || !kota || !kecamatan || !kelurahan) {
      return NextResponse.json(
        { success: false, error: 'Semua field wajib diisi' },
        { status: 400 }
      );
    }

    // Buat user baru
    const user = await createUser({
      username,
      password,
      namaPuskesmas,
      provinsi,
      kota,
      kecamatan,
      kelurahan,
    });

    return NextResponse.json({
      success: true,
      message: 'User berhasil didaftarkan',
      data: user,
    });
  } catch (error: any) {
    console.error('Register error:', error);

    // Handle unique constraint violation (username sudah ada)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Username sudah digunakan' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat mendaftar' },
      { status: 500 }
    );
  }
}
