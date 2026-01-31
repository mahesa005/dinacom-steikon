import { prisma } from '../prisma';

// ==================== CREATE ====================

export async function createHistoryKontrol(data: {
  bayiId: string;
  tanggalKontrol: Date;
  umurBulan: number;
  beratBadan: number;
  tinggiBadan: number;
  statusGizi?: string;
  statusStunting?: string;
  catatanTambahan?: string;
}) {
  return await prisma.historyKontrol.create({
    data,
    include: {
      bayi: {
        select: {
          id: true,
          nama: true,
          nomorPasien: true,
          tanggalLahir: true,
        },
      },
    },
  });
}

// ==================== READ ====================

export async function getHistoryKontrolById(id: string) {
  return await prisma.historyKontrol.findUnique({
    where: { id },
    include: {
      bayi: true,
    },
  });
}

export async function getHistoryKontrolByBayiId(bayiId: string) {
  return await prisma.historyKontrol.findMany({
    where: { bayiId },
    orderBy: {
      tanggalKontrol: 'desc',
    },
  });
}

export async function getLatestHistoryKontrol(bayiId: string) {
  return await prisma.historyKontrol.findFirst({
    where: { bayiId },
    orderBy: {
      tanggalKontrol: 'desc',
    },
    include: {
      bayi: {
        select: {
          nama: true,
          nomorPasien: true,
        },
      },
    },
  });
}

// Get history dalam rentang waktu tertentu
export async function getHistoryKontrolByDateRange(
  bayiId: string,
  startDate: Date,
  endDate: Date
) {
  return await prisma.historyKontrol.findMany({
    where: {
      bayiId,
      tanggalKontrol: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: {
      tanggalKontrol: 'asc',
    },
  });
}

// ==================== UPDATE ====================

export async function updateHistoryKontrol(
  id: string,
  data: Partial<{
    beratBadan: number;
    tinggiBadan: number;
    statusGizi: string;
    statusStunting: string;
    catatanTambahan: string;
  }>
) {
  return await prisma.historyKontrol.update({
    where: { id },
    data,
  });
}

// ==================== DELETE ====================

export async function deleteHistoryKontrol(id: string) {
  return await prisma.historyKontrol.delete({
    where: { id },
  });
}

// ==================== ANALISIS ====================

// Dapatkan grafik pertumbuhan bayi
export async function getGrafikPertumbuhan(bayiId: string, limit = 12) {
  const history = await prisma.historyKontrol.findMany({
    where: { bayiId },
    select: {
      tanggalKontrol: true,
      umurBulan: true,
      beratBadan: true,
      tinggiBadan: true,
      statusGizi: true,
      statusStunting: true,
    },
    orderBy: {
      tanggalKontrol: 'asc',
    },
    take: limit,
  });

  return history;
}

// Cek apakah bayi perlu kontrol (lebih dari 1 bulan sejak kontrol terakhir)
export async function checkPerluKontrol(bayiId: string) {
  const latestKontrol = await getLatestHistoryKontrol(bayiId);
  
  if (!latestKontrol) {
    return { perluKontrol: true, message: 'Belum ada riwayat kontrol' };
  }

  const today = new Date();
  const daysSinceLastControl = Math.floor(
    (today.getTime() - latestKontrol.tanggalKontrol.getTime()) / (1000 * 60 * 60 * 24)
  );

  const perluKontrol = daysSinceLastControl >= 30; // 30 hari = 1 bulan

  return {
    perluKontrol,
    daysSinceLastControl,
    lastControlDate: latestKontrol.tanggalKontrol,
    message: perluKontrol
      ? `Sudah ${daysSinceLastControl} hari sejak kontrol terakhir`
      : `Kontrol terakhir ${daysSinceLastControl} hari yang lalu`,
  };
}

// Statistik status stunting
export async function getStatistikStunting() {
  // Ambil semua bayi
  const where: any = {};

  const bayiList = await prisma.bayi.findMany({
    where,
    select: {
      id: true,
      historyKontrol: {
        select: {
          statusStunting: true,
          tanggalKontrol: true,
        },
        orderBy: {
          tanggalKontrol: 'desc',
        },
        take: 1,
      },
    },
  });

  // Map untuk mendapatkan status stunting terakhir setiap bayi
  const result = bayiList.map((bayi) => ({
    bayiId: bayi.id,
    statusStunting: bayi.historyKontrol[0]?.statusStunting || null,
  }));

  return result;
}
