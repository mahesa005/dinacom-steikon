import { Globe } from 'lucide-react';

interface LanguageTabProps {
  formData: {
    language: string;
    timezone: string;
    dateFormat: string;
  };
  onInputChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export function LanguageTab({ formData, onInputChange }: LanguageTabProps) {
  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-gray-200">
        <div className="flex items-center space-x-3 mb-2">
          <Globe className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-bold text-gray-900">Bahasa & Region</h3>
        </div>
        <p className="text-sm text-gray-500">Atur preferensi bahasa dan zona waktu</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Bahasa</label>
          <select
            name="language"
            value={formData.language}
            onChange={onInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="id">Bahasa Indonesia</option>
            <option value="en">English</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Zona Waktu
          </label>
          <select
            name="timezone"
            value={formData.timezone}
            onChange={onInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="Asia/Jakarta">WIB - Jakarta (UTC+7)</option>
            <option value="Asia/Makassar">WITA - Makassar (UTC+8)</option>
            <option value="Asia/Jayapura">WIT - Jayapura (UTC+9)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Format Tanggal
          </label>
          <select
            name="dateFormat"
            value={formData.dateFormat}
            onChange={onInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="DD/MM/YYYY">DD/MM/YYYY (31/01/2026)</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY (01/31/2026)</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD (2026-01-31)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
