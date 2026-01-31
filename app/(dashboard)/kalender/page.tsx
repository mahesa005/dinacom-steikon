'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { CalendarStats } from './_components/CalendarStats';
import { CalendarGrid } from './_components/CalendarGrid';
import { AppointmentList } from './_components/AppointmentList';
import { AppointmentDetailModal } from './_components/AppointmentDetailModal';
import { AddAppointmentModal } from './_components/AddAppointmentModal';

interface JadwalPemeriksaan {
  id: string;
  bayiId: string;
  targetUmurBulan: number;
  rentangAwal: string;
  rentangAkhir: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'MISSED';
  bayi?: {
    nama: string;
    namaIbu: string;
    nomorHpOrangTua: string;
    nomorPasien: string;
  };
}

interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  type: 'kontrol-rutin' | 'vaksinasi' | 'konsultasi' | 'tindakan';
  status: 'dijadwalkan' | 'selesai' | 'dibatalkan' | 'tidak-hadir';
  riskLevel: 'rendah' | 'sedang' | 'tinggi';
  notes?: string;
  bayiId?: string;
  targetUmurBulan?: number;
  rentangAkhir?: string;
}

export default function KalenderPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]); // Untuk kalender (per bulan)
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]); // Untuk stats (semua data)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all appointments untuk stats (hanya sekali)
  useEffect(() => {
    fetchAllAppointments();
  }, []);

  // Fetch jadwal pemeriksaan untuk bulan tertentu
  useEffect(() => {
    fetchSchedules();
  }, [currentDate]);

  const fetchAllAppointments = async () => {
    try {
      const bayiResponse = await fetch('/api/bayi');
      const bayiResult = await bayiResponse.json();
      
      if (!bayiResult.success) return;

      const allAppts: Appointment[] = [];

      for (const bayi of bayiResult.data) {
        const scheduleResponse = await fetch(`/api/jadwal-pemeriksaan?bayiId=${bayi.id}`);
        const scheduleResult = await scheduleResponse.json();
        
        if (scheduleResult.success) {
          const appointments = scheduleResult.data.map((s: JadwalPemeriksaan) => ({
            id: s.id,
            patientId: bayi.nomorPasien,
            patientName: bayi.nama,
            date: new Date(s.rentangAwal).toISOString().split('T')[0],
            time: 'Fleksibel',
            type: 'kontrol-rutin' as const,
            status: s.status === 'COMPLETED' ? 'selesai' : 
                    s.status === 'MISSED' ? 'tidak-hadir' : 'dijadwalkan' as const,
            riskLevel: 'sedang' as const,
            notes: `Pemeriksaan rutin bulan ke-${s.targetUmurBulan}. Rentang waktu: ${new Date(s.rentangAwal).toLocaleDateString('id-ID')} - ${new Date(s.rentangAkhir).toLocaleDateString('id-ID')}`,
            bayiId: bayi.id,
            targetUmurBulan: s.targetUmurBulan,
            rentangAkhir: s.rentangAkhir,
          }));
          
          allAppts.push(...appointments);
        }
      }

      setAllAppointments(allAppts);
    } catch (error) {
      console.error('Error fetching all appointments:', error);
    }
  };

  const fetchSchedules = async () => {
    try {
      setIsLoading(true);
      
      // Get all bayi first
      const bayiResponse = await fetch('/api/bayi');
      const bayiResult = await bayiResponse.json();
      
      if (!bayiResult.success) {
        console.error('Failed to fetch bayi');
        return;
      }

      // Fetch schedules for all bayi in the current month
      const allAppointments: Appointment[] = [];
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      for (const bayi of bayiResult.data) {
        const scheduleResponse = await fetch(`/api/jadwal-pemeriksaan?bayiId=${bayi.id}`);
        const scheduleResult = await scheduleResponse.json();
        
        if (scheduleResult.success) {
          const monthSchedules = scheduleResult.data
            .filter((s: JadwalPemeriksaan) => {
              const scheduleDate = new Date(s.rentangAwal);
              return scheduleDate >= startOfMonth && scheduleDate <= endOfMonth;
            })
            .map((s: JadwalPemeriksaan) => ({
              id: s.id,
              patientId: bayi.nomorPasien,
              patientName: bayi.nama,
              date: new Date(s.rentangAwal).toISOString().split('T')[0],
              time: 'Fleksibel', // Waktu pemeriksaan bisa disesuaikan dengan jadwal posyandu
              type: 'kontrol-rutin' as const,
              status: s.status === 'COMPLETED' ? 'selesai' : 
                      s.status === 'MISSED' ? 'tidak-hadir' : 'dijadwalkan' as const,
              riskLevel: 'sedang' as const, // Default, bisa diambil dari history terakhir
              notes: `Pemeriksaan rutin bulan ke-${s.targetUmurBulan}. Rentang waktu: ${new Date(s.rentangAwal).toLocaleDateString('id-ID')} - ${new Date(s.rentangAkhir).toLocaleDateString('id-ID')}`,
              bayiId: bayi.id,
              targetUmurBulan: s.targetUmurBulan,
              rentangAkhir: s.rentangAkhir,
            }));
          
          allAppointments.push(...monthSchedules);
        }
      }

      setAppointments(allAppointments);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getAppointmentsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return appointments.filter((apt) => apt.date === dateString);
  };

  const getFilteredAppointments = () => {
    if (!selectedDate) return [];

    let filtered = getAppointmentsForDate(selectedDate);

    if (filterStatus !== 'all') {
      filtered = filtered.filter((apt) => apt.status === filterStatus);
    }

    if (filterType !== 'all') {
      filtered = filtered.filter((apt) => apt.type === filterType);
    }

    return filtered.sort((a, b) => a.time.localeCompare(b.time));
  };

  const handleSaveAppointment = () => {
    alert('Jadwal berhasil ditambahkan!');
    setIsAddModalOpen(false);
    fetchAllAppointments(); // Refresh all data
    fetchSchedules(); // Refresh calendar data
  };

  const getStatsData = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayString = today.toISOString().split('T')[0];
    
    // Jadwal hari ini (hanya yang dijadwalkan) - dari allAppointments
    const todayAppointments = allAppointments.filter(apt => 
      apt.date === todayString && apt.status === 'dijadwalkan'
    );
    
    // Awal minggu (Minggu)
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    // Akhir minggu (Sabtu)
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    
    // Jadwal minggu ini (hanya yang dijadwalkan) - dari allAppointments
    const weekAppointments = allAppointments.filter(apt => {
      const aptDate = new Date(apt.date);
      aptDate.setHours(0, 0, 0, 0);
      return aptDate >= weekStart && aptDate <= weekEnd && apt.status === 'dijadwalkan';
    });

    // High risk count: hitung dari allAppointments yang statusnya dijadwalkan
    const highRiskCount = allAppointments.filter(apt => 
      apt.riskLevel === 'tinggi' && apt.status === 'dijadwalkan'
    ).length;

    // Completed count: hitung dari semua allAppointments
    const completedCount = allAppointments.filter(apt => 
      apt.status === 'selesai'
    ).length;

    return {
      todayCount: todayAppointments.length,
      weekCount: weekAppointments.length,
      highRiskCount,
      completedCount,
    };
  };

  const stats = getStatsData();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Kalender Kontrol" subtitle="Kelola jadwal kontrol dan kunjungan pasien" showUserInfo />

      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Memuat jadwal pemeriksaan...</p>
            </div>
          ) : (
            <>
              <CalendarStats
                todayCount={stats.todayCount}
                weekCount={stats.weekCount}
                highRiskCount={stats.highRiskCount}
                completedCount={stats.completedCount}
              />

              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2">
                  <CalendarGrid
                    currentDate={currentDate}
                    selectedDate={selectedDate}
                    appointments={appointments}
                    onDateSelect={setSelectedDate}
                    onNavigate={navigateMonth}
                    onTodayClick={() => {
                      setCurrentDate(new Date());
                      setSelectedDate(new Date());
                    }}
                  />
                </div>

                <div className="col-span-1">
                  <AppointmentList
                    selectedDate={selectedDate}
                    appointments={getFilteredAppointments()}
                    filterType={filterType}
                    filterStatus={filterStatus}
                    onFilterTypeChange={setFilterType}
                    onFilterStatusChange={setFilterStatus}
                    onAppointmentClick={(apt) => {
                      setSelectedAppointment(apt);
                      setIsDetailModalOpen(true);
                    }}
                    onAddClick={() => setIsAddModalOpen(true)}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <AppointmentDetailModal
        isOpen={isDetailModalOpen}
        appointment={selectedAppointment}
        onClose={() => setIsDetailModalOpen(false)}
        onRefresh={() => {
          fetchAllAppointments(); // Refresh all data untuk stats
          fetchSchedules(); // Refresh calendar data
        }}
      />

      <AddAppointmentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveAppointment}
      />
    </div>
  );
}
