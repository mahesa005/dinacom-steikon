'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { PatientDetailModal } from './_components/PatientDetailModal';
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

function DaftarPasienContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Handle filter from URL params
  useEffect(() => {
    const filterParam = searchParams.get('filter');
    if (filterParam) {
      setStatusFilter(filterParam);
    }
  }, [searchParams]);

  // Fetch patients from API
  useEffect(() => {
    fetchPatients();
  }, [searchQuery]);

  const fetchPatients = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/bayi?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        // Map API data to Patient type
        const mappedPatients: Patient[] = result.data.map((bayi: any) => {
          // Calculate age in months
          const birthDate = new Date(bayi.tanggalLahir);
          const today = new Date();
          const ageMonths = Math.floor(
            (today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
          );

          // Get latest control data if available
          const latestControl = bayi.historyKontrol?.[0];

          // Get latest AI analysis if available
          const latestAnalysis = bayi.hasilAnalisis?.[0];

          // Determine risk level from AI analysis or control data
          let riskLevel = 'MEDIUM';
          let riskPercentage = 50;
          let mainFactor = '-';

          if (latestAnalysis) {
            // Parse hasilPrediksi to get skorRisiko and levelRisiko
            try {
              const hasilPrediksi = JSON.parse(latestAnalysis.hasilPrediksi || '{}');
              
              // Get skorRisiko from hasilPrediksi
              if (hasilPrediksi.statusRisiko?.skorRisiko) {
                riskPercentage = hasilPrediksi.statusRisiko.skorRisiko;
              } else {
                // Fallback to tingkatKepercayaan
                riskPercentage = Math.round((latestAnalysis.tingkatKepercayaan || 0.5) * 100);
              }

              // Get levelRisiko from hasilPrediksi
              if (hasilPrediksi.statusRisiko?.levelRisiko) {
                const level = hasilPrediksi.statusRisiko.levelRisiko;
                if (level.includes('Tinggi')) {
                  riskLevel = 'HIGH';
                } else if (level.includes('Rendah')) {
                  riskLevel = 'LOW';
                } else {
                  riskLevel = 'MEDIUM';
                }
              } else {
                // Fallback: determine from riskPercentage
                if (riskPercentage > 75) {
                  riskLevel = 'HIGH';
                } else if (riskPercentage < 35) {
                  riskLevel = 'LOW';
                } else {
                  riskLevel = 'MEDIUM';
                }
              }
            } catch (error) {
              // Fallback to tingkatKepercayaan if parsing fails
              riskPercentage = Math.round((latestAnalysis.tingkatKepercayaan || 0.5) * 100);
              if (riskPercentage > 75) riskLevel = 'HIGH';
              else if (riskPercentage < 35) riskLevel = 'LOW';
              else riskLevel = 'MEDIUM';
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
            bayiId: bayi.id,
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

  // URL-based state for patient detail modal
  const selectedPatientId = searchParams.get('patient');
  const selectedPatient = patients.find((p) => p.id === selectedPatientId);

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

  // Calculate stats from actual data
  const stats = {
    total: patients.length,
    high: patients.filter((p) => p.riskLevel === 'HIGH').length,
    medium: patients.filter((p) => p.riskLevel === 'MEDIUM').length,
    low: patients.filter((p) => p.riskLevel === 'LOW').length,
  };

  // Filter patients based on search and status
  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      searchQuery === '' ||
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.parentName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'high' && patient.riskLevel === 'HIGH') ||
      (statusFilter === 'medium' && patient.riskLevel === 'MEDIUM') ||
      (statusFilter === 'low' && patient.riskLevel === 'LOW');

    return matchesSearch && matchesStatus;
  });

  // Sort patients
  const sortedPatients = [...filteredPatients].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return b.id.localeCompare(a.id);
      case 'risk':
        const riskOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        return riskOrder[b.riskLevel as keyof typeof riskOrder] - riskOrder[a.riskLevel as keyof typeof riskOrder];
      case 'name':
        return a.name.localeCompare(b.name);
      case 'checkup':
        return a.lastCheckup.localeCompare(b.lastCheckup);
      default:
        return 0;
    }
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(sortedPatients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPatients = sortedPatients.slice(startIndex, endIndex);

  // Export function
  const handleExport = () => {
    const csvContent = [
      ['ID', 'Nama', 'Usia (bulan)', 'Orang Tua', 'Kontrol Terakhir', 'Status Risiko'],
      ...filteredPatients.map((p) => [
        p.id,
        p.name,
        p.ageMonths.toString(),
        p.parentName,
        p.lastCheckup,
        `${p.riskLevel} (${p.riskPercentage}%)`,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daftar-pasien-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-teal-600" />
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
                onClick={() => router.push('/input-data')}
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
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm font-medium"
              >
                <option value="all">Semua Status</option>
                <option value="high">Risiko Tinggi</option>
                <option value="medium">Risiko Sedang</option>
                <option value="low">Risiko Rendah</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm font-medium"
              >
                <option value="newest">Urutkan: Terbaru</option>
                <option value="risk">Urutkan: Risiko Tertinggi</option>
                <option value="checkup">Urutkan: Kontrol Terdekat</option>
                <option value="name">Urutkan: Nama A-Z</option>
              </select>
              <button
                onClick={handleExport}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center space-x-2 text-sm font-medium"
              >
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
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      Memuat data...
                    </td>
                  </tr>
                ) : paginatedPatients.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      {searchQuery || statusFilter !== 'all' 
                        ? 'Tidak ada data yang sesuai dengan filter' 
                        : 'Belum ada data pasien'}
                    </td>
                  </tr>
                ) : (
                  paginatedPatients.map((patient) => (
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
                        className="text-teal-600 hover:text-teal-800 text-sm font-medium flex items-center space-x-1"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Detail</span>
                      </button>
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Menampilkan{' '}
              <span className="font-semibold">
                {startIndex + 1}-{Math.min(endIndex, sortedPatients.length)}
              </span>{' '}
              dari <span className="font-semibold">{sortedPatients.length}</span> pasien
              {searchQuery || statusFilter !== 'all' ? ' (filtered)' : ''}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 rounded text-sm $\{
                      currentPage === pageNum
                        ? 'bg-teal-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              {totalPages > 5 && (
                <>
                  <span className="text-gray-500">...</span>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className={`px-3 py-1 rounded text-sm $\{
                      currentPage === totalPages
                        ? 'bg-teal-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {totalPages}
                  </button>
                </>
              )}
              
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
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
        bayiId={selectedPatient?.bayiId}
        onRefresh={fetchPatients}
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
