import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarGridProps {
  currentDate: Date;
  selectedDate: Date | null;
  appointments: Array<{
    id: string;
    date: string;
    riskLevel: 'rendah' | 'sedang' | 'tinggi';
  }>;
  onDateSelect: (date: Date) => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  onTodayClick: () => void;
}

const getDaysInMonth = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  return { daysInMonth, startingDayOfWeek };
};

const monthNames = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export function CalendarGrid({
  currentDate,
  selectedDate,
  appointments,
  onDateSelect,
  onNavigate,
  onTodayClick,
}: CalendarGridProps) {
  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  const getAppointmentsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return appointments.filter((apt) => apt.date === dateString);
  };

  const renderCalendarDays = () => {
    const calendarDays = [];

    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      calendarDays.push(
        <div key={`empty-${i}`} className="aspect-square p-2" />
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayAppointments = getAppointmentsForDate(date);
      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
      const isToday = date.toDateString() === new Date().toDateString();

      calendarDays.push(
        <button
          key={day}
          onClick={() => onDateSelect(date)}
          className={`aspect-square p-2 rounded-lg border transition-all ${
            isSelected
              ? 'bg-blue-600 text-white border-blue-600'
              : isToday
              ? 'bg-blue-50 border-blue-200 text-blue-700'
              : 'border-gray-200 hover:bg-gray-50'
          }`}
        >
          <div className="text-sm font-medium">{day}</div>
          {dayAppointments.length > 0 && (
            <div className="flex justify-center gap-1 mt-1">
              {dayAppointments.slice(0, 3).map((apt, idx) => (
                <div
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full ${
                    apt.riskLevel === 'tinggi'
                      ? 'bg-red-500'
                      : apt.riskLevel === 'sedang'
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  } ${isSelected ? 'bg-opacity-100' : 'bg-opacity-70'}`}
                />
              ))}
              {dayAppointments.length > 3 && (
                <div className={`text-[8px] ${isSelected ? 'text-white' : 'text-gray-500'}`}>
                  +{dayAppointments.length - 3}
                </div>
              )}
            </div>
          )}
        </button>
      );
    }

    return calendarDays;
  };

  return (
    <Card className="p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={onTodayClick}>
            Hari Ini
          </Button>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onNavigate('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => onNavigate('next')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-2">{renderCalendarDays()}</div>

      {/* Legend */}
      <div className="flex items-center justify-center space-x-6 mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-sm text-gray-600">Risiko Tinggi</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <span className="text-sm text-gray-600">Risiko Sedang</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-sm text-gray-600">Risiko Rendah</span>
        </div>
      </div>
    </Card>
  );
}
