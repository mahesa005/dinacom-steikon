'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { CalendarStats } from './_components/CalendarStats';
import { CalendarGrid } from './_components/CalendarGrid';
import { AppointmentList } from './_components/AppointmentList';
import { AppointmentDetailModal } from './_components/AppointmentDetailModal';
import { AddAppointmentModal } from './_components/AddAppointmentModal';

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
}

const mockAppointments: Appointment[] = [
  {
    id: '1',
    patientId: 'SB001',
    patientName: 'Aisyah Putri',
    date: '2026-01-31',
    time: '09:00',
    type: 'kontrol-rutin',
    status: 'dijadwalkan',
    riskLevel: 'tinggi',
    notes: 'Kontrol stunting bulan ke-3',
  },
  {
    id: '2',
    patientId: 'SB002',
    patientName: 'Budi Santoso',
    date: '2026-01-31',
    time: '10:30',
    type: 'vaksinasi',
    status: 'dijadwalkan',
    riskLevel: 'rendah',
    notes: 'Vaksinasi DPT-3',
  },
  {
    id: '3',
    patientId: 'SB003',
    patientName: 'Citra Lestari',
    date: '2026-01-31',
    time: '14:00',
    type: 'konsultasi',
    status: 'dijadwalkan',
    riskLevel: 'sedang',
    notes: 'Konsultasi gizi',
  },
  {
    id: '4',
    patientId: 'SB004',
    patientName: 'Dewi Sartika',
    date: '2026-02-01',
    time: '09:00',
    type: 'kontrol-rutin',
    status: 'dijadwalkan',
    riskLevel: 'sedang',
  },
  {
    id: '5',
    patientId: 'SB005',
    patientName: 'Eko Prasetyo',
    date: '2026-02-03',
    time: '11:00',
    type: 'vaksinasi',
    status: 'dijadwalkan',
    riskLevel: 'rendah',
  },
];

export default function KalenderPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

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
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Kalender Kontrol" subtitle="Kelola jadwal kontrol dan kunjungan pasien" />

      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <CalendarStats
            todayCount={getAppointmentsForDate(new Date()).length}
            weekCount={12}
            highRiskCount={3}
            completedCount={45}
          />

          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2">
              <CalendarGrid
                currentDate={currentDate}
                selectedDate={selectedDate}
                appointments={appointments}
                onDateSelect={setSelectedDate}
                onNavigate={navigateMonth}
                onTodayClick={() => setCurrentDate(new Date())}
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
        </div>
      </div>

      <AppointmentDetailModal
        isOpen={isDetailModalOpen}
        appointment={selectedAppointment}
        onClose={() => setIsDetailModalOpen(false)}
      />

      <AddAppointmentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveAppointment}
      />
    </div>
  );
}
