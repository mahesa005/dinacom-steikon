import { NextRequest, NextResponse } from 'next/server';
import {
  generateJadwalPemeriksaan,
  updateJadwalSetelahPemeriksaan,
  getJadwalPemeriksaan,
  getJadwalByTanggal,
  updateMissedSchedules,
} from '@/lib/jadwal';
import { prisma } from '@/lib/db';
import { JadwalStatus } from '@/app/generated/prisma/client';

// GET /api/jadwal-pemeriksaan - Get jadwal pemeriksaan
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bayiId = searchParams.get('bayiId');
    const tanggal = searchParams.get('tanggal');
    const includeCompleted = searchParams.get('includeCompleted') === 'true';

    if (tanggal) {
      // Get jadwal by tanggal
      const jadwalList = await getJadwalByTanggal(new Date(tanggal));
      return NextResponse.json({
        success: true,
        data: jadwalList,
        count: jadwalList.length,
      });
    }

    if (bayiId) {
      // Get jadwal by bayi ID
      const jadwalList = await getJadwalPemeriksaan(bayiId, includeCompleted);
      return NextResponse.json({
        success: true,
        data: jadwalList,
        count: jadwalList.length,
      });
    }

    // Get all jadwal (upcoming only)
    const jadwalList = await prisma.jadwalPemeriksaan.findMany({
      where: {
        status: JadwalStatus.SCHEDULED,
        rentangAwal: {
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 hari ke depan
        },
      },
      include: {
        bayi: {
          select: {
            nama: true,
            namaIbu: true,
            nomorHpOrangTua: true,
          },
        },
      },
      orderBy: { rentangAwal: 'asc' },
      take: 100,
    });

    return NextResponse.json({
      success: true,
      data: jadwalList,
      count: jadwalList.length,
    });
  } catch (error) {
    console.error('Get jadwal error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil jadwal pemeriksaan' },
      { status: 500 }
    );
  }
}

// POST /api/jadwal-pemeriksaan - Generate atau regenerate jadwal
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bayiId, riskLevel, action } = body;

    if (!bayiId) {
      return NextResponse.json(
        { success: false, error: 'bayiId wajib diisi' },
        { status: 400 }
      );
    }

    // Get bayi data - bayiId is internal ID, not nomorPasien
    const bayi = await prisma.bayi.findUnique({
      where: { id: bayiId },
      select: { tanggalLahir: true },
    });

    if (!bayi) {
      return NextResponse.json(
        { success: false, error: 'Data bayi tidak ditemukan' },
        { status: 404 }
      );
    }

    let result;

    if (action === 'regenerate') {
      // Regenerate dari sekarang
      result = await generateJadwalPemeriksaan(
        bayiId,
        bayi.tanggalLahir,
        riskLevel || 'MEDIUM'
      );
    } else {
      // Generate jadwal baru
      result = await generateJadwalPemeriksaan(
        bayiId,
        bayi.tanggalLahir,
        riskLevel || 'MEDIUM'
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Generate jadwal error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal membuat jadwal pemeriksaan' },
      { status: 500 }
    );
  }
}

// PATCH /api/jadwal-pemeriksaan - Update status jadwal
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { jadwalId, status, bayiId, newRiskLevel } = body;

    if (!jadwalId) {
      return NextResponse.json(
        { success: false, error: 'jadwalId wajib diisi' },
        { status: 400 }
      );
    }

    // Update status jadwal
    await prisma.jadwalPemeriksaan.update({
      where: { id: jadwalId },
      data: { status },
    });

    // Jika status COMPLETED dan ada newRiskLevel, generate jadwal baru
    if (status === 'COMPLETED' && newRiskLevel && bayiId) {
      await updateJadwalSetelahPemeriksaan(bayiId, jadwalId, newRiskLevel);
    }

    return NextResponse.json({
      success: true,
      message: 'Status jadwal berhasil diupdate',
    });
  } catch (error) {
    console.error('Update jadwal error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengupdate jadwal' },
      { status: 500 }
    );
  }
}

// DELETE /api/jadwal-pemeriksaan - Delete jadwal (hanya yang DIJADWALKAN)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jadwalId = searchParams.get('jadwalId');

    if (!jadwalId) {
      return NextResponse.json(
        { success: false, error: 'jadwalId wajib diisi' },
        { status: 400 }
      );
    }

    // Hanya bisa delete jadwal dengan status SCHEDULED
    await prisma.jadwalPemeriksaan.deleteMany({
      where: {
        id: jadwalId,
        status: JadwalStatus.SCHEDULED,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Jadwal berhasil dihapus',
    });
  } catch (error) {
    console.error('Delete jadwal error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus jadwal' },
      { status: 500 }
    );
  }
}
