'use client';

import { Header } from '@/components/layout/Header';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { UrgentActionsCard } from '@/components/dashboard/UrgentActionsCard';
import { AIInsightCard } from '@/components/dashboard/AIInsightCard';
import { RiskDistributionChart } from '@/components/dashboard/RiskDistributionChart';
import { PatientTable } from '@/components/dashboard/PatientTable';
import { AlertTriangle, Eye, CheckCircle, Calendar } from 'lucide-react';
import type { Patient } from '@/types';

// Mock data matching the HTML mockup
const mockPatients: Patient[] = [
  {
    id: 'P001',
    name: 'Ahmad Fadhil',
    birthDate: '2025-07-30',
    ageMonths: 6,
    gender: 'male',
    birthWeight: 2.8,
    birthLength: 47,
    parentName: 'Siti Nurhaliza',
    parentPhone: '0812-3456-7890',
    parentEducation: 'SMP',
    parentHeight: 148,
    fatherName: 'Ahmad Dhani',
    fatherEducation: 'SMA',
    fatherHeight: 165,
    riskLevel: 'HIGH',
    riskPercentage: 78,
    mainFactor: 'Sanitasi',
    mainFactorIcon: '🚽',
    lastCheckup: '8 Jan',
    nextCheckup: '15 Jan 2026',
    toiletFacility: 'poor',
    wasteManagement: 'poor',
    waterAccess: 'adequate',
  },
  {
    id: 'P002',
    name: 'Zahra Amelia',
    birthDate: '2025-09-30',
    ageMonths: 4,
    gender: 'female',
    birthWeight: 3.0,
    birthLength: 49,
    parentName: 'Dewi Kartika',
    parentPhone: '0813-9876-5432',
    parentEducation: 'SMA',
    parentHeight: 155,
    fatherName: 'Budi Santoso',
    fatherEducation: 'S1',
    fatherHeight: 170,
    riskLevel: 'MEDIUM',
    riskPercentage: 45,
    mainFactor: 'Pend. Ibu',
    mainFactorIcon: '👩',
    lastCheckup: '10 Jan 2026',
    nextCheckup: '10 Jan 2026',
    toiletFacility: 'adequate',
    wasteManagement: 'adequate',
    waterAccess: 'good',
  },
  {
    id: 'P003',
    name: 'Muhammad Rizki',
    birthDate: '2025-05-30',
    ageMonths: 8,
    gender: 'male',
    birthWeight: 3.2,
    birthLength: 50,
    parentName: 'Ani Suryani',
    parentPhone: '0814-5678-1234',
    parentEducation: 'S1',
    parentHeight: 160,
    fatherName: 'Rudi Hartono',
    fatherEducation: 'S1',
    fatherHeight: 172,
    riskLevel: 'LOW',
    riskPercentage: 18,
    mainFactor: 'Normal',
    mainFactorIcon: '✅',
    lastCheckup: '5 Jan 2026',
    nextCheckup: '9 Feb 2026',
    toiletFacility: 'good',
    wasteManagement: 'good',
    waterAccess: 'good',
  },
  {
    id: 'P004',
    name: 'Aisha Putri',
    birthDate: '2025-08-30',
    ageMonths: 5,
    gender: 'female',
    birthWeight: 2.6,
    birthLength: 46,
    parentName: 'Rina Marlina',
    parentPhone: '0813-8765-4321',
    parentEducation: 'SD',
    parentHeight: 145,
    fatherName: 'Joko Widodo',
    fatherEducation: 'SMP',
    fatherHeight: 160,
    riskLevel: 'HIGH',
    riskPercentage: 82,
    mainFactor: 'Pendidikan Ibu',
    mainFactorIcon: '👩',
    lastCheckup: '3 Jan 2026',
    nextCheckup: 'Hari ini, 14:00',
    toiletFacility: 'poor',
    wasteManagement: 'poor',
    waterAccess: 'adequate',
  },
];

const urgentPatients = mockPatients.filter((p) => p.riskLevel === 'HIGH');

const riskDistributionData = {
  high: { count: 24, percentage: 16 },
  medium: { count: 38, percentage: 25 },
  low: { count: 88, percentage: 59 },
  total: 150,
};

const aiInsight = `"<strong>Sanitasi buruk</strong> menjadi faktor utama pada <strong>15 dari 24 kasus</strong> risiko tinggi di wilayah ini. Prioritaskan <strong>edukasi kebersihan lingkungan</strong> dan koordinasi dengan program STBM (Sanitasi Total Berbasis Masyarakat) untuk hasil maksimal."`;

export default function DashboardPage() {
  return (
    <>
      <Header
        title="Dashboard"
        subtitle="Pantau dan kelola pasien stunting secara real-time"
      />

      <div className="p-8 space-y-6">
        {/* Urgent Actions */}
        <UrgentActionsCard patients={urgentPatients} totalCount={3} />

        {/* Stats Cards Row */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Risiko Tinggi"
            value={24}
            icon={<AlertTriangle className="w-6 h-6" />}
            variant="danger"
            badge="URGENT"
            trend={{ direction: 'down', value: '3% dari bulan lalu' }}
          />
          <StatsCard
            title="Risiko Sedang"
            value={38}
            icon={<Eye className="w-6 h-6" />}
            variant="warning"
            subtitle="25% dari total pasien"
          />
          <StatsCard
            title="Risiko Rendah"
            value={88}
            icon={<CheckCircle className="w-6 h-6" />}
            variant="success"
            trend={{ direction: 'up', value: '5% dari bulan lalu' }}
          />
          <StatsCard
            title="Kontrol Hari Ini"
            value={12}
            icon={<Calendar className="w-6 h-6" />}
            variant="info"
            subtitle="5 sudah hadir • 7 pending"
          />
        </section>

        {/* AI Insight + Chart Row */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AIInsightCard insight={aiInsight} />
          </div>
          <RiskDistributionChart data={riskDistributionData} />
        </section>

        {/* Patient Table */}
        <PatientTable patients={mockPatients} totalCount={150} />
      </div>
    </>
  );
}
