import { prisma } from '@/lib/db';
import { JadwalStatus } from '@/app/generated/prisma/client';

/**
 * Generate jadwal pemeriksaan otomatis untuk bayi sampai umur 2 tahun
 * Berdasarkan Permenkes RI No. 2 Tahun 2020 dan Pedoman Tata Laksana Stunting (2022)
 * 
 * @param bayiId - ID bayi (bukan nomorPasien, tapi internal ID)
 * @param tanggalLahir - Tanggal lahir bayi
 * @param riskLevel - Level risiko stunting (HIGH, MEDIUM, LOW)
 * @param tanggalMulai - Tanggal mulai generate jadwal (default: hari ini)
 */
export async function generateJadwalPemeriksaan(
  bayiId: string,
  tanggalLahir: Date,
  riskLevel: string = 'MEDIUM',
  tanggalMulai?: Date
) {
  const startDate = tanggalMulai || new Date();
  const birthDate = new Date(tanggalLahir);
  const maxAge = 24; // 24 bulan (2 tahun)
  
  // Hitung umur bayi saat ini dalam bulan
  const currentAgeMonths = Math.floor(
    (startDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
  );
  
  // Jika bayi sudah lebih dari 24 bulan, tidak perlu generate jadwal
  if (currentAgeMonths >= maxAge) {
    return { success: false, message: 'Bayi sudah melewati usia pemantauan (>24 bulan)' };
  }
  
  // Tentukan interval pemeriksaan berdasarkan risiko
  // HIGH (MERAH) atau MEDIUM (KUNING): 14 hari
  // LOW (HIJAU): 30 hari
  const intervalDays = (riskLevel === 'HIGH' || riskLevel === 'MEDIUM') ? 14 : 30;
  
  const jadwalList = [];
  
  // Hitung tanggal akhir pemantauan (24 bulan sejak lahir)
  const endDate = new Date(birthDate);
  endDate.setMonth(birthDate.getMonth() + maxAge);
  
  // Mulai dari startDate atau tanggalLahir (yang lebih besar)
  let currentDate = new Date(Math.max(startDate.getTime(), birthDate.getTime()));
  
  // Generate jadwal berdasarkan interval hari
  while (currentDate < endDate) {
    // Hitung umur dalam bulan untuk jadwal ini
    const ageInMonths = Math.floor(
      (currentDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
    );
    
    // Skip jika masih di bulan pertama (mulai dari bulan ke-2)
    if (ageInMonths < 2) {
      currentDate.setDate(currentDate.getDate() + intervalDays);
      continue;
    }
    
    // Rentang awal: 3 hari sebelum target
    const rentangAwal = new Date(currentDate);
    rentangAwal.setDate(currentDate.getDate() - 3);
    
    // Rentang akhir: 3 hari setelah target
    const rentangAkhir = new Date(currentDate);
    rentangAkhir.setDate(currentDate.getDate() + 3);
    
    jadwalList.push({
      bayiId,
      targetUmurBulan: ageInMonths,
      rentangAwal,
      rentangAkhir,
      status: JadwalStatus.SCHEDULED,
    });
    
    // Tambah interval untuk jadwal berikutnya
    currentDate.setDate(currentDate.getDate() + intervalDays);
  }
  
  // Hapus jadwal lama yang masih SCHEDULED (belum dilaksanakan)
  await prisma.jadwalPemeriksaan.deleteMany({
    where: {
      bayiId,
      status: JadwalStatus.SCHEDULED,
      rentangAwal: {
        gte: startDate,
      },
    },
  });
  
  // Insert jadwal baru ke database
  const result = await prisma.jadwalPemeriksaan.createMany({
    data: jadwalList,
  });
  
  return {
    success: true,
    message: `Berhasil membuat ${result.count} jadwal pemeriksaan`,
    count: result.count,
    interval: intervalDays,
    riskLevel,
  };
}

/**
 * Update jadwal pemeriksaan setelah pemeriksaan selesai
 * Generate jadwal baru berdasarkan hasil pemeriksaan terbaru
 * 
 * @param bayiId - ID bayi (internal ID)
 * @param jadwalId - ID jadwal yang sudah selesai
 * @param newRiskLevel - Level risiko hasil pemeriksaan terbaru
 */
export async function updateJadwalSetelahPemeriksaan(
  bayiId: string,
  jadwalId: string,
  newRiskLevel: string
) {
  // Update status jadwal menjadi COMPLETED
  await prisma.jadwalPemeriksaan.update({
    where: { id: jadwalId },
    data: { status: JadwalStatus.COMPLETED },
  });
  
  // Ambil data bayi untuk tanggal lahir
  const bayi = await prisma.bayi.findUnique({
    where: { id: bayiId },
    select: { tanggalLahir: true },
  });
  
  if (!bayi) {
    return { success: false, message: 'Data bayi tidak ditemukan' };
  }
  
  // Generate jadwal baru mulai dari besok
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  return await generateJadwalPemeriksaan(
    bayiId,
    bayi.tanggalLahir,
    newRiskLevel,
    tomorrow
  );
}

/**
 * Get jadwal pemeriksaan untuk bayi tertentu
 * 
 * @param bayiId - ID bayi (internal ID)
 * @param includeCompleted - Apakah termasuk jadwal yang sudah selesai
 */
export async function getJadwalPemeriksaan(
  bayiId: string,
  includeCompleted: boolean = false
) {
  const whereClause: any = { bayiId };
  
  if (!includeCompleted) {
    whereClause.status = {
      in: ['SCHEDULED', 'MISSED'],
    };
  }
  
  return await prisma.jadwalPemeriksaan.findMany({
    where: whereClause,
    orderBy: { rentangAwal: 'asc' },
  });
}

/**
 * Get jadwal pemeriksaan untuk tanggal tertentu
 * 
 * @param tanggal - Tanggal yang dicari
 */
export async function getJadwalByTanggal(tanggal: Date) {
  const searchDate = new Date(tanggal);
  searchDate.setHours(0, 0, 0, 0);
  
  return await prisma.jadwalPemeriksaan.findMany({
    where: {
      rentangAwal: {
        lte: searchDate,
      },
      rentangAkhir: {
        gte: searchDate,
      },
      status: JadwalStatus.SCHEDULED,
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
  });
}

/**
 * Check dan update status MISSED untuk jadwal yang sudah lewat
 */
export async function updateMissedSchedules() {
  const now = new Date();
  
  await prisma.jadwalPemeriksaan.updateMany({
    where: {
      status: JadwalStatus.SCHEDULED,
      rentangAkhir: {
        lt: now,
      },
    },
    data: {
      status: JadwalStatus.MISSED,
    },
  });
}
