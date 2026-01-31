'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Home,
  Users,
  PlusCircle,
  Calendar,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/daftar-pasien', label: 'Daftar Pasien', icon: Users },
  { href: '/input-data', label: 'Input Data Baru', icon: PlusCircle },
  { href: '/kalender', label: 'Kalender Kontrol', icon: Calendar },
];

interface SidebarProps {
  user?: {
    name: string;
    institution: string;
    initials: string;
  };
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [loggedInUser, setLoggedInUser] = useState<{ username: string; namaPuskesmas: string } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      if (userData && userData !== 'undefined') {
        try {
          setLoggedInUser(JSON.parse(userData));
        } catch (error) {
          console.error('Failed to parse user data:', error);
          localStorage.removeItem('user');
        }
      }
    }
  }, []);

  const getInitials = (name: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const defaultUser = {
    name: loggedInUser?.namaPuskesmas || '',
    institution: loggedInUser?.username || '',
    initials: loggedInUser?.namaPuskesmas ? getInitials(loggedInUser.namaPuskesmas) : '?',
  };

  const currentUser = user || defaultUser;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Image
            src="/logo/logo-text.png"
            alt="Stunting Sentinel Logo"
            width={200}
            height={50}
            className="w-auto h-12"
            priority
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-teal-50 text-teal-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 px-4 py-3 bg-gray-50 rounded-lg">
          <div className="w-10 h-10 bg-linear-to-br from-teal-500 to-teal-700 rounded-full flex items-center justify-center text-white font-semibold">
            {currentUser.initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 line-clamp-2 break-words">
              {currentUser.name}
            </p>
            <p className="text-xs text-gray-500 line-clamp-1 break-words">
              {currentUser.institution}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
