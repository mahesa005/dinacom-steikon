import { NextRequest, NextResponse } from 'next/server';
import { createBayi, getAllBayi } from '@/lib/db';
import { generateJadwalPemeriksaan } from '@/lib/jadwal';

// GET /api/bayi - Get all bayi dengan filter
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const filters = {
      statusAktif: searchParams.get('statusAktif') === 'true',
      provinsi: searchParams.get('provinsi') || undefined,
      kota: searchParams.get('kota') || undefined,
      kecamatan: searchParams.get('kecamatan') || undefined,
      kelurahan: searchParams.get('kelurahan') || undefined,
      search: searchParams.get('search') || undefined,
    };

    const bayiList = await getAllBayi(filters);

    return NextResponse.json({
      success: true,
      data: bayiList,
      count: bayiList.length,
    });
  } catch (error) {
    console.error('Get bayi error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data bayi' },
      { status: 500 }
    );
  }
}

// POST /api/bayi - Create bayi baru
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validasi required fields (exclude createdById karena akan di-handle otomatis)
    const requiredFields = [
      'nomorPasien', 'nama', 'tanggalLahir', 'tempatLahir', 'jenisKelamin',
      'beratLahir', 'panjangLahir', 'namaIbu', 'namaAyah', 'nomorHpOrangTua',
      'alamat'
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Field ${field} wajib diisi` },
          { status: 400 }
        );
      }
    }

    // Convert tanggalLahir ke Date
    body.tanggalLahir = new Date(body.tanggalLahir);

    const bayi = await createBayi(body);

    // Generate jadwal pemeriksaan otomatis sampai umur 2 tahun
    // Default risk level: MEDIUM (akan di-update setelah pemeriksaan pertama)
    // Gunakan bayi.id (internal ID), bukan nomorPasien
    try {
      await generateJadwalPemeriksaan(
        bayi.id, // Internal ID dari database
        bayi.tanggalLahir,
        'MEDIUM' // Default risk level untuk bayi baru
      );
    } catch (jadwalError) {
      console.error('Error generating jadwal:', jadwalError);
      // Lanjutkan walaupun gagal membuat jadwal
    }

    return NextResponse.json({
      success: true,
      message: 'Bayi berhasil didaftarkan dan jadwal pemeriksaan telah dibuat',
      data: bayi,
    });
  } catch (error: any) {
    console.error('Create bayi error:', error);

    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Nomor pasien atau NIK sudah terdaftar' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Gagal mendaftarkan bayi' },
      { status: 500 }
    );
  }
}
