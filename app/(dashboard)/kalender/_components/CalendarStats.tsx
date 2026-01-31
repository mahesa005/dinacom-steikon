import { Card } from '@/components/ui/Card';
import { CalendarIcon, Clock, AlertCircle, CheckCircle } from 'lucide-react';

interface CalendarStatsProps {
  todayCount: number;
  weekCount: number;
  highRiskCount: number;
  completedCount: number;
}

export function CalendarStats({ todayCount, weekCount, highRiskCount, completedCount }: CalendarStatsProps) {
  return (
    <div className="grid grid-cols-4 gap-6 mb-6">
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Hari Ini</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{todayCount}</p>
          </div>
          <div className="w-12 h-12 bg-teal-50 rounded-lg flex items-center justify-center">
            <CalendarIcon className="w-6 h-6 text-teal-600" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Minggu Ini</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{weekCount}</p>
          </div>
          <div className="w-12 h-12 bg-teal-50 rounded-lg flex items-center justify-center">
            <Clock className="w-6 h-6 text-teal-600" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Risiko Tinggi</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{highRiskCount}</p>
          </div>
          <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Selesai</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{completedCount}</p>
          </div>
          <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </Card>
    </div>
  );
}
