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

const formSections = [
  { id: 'baby', title: 'Data Bayi' },
  { id: 'parent', title: 'Data Orang Tua' },
  { id: 'environment', title: 'Lingkungan' },
  { id: 'review', title: 'Review & Submit' },
];

export default function InputDataPage() {
  const router = useRouter();
  const [currentSection, setCurrentSection] = useState('baby');
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate patient number automatically
  useEffect(() => {
    const generatePatientNumber = () => {
      const timestamp = Date.now().toString().slice(-6);
      const random = Math.random().toString(36).substring(2, 5).toUpperCase();
      return `P${timestamp}${random}`;
    };
    
    setFormData(prev => ({
      ...prev,
      patientNumber: generatePatientNumber()
    }));
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
    kelurahan: 'Default',
    kecamatan: 'Default',
    kota: 'Default',
    provinsi: 'Default',

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
        nik: formData.nik || undefined,
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
        kelurahan: formData.kelurahan,
        kecamatan: formData.kecamatan,
        kota: formData.kota,
        provinsi: formData.provinsi,
        golonganDarah: formData.bloodType || undefined,
        createdById: 'temp-user-id',
      };

      const response = await fetch('/api/bayi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Gagal menyimpan data');
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
