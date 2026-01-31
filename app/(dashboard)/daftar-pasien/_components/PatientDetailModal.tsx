'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { OverviewTab } from './tabs/OverviewTab';
import { HistoryTab } from './tabs/HistoryTab';
import { ShapTab } from './tabs/ShapTab';
import { InterventionTab } from './tabs/InterventionTab';
import { AddControlModal } from './AddControlModal';
import { User } from 'lucide-react';
import type { Patient } from '@/types';

interface PatientDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  bayiId?: string;
  onRefresh?: () => void;
}

export function PatientDetailModal({
  isOpen,
  onClose,
  patient,
  bayiId,
  onRefresh,
}: PatientDetailModalProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isAddControlOpen, setIsAddControlOpen] = useState(false);
  const [historyKey, setHistoryKey] = useState(0);

  if (!patient) return null;

  const handleAddControlSuccess = () => {
    // Refresh history tab by changing key
    setHistoryKey(prev => prev + 1);
    // Also refresh parent data if callback provided
    onRefresh?.();
  };

  const getRiskLabel = (level: string) => {
    switch (level) {
      case 'HIGH':
        return 'Risiko Tinggi';
      case 'MEDIUM':
        return 'Risiko Sedang';
      case 'LOW':
        return 'Risiko Rendah';
      default:
        return level;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title="Detail Pasien"
      subtitle="Informasi lengkap dan riwayat pemeriksaan"
      headerClassName="bg-linear-to-r from-blue-50 to-purple-50"
    >
      <div className="px-6 py-6 max-h-[calc(100vh-200px)] overflow-y-auto">
        {/* Patient Header Card */}
        <div className="bg-linear-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                <User className="w-12 h-12 text-blue-600" />
              </div>
              <div>
                <h4 className="text-2xl font-bold">{patient.name}</h4>
                <p className="text-blue-100 mt-1">
                  ID Pasien: {patient.id} • Umur: {patient.ageMonths} bulan
                </p>
                <p className="text-blue-100 text-sm mt-1">
                  Orang Tua: {patient.parentName} • HP: {patient.parentPhone}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span
                className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                  patient.riskLevel === 'HIGH'
                    ? 'bg-red-500'
                    : patient.riskLevel === 'MEDIUM'
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                }`}
              >
                {getRiskLabel(patient.riskLevel)}
              </span>
              <p className="text-3xl font-bold mt-2">
                {patient.riskPercentage}%
              </p>
              <p className="text-blue-100 text-sm">Probabilitas Stunting</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="overview">Ringkasan</TabsTrigger>
              <TabsTrigger value="history">Riwayat Pemeriksaan</TabsTrigger>
              <TabsTrigger value="shap">Analisis AI (SHAP)</TabsTrigger>
              <TabsTrigger value="intervention">
                Rekomendasi Intervensi
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Tab Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="overview">
            <OverviewTab patient={patient} bayiId={bayiId} />
          </TabsContent>
          <TabsContent value="history">
            <HistoryTab 
              key={historyKey}
              patientId={patient.id} 
              bayiId={bayiId}
              onAddControl={() => setIsAddControlOpen(true)}
            />
          </TabsContent>
          <TabsContent value="shap">
            <ShapTab patient={patient} />
          </TabsContent>
          <TabsContent value="intervention">
            <InterventionTab patientId={patient.id} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal Footer */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between rounded-b-xl">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-white transition text-sm font-medium"
        >
          Tutup
        </button>
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium">
            Cetak Laporan
          </button>
          <button 
            onClick={() => setIsAddControlOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold"
          >
            Tambah Kontrol Baru
          </button>
        </div>
      </div>

      {/* Add Control Modal */}
      <AddControlModal
        isOpen={isAddControlOpen}
        onClose={() => setIsAddControlOpen(false)}
        patient={patient}
        bayiId={bayiId || ''}
        onSuccess={handleAddControlSuccess}
      />
    </Modal>
  );
}
