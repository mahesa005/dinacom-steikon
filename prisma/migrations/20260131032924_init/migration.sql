-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "namaPuskesmas" TEXT NOT NULL,
    "provinsi" TEXT NOT NULL,
    "kota" TEXT NOT NULL,
    "kecamatan" TEXT NOT NULL,
    "kelurahan" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bayi" (
    "id" TEXT NOT NULL,
    "nomorPasien" TEXT NOT NULL,
    "nik" TEXT,
    "nama" TEXT NOT NULL,
    "tanggalLahir" TIMESTAMP(3) NOT NULL,
    "tempatLahir" TEXT NOT NULL,
    "jenisKelamin" TEXT NOT NULL,
    "beratLahir" DOUBLE PRECISION NOT NULL,
    "panjangLahir" DOUBLE PRECISION NOT NULL,
    "namaIbu" TEXT NOT NULL,
    "namaAyah" TEXT NOT NULL,
    "nomorHpOrangTua" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "golonganDarah" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "bayi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "history_kontrol" (
    "id" TEXT NOT NULL,
    "bayiId" TEXT NOT NULL,
    "tanggalKontrol" TIMESTAMP(3) NOT NULL,
    "umurBulan" INTEGER NOT NULL,
    "beratBadan" DOUBLE PRECISION NOT NULL,
    "tinggiBadan" DOUBLE PRECISION NOT NULL,
    "statusGizi" TEXT,
    "statusStunting" TEXT,
    "catatanTambahan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "history_kontrol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hasil_analisis_ai" (
    "id" TEXT NOT NULL,
    "bayiId" TEXT NOT NULL,
    "jenisAnalisis" TEXT NOT NULL,
    "hasilPrediksi" TEXT NOT NULL,
    "tingkatKepercayaan" DOUBLE PRECISION,
    "dataInput" TEXT NOT NULL,
    "rekomendasiTindakan" TEXT,
    "catatanAI" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hasil_analisis_ai_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "bayi_nomorPasien_key" ON "bayi"("nomorPasien");

-- CreateIndex
CREATE UNIQUE INDEX "bayi_nik_key" ON "bayi"("nik");

-- CreateIndex
CREATE INDEX "history_kontrol_bayiId_idx" ON "history_kontrol"("bayiId");

-- CreateIndex
CREATE INDEX "history_kontrol_tanggalKontrol_idx" ON "history_kontrol"("tanggalKontrol");

-- CreateIndex
CREATE INDEX "hasil_analisis_ai_bayiId_idx" ON "hasil_analisis_ai"("bayiId");

-- CreateIndex
CREATE INDEX "hasil_analisis_ai_createdAt_idx" ON "hasil_analisis_ai"("createdAt");

-- AddForeignKey
ALTER TABLE "bayi" ADD CONSTRAINT "bayi_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "history_kontrol" ADD CONSTRAINT "history_kontrol_bayiId_fkey" FOREIGN KEY ("bayiId") REFERENCES "bayi"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hasil_analisis_ai" ADD CONSTRAINT "hasil_analisis_ai_bayiId_fkey" FOREIGN KEY ("bayiId") REFERENCES "bayi"("id") ON DELETE CASCADE ON UPDATE CASCADE;
