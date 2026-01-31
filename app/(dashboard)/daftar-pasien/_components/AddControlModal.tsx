'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import type { Patient } from '@/types';

interface AddControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  bayiId: string;
  onSuccess: () => void;
}

export function AddControlModal({
  isOpen,
  onClose,
  patient,
  bayiId,
  onSuccess,
}: AddControlModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [predictionResult, setPredictionResult] = useState<{
    prediction: string;
    probability: number;
    explanation?: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    tanggalKontrol: new Date().toISOString().split('T')[0],
    umurBulan: patient?.ageMonths || 0,
    beratBadan: '',
    tinggiBadan: '',
    catatanTambahan: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setPredictionResult(null);

    try {
      // First, run prediction
      const predictionPayload = {
        mother_height_cm: patient?.parentHeight || 155,
        father_height_cm: patient?.fatherHeight || 170,
        mother_edu_level: mapEducationLevel(patient?.parentEducation || 'SMA'),
        father_edu_level: mapEducationLevel(patient?.fatherEducation || 'SMA'),
        toilet_standard: patient?.toiletFacility === 'adequate' ? 1 : 0,
        waste_mgmt_std: patient?.wasteManagement === 'adequate' ? 1 : 0,
        birth_weight_kg: (patient?.birthWeight || 3000) / 1000,
        birth_length_cm: patient?.birthLength || 50,
        age_months: parseInt(formData.umurBulan.toString()),
        weight_kg: parseFloat(formData.beratBadan),
        height_cm: parseFloat(formData.tinggiBadan),
        gender: patient?.gender === 'male' ? 1 : 0,
      };

      // Get prediction
      const predictionResponse = await fetch('/api/stunting/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(predictionPayload),
      });

      let statusStunting = 'MEDIUM';
      let probability = 50;

      if (predictionResponse.ok) {
        const predictionData = await predictionResponse.json();
        statusStunting = predictionData.prediction === 'stunted' ? 'HIGH' : 
                         predictionData.probability > 0.3 ? 'MEDIUM' : 'LOW';
        probability = Math.round(predictionData.probability * 100);
        
        setPredictionResult({
          prediction: statusStunting,
          probability: probability,
        });
      }

      // Save control history
      const controlPayload = {
        tanggalKontrol: formData.tanggalKontrol,
        umurBulan: parseInt(formData.umurBulan.toString()),
        beratBadan: parseFloat(formData.beratBadan),
        tinggiBadan: parseFloat(formData.tinggiBadan),
        statusStunting,
        catatanTambahan: formData.catatanTambahan || undefined,
      };

      const response = await fetch(`/api/bayi/${bayiId}/kontrol`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(controlPayload),
      });

      const result = await response.json();

      if (result.success) {
        // Update jadwal status to COMPLETED and generate new schedules based on risk level
        try {
          // Find jadwal that matches the age and mark as completed
          const scheduleResponse = await fetch(`/api/jadwal-pemeriksaan?bayiId=${bayiId}`);
          const scheduleResult = await scheduleResponse.json();
          
          if (scheduleResult.success && scheduleResult.data.length > 0) {
            // Find matching scheduled appointment based on age
            const matchingSchedule = scheduleResult.data.find((s: any) => 
              s.targetUmurBulan === parseInt(formData.umurBulan.toString()) && 
              s.status === 'SCHEDULED'
            );
            
            if (matchingSchedule) {
              // Update status to COMPLETED and regenerate schedules with new risk level
              await fetch(`/api/jadwal-pemeriksaan`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  jadwalId: matchingSchedule.id,
                  bayiId: bayiId,
                  newRiskLevel: statusStunting,
                }),
              });
            }
          }
        } catch (scheduleError) {
          console.error('Error updating schedule:', scheduleError);
          // Continue anyway, schedule update is not critical
        }

        alert(`Data kontrol berhasil disimpan!\n\nHasil Prediksi: ${
          statusStunting === 'HIGH' ? 'Risiko Tinggi' : 
          statusStunting === 'MEDIUM' ? 'Risiko Sedang' : 'Risiko Rendah'
        } (${probability}%)\n\nJadwal pemeriksaan telah diperbarui berdasarkan hasil pemeriksaan.`);
        onSuccess();
        onClose();
        // Reset form
        setFormData({
          tanggalKontrol: new Date().toISOString().split('T')[0],
          umurBulan: patient?.ageMonths || 0,
          beratBadan: '',
          tinggiBadan: '',
          catatanTambahan: '',
        });
        setPredictionResult(null);
      } else {
        alert(result.error || 'Gagal menyimpan data kontrol');
      }
    } catch (error) {
      console.error('Error saving control:', error);
      alert('Terjadi kesalahan saat menyimpan data');
    } finally {
      setIsSubmitting(false);
    }
  };

  const mapEducationLevel = (education: string): number => {
    const map: Record<string, number> = {
      'SD': 1,
      'SMP': 2,
      'SMA': 3,
      'D3': 4,
      'S1': 5,
      'S2': 6,
      'S3': 7,
    };
    return map[education] || 3;
  };

  if (!patient) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tambah Data Kontrol"
      subtitle={`Pasien: ${patient.name} (${patient.id})`}
    >
      <form onSubmit={handleSubmit} className="space-y-4 p-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tanggal Kontrol <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.tanggalKontrol}
              onChange={(e) => setFormData({ ...formData, tanggalKontrol: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Umur (Bulan) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              min="0"
              max="60"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.umurBulan}
              onChange={(e) => setFormData({ ...formData, umurBulan: parseInt(e.target.value) || 0 })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Berat Badan (kg) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              step="0.1"
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Contoh: 7.5"
              value={formData.beratBadan}
              onChange={(e) => setFormData({ ...formData, beratBadan: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tinggi Badan (cm) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              step="0.1"
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Contoh: 65"
              value={formData.tinggiBadan}
              onChange={(e) => setFormData({ ...formData, tinggiBadan: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Catatan Tambahan
          </label>
          <textarea
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Catatan pemeriksaan (opsional)"
            value={formData.catatanTambahan}
            onChange={(e) => setFormData({ ...formData, catatanTambahan: e.target.value })}
          />
        </div>

        {predictionResult && (
          <div className={`p-4 rounded-lg ${
            predictionResult.prediction === 'HIGH' ? 'bg-red-50 border border-red-200' :
            predictionResult.prediction === 'MEDIUM' ? 'bg-yellow-50 border border-yellow-200' :
            'bg-green-50 border border-green-200'
          }`}>
            <p className="font-semibold">
              Hasil Prediksi: {
                predictionResult.prediction === 'HIGH' ? 'Risiko Tinggi' :
                predictionResult.prediction === 'MEDIUM' ? 'Risiko Sedang' : 'Risiko Rendah'
              }
            </p>
            <p className="text-sm">Probabilitas: {predictionResult.probability}%</p>
          </div>
        )}

        <div className="flex space-x-3 pt-4">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? 'Menyimpan & Prediksi...' : 'Simpan & Prediksi'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
