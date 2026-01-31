import { prisma } from '../prisma';

// ==================== CREATE ====================

export async function createBayi(data: {
  nomorPasien: string;
  nik?: string;
  nama: string;
  tanggalLahir: Date;
  tempatLahir: string;
  jenisKelamin: 'LAKI-LAKI' | 'PEREMPUAN';
  beratLahir: number;
  panjangLahir: number;
  namaIbu: string;
  namaAyah: string;
  nomorHpOrangTua: string;
  alamat: string;
  golonganDarah?: string;
  createdById: string;
}) {
  return await prisma.bayi.create({
    data,
    include: {
      createdBy: {
        select: {
          username: true,
          namaPuskesmas: true,
        },
      },
    },
  });
}

// ==================== READ ====================

export async function getBayiById(id: string) {
  return await prisma.bayi.findUnique({
    where: { id },
    include: {
      createdBy: {
        select: {
          username: true,
          namaPuskesmas: true,
        },
      },
      historyKontrol: {
        orderBy: {
          tanggalKontrol: 'desc',
        },
        take: 5, // 5 history terakhir
      },
    },
  });
}

export async function getBayiByNomorPasien(nomorPasien: string) {
  return await prisma.bayi.findUnique({
    where: { nomorPasien },
    include: {
      historyKontrol: {
        orderBy: {
          tanggalKontrol: 'desc',
        },
      },
    },
  });
}

export async function getAllBayi(filters?: {
  search?: string;
}) {
  const where: any = {};

  if (filters?.search) {
    where.OR = [
      { nama: { contains: filters.search, mode: 'insensitive' } },
      { nomorPasien: { contains: filters.search, mode: 'insensitive' } },
      { namaIbu: { contains: filters.search, mode: 'insensitive' } },
      { namaAyah: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  return await prisma.bayi.findMany({
    where,
    include: {
      createdBy: {
        select: {
          username: true,
          namaPuskesmas: true,
        },
      },
      historyKontrol: {
        orderBy: {
          tanggalKontrol: 'desc',
        },
        take: 1, // Hanya kontrol terakhir
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function getBayiByPuskesmas(userId: string) {
  return await prisma.bayi.findMany({
    where: {
      createdById: userId,
    },
    include: {
      historyKontrol: {
        orderBy: {
          tanggalKontrol: 'desc',
        },
        take: 1,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

// ==================== UPDATE ====================

export async function updateBayi(id: string, data: Partial<{
  nama: string;
  nomorHpOrangTua: string;
  alamat: string;
  golonganDarah: string;
}>) {
  return await prisma.bayi.update({
    where: { id },
    data,
  });
}

// ==================== DELETE ====================

export async function deleteBayi(id: string) {
  return await prisma.bayi.delete({
    where: { id },
  });
}

// ==================== STATISTIK ====================

export async function getStatistikBayi() {
  const where: any = {};

  const [total, lakiLaki, perempuan] = await Promise.all([
    prisma.bayi.count({ where }),
    prisma.bayi.count({ where: { ...where, jenisKelamin: 'LAKI-LAKI' } }),
    prisma.bayi.count({ where: { ...where, jenisKelamin: 'PEREMPUAN' } }),
  ]);

  return {
    total,
    lakiLaki,
    perempuan,
  };
}
