'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, ArrowRight, Save } from 'lucide-react';
import { FormNavigation } from './_components/FormNavigation';
import { BabyDataForm } from './_components/BabyDataForm';
import { ParentDataForm } from './_components/ParentDataForm';
import { EnvironmentDataForm } from './_components/EnvironmentDataForm';
import { ReviewSubmit } from './_components/ReviewSubmit';
import { predictStunting, explainStunting } from '@/lib/stunting-prediction';

const formSections = [
  { id: 'baby', title: 'Data Bayi' },
  { id: 'parent', title: 'Data Orang Tua' },
  { id: 'environment', title: 'Lingkungan' },
  { id: 'review', title: 'Review & Submit' },
];

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
  const [currentSection, setCurrentSection] = useState('baby');
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    try {
      // Map form data to API format
      const payload = {
        nomorPasien: formData.patientNumber,
        nik: formData.nik?.trim() || null,
        nama: formData.name,
        tanggalLahir: new Date(formData.birthDate).toISOString(),
        tempatLahir: formData.birthPlace,
        jenisKelamin: formData.gender === 'male' ? 'LAKI-LAKI' : 'PEREMPUAN',
        beratLahir: parseFloat(formData.birthWeight),
        panjangLahir: parseFloat(formData.birthLength),
        namaIbu: formData.motherName,
        namaAyah: formData.fatherName,
        nomorHpOrangTua: formData.motherPhone,
        alamat: formData.address,
        golonganDarah: formData.bloodType?.trim() || null,
        // createdById akan di-handle otomatis oleh backend
      };

      // 1. Simpan data bayi ke database
      const response = await fetch('/api/bayi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Gagal menyimpan data');
      }

      // 2. Prepare prediction payload with threshold fallback
      const motherHeight = parseFloat(formData.motherHeight);
      const fatherHeight = parseFloat(formData.fatherHeight);

      const predictionPayload = {
        mother_height_cm: motherHeight < 100 ? 100 : motherHeight,
        father_height_cm: fatherHeight < 100 ? 100 : fatherHeight,
        mother_edu_level: mapEducationToLevel(formData.motherEducation),
        father_edu_level: mapEducationToLevel(formData.fatherEducation),
        toilet_standard: mapFacilityToStandard(formData.toiletFacility),
        waste_mgmt_std: mapFacilityToStandard(formData.wasteManagement),
      };

      const bayiId = result.data.id;

      try {
        // Call both prediction and explanation APIs in parallel
        const [predictionResult, explainResult] = await Promise.all([
          predictStunting(predictionPayload),
          explainStunting(predictionPayload),
        ]);

        if (predictionResult.success && explainResult.success) {
          // Determine risk level based on prediction
          const stuntingRisk = predictionResult.data.stunting_risk;
          let riskLevel = 'MEDIUM';
          if (predictionResult.data.is_stunting || stuntingRisk > 70) {
            riskLevel = 'HIGH';
          } else if (stuntingRisk < 30) {
            riskLevel = 'LOW';
          }

          // Get top contributing factors from SHAP values
          // API returns shap_values as object {feature: value}, need to convert to array
          console.log('Explain result data:', explainResult.data);
          const rawShapValues = explainResult.data?.shap_values || {};
          const inputFeatures = explainResult.data?.input_features || {};

          // Convert object to array format
          let shapValues: Array<{ feature: string; value: number; feature_value: number }> = [];
          if (typeof rawShapValues === 'object' && !Array.isArray(rawShapValues)) {
            shapValues = Object.entries(rawShapValues).map(([feature, value]) => ({
              feature,
              value: value as number,
              feature_value: (inputFeatures as any)[feature] || 0,
            }));
          } else if (Array.isArray(rawShapValues)) {
            shapValues = rawShapValues;
          }

          const topFactors = shapValues
            .slice()
            .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
            .slice(0, 3);

          // Generate recommendations based on top factors
          const recommendations = topFactors.map(factor => {
            const featureName = factor.feature.replace(/_/g, ' ');
            if (factor.value > 0) {
              return `Perhatikan faktor ${featureName} yang berkontribusi terhadap risiko stunting.`;
            }
            return `Faktor ${featureName} sudah baik, pertahankan kondisi ini.`;
          }).join(' ');

          // 3. Save analysis results to hasil_analisis_ai
          console.log('Saving analysis for bayiId:', bayiId);

          const analisisPayload = {
            jenisAnalisis: 'SHAP_ANALYSIS',
            tingkatKepercayaan: predictionResult.data.confidence,
            dataInput: JSON.stringify({
              input_features: predictionResult.data.input_features,
              shap_values: shapValues,
              top_factors: topFactors,
              base_value: explainResult.data.base_value,
            }),
            hasilPrediksi: JSON.stringify({
              is_stunting: predictionResult.data.is_stunting,
              stunting_risk: stuntingRisk,
              risk_level: riskLevel,
            }),
            rekomendasiTindakan: recommendations || 'Lakukan pemantauan rutin terhadap pertumbuhan bayi.',
            catatanAI: `Analisis SHAP - Risiko ${riskLevel} (${Math.round(stuntingRisk)}%). Confidence: ${Math.round(predictionResult.data.confidence * 100)}%`,
          };

          console.log('Analisis payload:', analisisPayload);

          const analisisResponse = await fetch(`/api/bayi/${bayiId}/analisis`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(analisisPayload),
          });

          const analisisResult = await analisisResponse.json();
          console.log('Analisis response:', analisisResult);

          if (!analisisResponse.ok) {
            console.error('Failed to save analysis:', analisisResult);
          }
        } else {
          console.log('Prediction failed:', predictionResult);
          console.log('Explain failed:', explainResult);
        }
      } catch (predictionError) {
        console.error('Prediction/Analysis error (non-blocking):', predictionError);
      }

      alert('Data berhasil disimpan!');
      router.push('/daftar-pasien');
    } catch (error: any) {
      console.error('Error saving data:', error);
      alert(error.message || 'Terjadi kesalahan saat menyimpan data');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentIndex = formSections.findIndex((s) => s.id === currentSection);
  const isFirstSection = currentIndex === 0;
  const isLastSection = currentIndex === formSections.length - 1;

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
