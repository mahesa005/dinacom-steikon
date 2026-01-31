import { ReactNode } from 'react';
import type { RiskLevel } from '@/types';

interface BadgeProps {
  variant?: 'high' | 'medium' | 'low' | 'default' | 'urgent' | 'ai';
  children: ReactNode;
  className?: string;
}

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  const variantClasses = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-green-100 text-green-700',
    default: 'bg-gray-100 text-gray-700',
    urgent: 'bg-red-500 text-white',
    ai: 'bg-purple-200 text-purple-800',
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

interface RiskBadgeProps {
  level: RiskLevel;
  percentage: number;
  className?: string;
}

export function RiskBadge({ level, percentage, className = '' }: RiskBadgeProps) {
  const levelConfig = {
    HIGH: { variant: 'high' as const, label: 'Tinggi' },
    MEDIUM: { variant: 'medium' as const, label: 'Sedang' },
    LOW: { variant: 'low' as const, label: 'Rendah' },
  };

  const config = levelConfig[level];

  return (
    <Badge variant={config.variant} className={className}>
      {config.label} ({percentage}%)
    </Badge>
  );
}
