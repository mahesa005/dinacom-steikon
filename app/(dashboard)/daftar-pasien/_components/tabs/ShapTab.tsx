'use client';

import { useState, useEffect } from 'react';
import { Lightbulb, Loader2, RefreshCw } from 'lucide-react';
import type { Patient } from '@/types';

interface ShapTabProps {
  patient: Patient;
}

interface SHAPAnalysis {
  statusRisiko: {
    skorRisiko: number;
    levelRisiko: 'Risiko Rendah' | 'Risiko Sedang' | 'Risiko Tinggi';
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
    prioritas: 'Prioritas Tinggi' | 'Prioritas Sedang' | 'Prioritas Rendah';
    icon: string;
    dayLabel?: string;
  }>;
}

export function ShapTab({ patient }: ShapTabProps) {
  const [analysis, setAnalysis] = useState<SHAPAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSHAPAnalysis();
  }, [patient.id]);

  const fetchSHAPAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/bayi/${patient.id}/shap-analysis`);
      const result = await response.json();

      if (result.success && result.hasAnalysis) {
        setAnalysis(result.data.insights);
      } else {
        // Jika tidak ada analisis, tampilkan pesan bahwa belum ada data
        setError('Analisis SHAP belum tersedia. Data akan di-generate otomatis saat input bayi.');
      }
    } catch (err) {
      console.error('Error fetching SHAP analysis:', err);
      setError('Gagal memuat analisis SHAP');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Memuat analisis SHAP...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <p className="text-yellow-700">{error}</p>
        <button
          onClick={() => fetchSHAPAnalysis()}
          className="mt-3 text-sm text-yellow-600 hover:text-yellow-700 font-medium flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Coba Lagi</span>
        </button>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Sedang generate analisis SHAP...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Risiko */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-linear-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
            <Lightbulb className="w-7 h-7 text-white" />
          </div>
          <div>
            <h5 className="font-bold text-gray-900">
              Explainable AI Analysis (SHAP)
            </h5>
            <p className="text-sm text-gray-600">
              Penjelasan transparan dari prediksi AI
            </p>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              {analysis.statusRisiko.levelRisiko}
            </span>
            <span className="text-2xl font-bold text-purple-600">
              {analysis.statusRisiko.skorRisiko}%
            </span>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">
            {analysis.statusRisiko.penjelasan}
          </p>
        </div>
      </div>

      {/* Faktor Penyebab */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h5 className="font-semibold text-gray-900 mb-4">
          Kontribusi Faktor terhadap Prediksi
        </h5>
        
        {/* Faktor yang meningkatkan risiko */}
        <div className="mb-6">
          <h6 className="text-sm font-semibold text-red-600 mb-3">
            Faktor yang meningkatkan risiko:
          </h6>
          <div className="space-y-4">
            {analysis.faktorPenyebab
              .filter(faktor => faktor.persentasePengaruh > 0)
              .map((faktor, index) => {
                // Tentukan warna berdasarkan tingkat pengaruh
                let bgColor = '';
                let textColor = '';
                
                const absValue = Math.abs(faktor.persentasePengaruh);
                if (absValue >= 25) {
                  bgColor = 'bg-red-500'; // Merah tua untuk pengaruh tinggi
                  textColor = 'text-red-600';
                } else if (absValue >= 15) {
                  bgColor = 'bg-red-500'; // Merah untuk pengaruh sedang
                  textColor = 'text-red-600';
                } else {
                  bgColor = 'bg-orange-500'; // Oranye untuk pengaruh rendah
                  textColor = 'text-orange-600';
                }

                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center">
                      <span className="w-40 text-sm text-gray-700 font-medium">
                        {faktor.nama}
                      </span>
                      <div className="flex-1 flex items-center">
                        <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${bgColor} rounded-full`}
                            style={{
                              width: `${Math.abs(faktor.persentasePengaruh)}%`,
                            }}
                          />
                        </div>
                        <span className={`ml-3 text-sm font-semibold ${textColor} w-16 text-right`}>
                          +{faktor.persentasePengaruh}%
                        </span>
                      </div>
                    </div>
                    <div className="ml-40 text-xs text-gray-600">
                      <p className="mb-1"><strong>Nilai:</strong> {faktor.nilai}</p>
                      <p><strong>Pengaruh:</strong> {faktor.mengapaIniPenting}</p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Faktor yang menurunkan risiko */}
        <div>
          <h6 className="text-sm font-semibold text-green-600 mb-3">
            Faktor yang menurunkan risiko:
          </h6>
          <div className="space-y-4">
            {analysis.faktorPenyebab
              .filter(faktor => faktor.persentasePengaruh < 0)
              .map((faktor, index) => {
                const bgColor = 'bg-green-500';
                const textColor = 'text-green-600';

                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center">
                      <span className="w-40 text-sm text-gray-700 font-medium">
                        {faktor.nama}
                      </span>
                      <div className="flex-1 flex items-center">
                        <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${bgColor} rounded-full`}
                            style={{
                              width: `${Math.abs(faktor.persentasePengaruh)}%`,
                            }}
                          />
                        </div>
                        <span className={`ml-3 text-sm font-semibold ${textColor} w-16 text-right`}>
                          {faktor.persentasePengaruh}%
                        </span>
                      </div>
                    </div>
                    <div className="ml-40 text-xs text-gray-600">
                      <p className="mb-1"><strong>Nilai:</strong> {faktor.nilai}</p>
                      <p><strong>Pengaruh:</strong> {faktor.mengapaIniPenting}</p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-end">
        <button
          onClick={fetchSHAPAnalysis}
          className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Analisis</span>
        </button>
      </div>
    </div>
  );
}
