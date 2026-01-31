'use client';

import { useState, useEffect } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';

interface InterventionTabProps {
  patientId: string;
}

interface Intervention {
  judul: string;
  deskripsi: string;
  prioritas: 'Prioritas Tinggi' | 'Prioritas Sedang' | 'Prioritas Rendah';
  icon: string;
  dayLabel?: string;
}

export function InterventionTab({ patientId }: InterventionTabProps) {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInterventions();
  }, [patientId]);

  const fetchInterventions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/bayi/${patientId}/shap-analysis`);
      const result = await response.json();

      if (result.success && result.hasAnalysis) {
        setInterventions(result.data.insights.rekomendasiTindakan || []);
      } else {
        setInterventions([]);
      }
    } catch (err) {
      console.error('Error fetching interventions:', err);
      setError('Gagal memuat rekomendasi intervensi');
    } finally {
      setIsLoading(false);
    }
  };

  const getColorClasses = (prioritas: string) => {
    switch (prioritas) {
      case 'Prioritas Tinggi':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          badge: 'bg-red-500',
          text: 'text-red-700',
        };
      case 'Prioritas Sedang':
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          badge: 'bg-orange-500',
          text: 'text-orange-700',
        };
      case 'Prioritas Rendah':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          badge: 'bg-green-500',
          text: 'text-green-700',
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          badge: 'bg-gray-500',
          text: 'text-gray-700',
        };
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Memuat rekomendasi intervensi...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <AlertCircle className="w-6 h-6 text-red-600" />
          <p className="text-red-700">{error}</p>
        </div>
        <button
          onClick={fetchInterventions}
          className="mt-3 text-sm text-red-600 hover:text-red-700 font-medium"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  if (interventions.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-3">
          <AlertCircle className="w-6 h-6 text-yellow-600" />
          <h5 className="font-semibold text-gray-900">
            Belum Ada Rekomendasi Intervensi
          </h5>
        </div>
        <p className="text-sm text-gray-700 mb-4">
          Rekomendasi intervensi akan muncul setelah analisis SHAP dilakukan. 
          Silakan generate analisis SHAP terlebih dahulu di tab "Analisis AI (SHAP)".
        </p>
      </div>
    );
  }

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

      {interventions.map((intervention, index) => {
        const colors = getColorClasses(intervention.prioritas);
        return (
          <div
            key={index}
            className={`${colors.bg} border ${colors.border} rounded-lg p-4`}
          >
            <div className="flex items-start space-x-3">
              <div
                className={`w-10 h-10 ${colors.badge} rounded-full flex items-center justify-center flex-shrink-0`}
              >
                <span className="text-2xl">{intervention.icon}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <p className="font-semibold text-gray-900">
                    {intervention.judul}
                  </p>
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${colors.badge} text-white ml-2`}>
                    {intervention.prioritas}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-2">
                  {intervention.deskripsi}
                </p>
                {intervention.dayLabel && (
                  <span className="inline-block text-xs font-medium bg-white px-2 py-1 rounded border border-gray-200">
                    Timeline: {intervention.dayLabel}
                  </span>
                )}
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
