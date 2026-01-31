'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Plus, Calendar, Clock, AlertCircle, CheckCheck } from 'lucide-react';
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

interface JadwalPemeriksaan {
  id: string;
  bayiId: string;
  targetUmurBulan: number;
  rentangAwal: string;
  rentangAkhir: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'MISSED';
  createdAt: string;
  updatedAt: string;
}

interface HistoryTabProps {
  patientId: string;
  bayiId?: string;
  onAddControl?: () => void;
}

export function HistoryTab({ patientId, bayiId, onAddControl }: HistoryTabProps) {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [incomingSchedules, setIncomingSchedules] = useState<JadwalPemeriksaan[]>([]);
  const [missedSchedules, setMissedSchedules] = useState<JadwalPemeriksaan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState<'upcoming' | 'history' | 'all'>('all');

  useEffect(() => {
    if (bayiId) {
      fetchData();
    }
  }, [bayiId]);

  const fetchData = async () => {
    try {
      // Fetch history
      const historyResponse = await fetch(`/api/bayi/${bayiId}/kontrol`);
      const historyResult = await historyResponse.json();
      
      if (historyResult.success) {
        setHistory(historyResult.data);
      }

      // Fetch schedules
      const scheduleResponse = await fetch(`/api/jadwal-pemeriksaan?bayiId=${bayiId}`);
      const scheduleResult = await scheduleResponse.json();
      
      if (scheduleResult.success) {
        const today = new Date();
        const upcoming = scheduleResult.data.filter(
          (s: JadwalPemeriksaan) => s.status === 'SCHEDULED' && new Date(s.rentangAwal) >= today
        );
        const missed = scheduleResult.data.filter(
          (s: JadwalPemeriksaan) => s.status === 'MISSED'
        );
        
        setIncomingSchedules(upcoming.slice(0, 5)); // Show next 5 schedules
        setMissedSchedules(missed);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
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

  if (isLoading) {
    return <div className="text-center py-8 text-gray-500">Memuat data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <div className="inline-flex rounded-lg border border-gray-200 p-1">
          <button
            onClick={() => setActiveView('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              activeView === 'all'
                ? 'bg-teal-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setActiveView('upcoming')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              activeView === 'upcoming'
                ? 'bg-teal-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Jadwal Mendatang ({incomingSchedules.length})
          </button>
          <button
            onClick={() => setActiveView('history')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              activeView === 'history'
                ? 'bg-teal-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Riwayat ({history.length})
          </button>
        </div>
        <Button onClick={onAddControl} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Tambah Kontrol
        </Button>
      </div>

      {/* Upcoming Schedules Section */}
      {(activeView === 'all' || activeView === 'upcoming') && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-teal-600" />
            <h3 className="text-lg font-semibold text-gray-900">Jadwal Pemeriksaan Mendatang</h3>
          </div>

          {incomingSchedules.length === 0 ? (
            <div className="text-center py-8 text-gray-500 border border-dashed border-gray-300 rounded-lg">
              Tidak ada jadwal mendatang
            </div>
          ) : (
            <div className="space-y-3">
              {incomingSchedules.map((schedule) => {
                const daysUntil = getDaysUntil(schedule.rentangAwal);
                const isUrgent = daysUntil <= 3 && daysUntil >= 0;
                const isToday = daysUntil === 0;

                return (
                  <div
                    key={schedule.id}
                    className={`border rounded-lg p-4 transition ${
                      isUrgent
                        ? 'border-orange-300 bg-orange-50'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                            isUrgent ? 'bg-orange-100' : 'bg-teal-100'
                          }`}
                        >
                          <Calendar
                            className={`w-5 h-5 ${
                              isUrgent ? 'text-orange-600' : 'text-teal-600'
                            }`}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900">
                              Pemeriksaan Bulan ke-{schedule.targetUmurBulan}
                            </p>
                            {isToday && (
                              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                                HARI INI
                              </span>
                            )}
                            {isUrgent && !isToday && (
                              <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
                                SEGERA
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            Rentang waktu: {formatDateRange(schedule.rentangAwal, schedule.rentangAkhir)}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {daysUntil > 0 ? `${daysUntil} hari lagi` : daysUntil === 0 ? 'Hari ini' : 'Terlambat'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={onAddControl}
                        className="shrink-0"
                      >
                        Lakukan Pemeriksaan
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Missed Schedules Alert */}
      {missedSchedules.length > 0 && (activeView === 'all' || activeView === 'upcoming') && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">
                {missedSchedules.length} Jadwal Terlewat
              </p>
              <p className="text-sm text-red-700 mt-1">
                Terdapat jadwal pemeriksaan yang terlewat. Segera lakukan pemeriksaan.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* History Section */}
      {(activeView === 'all' || activeView === 'history') && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CheckCheck className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Riwayat Pemeriksaan</h3>
          </div>

          {history.length === 0 ? (
            <div className="text-center py-8 text-gray-500 border border-dashed border-gray-300 rounded-lg">
              Belum ada riwayat pemeriksaan
            </div>
          ) : (
            <>
              {/* Growth Chart */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="text-md font-semibold text-gray-900 mb-4">Grafik Pertumbuhan</h4>
                
                {/* Weight Chart */}
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-700 mb-3">Berat Badan (kg)</p>
                  <div className="relative h-48 border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <svg width="100%" height="100%" viewBox="0 0 400 150" preserveAspectRatio="xMidYMid meet">
                      {/* Grid lines */}
                      {[0, 37.5, 75, 112.5, 150].map((y, idx) => (
                        <line
                          key={idx}
                          x1="0"
                          y1={y}
                          x2="400"
                          y2={y}
                          stroke="#e5e7eb"
                          strokeWidth="1"
                        />
                      ))}
                      
                      {/* Weight line */}
                      {history.length > 1 && (
                        <polyline
                          fill="none"
                          stroke="#14b8a6"
                          strokeWidth="3"
                          points={history
                            .slice()
                            .reverse()
                            .map((record, idx) => {
                              const x = (idx / (history.length - 1)) * 400;
                              const maxWeight = Math.max(...history.map(h => h.beratBadan)) * 1.2;
                              const y = 150 - (record.beratBadan / maxWeight) * 150;
                              return `${x},${y}`;
                            })
                            .join(' ')}
                        />
                      )}
                      
                      {/* Data points */}
                      {history
                        .slice()
                        .reverse()
                        .map((record, idx) => {
                          const x = (idx / (history.length - 1 || 1)) * 400;
                          const maxWeight = Math.max(...history.map(h => h.beratBadan)) * 1.2;
                          const y = 150 - (record.beratBadan / maxWeight) * 150;
                          return (
                            <g key={idx}>
                              <circle
                                cx={x}
                                cy={y}
                                r="6"
                                fill="#14b8a6"
                                stroke="white"
                                strokeWidth="2"
                              />
                              <text
                                x={x}
                                y={y - 10}
                                textAnchor="middle"
                                className="text-xs fill-gray-700 font-semibold"
                                style={{ fontSize: '12px' }}
                              >
                                {record.beratBadan}
                              </text>
                            </g>
                          );
                        })}
                    </svg>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    {history.slice().reverse().map((record, idx) => (
                      <span key={idx}>{record.umurBulan}m</span>
                    ))}
                  </div>
                </div>

                {/* Height Chart */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">Tinggi Badan (cm)</p>
                  <div className="relative h-48 border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <svg width="100%" height="100%" viewBox="0 0 400 150" preserveAspectRatio="xMidYMid meet">
                      {/* Grid lines */}
                      {[0, 37.5, 75, 112.5, 150].map((y, idx) => (
                        <line
                          key={idx}
                          x1="0"
                          y1={y}
                          x2="400"
                          y2={y}
                          stroke="#e5e7eb"
                          strokeWidth="1"
                        />
                      ))}
                      
                      {/* Height line */}
                      {history.length > 1 && (
                        <polyline
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="3"
                          points={history
                            .slice()
                            .reverse()
                            .map((record, idx) => {
                              const x = (idx / (history.length - 1)) * 400;
                              const maxHeight = Math.max(...history.map(h => h.tinggiBadan)) * 1.1;
                              const minHeight = Math.min(...history.map(h => h.tinggiBadan)) * 0.9;
                              const y = 150 - ((record.tinggiBadan - minHeight) / (maxHeight - minHeight)) * 150;
                              return `${x},${y}`;
                            })
                            .join(' ')}
                        />
                      )}
                      
                      {/* Data points */}
                      {history
                        .slice()
                        .reverse()
                        .map((record, idx) => {
                          const x = (idx / (history.length - 1 || 1)) * 400;
                          const maxHeight = Math.max(...history.map(h => h.tinggiBadan)) * 1.1;
                          const minHeight = Math.min(...history.map(h => h.tinggiBadan)) * 0.9;
                          const y = 150 - ((record.tinggiBadan - minHeight) / (maxHeight - minHeight)) * 150;
                          return (
                            <g key={idx}>
                              <circle
                                cx={x}
                                cy={y}
                                r="6"
                                fill="#3b82f6"
                                stroke="white"
                                strokeWidth="2"
                              />
                              <text
                                x={x}
                                y={y - 10}
                                textAnchor="middle"
                                className="text-xs fill-gray-700 font-semibold"
                                style={{ fontSize: '12px' }}
                              >
                                {record.tinggiBadan}
                              </text>
                            </g>
                          );
                        })}
                    </svg>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    {history.slice().reverse().map((record, idx) => (
                      <span key={idx}>{record.umurBulan}m</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* History List */}
              <div className="space-y-3">{history.map((record) => {
                return (
                  <div
                    key={record.id}
                    className="border border-gray-200 rounded-lg p-4 bg-white hover:bg-gray-50 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-teal-100">
                          <CheckCircle className="w-5 h-5 text-teal-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            Pemeriksaan Rutin - Bulan ke-{record.umurBulan}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            Berat: {record.beratBadan} kg • Tinggi: {record.tinggiBadan} cm
                          </p>
                          {record.catatanTambahan && (
                            <p className="text-xs text-gray-500 mt-2">
                              Catatan: {record.catatanTambahan}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="text-sm text-gray-500 shrink-0">
                        {new Date(record.tanggalKontrol).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
