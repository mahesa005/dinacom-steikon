'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { UrgentActionsCard } from '@/components/dashboard/UrgentActionsCard';
import { AIInsightCard } from '@/components/dashboard/AIInsightCard';
import { RiskDistributionChart } from '@/components/dashboard/RiskDistributionChart';
import { PatientTable } from '@/components/dashboard/PatientTable';
import { AlertTriangle, Eye, CheckCircle, Calendar } from 'lucide-react';
import type { Patient } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [aiInsight, setAiInsight] = useState<string>('');
  const [isLoadingInsight, setIsLoadingInsight] = useState(true);

  useEffect(() => {
    fetchPatients();
    fetchAIInsight();
  }, []);

  const fetchAIInsight = async () => {
    setIsLoadingInsight(true);
    try {
      const response = await fetch('/api/stunting/insight');
      const result = await response.json();
      
      if (result.success) {
        setAiInsight(result.data.insight);
      }
    } catch (error) {
      console.error('Error fetching AI insight:', error);
      setAiInsight('Tidak dapat memuat insight AI saat ini.');
    } finally {
      setIsLoadingInsight(false);
    }
  };

  const handleViewAllUrgent = () => {
    router.push('/daftar-pasien?filter=high');
  };

  const handleAddPatient = () => {
    router.push('/input-data');
  };

  const handleViewPatient = (patient: Patient) => {
    router.push(`/daftar-pasien?patient=${patient.id}`);
  };

  const fetchPatients = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/bayi');
      const result = await response.json();

      if (result.success) {
        // Map API data to Patient type
        const mappedPatients: Patient[] = result.data.map((bayi: any) => {
          const birthDate = new Date(bayi.tanggalLahir);
          const today = new Date();
          const ageMonths = Math.floor(
            (today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
          );

          const latestControl = bayi.historyKontrol?.[0];

          return {
            id: bayi.nomorPasien,
            name: bayi.nama,
            birthDate: new Date(bayi.tanggalLahir).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            }),
            ageMonths,
            gender: bayi.jenisKelamin === 'LAKI-LAKI' ? 'male' : 'female',
            birthWeight: bayi.beratLahir,
            birthLength: bayi.panjangLahir,
            parentName: bayi.namaIbu,
            parentPhone: bayi.nomorHpOrangTua,
            parentEducation: 'SMA',
            parentHeight: 155,
            fatherName: bayi.namaAyah,
            fatherEducation: 'SMA',
            fatherHeight: 170,
            riskLevel: latestControl?.statusStunting || 'MEDIUM',
            riskPercentage: 50,
            mainFactor: 'Sanitasi',
            mainFactorIcon: '',
            lastCheckup: latestControl
              ? new Date(latestControl.tanggalKontrol).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
              : '-',
            nextCheckup: '-',
            toiletFacility: 'adequate',
            wasteManagement: 'adequate',
            waterAccess: 'good',
          };
        });

        setPatients(mappedPatients);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate statistics from actual data
  const highRiskPatients = patients.filter((p) => p.riskLevel === 'HIGH');
  const mediumRiskPatients = patients.filter((p) => p.riskLevel === 'MEDIUM');
  const lowRiskPatients = patients.filter((p) => p.riskLevel === 'LOW');
  const totalPatients = patients.length;

  const riskDistributionData = {
    high: {
      count: highRiskPatients.length,
      percentage: totalPatients > 0 ? Math.round((highRiskPatients.length / totalPatients) * 100) : 0,
    },
    medium: {
      count: mediumRiskPatients.length,
      percentage: totalPatients > 0 ? Math.round((mediumRiskPatients.length / totalPatients) * 100) : 0,
    },
    low: {
      count: lowRiskPatients.length,
      percentage: totalPatients > 0 ? Math.round((lowRiskPatients.length / totalPatients) * 100) : 0,
    },
    total: totalPatients,
  };

  // Get urgent patients (high risk patients)
  const urgentPatients = highRiskPatients.slice(0, 3);

  return (
    <>
      <Header
        title="Dashboard"
        subtitle="Pantau dan kelola pasien stunting secara real-time"
        showUserInfo
      />

      <div className="p-8 space-y-6">
        {/* Urgent Actions */}
        <UrgentActionsCard
          patients={urgentPatients}
          totalCount={highRiskPatients.length}
          onViewAll={handleViewAllUrgent}
        />

        {/* Stats Cards Row */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Risiko Tinggi"
            value={highRiskPatients.length}
            icon={<AlertTriangle className="w-6 h-6" />}
            variant="danger"
            badge="URGENT"
            trend={{ direction: 'down', value: '3% dari bulan lalu' }}
          />
          <StatsCard
            title="Risiko Sedang"
            value={mediumRiskPatients.length}
            icon={<Eye className="w-6 h-6" />}
            variant="warning"
            subtitle={`${riskDistributionData.medium.percentage}% dari total pasien`}
          />
          <StatsCard
            title="Risiko Rendah"
            value={lowRiskPatients.length}
            icon={<CheckCircle className="w-6 h-6" />}
            variant="success"
            trend={{ direction: 'up', value: '5% dari bulan lalu' }}
          />
          <StatsCard
            title="Kontrol Hari Ini"
            value={0}
            icon={<Calendar className="w-6 h-6" />}
            variant="info"
            subtitle="Belum ada kontrol hari ini"
          />
        </section>

        {/* AI Insight + Chart Row */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AIInsightCard 
              insight={isLoadingInsight ? 'Memuat insight AI...' : aiInsight} 
            />
          </div>
          <RiskDistributionChart data={riskDistributionData} />
        </section>

        {/* Patient Table */}
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Memuat data...</div>
        ) : (
          <PatientTable
            patients={patients.slice(0, 10)}
            totalCount={totalPatients}
            onAddPatient={handleAddPatient}
            onViewPatient={handleViewPatient}
          />
        )}
      </div>
    </>
  );
}
