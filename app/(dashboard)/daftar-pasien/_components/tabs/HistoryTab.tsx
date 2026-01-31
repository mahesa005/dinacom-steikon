import { CheckCircle } from 'lucide-react';
import type { ExaminationHistory } from '@/types';

interface HistoryTabProps {
  patientId: string;
}

// Mock history data
const mockHistory: ExaminationHistory[] = [
  {
    id: '1',
    patientId: 'P001',
    date: '8 Jan 2026',
    month: 6,
    weight: 6.2,
    height: 64,
    riskLevel: 'HIGH',
    riskPercentage: 78,
    notes: 'Pertumbuhan lambat, rekomendasi PMT intensif',
  },
  {
    id: '2',
    patientId: 'P001',
    date: '8 Des 2025',
    month: 5,
    weight: 5.8,
    height: 62,
    riskLevel: 'MEDIUM',
    riskPercentage: 65,
  },
  {
    id: '3',
    patientId: 'P001',
    date: '8 Nov 2025',
    month: 4,
    weight: 5.4,
    height: 60,
    riskLevel: 'MEDIUM',
    riskPercentage: 55,
  },
  {
    id: '4',
    patientId: 'P001',
    date: '8 Okt 2025',
    month: 3,
    weight: 4.9,
    height: 58,
    riskLevel: 'LOW',
    riskPercentage: 35,
  },
];

export function HistoryTab({ patientId }: HistoryTabProps) {
  return (
    <div className="space-y-4">
      {mockHistory.map((record) => (
        <div
          key={record.id}
          className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  record.riskLevel === 'HIGH'
                    ? 'bg-red-100'
                    : record.riskLevel === 'MEDIUM'
                    ? 'bg-yellow-100'
                    : 'bg-green-100'
                }`}
              >
                <CheckCircle
                  className={`w-5 h-5 ${
                    record.riskLevel === 'HIGH'
                      ? 'text-red-600'
                      : record.riskLevel === 'MEDIUM'
                      ? 'text-yellow-600'
                      : 'text-green-600'
                  }`}
                />
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  Pemeriksaan Rutin - Bulan ke-{record.month}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Berat: {record.weight} kg • Panjang: {record.height} cm •
                  Status:{' '}
                  <span
                    className={
                      record.riskLevel === 'HIGH'
                        ? 'text-red-600 font-semibold'
                        : record.riskLevel === 'MEDIUM'
                        ? 'text-yellow-600 font-semibold'
                        : 'text-green-600 font-semibold'
                    }
                  >
                    Risiko{' '}
                    {record.riskLevel === 'HIGH'
                      ? 'Tinggi'
                      : record.riskLevel === 'MEDIUM'
                      ? 'Sedang'
                      : 'Rendah'}{' '}
                    ({record.riskPercentage}%)
                  </span>
                </p>
                {record.notes && (
                  <p className="text-xs text-gray-500 mt-2">
                    Catatan: {record.notes}
                  </p>
                )}
              </div>
            </div>
            <span className="text-sm text-gray-500">{record.date}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
