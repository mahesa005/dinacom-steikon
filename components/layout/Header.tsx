'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, LogOut } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showUserInfo?: boolean;
  user?: {
    name: string;
    institution: string;
    initials: string;
  };
}

export function Header({ title, subtitle, showUserInfo = false, user }: HeaderProps) {
  const router = useRouter();
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

  const today = new Date();
  const formattedDate = today.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

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

  const handleLogout = () => {
    localStorage.removeItem('user');
    document.cookie = 'token=; path=/; max-age=0';
    router.push('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="px-8 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {/* Date */}
          <div className="text-sm text-gray-600 flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span className="font-medium">{formattedDate}</span>
          </div>

          {/* User Info (optional) */}
          {showUserInfo && (
            <>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {currentUser.name}
                  </p>
                  <p className="text-xs text-gray-500">{currentUser.institution}</p>
                </div>
                <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold cursor-pointer">
                  {currentUser.initials}
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 flex items-center space-x-2 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
