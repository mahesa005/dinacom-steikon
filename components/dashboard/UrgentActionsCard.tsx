'use client';

import { AlertTriangle, Phone, Calendar, Eye, CheckCircle, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { Patient } from '@/types';

interface UrgentPatientCardProps {
  patient: Patient;
  onContact?: () => void;
  onSchedule?: () => void;
  onViewDetail?: () => void;
  onMarkPresent?: () => void;
  isToday?: boolean;
}

function UrgentPatientCard({
  patient,
  onContact,
  onSchedule,
  onViewDetail,
  onMarkPresent,
  isToday = false,
}: UrgentPatientCardProps) {
  return (
    <div className="bg-white rounded-lg p-4 card-shadow hover-lift cursor-pointer">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {patient.id}
            </span>
            <h4 className="font-bold text-gray-900">{patient.name}</h4>
            <span className="text-sm text-gray-500">
              {patient.ageMonths} bulan
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                patient.riskLevel === 'HIGH'
                  ? 'bg-red-100 text-red-700'
                  : patient.riskLevel === 'MEDIUM'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-green-100 text-green-700'
              }`}
            >
              {patient.riskLevel === 'HIGH'
                ? 'Tinggi'
                : patient.riskLevel === 'MEDIUM'
                ? 'Sedang'
                : 'Rendah'}{' '}
              {patient.riskPercentage}%
            </span>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>
                {isToday ? (
                  <>
                    Kontrol berikutnya: <strong>Hari ini, 14:00</strong>
                  </>
                ) : (
                  <>
                    Terakhir kontrol: <strong>{patient.lastCheckup}</strong>
                  </>
                )}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              {patient.mainFactorIcon && (
                <span className="text-lg">{patient.mainFactorIcon}</span>
              )}
              <span>
                Faktor utama: <strong>{patient.mainFactor}</strong>
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Ibu: {patient.parentName} - HP: {patient.parentPhone}
          </p>
        </div>
      </div>
    </div>
  );
}

interface UrgentActionsCardProps {
  patients: Patient[];
  totalCount: number;
  onViewAll?: () => void;
}

export function UrgentActionsCard({
  patients,
  totalCount,
  onViewAll,
}: UrgentActionsCardProps) {
  const displayedPatients = patients.slice(0, 2);
  const remainingCount = totalCount - displayedPatients.length;

  return (
    <section>
      <div className="bg-linear-to-r from-red-50 to-orange-50 border-l-4 border-red-500 rounded-lg p-6 card-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                Perlu Tindakan Segera
              </h3>
              <p className="text-lg text-gray-600">
                {totalCount} pasien membutuhkan perhatian Anda hari ini
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {displayedPatients.map((patient, index) => (
            <UrgentPatientCard
              key={patient.id}
              patient={patient}
              isToday={index === 1}
            />
          ))}

          {remainingCount > 0 && (
            <button 
              onClick={onViewAll}
              className="w-full py-2 text-base text-gray-900 hover:text-red-600 font-bold flex items-center justify-center space-x-2 bg-red-50 rounded-lg hover:bg-red-100 transition"
            >
              <span>+ {remainingCount} pasien lainnya</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
