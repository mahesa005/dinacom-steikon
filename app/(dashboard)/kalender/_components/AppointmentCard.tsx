import { Badge } from '@/components/ui/Badge';
import { Clock, User, CheckCircle } from 'lucide-react';

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

interface AppointmentCardProps {
  appointment: Appointment;
  onClick: (appointment: Appointment) => void;
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

export function AppointmentCard({ appointment, onClick }: AppointmentCardProps) {
  return (
    <div
      onClick={() => onClick(appointment)}
      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-semibold text-gray-900">
            {appointment.time}
          </span>
        </div>
        <Badge className={getRiskBadgeColor(appointment.riskLevel)}>
          {appointment.riskLevel}
        </Badge>
      </div>
      <p className="font-medium text-gray-900 mb-1">
        {appointment.patientName}
      </p>
      <p className="text-xs text-gray-500 mb-2">ID: {appointment.patientId}</p>
      <div className="flex items-center space-x-2">
        <Badge className={getTypeBadgeColor(appointment.type)}>
          {appointment.type.replace('-', ' ')}
        </Badge>
        <Badge className={getStatusBadgeColor(appointment.status)}>
          {appointment.status}
        </Badge>
      </div>
    </div>
  );
}
