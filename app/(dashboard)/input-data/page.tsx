'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, ArrowRight, Save, Loader2, CheckCircle, Brain, AlertTriangle, TrendingUp } from 'lucide-react';
import { FormNavigation } from './_components/FormNavigation';
import { BabyDataForm } from './_components/BabyDataForm';
import { ParentDataForm } from './_components/ParentDataForm';
import { EnvironmentDataForm } from './_components/EnvironmentDataForm';
import { ReviewSubmit } from './_components/ReviewSubmit';

const formSections = [
  { id: 'baby', title: 'Data Bayi' },
  { id: 'parent', title: 'Data Orang Tua' },
  { id: 'environment', title: 'Lingkungan' },
  { id: 'review', title: 'Review & Submit' },
];

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

// Mapping functions untuk konversi form data ke format API prediksi
const mapEducationToLevel = (education: string): number => {
  const mapping: Record<string, number> = {
    'SD': 2,
    'SMP': 3,
    'SMA': 4,
    'D3': 5,
    'S1': 5,
    'S2': 5,
    'S3': 5,
  };
  return mapping[education] || 1;
};

const mapFacilityToStandard = (facility: string): number => {
  const mapping: Record<string, number> = {
    'good': 2,
    'adequate': 1,
    'poor': 0,
  };
  return mapping[facility] ?? 0;
};

