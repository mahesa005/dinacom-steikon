import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Calendar as CalendarIcon, Clock, User, CheckCircle, Phone } from 'lucide-react';
import { useRouter } from 'next/navigation';

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

interface AppointmentDetailModalProps {
  isOpen: boolean;
  appointment: Appointment | null;
  onClose: () => void;
  onRefresh?: () => void;
}

const getRiskBadgeColor = (level: string) => {
  switch (level) {
    case 'tinggi':
      return 'bg-red-100 text-red-700';
    case 'sedang':
      return 'bg-yellow-100 text-yellow-700';
    case 'rendah':
      return 'bg-green-100 text-green-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case 'dijadwalkan':
      return 'bg-teal-100 text-teal-700';
    case 'selesai':
      return 'bg-green-100 text-green-700';
    case 'dibatalkan':
      return 'bg-gray-100 text-gray-700';
    case 'tidak-hadir':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

const getTypeBadgeColor = (type: string) => {
  switch (type) {
    case 'kontrol-rutin':
      return 'bg-teal-100 text-teal-700';
    case 'vaksinasi':
      return 'bg-teal-100 text-teal-700';
    case 'konsultasi':
      return 'bg-teal-100 text-teal-700';
    case 'tindakan':
      return 'bg-orange-100 text-orange-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

export function AppointmentDetailModal({
  isOpen,
  appointment,
  onClose,
  onRefresh,
}: AppointmentDetailModalProps) {
  const router = useRouter();

  if (!appointment) return null;

  const handleMarkAsCompleted = async () => {
    if (!appointment.bayiId) {
      alert('Data bayi tidak ditemukan');
      return;
    }

    // Redirect to patient details to add control
    router.push(`/daftar-pasien?openPatient=${appointment.patientId}`);
    onClose();
  };

  const getDaysUntil = () => {
    const targetDate = new Date(appointment.date);
    const today = new Date();
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntil = getDaysUntil();
  const isUrgent = daysUntil <= 3 && daysUntil >= 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detail Jadwal Kontrol">
      <div className="space-y-4 p-6">
        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{appointment.patientName}</h3>
            <p className="text-sm text-gray-500">ID: {appointment.patientId}</p>
          </div>
          <Badge className={getRiskBadgeColor(appointment.riskLevel)}>
            Risiko {appointment.riskLevel}
          </Badge>
        </div>

        {isUrgent && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <p className="text-sm font-semibold text-orange-900">
              ⚠️ Jadwal mendesak: {daysUntil === 0 ? 'Hari ini' : `${daysUntil} hari lagi`}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <CalendarIcon className="w-5 h-5 text-gray-400" />
            <div className="flex-1">
              <p className="text-sm text-gray-500">Rentang Waktu Pemeriksaan</p>
              <p className="font-medium text-gray-900">
                {new Date(appointment.date).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
                {appointment.rentangAkhir && (
                  <span className="text-gray-500 text-sm">
                    {' - '}
                    {new Date(appointment.rentangAkhir).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Waktu Pemeriksaan</p>
              <p className="font-medium text-gray-900">
                {appointment.time === 'Fleksibel' 
                  ? 'Waktu fleksibel sesuai jadwal posyandu/puskesmas' 
                  : `${appointment.time} WIB`}
              </p>
            </div>
          </div>

          {appointment.targetUmurBulan && (
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Target Umur</p>
                <p className="font-medium text-gray-900">{appointment.targetUmurBulan} bulan</p>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-3">
            <User className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Jenis Kunjungan</p>
              <Badge className={getTypeBadgeColor(appointment.type)}>
                {appointment.type.replace('-', ' ')}
              </Badge>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <Badge className={getStatusBadgeColor(appointment.status)}>
                {appointment.status}
              </Badge>
            </div>
          </div>

          {appointment.notes && (
            <div className="pt-3 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-1">Catatan</p>
              <p className="text-sm text-gray-900">{appointment.notes}</p>
            </div>
          )}
        </div>

        <div className="flex space-x-3 pt-4">
          {appointment.status === 'dijadwalkan' && (
            <>
              <Button 
                variant="outline" 
                className="flex-1"
                icon={<Phone className="w-4 h-4" />}
                onClick={() => window.open(`https://wa.me/62${appointment.patientId}`, '_blank')}
              >
                Hubungi
              </Button>
              <Button 
                className="flex-1"
                onClick={handleMarkAsCompleted}
              >
                Lakukan Pemeriksaan
              </Button>
            </>
          )}
          {appointment.status === 'selesai' && (
            <Button variant="outline" className="w-full" onClick={onClose}>
              Tutup
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
