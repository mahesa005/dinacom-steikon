import { prisma } from '../prisma';

// ==================== CREATE ====================

export async function createHasilAnalisis(data: {
  bayiId: string;
  jenisAnalisis: string;
  hasilPrediksi: string;
  tingkatKepercayaan?: number;
  dataInput: string; // JSON string
  rekomendasiTindakan?: string;
  catatanAI?: string;
}) {
  return await prisma.hasilAnalisisAI.create({
    data,
    include: {
      bayi: {
        select: {
          id: true,
          nama: true,
          nomorPasien: true,
        },
      },
    },
  });
}

// ==================== READ ====================

export async function getHasilAnalisisById(id: string) {
  return await prisma.hasilAnalisisAI.findUnique({
    where: { id },
    include: {
      bayi: true,
    },
  });
}

export async function getHasilAnalisisByBayiId(bayiId: string) {
  return await prisma.hasilAnalisisAI.findMany({
    where: { bayiId },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function getLatestHasilAnalisis(bayiId: string, jenisAnalisis?: string) {
  const where: any = { bayiId };
  
  if (jenisAnalisis) {
    where.jenisAnalisis = jenisAnalisis;
  }

  return await prisma.hasilAnalisisAI.findFirst({
    where,
    orderBy: {
      createdAt: 'desc',
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

// ==================== UPDATE ====================

export async function updateHasilAnalisis(
  id: string,
  data: Partial<{
    hasilPrediksi: string;
    tingkatKepercayaan: number;
    rekomendasiTindakan: string;
    catatanAI: string;
  }>
) {
  return await prisma.hasilAnalisisAI.update({
    where: { id },
    data,
  });
}

// ==================== DELETE ====================

export async function deleteHasilAnalisis(id: string) {
  return await prisma.hasilAnalisisAI.delete({
    where: { id },
  });
}

// ==================== ANALISIS DAN STATISTIK ====================

// Dapatkan semua hasil analisis dengan filter
export async function getHasilAnalisisWithFilters(filters: {
  jenisAnalisis?: string;
  startDate?: Date;
  endDate?: Date;
  minConfidence?: number;
  bayiId?: string;
}) {
  const where: any = {};

  if (filters.jenisAnalisis) {
    where.jenisAnalisis = filters.jenisAnalisis;
  }

  if (filters.bayiId) {
    where.bayiId = filters.bayiId;
  }

  if (filters.startDate || filters.endDate) {
    where.createdAt = {};
    if (filters.startDate) where.createdAt.gte = filters.startDate;
    if (filters.endDate) where.createdAt.lte = filters.endDate;
  }

  if (filters.minConfidence !== undefined) {
    where.tingkatKepercayaan = {
      gte: filters.minConfidence,
    };
  }

  return await prisma.hasilAnalisisAI.findMany({
    where,
    include: {
      bayi: {
        select: {
          nama: true,
          nomorPasien: true,
          tanggalLahir: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

// Statistik hasil analisis
export async function getStatistikHasilAnalisis() {
  const [total, byJenis, avgConfidence] = await Promise.all([
    // Total analisis
    prisma.hasilAnalisisAI.count(),
    
    // Group by jenis analisis
    prisma.hasilAnalisisAI.groupBy({
      by: ['jenisAnalisis'],
      _count: {
        id: true,
      },
    }),
    
    // Average confidence
    prisma.hasilAnalisisAI.aggregate({
      _avg: {
        tingkatKepercayaan: true,
      },
    }),
  ]);

  return {
    total,
    byJenis,
    avgConfidence: avgConfidence._avg.tingkatKepercayaan,
  };
}

// ==================== SHAP ANALYSIS HELPERS ====================

/**
 * Get latest SHAP analysis for a patient with parsed JSON
 */
export async function getLatestSHAPAnalysis(bayiId: string) {
  const analysis = await getLatestHasilAnalisis(bayiId, 'SHAP_ANALYSIS');
  
  if (!analysis) {
    return null;
  }

  try {
    return {
      id: analysis.id,
      createdAt: analysis.createdAt,
      tingkatKepercayaan: analysis.tingkatKepercayaan,
      shapResult: JSON.parse(analysis.dataInput),
      insights: JSON.parse(analysis.hasilPrediksi),
      rekomendasiTindakan: analysis.rekomendasiTindakan,
      catatanAI: analysis.catatanAI,
    };
  } catch (error) {
    console.error('Error parsing SHAP analysis JSON:', error);
    return null;
  }
}

/**
 * Create SHAP analysis record with proper JSON stringification
 */
export async function createSHAPAnalysis(data: {
  bayiId: string;
  shapResult: any;
  insights: any;
  confidence: number;
}) {
  return await createHasilAnalisis({
    bayiId: data.bayiId,
    jenisAnalisis: 'SHAP_ANALYSIS',
    hasilPrediksi: JSON.stringify(data.insights),
    tingkatKepercayaan: data.confidence,
    dataInput: JSON.stringify(data.shapResult),
    rekomendasiTindakan: data.insights.rekomendasiTindakan
      ?.map((r: any) => `${r.judul}: ${r.deskripsi}`)
      .join('\n\n'),
    catatanAI: `Analisis SHAP - ${data.insights.statusRisiko?.levelRisiko || 'Unknown'}`,
  });
}

