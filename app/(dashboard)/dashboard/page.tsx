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
  const [todayKontrolCount, setTodayKontrolCount] = useState(0);

  useEffect(() => {
    fetchPatients();
    fetchAIInsight();
    fetchTodayKontrol();
  }, []);

  const fetchTodayKontrol = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/jadwal-pemeriksaan?tanggal=${today}`);
      const result = await response.json();

      if (result.success) {
        setTodayKontrolCount(result.count || 0);
      }
    } catch (error) {
      console.error('Error fetching today kontrol:', error);
    }
  };

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

          // Get latest AI analysis if available
          const latestAnalysis = bayi.hasilAnalisis?.[0];

          // Determine risk level from AI analysis or control data
          let riskLevel = 'MEDIUM';
          let riskPercentage = 50;
          let mainFactor = '-';

          if (latestAnalysis) {
            // Use AI analysis confidence as risk percentage
            riskPercentage = Math.round((latestAnalysis.tingkatKepercayaan || 0.5) * 100);

            // Parse hasilPrediksi to get risk level
            try {
              const hasilPrediksi = JSON.parse(latestAnalysis.hasilPrediksi || '{}');
              if (hasilPrediksi.risk_level) {
                riskLevel = hasilPrediksi.risk_level;
              } else if (hasilPrediksi.is_stunting !== undefined) {
                // Fallback: determine from is_stunting and stunting_risk
                const stuntingRisk = hasilPrediksi.stunting_risk || 0;
                if (hasilPrediksi.is_stunting || stuntingRisk > 70) {
                  riskLevel = 'HIGH';
                } else if (stuntingRisk < 30) {
                  riskLevel = 'LOW';
                } else {
                  riskLevel = 'MEDIUM';
                }
              }
            } catch {
              // If parsing fails, use default
            }

            // Try to extract main factor from dataInput (SHAP analysis)
            try {
              const dataInput = JSON.parse(latestAnalysis.dataInput || '{}');
              if (dataInput.top_factors && dataInput.top_factors.length > 0) {
                mainFactor = dataInput.top_factors[0].feature || '-';
              }
            } catch {
              mainFactor = '-';
            }
          } else if (latestControl?.statusStunting) {
            // Fallback to control data if no AI analysis
            riskLevel = latestControl.statusStunting;
          }

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
            riskLevel,
            riskPercentage,
            mainFactor,
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
            badge={highRiskPatients.length > 0 ? "URGENT" : undefined}
            subtitle={`${riskDistributionData.high.percentage}% dari total pasien`}
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
            subtitle={`${riskDistributionData.low.percentage}% dari total pasien`}
          />
          <StatsCard
            title="Kontrol Hari Ini"
            value={todayKontrolCount}
            icon={<Calendar className="w-6 h-6" />}
            variant="info"
            subtitle={todayKontrolCount > 0 ? `${todayKontrolCount} jadwal pemeriksaan` : "Tidak ada kontrol hari ini"}
          />
        </section>

        {/* Risk Distribution Chart - Full Width */}
        <section>
          <RiskDistributionChart data={riskDistributionData} />
        </section>

        {/* AI Insight */}
        <section>
          <AIInsightCard 
            insight={isLoadingInsight ? 'Memuat insight AI...' : aiInsight} 
          />
        </section>
      </div>
    </>
  );
}
