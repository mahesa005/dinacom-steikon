import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Calendar as CalendarIcon, Plus } from 'lucide-react';
import { AppointmentCard } from './AppointmentCard';

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

interface AppointmentListProps {
  selectedDate: Date | null;
  appointments: Appointment[];
  filterType: string;
  filterStatus: string;
  onFilterTypeChange: (value: string) => void;
  onFilterStatusChange: (value: string) => void;
  onAppointmentClick: (appointment: Appointment) => void;
  onAddClick: () => void;
}

export function AppointmentList({
  selectedDate,
  appointments,
  filterType,
  filterStatus,
  onFilterTypeChange,
  onFilterStatusChange,
  onAppointmentClick,
  onAddClick,
}: AppointmentListProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">
          {selectedDate
            ? selectedDate.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })
            : 'Pilih Tanggal'}
        </h3>
        <Button size="sm" onClick={onAddClick} className="flex items-center space-x-1">
          <Plus className="w-4 h-4" />
          <span>Tambah</span>
        </Button>
      </div>

      {/* Filters */}
      <div className="space-y-2 mb-4">
        <select
          value={filterType}
          onChange={(e) => onFilterTypeChange(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Semua Jenis</option>
          <option value="kontrol-rutin">Kontrol Rutin</option>
          <option value="vaksinasi">Vaksinasi</option>
          <option value="konsultasi">Konsultasi</option>
          <option value="tindakan">Tindakan</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => onFilterStatusChange(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Semua Status</option>
          <option value="dijadwalkan">Dijadwalkan</option>
          <option value="selesai">Selesai</option>
          <option value="dibatalkan">Dibatalkan</option>
          <option value="tidak-hadir">Tidak Hadir</option>
        </select>
      </div>

      {/* Appointments */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {appointments.length > 0 ? (
          appointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              onClick={onAppointmentClick}
            />
          ))
        ) : (
          <div className="text-center py-12">
            <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">Tidak ada jadwal</p>
          </div>
        )}
      </div>
    </Card>
  );
}
