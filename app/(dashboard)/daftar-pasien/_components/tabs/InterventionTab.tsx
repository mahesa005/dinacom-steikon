import type { Intervention } from '@/types';

interface InterventionTabProps {
  patientId: string;
}

const mockInterventions: Intervention[] = [
  {
    id: 1,
    title: 'Perbaikan Sanitasi Lingkungan',
    description:
      'Koordinasi dengan program STBM untuk perbaikan fasilitas toilet dan pengelolaan sampah',
    color: 'green',
  },
  {
    id: 2,
    title: 'Pemberian Makanan Tambahan (PMT)',
    description:
      'PMT intensif tinggi protein 2x sehari, monitoring berat badan mingguan',
    color: 'blue',
  },
  {
    id: 3,
    title: 'Edukasi Orang Tua',
    description:
      'Konseling gizi dan pola asuh, fokus pada pentingnya ASI eksklusif dan MP-ASI berkualitas',
    color: 'orange',
  },
  {
    id: 4,
    title: 'Pemantauan Pertumbuhan Intensif',
    description:
      'Kunjungan rumah bulanan untuk memantau perkembangan dan memberikan dukungan langsung',
    color: 'blue',
  },
  {
    id: 5,
    title: 'Rujukan ke Spesialis Gizi',
    description:
      'Konsultasi dengan ahli gizi untuk penyusunan menu makanan sesuai kebutuhan anak',
    color: 'green',
  },
];

export function InterventionTab({ patientId }: InterventionTabProps) {
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'green':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          badge: 'bg-green-500',
        };
      case 'blue':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          badge: 'bg-blue-500',
        };
      case 'orange':
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          badge: 'bg-orange-500',
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          badge: 'bg-gray-500',
        };
    }
  };

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 mb-2">
          Rekomendasi Intervensi
        </h4>
        <p className="text-sm text-gray-600">
          Berdasarkan analisis AI, berikut adalah langkah-langkah intervensi
          yang direkomendasikan untuk pasien ini:
        </p>
      </div>

      {mockInterventions.map((intervention) => {
        const colors = getColorClasses(intervention.color);
        return (
          <div
            key={intervention.id}
            className={`${colors.bg} border ${colors.border} rounded-lg p-4`}
          >
            <div className="flex items-start space-x-3">
              <div
                className={`w-6 h-6 ${colors.badge} rounded-full flex items-center justify-center flex-shrink-0`}
              >
                <span className="text-white text-xs font-bold">
                  {intervention.id}
                </span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {intervention.title}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {intervention.description}
                </p>
              </div>
            </div>
          </div>
        );
      })}

      {/* Action Buttons */}
      <div className="mt-6 pt-4 border-t border-gray-200 flex items-center space-x-3">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">
          Cetak Rencana Intervensi
        </button>
        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium">
          Bagikan ke Tim
        </button>
      </div>
    </div>
  );
}