export default function InputDataPage() {
  const router = useRouter();
  const [step, setStep] = useState<'form' | 'loading' | 'result'>('form');
  const [currentSection, setCurrentSection] = useState('baby');
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [loadingStage, setLoadingStage] = useState('');

  // Generate patient number automatically
  useEffect(() => {
    const generatePatientNumber = async () => {
      try {
        // Get count of existing patients to generate sequential ID
        const response = await fetch('/api/bayi');
        const result = await response.json();
        const count = result.success ? result.data.length + 1 : 1;
        
        // Format: SB-XXXXX (padded with zeros)
        const patientNumber = `SB-${count.toString().padStart(5, '0')}`;
        
        setFormData(prev => ({
          ...prev,
          patientNumber
        }));
      } catch (error) {
        // Fallback: use timestamp-based ID
        const timestamp = Date.now().toString().slice(-5);
        setFormData(prev => ({
          ...prev,
          patientNumber: `SB-${timestamp}`
        }));
      }
    };
    
    generatePatientNumber();
  }, []);

  const [formData, setFormData] = useState({
    // Baby data
    name: '',
    birthDate: '',
    birthPlace: '',
    gender: '',
    birthWeight: '',
    birthLength: '',
    patientNumber: '',
    nik: '',
    address: '',
    bloodType: '',

    // Parent data
    motherName: '',
    motherPhone: '',
    motherEducation: '',
    motherHeight: '',
    fatherName: '',
    fatherEducation: '',
    fatherHeight: '',

    // Environment data
    toiletFacility: '',
    wasteManagement: '',
    waterAccess: '',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateSection = (sectionId: string): boolean => {
    switch (sectionId) {
      case 'baby':
        return !!(
          formData.name &&
          formData.birthDate &&
          formData.birthPlace &&
          formData.gender &&
          formData.birthWeight &&
          formData.birthLength &&
          formData.patientNumber &&
          formData.address
        );
      case 'parent':
        return !!(
          formData.motherName &&
          formData.motherPhone &&
          formData.motherEducation &&
          formData.motherHeight &&
          formData.fatherName &&
          formData.fatherEducation &&
          formData.fatherHeight
        );
      case 'environment':
        return !!(
          formData.toiletFacility &&
          formData.wasteManagement &&
          formData.waterAccess
        );
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateSection(currentSection)) {
      alert('Mohon lengkapi semua field yang wajib diisi');
      return;
    }

    if (!completedSections.includes(currentSection)) {
      setCompletedSections([...completedSections, currentSection]);
    }

    const currentIndex = formSections.findIndex((s) => s.id === currentSection);
    if (currentIndex < formSections.length - 1) {
      setCurrentSection(formSections[currentIndex + 1].id);
    }
  };

  const handlePrevious = () => {
    const currentIndex = formSections.findIndex((s) => s.id === currentSection);
    if (currentIndex > 0) {
      setCurrentSection(formSections[currentIndex - 1].id);
    }
  };

  const handleSubmit = async () => {
    if (!validateSection('environment')) {
      alert('Mohon lengkapi semua data terlebih dahulu');
      return;
    }

    setIsSubmitting(true);
    setStep('loading');
    setLoadingStage('Menyimpan data bayi...');

    try {
      // Map education levels to numbers
      const educationMap: { [key: string]: number } = {
        'SD': 1,
        'SMP': 2,
        'SMA': 3,
        'D3': 4,
        'S1': 4,
        'S2': 4,
      };

      // Map facility standards
      const facilityMap: { [key: string]: number } = {
        'good': 1,
        'adequate': 1,
        'poor': 0,
      };

      // Prepare payload with parent data for auto-predict
      const payload: any = {
        nomorPasien: formData.patientNumber,
        nik: formData.nik?.trim() || null,
        nama: formData.name,
        tanggalLahir: formData.birthDate,
        tempatLahir: formData.birthPlace,
        jenisKelamin: formData.gender === 'male' ? 'LAKI-LAKI' : 'PEREMPUAN',
        beratLahir: parseFloat(formData.birthWeight) * 1000,
        panjangLahir: parseFloat(formData.birthLength),
        namaIbu: formData.motherName,
        namaAyah: formData.fatherName,
        nomorHpOrangTua: formData.motherPhone,
        alamat: formData.address,
        golonganDarah: formData.bloodType?.trim() || null,
      };

      // Add parent data for prediction (only if filled)
      if (formData.motherHeight) {
        payload.tinggiIbu = parseFloat(formData.motherHeight);
      }
      if (formData.fatherHeight) {
        payload.tinggiAyah = parseFloat(formData.fatherHeight);
      }
      if (formData.motherEducation) {
        payload.pendidikanIbu = educationMap[formData.motherEducation];
      }
      if (formData.fatherEducation) {
        payload.pendidikanAyah = educationMap[formData.fatherEducation];
      }
      if (formData.toiletFacility) {
        payload.fasilitas_toilet = facilityMap[formData.toiletFacility];
      }
      if (formData.wasteManagement) {
        payload.pengelolaan_sampah = facilityMap[formData.wasteManagement];
      }

      setLoadingStage('Membuat jadwal pemeriksaan...');

      // Call API - will auto-predict if parent data complete
      const response = await fetch('/api/bayi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Gagal menyimpan data');
      }

      setLoadingStage('Menganalisis risiko stunting dengan AI...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      setAnalysisResult(result.data);
      setStep('result');
    } catch (error: any) {
      console.error('Error saving data:', error);
      alert(error.message || 'Terjadi kesalahan saat menyimpan data');
      setStep('form');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentIndex = formSections.findIndex((s) => s.id === currentSection);
  const isFirstSection = currentIndex === 0;
  const isLastSection = currentIndex === formSections.length - 1;

  // Loading View
  if (step === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-12 max-w-2xl w-full">
          <div className="text-center">
            <Loader2 className="w-20 h-20 text-teal-600 animate-spin mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Memproses Data...
            </h3>
            <p className="text-lg text-gray-600 mb-8">{loadingStage}</p>
            <div className="space-y-4 text-left max-w-md mx-auto">
              <div className="flex items-center gap-4 text-base">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                <span>Menyimpan data bayi</span>
              </div>
              <div className="flex items-center gap-4 text-base">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                <span>Membuat jadwal pemeriksaan</span>
              </div>
              <div className="flex items-center gap-4 text-base">
                {loadingStage.includes('AI') ? (
                  <Loader2 className="w-6 h-6 text-teal-600 animate-spin flex-shrink-0" />
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex-shrink-0" />
                )}
                <span>Menganalisis risiko dengan AI</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
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
      <div className="min-h-screen bg-gray-50">
        <Header
          title="Hasil Analisis AI"
          subtitle={`Data bayi ${analysisResult.bayi.nama} berhasil disimpan`}
          showUserInfo
        />
        
        <div className="p-8">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Success Message */}
            <Card className="p-8">
              <div className="text-center">
                <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                  Bayi Berhasil Didaftarkan!
                </h2>
                <p className="text-lg text-gray-600 mb-2">
                  {analysisResult.bayi.nama} telah terdaftar dengan nomor pasien
                </p>
                <p className="text-2xl font-bold text-teal-600">
                  {analysisResult.bayi.nomorPasien}
                </p>
              </div>
            </Card>

            {/* AI Analysis Result */}
            {analysisResult.analisisAI && (
              <>
                {/* Risk Status */}
                <Card className={`p-8 border-2 ${riskColor}`}>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <Brain className="w-10 h-10" />
                      <div>
                        <h3 className="text-2xl font-bold">
                          {analysisResult.analisisAI.insights.statusRisiko.levelRisiko}
                        </h3>
                        <p className="text-sm opacity-75">
                          Skor: {analysisResult.analisisAI.insights.statusRisiko.skorRisiko}%
                        </p>
                      </div>
                    </div>
                    <TrendingUp className="w-8 h-8" />
                  </div>
                  <p className="text-base leading-relaxed">
                    {analysisResult.analisisAI.insights.statusRisiko.penjelasan}
                  </p>
                </Card>

                {/* Risk Factors */}
                <Card className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <AlertTriangle className="w-7 h-7 text-orange-600" />
                    Faktor Risiko Terdeteksi
                  </h3>
                  <div className="space-y-4">
                    {analysisResult.analisisAI.insights.faktorPenyebab.map((faktor, idx) => (
                      <div key={idx} className="border-l-4 border-orange-400 pl-6 py-4 bg-gray-50 rounded-r-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-lg text-gray-900">{faktor.nama}</h4>
                          <span className="text-sm font-semibold px-3 py-1 bg-orange-100 text-orange-700 rounded-full">
                            {faktor.persentasePengaruh.toFixed(1)}%
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">Nilai:</span> {faktor.nilai}
                        </p>
                        <p className="text-sm text-gray-700 mb-3">{faktor.penjelasan}</p>
                        <p className="text-sm text-teal-700 bg-teal-50 p-3 rounded-lg border-l-2 border-teal-400">
                          <span className="font-semibold">Mengapa penting:</span> {faktor.mengapaIniPenting}
                        </p>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Recommendations */}
                <Card className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <CheckCircle className="w-7 h-7 text-green-600" />
                    Rekomendasi Tindakan
                  </h3>
                  <div className="grid gap-4">
                    {analysisResult.analisisAI.insights.rekomendasiTindakan.map((rekomendasi, idx) => (
                      <div key={idx} className="border-l-4 border-green-400 pl-6 py-4 bg-gray-50 rounded-r-lg">
                        <div className="flex items-start gap-3 mb-2">
                          <span className="text-2xl">{rekomendasi.icon}</span>
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-bold text-lg text-gray-900">{rekomendasi.judul}</h4>
                              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                                rekomendasi.prioritas === 'Prioritas Tinggi' 
                                  ? 'bg-red-100 text-red-700'
                                  : rekomendasi.prioritas === 'Prioritas Sedang'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-teal-100 text-teal-700'
                              }`}>
                                {rekomendasi.prioritas}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">{rekomendasi.deskripsi}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </>
            )}

            {/* Action Buttons */}
            <Card className="p-6">
              <div className="flex gap-4 justify-center">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/daftar-pasien?patient=${analysisResult.bayi.nomorPasien}`)}
                  className="flex-1 max-w-xs"
                >
                  Lihat Detail Pasien
                </Button>
                <Button
                  onClick={() => {
                    setStep('form');
                    setAnalysisResult(null);
                    setCurrentSection('baby');
                    setCompletedSections([]);
                    // Reset form...
                    window.location.reload();
                  }}
                  className="flex-1 max-w-xs"
                >
                  Input Data Baru
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Form View
  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title="Input Data Baru"
        subtitle="Tambahkan data bayi baru untuk monitoring stunting"
        showUserInfo
      />

      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-12 gap-6">
            {/* Navigation Sidebar */}
            <div className="col-span-3">
              <Card className="p-4 sticky top-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Tahapan Input</h3>
                <FormNavigation
                  sections={formSections}
                  currentSection={currentSection}
                  completedSections={completedSections}
                  onSectionChange={setCurrentSection}
                />
              </Card>
            </div>

            {/* Form Content */}
            <div className="col-span-9">
              <Card className="p-6">
                {currentSection === 'baby' && (
                  <BabyDataForm formData={formData} onInputChange={handleInputChange} />
                )}

                {currentSection === 'parent' && (
                  <ParentDataForm formData={formData} onInputChange={handleInputChange} />
                )}

                {currentSection === 'environment' && (
                  <EnvironmentDataForm
                    formData={formData}
                    onInputChange={handleInputChange}
                  />
                )}

                {currentSection === 'review' && (
                  <ReviewSubmit
                    data={{
                      baby: {
                        patientNumber: formData.patientNumber,
                        nik: formData.nik,
                        name: formData.name,
                        birthDate: formData.birthDate,
                        birthPlace: formData.birthPlace,
                        gender: formData.gender,
                        birthWeight: formData.birthWeight,
                        birthLength: formData.birthLength,
                        bloodType: formData.bloodType,
                        address: formData.address,
                      },
                      parent: {
                        motherName: formData.motherName,
                        motherPhone: formData.motherPhone,
                        motherEducation: formData.motherEducation,
                        motherHeight: formData.motherHeight,
                        fatherName: formData.fatherName,
                        fatherEducation: formData.fatherEducation,
                        fatherHeight: formData.fatherHeight,
                      },
                      environment: {
                        toiletFacility: formData.toiletFacility,
                        wasteManagement: formData.wasteManagement,
                        waterAccess: formData.waterAccess,
                      },
                    }}
                    isSubmitting={isSubmitting}
                  />
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6 border-t border-gray-200 mt-8">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={isFirstSection}
                    className="flex items-center space-x-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Sebelumnya</span>
                  </Button>

                  {!isLastSection ? (
                    <Button onClick={handleNext} className="flex items-center space-x-2">
                      <span>Selanjutnya</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="flex items-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Data'}</span>
                    </Button>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}