'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { User, Calendar, Ruler, Weight, Users, Home, FileText, Loader2, CheckCircle, AlertTriangle, TrendingUp, Brain } from 'lucide-react';

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface AnalysisResult {
  bayi: any;
  analisisAI: {
    id: string;
    createdAt: string;
    insights: {
      statusRisiko: {
        skorRisiko: number;
        levelRisiko: string;
        penjelasan: string;
      };
      faktorPenyebab: Array<{
        nama: string;
        nilai: string;
        persentasePengaruh: number;
        penjelasan: string;
        mengapaIniPenting: string;
      }>;
      rekomendasiTindakan: Array<{
        judul: string;
        deskripsi: string;
        prioritas: string;
        icon: string;
      }>;
    };
  } | null;
}

export function AddPatientModal({ isOpen, onClose, onSuccess }: AddPatientModalProps) {
  const [step, setStep] = useState<'form' | 'loading' | 'result'>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [loadingStage, setLoadingStage] = useState('');
  
  const [formData, setFormData] = useState({
    // Patient ID
    nomorPasien: '',
    nik: '',
    
    // Baby Info
    nama: '',
    tanggalLahir: '',
    tempatLahir: '',
    jenisKelamin: '',
    beratLahir: '',
    panjangLahir: '',
    golonganDarah: '',
    alamat: '',
    
    // Mother Info
    namaIbu: '',
    nomorHpOrangTua: '',
    pendidikanIbu: '',
    tinggiIbu: '',
    
    // Father Info
    namaAyah: '',
    pendidikanAyah: '',
    tinggiAyah: '',
    
    // Environment
    fasilitas_toilet: '',
    pengelolaan_sampah: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStep('loading');
    setLoadingStage('Menyimpan data bayi...');

    try {
      // Map education levels to numbers
      const educationMap: { [key: string]: number } = {
        'SD': 0,
        'SMP': 1,
        'SMA': 1,
        'D3': 2,
        'S1': 2,
        'S2': 2,
      };

      // Map facility standards
      const facilityMap: { [key: string]: number } = {
        'good': 1,
        'adequate': 1,
        'poor': 0,
      };

      const payload: any = {
        nomorPasien: formData.nomorPasien,
        nik: formData.nik || null,
        nama: formData.nama,
        tanggalLahir: formData.tanggalLahir,
        tempatLahir: formData.tempatLahir,
        jenisKelamin: formData.jenisKelamin === 'male' ? 'L' : 'P',
        beratLahir: parseFloat(formData.beratLahir) * 1000,
        panjangLahir: parseFloat(formData.panjangLahir),
        golonganDarah: formData.golonganDarah || null,
        namaIbu: formData.namaIbu,
        namaAyah: formData.namaAyah,
        nomorHpOrangTua: formData.nomorHpOrangTua,
        alamat: formData.alamat,
      };

      // Add parent data only if filled (for prediction)
      if (formData.tinggiIbu) {
        payload.tinggiIbu = parseFloat(formData.tinggiIbu);
      }
      if (formData.tinggiAyah) {
        payload.tinggiAyah = parseFloat(formData.tinggiAyah);
      }
      if (formData.pendidikanIbu) {
        payload.pendidikanIbu = educationMap[formData.pendidikanIbu];
      }
      if (formData.pendidikanAyah) {
        payload.pendidikanAyah = educationMap[formData.pendidikanAyah];
      }
      if (formData.fasilitas_toilet) {
        payload.fasilitas_toilet = facilityMap[formData.fasilitas_toilet];
      }
      if (formData.pengelolaan_sampah) {
        payload.pengelolaan_sampah = facilityMap[formData.pengelolaan_sampah];
      }

      setLoadingStage('Membuat jadwal pemeriksaan...');
      
      const response = await fetch('/api/bayi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Gagal mendaftarkan bayi');
      }

      setLoadingStage('Menganalisis risiko stunting dengan AI...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      setAnalysisResult(result.data);
      setStep('result');
      
      onSuccess?.();
    } catch (error) {
      console.error('Submit error:', error);
      alert(error instanceof Error ? error.message : 'Terjadi kesalahan');
      setStep('form');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseResult = () => {
    setStep('form');
    setAnalysisResult(null);
    setFormData({
      nomorPasien: '',
      nik: '',
      nama: '',
      tanggalLahir: '',
      tempatLahir: '',
      jenisKelamin: '',
      beratLahir: '',
      panjangLahir: '',
      golonganDarah: '',
      alamat: '',
      namaIbu: '',
      nomorHpOrangTua: '',
      pendidikanIbu: '',
      tinggiIbu: '',
      namaAyah: '',
      pendidikanAyah: '',
      tinggiAyah: '',
      fasilitas_toilet: '',
      pengelolaan_sampah: '',
    });
    onClose();
  };

  // Loading View
  if (step === 'loading') {
    return (
      <Modal isOpen={isOpen} onClose={() => {}} size="md">
        <div className="px-6 py-12 text-center">
          <Loader2 className="w-16 h-16 text-teal-600 animate-spin mx-auto mb-6" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Memproses Data...
          </h3>
          <p className="text-gray-600 mb-6">{loadingStage}</p>
          <div className="space-y-3 text-left max-w-md mx-auto">
            <div className="flex items-center gap-3 text-sm">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>Menyimpan data bayi</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>Membuat jadwal pemeriksaan</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              {loadingStage.includes('AI') ? (
                <Loader2 className="w-5 h-5 text-teal-600 animate-spin" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
              )}
              <span>Menganalisis risiko dengan AI</span>
            </div>
          </div>
        </div>
      </Modal>
    );
  }

  // Result View
  if (step === 'result' && analysisResult) {
    const riskColor = analysisResult.analisisAI?.insights.statusRisiko.levelRisiko === 'Risiko Tinggi' 
      ? 'text-red-600 bg-red-50 border-red-200'
      : analysisResult.analisisAI?.insights.statusRisiko.levelRisiko === 'Risiko Sedang'
      ? 'text-yellow-600 bg-yellow-50 border-yellow-200'
      : 'text-green-600 bg-green-50 border-green-200';

    return (
      <Modal isOpen={isOpen} onClose={handleCloseResult} size="xl">
        <div className="px-6 py-6">
          {/* Header Success */}
          <div className="text-center mb-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Bayi Berhasil Didaftarkan!
            </h3>
            <p className="text-gray-600">
              {analysisResult.bayi.nama} telah terdaftar dengan nomor pasien <strong>{analysisResult.bayi.nomorPasien}</strong>
            </p>
          </div>

          {/* Analysis Result */}
          {analysisResult.analisisAI && (
            <div className="space-y-6 max-h-[60vh] overflow-y-auto">
              {/* Risk Status */}
              <div className={`border-2 rounded-xl p-6 ${riskColor}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Brain className="w-8 h-8" />
                    <div>
                      <h4 className="text-lg font-bold">
                        {analysisResult.analisisAI.insights.statusRisiko.levelRisiko}
                      </h4>
                      <p className="text-sm opacity-80">
                        Skor: {analysisResult.analisisAI.insights.statusRisiko.skorRisiko}%
                      </p>
                    </div>
                  </div>
                  <TrendingUp className="w-10 h-10 opacity-50" />
                </div>
                <p className="text-sm leading-relaxed">
                  {analysisResult.analisisAI.insights.statusRisiko.penjelasan}
                </p>
              </div>

              {/* Top Risk Factors */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  Faktor Penyebab Utama
                </h4>
                <div className="space-y-4">
                  {analysisResult.analisisAI.insights.faktorPenyebab.slice(0, 3).map((faktor, idx) => (
                    <div key={idx} className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-semibold text-gray-900">{faktor.nama}</h5>
                        <span className="text-sm font-bold text-teal-600">
                          {faktor.persentasePengaruh}%
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">Nilai: {faktor.nilai}</p>
                      <p className="text-sm text-gray-700">{faktor.penjelasan}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Recommendations */}
              <div className="bg-teal-50 rounded-xl p-6">
                <h4 className="font-bold text-gray-900 mb-4">Rekomendasi Tindakan Prioritas</h4>
                <div className="space-y-3">
                  {analysisResult.analisisAI.insights.rekomendasiTindakan
                    .filter(r => r.prioritas === 'Prioritas Tinggi')
                    .slice(0, 3)
                    .map((rekomendasi, idx) => (
                      <div key={idx} className="bg-white rounded-lg p-4 border border-teal-200">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{rekomendasi.icon}</span>
                          <div className="flex-1">
                            <h5 className="font-semibold text-gray-900 mb-1">
                              {rekomendasi.judul}
                            </h5>
                            <p className="text-sm text-gray-700">{rekomendasi.deskripsi}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end gap-3">
            <Button variant="outline" onClick={handleCloseResult}>
              Tutup
            </Button>
            <Button onClick={handleCloseResult}>
              Tambah Pasien Lagi
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  // Form View - Continue with existing form fields...
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title="Tambah Pasien Baru"
      subtitle="Masukkan data lengkap untuk prediksi risiko stunting"
    >
      <form onSubmit={handleSubmit} className="px-6 py-6">
        <div className="space-y-8 max-h-[calc(100vh-300px)] overflow-y-auto px-1">
          {/* Patient ID Section */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-600" />
              Identitas Pasien
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor Pasien <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.nomorPasien}
                  onChange={(e) => setFormData({ ...formData, nomorPasien: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Contoh: BP-2026-001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  NIK (Opsional)
                </label>
                <input
                  type="text"
                  value={formData.nik}
                  onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="16 digit NIK"
                  maxLength={16}
                />
              </div>
            </div>
          </div>

          {/* Baby Information */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-teal-600" />
              Informasi Bayi
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Lengkap Bayi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Nama bayi"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tempat Lahir <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.tempatLahir}
                  onChange={(e) => setFormData({ ...formData, tempatLahir: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Kota/Kabupaten"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Lahir <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.tanggalLahir}
                  onChange={(e) => setFormData({ ...formData, tanggalLahir: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jenis Kelamin <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.jenisKelamin}
                  onChange={(e) => setFormData({ ...formData, jenisKelamin: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="">Pilih jenis kelamin</option>
                  <option value="male">Laki-laki</option>
                  <option value="female">Perempuan</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Berat Lahir (kg) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={formData.beratLahir}
                  onChange={(e) => setFormData({ ...formData, beratLahir: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="2.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Panjang Lahir (cm) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  value={formData.panjangLahir}
                  onChange={(e) => setFormData({ ...formData, panjangLahir: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="48"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Golongan Darah (Opsional)
                </label>
                <select
                  value={formData.golonganDarah}
                  onChange={(e) => setFormData({ ...formData, golonganDarah: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="">Belum Tahu</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="AB">AB</option>
                  <option value="O">O</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alamat Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Jl. Contoh No. 123, RT 01 RW 02"
                />
              </div>
            </div>
          </div>

          {/* Mother Information */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-600" />
              Informasi Ibu
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Ibu <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.namaIbu}
                  onChange={(e) => setFormData({ ...formData, namaIbu: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Nama ibu"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor Telepon <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={formData.nomorHpOrangTua}
                  onChange={(e) => setFormData({ ...formData, nomorHpOrangTua: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="08XX-XXXX-XXXX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pendidikan Terakhir <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.pendidikanIbu}
                  onChange={(e) => setFormData({ ...formData, pendidikanIbu: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="">Pilih pendidikan</option>
                  <option value="SD">SD</option>
                  <option value="SMP">SMP</option>
                  <option value="SMA">SMA</option>
                  <option value="D3">D3</option>
                  <option value="S1">S1</option>
                  <option value="S2">S2</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tinggi Badan (cm) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  value={formData.tinggiIbu}
                  onChange={(e) => setFormData({ ...formData, tinggiIbu: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="150"
                />
              </div>
            </div>
          </div>

          {/* Father Information */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              Informasi Ayah
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Ayah <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.namaAyah}
                  onChange={(e) => setFormData({ ...formData, namaAyah: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Nama ayah"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pendidikan Terakhir <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.pendidikanAyah}
                  onChange={(e) => setFormData({ ...formData, pendidikanAyah: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="">Pilih pendidikan</option>
                  <option value="SD">SD</option>
                  <option value="SMP">SMP</option>
                  <option value="SMA">SMA</option>
                  <option value="D3">D3</option>
                  <option value="S1">S1</option>
                  <option value="S2">S2</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tinggi Badan (cm) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  value={formData.tinggiAyah}
                  onChange={(e) => setFormData({ ...formData, tinggiAyah: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="165"
                />
              </div>
            </div>
          </div>

          {/* Environment Information */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Home className="w-5 h-5 text-green-600" />
              Kondisi Lingkungan
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fasilitas Toilet <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.fasilitas_toilet}
                  onChange={(e) => setFormData({ ...formData, fasilitas_toilet: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="">Pilih kondisi</option>
                  <option value="good">Baik (Memenuhi Standar)</option>
                  <option value="adequate">Cukup</option>
                  <option value="poor">Tidak Layak</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pengelolaan Sampah <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.pengelolaan_sampah}
                  onChange={(e) => setFormData({ ...formData, pengelolaan_sampah: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="">Pilih kondisi</option>
                  <option value="good">Baik (Memenuhi Standar)</option>
                  <option value="adequate">Cukup</option>
                  <option value="poor">Buruk</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="mt-6 pt-6 border-t border-gray-200 flex items-center justify-end space-x-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Batal
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Memproses...
              </>
            ) : (
              'Simpan & Analisis AI'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
