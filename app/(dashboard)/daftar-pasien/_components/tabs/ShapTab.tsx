import { Lightbulb } from 'lucide-react';
import type { Patient } from '@/types';

interface ShapTabProps {
  patient: Patient;
}

export function ShapTab({ patient }: ShapTabProps) {
  return (
    <div className="space-y-6">
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
          <p className="text-sm text-gray-700 leading-relaxed">
            Model AI mendeteksi{' '}
            <strong>
              risiko{' '}
              {patient.riskLevel === 'HIGH'
                ? 'tinggi'
                : patient.riskLevel === 'MEDIUM'
                ? 'sedang'
                : 'rendah'}{' '}
              ({patient.riskPercentage}%)
            </strong>{' '}
            berdasarkan kombinasi faktor. Analisis SHAP akan menunjukkan kontributor
            utama risiko stunting untuk pasien ini.
          </p>
        </div>
      </div>

      {/* SHAP Values Visualization */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h5 className="font-semibold text-gray-900 mb-4">
          Kontribusi Faktor terhadap Prediksi
        </h5>
        <div className="space-y-4">
          {/* Positive factors (increasing risk) */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-red-600 mb-2">
              Faktor yang meningkatkan risiko:
            </p>
            <div className="flex items-center">
              <span className="w-40 text-sm text-gray-600">Sanitasi</span>
              <div className="flex-1 flex items-center">
                <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full"
                    style={{ width: '70%' }}
                  />
                </div>
                <span className="ml-3 text-sm font-semibold text-red-600">
                  +0.35
                </span>
              </div>
            </div>
            <div className="flex items-center">
              <span className="w-40 text-sm text-gray-600">
                Tinggi Badan Ibu
              </span>
              <div className="flex-1 flex items-center">
                <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full"
                    style={{ width: '56%' }}
                  />
                </div>
                <span className="ml-3 text-sm font-semibold text-red-600">
                  +0.28
                </span>
              </div>
            </div>
            <div className="flex items-center">
              <span className="w-40 text-sm text-gray-600">Pendidikan Ibu</span>
              <div className="flex-1 flex items-center">
                <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 rounded-full"
                    style={{ width: '30%' }}
                  />
                </div>
                <span className="ml-3 text-sm font-semibold text-orange-600">
                  +0.15
                </span>
              </div>
            </div>
          </div>

          {/* Negative factors (decreasing risk) */}
          <div className="space-y-3 mt-6">
            <p className="text-sm font-medium text-green-600 mb-2">
              Faktor yang menurunkan risiko:
            </p>
            <div className="flex items-center">
              <span className="w-40 text-sm text-gray-600">
                Berat Badan Lahir
              </span>
              <div className="flex-1 flex items-center">
                <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: '20%' }}
                  />
                </div>
                <span className="ml-3 text-sm font-semibold text-green-600">
                  -0.10
                </span>
              </div>
            </div>
            <div className="flex items-center">
              <span className="w-40 text-sm text-gray-600">ASI Eksklusif</span>
              <div className="flex-1 flex items-center">
                <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: '16%' }}
                  />
                </div>
                <span className="ml-3 text-sm font-semibold text-green-600">
                  -0.08
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Model Information */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h5 className="font-semibold text-gray-900 mb-2">Informasi Model</h5>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Nama Model:</span>
            <span className="ml-2 font-medium">XGBoost Stunting Predictor</span>
          </div>
          <div>
            <span className="text-gray-500">Versi:</span>
            <span className="ml-2 font-medium">v2.1.0</span>
          </div>
          <div>
            <span className="text-gray-500">Akurasi:</span>
            <span className="ml-2 font-medium">94.2%</span>
          </div>
          <div>
            <span className="text-gray-500">Terakhir Dilatih:</span>
            <span className="ml-2 font-medium">15 Jan 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
}
