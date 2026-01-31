// Type definitions untuk kemudahan development
import { Prisma } from '../../app/generated/prisma/client';

// ==================== USER TYPES ====================

export type User = Prisma.UserGetPayload<{
  select: {
    id: true;
    username: true;
    namaPuskesmas: true;
    provinsi: true;
    kota: true;
    kecamatan: true;
    kelurahan: true;
    createdAt: true;
    updatedAt: true;
  };
}>;

export type CreateUserInput = {
  username: string;
  password: string;
  namaPuskesmas: string;
  provinsi: string;
  kota: string;
  kecamatan: string;
  kelurahan: string;
};

// ==================== BAYI TYPES ====================

export type Bayi = Prisma.BayiGetPayload<{
  include: {
    createdBy: {
      select: {
        username: true;
        namaPuskesmas: true;
      };
    };
  };
}>;

export type BayiWithHistory = Prisma.BayiGetPayload<{
  include: {
    createdBy: true;
    historyKontrol: true;
  };
}>;

export type CreateBayiInput = {
  nomorPasien: string;
  nik?: string;
  nama: string;
  tanggalLahir: Date;
  tempatLahir: string;
  jenisKelamin: 'LAKI-LAKI' | 'PEREMPUAN';
  beratLahir: number;
  panjangLahir: number;
  lingkarKepala?: number;
  namaIbu: string;
  namaAyah: string;
  nikIbu?: string;
  nikAyah?: string;
  nomorHpOrangTua: string;
  alamat: string;
  rt?: string;
  rw?: string;
  kelurahan: string;
  kecamatan: string;
  kota: string;
  provinsi: string;
  anakKe?: number;
  golonganDarah?: string;
  riwayatPenyakit?: string;
  riwayatAlergi?: string;
  createdById: string;
};

export type BayiFilters = {
  statusAktif?: boolean;
  provinsi?: string;
  kota?: string;
  kecamatan?: string;
  kelurahan?: string;
  search?: string;
};

// ==================== HISTORY KONTROL TYPES ====================

export type HistoryKontrol = Prisma.HistoryKontrolGetPayload<{
  include: {
    bayi: true;
  };
}>;

export type CreateHistoryKontrolInput = {
  bayiId: string;
  tanggalKontrol: Date;
  umurBulan: number;
  beratBadan: number;
  tinggiBadan: number;
  lingkarKepala?: number;
  lingkarLengan?: number;
  statusGizi?: string;
  statusStunting?: string;
  imunisasi?: string;
  vitaminA?: boolean;
  keluhan?: string;
  diagnosis?: string;
  tindakan?: string;
  catatanTambahan?: string;
};

export type GrafikPertumbuhan = {
  tanggalKontrol: Date;
  umurBulan: number;
  beratBadan: number;
  tinggiBadan: number;
  lingkarKepala: number | null;
  statusGizi: string | null;
  statusStunting: string | null;
}[];

// ==================== HASIL ANALISIS AI TYPES ====================

export type HasilAnalisisAI = Prisma.HasilAnalisisAIGetPayload<{
  include: {
    bayi: true;
    historyKontrol: true;
  };
}>;

export type CreateHasilAnalisisInput = {
  bayiId: string;
  historyKontrolId?: string;
  jenisAnalisis: string;
  hasilPrediksi: string;
  tingkatKepercayaan?: number;
  dataInput: string;
  rekomendasiTindakan?: string;
  catatanAI?: string;
  modelVersion?: string;
  processingTime?: number;
};

export type JenisAnalisis =
  | 'PREDIKSI_STUNTING'
  | 'REKOMENDASI_GIZI'
  | 'ANALISIS_PERTUMBUHAN'
  | 'DETEKSI_RISIKO';

export type HasilPrediksi = 
  | 'NORMAL'
  | 'BERISIKO'
  | 'STUNTING'
  | 'SEVERELY_STUNTING';

// ==================== API RESPONSE TYPES ====================

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

export type PaginatedResponse<T> = {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

// ==================== STATISTIK TYPES ====================

export type StatistikBayi = {
  total: number;
  lakiLaki: number;
  perempuan: number;
};

export type StatistikAnalisis = {
  total: number;
  byJenis: {
    jenisAnalisis: string;
    _count: {
      id: number;
    };
  }[];
  avgConfidence: number | null;
};

export type PerformaModel = {
  totalPredictions: number;
  avgConfidence: number;
  avgProcessingTime: number;
  modelVersion: string;
};
