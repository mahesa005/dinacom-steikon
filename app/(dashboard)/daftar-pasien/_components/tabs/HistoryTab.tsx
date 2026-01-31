'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface HistoryRecord {
  id: string;
  tanggalKontrol: string;
  umurBulan: number;
  beratBadan: number;
  tinggiBadan: number;
  statusStunting?: string;
  catatanTambahan?: string;
}

interface HistoryTabProps {
  patientId: string;
  bayiId?: string;
  onAddControl?: () => void;
}

export function HistoryTab({ patientId, bayiId, onAddControl }: HistoryTabProps) {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (bayiId) {
      fetchHistory();
    }
  }, [bayiId]);

  const fetchHistory = async () => {
    try {
      const response = await fetch(`/api/bayi/${bayiId}/kontrol`);
      const result = await response.json();
      
      if (result.success) {
        setHistory(result.data);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8 text-gray-500">Memuat riwayat...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Add New Control Button */}
      <div className="flex justify-end mb-4">
        <Button onClick={onAddControl} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Tambah Kontrol Baru
        </Button>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Belum ada riwayat pemeriksaan
        </div>
      ) : (
        history.map((record) => {
          const riskLevel = record.statusStunting || 'MEDIUM';
          return (
            <div
              key={record.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      riskLevel === 'HIGH'
                        ? 'bg-red-100'
                        : riskLevel === 'MEDIUM'
                        ? 'bg-yellow-100'
                        : 'bg-green-100'
                    }`}
                  >
                    <CheckCircle
                      className={`w-5 h-5 ${
                        riskLevel === 'HIGH'
                          ? 'text-red-600'
                          : riskLevel === 'MEDIUM'
                          ? 'text-yellow-600'
                          : 'text-green-600'
                      }`}
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      Pemeriksaan Rutin - Bulan ke-{record.umurBulan}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Berat: {record.beratBadan} kg • Tinggi: {record.tinggiBadan} cm •
                      Status:{' '}
                      <span
                        className={
                          riskLevel === 'HIGH'
                            ? 'text-red-600 font-semibold'
                            : riskLevel === 'MEDIUM'
                            ? 'text-yellow-600 font-semibold'
                            : 'text-green-600 font-semibold'
                        }
                      >
                        Risiko{' '}
                        {riskLevel === 'HIGH'
                          ? 'Tinggi'
                          : riskLevel === 'MEDIUM'
                          ? 'Sedang'
                          : 'Rendah'}
                      </span>
                    </p>
                    {record.catatanTambahan && (
                      <p className="text-xs text-gray-500 mt-2">
                        Catatan: {record.catatanTambahan}
                      </p>
                    )}
                  </div>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(record.tanggalKontrol).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
