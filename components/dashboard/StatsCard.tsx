import { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: number;
  icon: ReactNode;
  variant?: 'default' | 'danger' | 'warning' | 'success' | 'info';
  badge?: string;
  trend?: {
    direction: 'up' | 'down';
    value: string;
  };
  subtitle?: string;
}

export function StatsCard({
  title,
  value,
  icon,
  variant = 'default',
  badge,
  trend,
  subtitle,
}: StatsCardProps) {
  const variantStyles = {
    default: {
      bg: 'bg-white',
      iconBg: 'bg-gray-100',
      iconColor: 'text-gray-600',
    },
    danger: {
      bg: 'bg-white',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
    },
    warning: {
      bg: 'bg-white',
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
    },
    success: {
      bg: 'bg-white',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    info: {
      bg: 'bg-white',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div
      className={`${styles.bg} rounded-xl p-6 card-shadow hover-lift cursor-pointer`}
    >
      <div className="flex items-center justify-between mb-4">
        <div
          className={`w-12 h-12 ${styles.iconBg} rounded-lg flex items-center justify-center`}
        >
          <span className={styles.iconColor}>{icon}</span>
        </div>
        {badge && (
          <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded">
            {badge}
          </span>
        )}
      </div>
      <h3 className="text-3xl font-bold text-gray-900 mb-1">{value}</h3>
      <p className="text-sm text-gray-600 mb-2">{title}</p>
      {trend && (
        <div className="flex items-center text-xs">
          <span
            className={`flex items-center font-semibold ${
              trend.direction === 'up' ? 'text-green-500' : 'text-red-500'
            }`}
          >
            {trend.direction === 'up' ? (
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            ) : (
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                />
              </svg>
            )}
            {trend.value}
          </span>
        </div>
      )}
      {subtitle && (
        <div className="flex items-center text-xs">
          <span className="text-gray-500 font-semibold">{subtitle}</span>
        </div>
      )}
    </div>
  );
}
