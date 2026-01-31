'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Save } from 'lucide-react';
import { SettingsTabs } from './_components/SettingsTabs';
import { ProfileTab } from './_components/ProfileTab';
import { SecurityTab } from './_components/SecurityTab';
import { NotificationTab } from './_components/NotificationTab';
import { LanguageTab } from './_components/LanguageTab';

export default function PengaturanPage() {
  const [activeTab, setActiveTab] = useState('profil');
  const [formData, setFormData] = useState({
    // Profile
    name: 'Bidan Ani',
    email: 'bidan.ani@puskesmas.id',
    phone: '081234567890',
    institution: 'Puskesmas Kertajaya',
    address: 'Jl. Kesehatan No. 123, Bandung',

    // Password
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',

    // Notifications
    emailNotifications: true,
    whatsappNotifications: true,
    riskAlerts: true,
    reminderNotifications: true,
    weeklyReports: false,

    // Language & Region
    language: 'id',
    timezone: 'Asia/Jakarta',
    dateFormat: 'DD/MM/YYYY',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    alert('Pengaturan berhasil disimpan!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Pengaturan" subtitle="Kelola profil dan preferensi sistem Anda" />

      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-12 gap-6">
            {/* Sidebar Tabs */}
            <div className="col-span-3">
              <Card className="p-2">
                <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />
              </Card>
            </div>

            {/* Content Area */}
            <div className="col-span-9">
              <Card className="p-6">
                {activeTab === 'profil' && (
                  <ProfileTab formData={formData} onInputChange={handleInputChange} />
                )}

                {activeTab === 'keamanan' && (
                  <SecurityTab formData={formData} onInputChange={handleInputChange} />
                )}

                {activeTab === 'notifikasi' && (
                  <NotificationTab formData={formData} onInputChange={handleInputChange} />
                )}

                {activeTab === 'bahasa' && (
                  <LanguageTab formData={formData} onInputChange={handleInputChange} />
                )}

                {/* Save Button */}
                <div className="pt-6 border-t border-gray-200 mt-8">
                  <div className="flex justify-end space-x-3">
                    <Button variant="outline">Batalkan</Button>
                    <Button onClick={handleSave} className="flex items-center space-x-2">
                      <Save className="w-4 h-4" />
                      <span>Simpan Perubahan</span>
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
