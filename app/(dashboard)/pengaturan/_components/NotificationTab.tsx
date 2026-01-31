import { Bell } from 'lucide-react';

interface NotificationTabProps {
  formData: {
    emailNotifications: boolean;
    whatsappNotifications: boolean;
    riskAlerts: boolean;
    reminderNotifications: boolean;
    weeklyReports: boolean;
  };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

interface ToggleSwitchProps {
  name: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function ToggleSwitch({ name, checked, onChange }: ToggleSwitchProps) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
    </label>
  );
}

export function NotificationTab({ formData, onInputChange }: NotificationTabProps) {
  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-gray-200">
        <div className="flex items-center space-x-3 mb-2">
          <Bell className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-bold text-gray-900">Notifikasi</h3>
        </div>
        <p className="text-sm text-gray-500">Kelola preferensi notifikasi Anda</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <div>
            <h4 className="text-sm font-semibold text-gray-900">Notifikasi Email</h4>
            <p className="text-xs text-gray-500 mt-1">Terima notifikasi melalui email</p>
          </div>
          <ToggleSwitch
            name="emailNotifications"
            checked={formData.emailNotifications}
            onChange={onInputChange}
          />
        </div>

        <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <div>
            <h4 className="text-sm font-semibold text-gray-900">Notifikasi WhatsApp</h4>
            <p className="text-xs text-gray-500 mt-1">Terima notifikasi melalui WhatsApp</p>
          </div>
          <ToggleSwitch
            name="whatsappNotifications"
            checked={formData.whatsappNotifications}
            onChange={onInputChange}
          />
        </div>

        <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <div>
            <h4 className="text-sm font-semibold text-gray-900">Alert Risiko Tinggi</h4>
            <p className="text-xs text-gray-500 mt-1">
              Notifikasi segera untuk kasus berisiko tinggi
            </p>
          </div>
          <ToggleSwitch
            name="riskAlerts"
            checked={formData.riskAlerts}
            onChange={onInputChange}
          />
        </div>

        <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <div>
            <h4 className="text-sm font-semibold text-gray-900">Pengingat Kontrol</h4>
            <p className="text-xs text-gray-500 mt-1">Pengingat jadwal kontrol pasien</p>
          </div>
          <ToggleSwitch
            name="reminderNotifications"
            checked={formData.reminderNotifications}
            onChange={onInputChange}
          />
        </div>

        <div className="flex items-center justify-between py-3">
          <div>
            <h4 className="text-sm font-semibold text-gray-900">Laporan Mingguan</h4>
            <p className="text-xs text-gray-500 mt-1">Ringkasan statistik mingguan</p>
          </div>
          <ToggleSwitch
            name="weeklyReports"
            checked={formData.weeklyReports}
            onChange={onInputChange}
          />
        </div>
      </div>
    </div>
  );
}
