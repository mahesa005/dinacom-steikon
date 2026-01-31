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
  const [isGenerating, setIsGenerating] = useState(false);
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
        // Auto-generate if no analysis exists
        await autoGenerateSHAP();
      }
    } catch (err) {
      console.error('Error fetching SHAP analysis:', err);
      setError('Gagal memuat analisis SHAP');
    } finally {
      setIsLoading(false);
    }
  };

  const autoGenerateSHAP = async () => {
    setIsGenerating(true);
    
    try {
      // TODO: Replace with actual SHAP data from Python ML model
      // For now, create mock SHAP data based on patient info
      const mockShapResult = {
        is_stunting: patient.riskLevel === 'HIGH' ? 1 : 0,
        stunting_risk: patient.riskLevel,
        confidence: patient.riskPercentage / 100,
        shap_values: {
          // Tinggi Ibu - jika < 150cm meningkatkan risiko
          mother_height_cm: patient.parentHeight 
            ? (patient.parentHeight < 150 ? 0.25 : (patient.parentHeight < 155 ? 0.15 : -0.10))
            : 0.15,
          // Tinggi Ayah - jika < 165cm meningkatkan risiko
          father_height_cm: patient.fatherHeight 
            ? (patient.fatherHeight < 165 ? 0.20 : (patient.fatherHeight < 170 ? 0.10 : -0.08))
            : 0.10,
          // Pendidikan Ibu - pendidikan rendah meningkatkan risiko
          mother_edu_level: patient.parentEducation === 'SD' ? 0.22 
            : patient.parentEducation === 'SMP' ? 0.12 
            : patient.parentEducation === 'SMA' ? 0.05 
            : -0.05,
          // Pendidikan Ayah - pendidikan rendah meningkatkan risiko
          father_edu_level: patient.fatherEducation === 'SD' ? 0.18 
            : patient.fatherEducation === 'SMP' ? 0.10 
            : patient.fatherEducation === 'SMA' ? 0.03 
            : -0.05,
          // Fasilitas Toilet - tidak memenuhi standar meningkatkan risiko
          toilet_standard: patient.toiletFacility === 'poor' ? 0.30 
            : patient.toiletFacility === 'adequate' ? 0.10 
            : -0.08,
          // Pengelolaan Sampah - tidak memenuhi standar meningkatkan risiko
          waste_mgmt_std: patient.wasteManagement === 'poor' ? 0.28 
            : patient.wasteManagement === 'adequate' ? 0.08 
            : -0.06,
        },
        input_features: {
          mother_height_cm: patient.parentHeight || 155,
          father_height_cm: patient.fatherHeight || 170,
          mother_edu_level: patient.parentEducation === 'SD' ? 1 
            : patient.parentEducation === 'SMP' ? 2 
            : patient.parentEducation === 'SMA' ? 3 
            : 4,
          father_edu_level: patient.fatherEducation === 'SD' ? 1 
            : patient.fatherEducation === 'SMP' ? 2 
            : patient.fatherEducation === 'SMA' ? 3 
            : 4,
          toilet_standard: patient.toiletFacility === 'good' ? 1 : 0,
          waste_mgmt_std: patient.wasteManagement === 'good' ? 1 : 0,
        },
      };

      const generateResponse = await fetch(`/api/bayi/${patient.id}/shap-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shapResult: mockShapResult,
        }),
      });

      const generateResult = await generateResponse.json();

      if (generateResult.success) {
        setAnalysis(generateResult.data.insights);
      } else {
        setError('Gagal generate analisis SHAP: ' + generateResult.message);
      }
    } catch (err) {
      console.error('Error generating SHAP:', err);
      setError('Gagal generate analisis SHAP');
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">
          {isGenerating ? 'Generating analisis SHAP...' : 'Memuat analisis SHAP...'}
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-700">{error}</p>
        <button
          onClick={() => autoGenerateSHAP()}
          className="mt-3 text-sm text-red-600 hover:text-red-700 font-medium flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Generate Ulang</span>
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
        <div className="space-y-4">
          {analysis.faktorPenyebab.map((faktor, index) => {
            const isPositive = faktor.persentasePengaruh > 0;
            const color = isPositive ? 'red' : 'green';
            const bgColor = isPositive ? 'bg-red-500' : 'bg-green-500';
            const textColor = isPositive ? 'text-red-600' : 'text-green-600';

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
                      {isPositive ? '+' : ''}{faktor.persentasePengaruh}%
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
