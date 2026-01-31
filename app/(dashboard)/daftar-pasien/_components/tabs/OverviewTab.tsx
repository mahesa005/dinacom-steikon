import { Calendar, Phone, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { Patient } from '@/types';

interface OverviewTabProps {
  patient: Patient;
}

export function OverviewTab({ patient }: OverviewTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column: Patient Info */}
      <div className="space-y-6">
        {/* Basic Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h5 className="font-semibold text-gray-900 mb-4">
            Informasi Dasar Bayi
          </h5>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Nama Lengkap:</span>
              <span className="text-sm font-semibold text-gray-900">
                {patient.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Tanggal Lahir:</span>
              <span className="text-sm font-semibold text-gray-900">
                {patient.birthDate}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Jenis Kelamin:</span>
              <span className="text-sm font-semibold text-gray-900">
                {patient.gender === 'male' ? 'Laki-laki' : 'Perempuan'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Berat Lahir:</span>
              <span className="text-sm font-semibold text-gray-900">
                {patient.birthWeight} kg
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Panjang Lahir:</span>
              <span className="text-sm font-semibold text-gray-900">
                {patient.birthLength} cm
              </span>
            </div>
          </div>
        </div>

        {/* Parent Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h5 className="font-semibold text-gray-900 mb-4">
            Informasi Orang Tua
          </h5>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Nama Ibu:</span>
              <span className="text-sm font-semibold text-gray-900">
                {patient.parentName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Tinggi Badan Ibu:</span>
              <span
                className={`text-sm font-semibold ${
                  patient.parentHeight < 150 ? 'text-red-600' : 'text-gray-900'
                }`}
              >
                {patient.parentHeight} cm{' '}
                {patient.parentHeight < 150 && '⚠️'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Pendidikan Ibu:</span>
              <span className="text-sm font-semibold text-gray-900">
                {patient.parentEducation}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Nama Ayah:</span>
              <span className="text-sm font-semibold text-gray-900">
                {patient.fatherName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Tinggi Badan Ayah:</span>
              <span className="text-sm font-semibold text-gray-900">
                {patient.fatherHeight} cm
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Pendidikan Ayah:</span>
              <span className="text-sm font-semibold text-gray-900">
                {patient.fatherEducation}
              </span>
            </div>
          </div>
        </div>

        {/* Environment Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h5 className="font-semibold text-gray-900 mb-4">
            Kondisi Lingkungan
          </h5>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Fasilitas Toilet:</span>
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                  patient.toiletFacility === 'poor'
                    ? 'bg-red-100 text-red-700'
                    : patient.toiletFacility === 'adequate'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-green-100 text-green-700'
                }`}
              >
                {patient.toiletFacility === 'poor'
                  ? 'Tidak Layak ⚠️'
                  : patient.toiletFacility === 'adequate'
                  ? 'Cukup'
                  : 'Baik'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Pengelolaan Sampah:</span>
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                  patient.wasteManagement === 'poor'
                    ? 'bg-red-100 text-red-700'
                    : patient.wasteManagement === 'adequate'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-green-100 text-green-700'
                }`}
              >
                {patient.wasteManagement === 'poor'
                  ? 'Buruk ⚠️'
                  : patient.wasteManagement === 'adequate'
                  ? 'Cukup'
                  : 'Baik'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Akses Air Bersih:</span>
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                  patient.waterAccess === 'poor'
                    ? 'bg-red-100 text-red-700'
                    : patient.waterAccess === 'adequate'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-green-100 text-green-700'
                }`}
              >
                {patient.waterAccess === 'poor'
                  ? 'Tidak Ada'
                  : patient.waterAccess === 'adequate'
                  ? 'Terbatas'
                  : 'Baik'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Charts & Status */}
      <div className="space-y-6">
        {/* Risk Breakdown */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h5 className="font-semibold text-gray-900 mb-4">
            Breakdown Faktor Risiko
          </h5>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">🚽</span>
                  <span className="text-sm font-medium text-gray-700">
                    Sanitasi
                  </span>
                </div>
                <span className="text-sm font-bold text-red-600">35%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full chart-bar"
                  style={{ width: '35%' }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">👩</span>
                  <span className="text-sm font-medium text-gray-700">
                    Tinggi Badan Ibu
                  </span>
                </div>
                <span className="text-sm font-bold text-red-600">28%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full chart-bar"
                  style={{ width: '28%' }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">📚</span>
                  <span className="text-sm font-medium text-gray-700">
                    Pendidikan Ibu
                  </span>
                </div>
                <span className="text-sm font-bold text-orange-600">15%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-orange-500 h-2 rounded-full chart-bar"
                  style={{ width: '15%' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Next Checkup */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h5 className="font-semibold text-gray-900">Kontrol Berikutnya</h5>
              <p className="text-sm text-gray-600">Jadwal pemeriksaan ulang</p>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-2xl font-bold text-gray-900">
              {patient.nextCheckup}
            </p>
            <p className="text-sm text-gray-600 mt-1">5 hari lagi • 10:00 WIB</p>
            <p className="text-xs text-gray-500 mt-2">
              Lokasi: Posyandu Melati RW 05
            </p>
          </div>
          <button className="mt-4 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm">
            Ubah Jadwal
          </button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="success"
            className="w-full py-3"
            icon={<Phone className="w-5 h-5" />}
          >
            Hubungi
          </Button>
          <Button
            variant="secondary"
            className="w-full py-3"
            icon={<MessageCircle className="w-5 h-5" />}
          >
            WhatsApp
          </Button>
        </div>
      </div>
    </div>
  );
}
