'use client';

import { useState, useEffect } from 'react';
import { Calendar, Phone, MessageCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { Patient } from '@/types';

interface JadwalPemeriksaan {
  id: string;
  bayiId: string;
  targetUmurBulan: number;
  rentangAwal: string;
  rentangAkhir: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'MISSED';
}

interface OverviewTabProps {
  patient: Patient;
  bayiId?: string;
}

export function OverviewTab({ patient, bayiId }: OverviewTabProps) {
  const [nextSchedule, setNextSchedule] = useState<JadwalPemeriksaan | null>(null);
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(true);

  useEffect(() => {
    if (bayiId) {
      fetchNextSchedule();
    }
  }, [bayiId]);

  const fetchNextSchedule = async () => {
    try {
      const response = await fetch(`/api/jadwal-pemeriksaan?bayiId=${bayiId}`);
      const result = await response.json();
      
      if (result.success && result.data.length > 0) {
        // Find next upcoming schedule
        const today = new Date();
        const upcoming = result.data.find(
          (s: JadwalPemeriksaan) => s.status === 'SCHEDULED' && new Date(s.rentangAwal) >= today
        );
        setNextSchedule(upcoming || null);
      }
    } catch (error) {
      console.error('Error fetching schedule:', error);
    } finally {
      setIsLoadingSchedule(false);
    }
  };

  const getDaysUntil = (dateStr: string) => {
    const targetDate = new Date(dateStr);
    const today = new Date();
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDateRange = (startStr: string, endStr: string) => {
    const start = new Date(startStr);
    const end = new Date(endStr);
    
    return `${start.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  };

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
        <div className={`border rounded-lg p-6 ${
          nextSchedule && getDaysUntil(nextSchedule.rentangAwal) <= 3
            ? 'bg-orange-50 border-orange-200'
            : 'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-center space-x-3 mb-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              nextSchedule && getDaysUntil(nextSchedule.rentangAwal) <= 3
                ? 'bg-orange-500'
                : 'bg-blue-500'
            }`}>
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h5 className="font-semibold text-gray-900">Jadwal Pemeriksaan Berikutnya</h5>
              <p className="text-sm text-gray-600">Pemeriksaan rutin terjadwal</p>
            </div>
          </div>
          
          {isLoadingSchedule ? (
            <div className="bg-white rounded-lg p-4 text-center">
              <p className="text-sm text-gray-500">Memuat jadwal...</p>
            </div>
          ) : nextSchedule ? (
            <>
              <div className="bg-white rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatDateRange(nextSchedule.rentangAwal, nextSchedule.rentangAkhir)}
                    </p>
                    <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {(() => {
                        const days = getDaysUntil(nextSchedule.rentangAwal);
                        if (days === 0) return 'Hari ini';
                        if (days === 1) return 'Besok';
                        if (days < 0) return `Terlambat ${Math.abs(days)} hari`;
                        return `${days} hari lagi`;
                      })()}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Pemeriksaan untuk umur {nextSchedule.targetUmurBulan} bulan
                    </p>
                  </div>
                  {getDaysUntil(nextSchedule.rentangAwal) <= 3 && getDaysUntil(nextSchedule.rentangAwal) >= 0 && (
                    <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
                      SEGERA
                    </span>
                  )}
                </div>
              </div>
              {getDaysUntil(nextSchedule.rentangAwal) <= 7 && getDaysUntil(nextSchedule.rentangAwal) >= 0 && (
                <div className="mt-3 bg-white/80 rounded-lg p-3 text-xs text-gray-600">
                  💡 <strong>Tips:</strong> Pastikan bayi dalam kondisi sehat saat pemeriksaan untuk hasil yang akurat
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-lg p-4 text-center">
              <p className="text-sm text-gray-500">Tidak ada jadwal mendatang</p>
              <p className="text-xs text-gray-400 mt-1">
                Jadwal akan otomatis dibuat setelah pemeriksaan
              </p>
            </div>
          )}
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
