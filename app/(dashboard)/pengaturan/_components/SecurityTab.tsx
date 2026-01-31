import { useState } from 'react';
import { Shield, Eye, EyeOff } from 'lucide-react';

interface SecurityTabProps {
  formData: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function SecurityTab({ formData, onInputChange }: SecurityTabProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-gray-200">
        <div className="flex items-center space-x-3 mb-2">
          <Shield className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-bold text-gray-900">Keamanan</h3>
        </div>
        <p className="text-sm text-gray-500">Ubah password dan kelola keamanan akun</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password Saat Ini
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="currentPassword"
              value={formData.currentPassword}
              onChange={onInputChange}
              className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password Baru
          </label>
          <div className="relative">
            <input
              type={showNewPassword ? 'text' : 'password'}
              name="newPassword"
              value={formData.newPassword}
              onChange={onInputChange}
              className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Minimal 8 karakter, kombinasi huruf besar, huruf kecil, dan angka
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Konfirmasi Password Baru
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={onInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="pt-6 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">
          Aktivitas Login Terakhir
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-2 px-3 bg-gray-50 rounded-lg">
            <span className="text-gray-600">Windows PC - Chrome</span>
            <span className="text-gray-500">31 Januari 2026, 09:24</span>
          </div>
          <div className="flex justify-between py-2 px-3 bg-gray-50 rounded-lg">
            <span className="text-gray-600">Android - Mobile App</span>
            <span className="text-gray-500">30 Januari 2026, 15:41</span>
          </div>
        </div>
      </div>
    </div>
  );
}
