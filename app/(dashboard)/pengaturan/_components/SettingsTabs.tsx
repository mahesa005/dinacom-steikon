import { User, Lock, Bell, Globe } from 'lucide-react';

interface SettingsTab {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SettingsTabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const tabs: SettingsTab[] = [
  { id: 'profil', label: 'Profil', icon: User },
  { id: 'keamanan', label: 'Keamanan', icon: Lock },
  { id: 'notifikasi', label: 'Notifikasi', icon: Bell },
  { id: 'bahasa', label: 'Bahasa & Region', icon: Globe },
];

export function SettingsTabs({ activeTab, onTabChange }: SettingsTabsProps) {
  return (
    <div className="space-y-1">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="font-medium">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
