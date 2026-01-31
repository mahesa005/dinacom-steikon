'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { PatientDetailModal } from './_components/PatientDetailModal';
import { AddPatientModal } from './_components/AddPatientModal';
import {
  Search,
  Plus,
  Download,
  Eye,
  Users,
  AlertTriangle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { Patient } from '@/types';

// Mock data
const mockPatients: Patient[] = [
  {
    id: 'P001',
    name: 'Ahmad Fadhil',
    birthDate: '30 Juli 2025',
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
    lastCheckup: '8 Jan 2026',
    nextCheckup: '15 Jan 2026',
    toiletFacility: 'poor',
    wasteManagement: 'poor',
    waterAccess: 'adequate',
  },
  {
    id: 'P002',
    name: 'Zahra Amelia',
    birthDate: '30 Sep 2025',
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
    nextCheckup: '10 Feb 2026',
    toiletFacility: 'adequate',
    wasteManagement: 'adequate',
    waterAccess: 'good',
  },
  {
    id: 'P003',
    name: 'Muhammad Rizki',
    birthDate: '30 Mei 2025',
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
    birthDate: '30 Agu 2025',
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
    nextCheckup: '3 Feb 2026',
    toiletFacility: 'poor',
    wasteManagement: 'poor',
    waterAccess: 'adequate',
  },
  {
    id: 'P005',
    name: 'Dimas Pratama',
    birthDate: '15 Jun 2025',
    ageMonths: 7,
    gender: 'male',
    birthWeight: 3.1,
    birthLength: 48,
    parentName: 'Lina Sari',
    parentPhone: '0815-1234-5678',
    parentEducation: 'SMA',
    parentHeight: 158,
    fatherName: 'Agus Pratama',
    fatherEducation: 'SMA',
    fatherHeight: 168,
    riskLevel: 'MEDIUM',
    riskPercentage: 52,
    mainFactor: 'Gizi',
    mainFactorIcon: '🍎',
    lastCheckup: '12 Jan 2026',
    nextCheckup: '12 Feb 2026',
    toiletFacility: 'adequate',
    wasteManagement: 'good',
    waterAccess: 'good',
  },
];

function DaftarPasienContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // URL-based state for patient detail modal
  const selectedPatientId = searchParams.get('patient');
  const selectedPatient = mockPatients.find((p) => p.id === selectedPatientId);

  const openPatientDetail = (patient: Patient) => {
    router.push(`/daftar-pasien?patient=${patient.id}`, { scroll: false });
  };

  const closePatientDetail = () => {
    router.push('/daftar-pasien', { scroll: false });
  };

  const getRiskBadgeClasses = (level: string) => {
    switch (level) {
      case 'HIGH':
        return 'bg-red-100 text-red-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOW':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    total: 150,
    high: 24,
    medium: 38,
    low: 88,
  };

  return (
    <>
      <Header
        title="Daftar Pasien"
        subtitle="Kelola dan pantau semua data pasien"
        showUserInfo
      />

      <div className="p-8 space-y-6">
        {/* Stats Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">
                  Total Pasien
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.total}
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-red-600 uppercase font-semibold">
                  Risiko Tinggi
                </p>
                <p className="text-2xl font-bold text-red-700 mt-1">
                  {stats.high}
                </p>
              </div>
              <div className="w-10 h-10 bg-red-200 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-700" />
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-yellow-600 uppercase font-semibold">
                  Risiko Sedang
                </p>
                <p className="text-2xl font-bold text-yellow-700 mt-1">
                  {stats.medium}
                </p>
              </div>
              <div className="w-10 h-10 bg-yellow-200 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-yellow-700" />
              </div>
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-600 uppercase font-semibold">
                  Risiko Rendah
                </p>
                <p className="text-2xl font-bold text-green-700 mt-1">
                  {stats.low}
                </p>
              </div>
              <div className="w-10 h-10 bg-green-200 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-700" />
              </div>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-xl shadow-sm">
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Data Pasien Terkini
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Daftar pasien yang dipantau minggu ini
                </p>
              </div>
              <Button
                variant="primary"
                size="lg"
                icon={<Plus className="w-5 h-5" />}
                onClick={() => setIsAddModalOpen(true)}
              >
                Tambah Pasien Baru
              </Button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari pasien berdasarkan nama atau ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium"
              >
                <option value="all">Semua Status</option>
                <option value="high">Risiko Tinggi</option>
                <option value="medium">Risiko Sedang</option>
                <option value="low">Risiko Rendah</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium"
              >
                <option value="newest">Urutkan: Terbaru</option>
                <option value="risk">Urutkan: Risiko Tertinggi</option>
                <option value="checkup">Urutkan: Kontrol Terdekat</option>
                <option value="name">Urutkan: Nama A-Z</option>
              </select>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center space-x-2 text-sm font-medium">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    ID Pasien
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Nama Bayi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Umur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Nama Orang Tua
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Tanggal Kontrol Terakhir
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Status Risiko
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {mockPatients.map((patient) => (
                  <tr
                    key={patient.id}
                    className="hover:bg-gray-50 cursor-pointer transition"
                    onClick={() => openPatientDetail(patient)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">
                        {patient.id}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {patient.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {patient.ageMonths} bulan
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {patient.parentName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {patient.lastCheckup}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getRiskBadgeClasses(
                          patient.riskLevel
                        )}`}
                      >
                        {patient.riskLevel === 'HIGH'
                          ? 'Tinggi'
                          : patient.riskLevel === 'MEDIUM'
                          ? 'Sedang'
                          : 'Rendah'}{' '}
                        ({patient.riskPercentage}%)
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openPatientDetail(patient);
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Detail</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Menampilkan <span className="font-semibold">1-{mockPatients.length}</span>{' '}
              dari <span className="font-semibold">{stats.total}</span> pasien
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm flex items-center">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </button>
              <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm">
                1
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm">
                2
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm">
                3
              </button>
              <span className="text-gray-500">...</span>
              <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm">
                19
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm flex items-center">
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <PatientDetailModal
        isOpen={!!selectedPatient}
        onClose={closePatientDetail}
        patient={selectedPatient || null}
      />

      <AddPatientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </>
  );
}

export default function DaftarPasienPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <DaftarPasienContent />
    </Suspense>
  );
}
