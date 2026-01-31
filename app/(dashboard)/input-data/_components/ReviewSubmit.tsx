import { CheckCircle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface ReviewData {
  baby: {
    name: string;
    birthDate: string;
    gender: string;
    birthWeight: string;
    birthLength: string;
  };
  parent: {
    motherName: string;
    motherPhone: string;
    motherEducation: string;
    motherHeight: string;
    fatherName: string;
    fatherEducation: string;
    fatherHeight: string;
  };
  environment: {
    toiletFacility: string;
    wasteManagement: string;
    waterAccess: string;
  };
}

interface ReviewSubmitProps {
  data: ReviewData;
  isSubmitting: boolean;
}

const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const formatGender = (gender: string) => {
  return gender === 'male' ? 'Laki-laki' : gender === 'female' ? 'Perempuan' : '-';
};

const formatFacilityLevel = (level: string) => {
  const mapping: Record<string, { label: string; color: string }> = {
    good: { label: 'Baik', color: 'bg-green-100 text-green-700' },
    adequate: { label: 'Cukup', color: 'bg-yellow-100 text-yellow-700' },
    poor: { label: 'Buruk', color: 'bg-red-100 text-red-700' },
  };
  return mapping[level] || { label: '-', color: 'bg-gray-100 text-gray-700' };
};

export function ReviewSubmit({ data, isSubmitting }: ReviewSubmitProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
          <CheckCircle className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Review & Submit</h3>
          <p className="text-sm text-gray-500">
            Periksa kembali data sebelum menyimpan
          </p>
        </div>
      </div>

      {/* Baby Data Review */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Data Bayi</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Nama Lengkap</p>
            <p className="text-base font-medium text-gray-900">{data.baby.name || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Tanggal Lahir</p>
            <p className="text-base font-medium text-gray-900">
              {formatDate(data.baby.birthDate)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Jenis Kelamin</p>
            <p className="text-base font-medium text-gray-900">
              {formatGender(data.baby.gender)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Berat Lahir</p>
            <p className="text-base font-medium text-gray-900">
              {data.baby.birthWeight ? `${data.baby.birthWeight} kg` : '-'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Panjang Lahir</p>
            <p className="text-base font-medium text-gray-900">
              {data.baby.birthLength ? `${data.baby.birthLength} cm` : '-'}
            </p>
          </div>
        </div>
      </div>

      {/* Parent Data Review */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Data Orang Tua</h4>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Ibu</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Nama</p>
                <p className="text-base font-medium text-gray-900">
                  {data.parent.motherName || '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Nomor Telepon</p>
                <p className="text-base font-medium text-gray-900">
                  {data.parent.motherPhone || '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Pendidikan</p>
                <p className="text-base font-medium text-gray-900">
                  {data.parent.motherEducation || '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tinggi Badan</p>
                <p className="text-base font-medium text-gray-900">
                  {data.parent.motherHeight ? `${data.parent.motherHeight} cm` : '-'}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm font-semibold text-gray-700 mb-2">Ayah</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Nama</p>
                <p className="text-base font-medium text-gray-900">
                  {data.parent.fatherName || '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Pendidikan</p>
                <p className="text-base font-medium text-gray-900">
                  {data.parent.fatherEducation || '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tinggi Badan</p>
                <p className="text-base font-medium text-gray-900">
                  {data.parent.fatherHeight ? `${data.parent.fatherHeight} cm` : '-'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Environment Data Review */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Lingkungan & Sanitasi
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 mb-2">Fasilitas Toilet</p>
            <Badge className={formatFacilityLevel(data.environment.toiletFacility).color}>
              {formatFacilityLevel(data.environment.toiletFacility).label}
            </Badge>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">Pengelolaan Sampah</p>
            <Badge className={formatFacilityLevel(data.environment.wasteManagement).color}>
              {formatFacilityLevel(data.environment.wasteManagement).label}
            </Badge>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">Akses Air Bersih</p>
            <Badge className={formatFacilityLevel(data.environment.waterAccess).color}>
              {formatFacilityLevel(data.environment.waterAccess).label}
            </Badge>
          </div>
        </div>
      </div>

      {/* Warning Message */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-amber-800">
            <strong>Perhatian:</strong> Pastikan semua data yang dimasukkan sudah benar. Data yang
            telah disimpan akan langsung dianalisis oleh sistem AI untuk menentukan tingkat
            risiko stunting.
          </p>
        </div>
      </div>

      {isSubmitting && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-sm text-gray-600 mt-2">Menyimpan data...</p>
        </div>
      )}
    </div>
  );
}
