'use client';

import { useState } from 'react';
import { Search, Filter, Plus, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { Patient } from '@/types';

interface PatientTableProps {
  patients: Patient[];
  totalCount: number;
  onAddPatient?: () => void;
  onViewPatient?: (patient: Patient) => void;
}

export function PatientTable({
  patients,
  totalCount,
  onAddPatient,
  onViewPatient,
}: PatientTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);

  const getRiskBadgeClasses = (level: string) => {
    switch (level) {
      case 'HIGH':
        return 'bg-red-100 text-red-700';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-700';
      case 'LOW':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getRiskLabel = (level: string) => {
    switch (level) {
      case 'HIGH':
        return 'Tinggi';
      case 'MEDIUM':
        return 'Sedang';
      case 'LOW':
        return 'Rendah';
      default:
        return level;
    }
  };

  return (
    <section>
      <div className="bg-white rounded-xl card-shadow">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Data Pasien Terkini
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Menampilkan {patients.length} dari {totalCount} pasien
              </p>
            </div>
            <Button
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={onAddPatient}
            >
              Tambah Pasien Baru
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari nama bayi, ID, atau nama orang tua..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="all">Semua Status</option>
              <option value="high">Risiko Tinggi</option>
              <option value="medium">Risiko Sedang</option>
              <option value="low">Risiko Rendah</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="newest">Urutkan: Terbaru</option>
              <option value="risk">Urutkan: Risiko Tertinggi</option>
              <option value="checkup">Urutkan: Kontrol Terdekat</option>
              <option value="name">Urutkan: Nama A-Z</option>
            </select>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  ID Pasien
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Nama Bayi
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Umur
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status Risiko
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Faktor Utama
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Kontrol Berikutnya
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {patients.map((patient) => (
                <tr
                  key={patient.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => onViewPatient?.(patient)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-gray-900">
                      {patient.id}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-semibold text-gray-900">
                        {patient.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        Ibu: {patient.parentName}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {patient.ageMonths} bulan
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getRiskBadgeClasses(
                        patient.riskLevel
                      )}`}
                    >
                      {getRiskLabel(patient.riskLevel)} {patient.riskPercentage}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {patient.mainFactorIcon && (
                        <span className="text-lg">{patient.mainFactorIcon}</span>
                      )}
                      <span className="text-sm text-gray-700">
                        {patient.mainFactor}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-medium">
                      {patient.nextCheckup}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewPatient?.(patient);
                      }}
                      className="text-teal-600 hover:text-teal-800 text-sm font-medium flex items-center space-x-1"
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
            Menampilkan <span className="font-semibold">1-{patients.length}</span>{' '}
            dari <span className="font-semibold">{totalCount}</span> pasien
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm flex items-center"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </button>
            <button className="px-3 py-1 bg-teal-600 text-white rounded text-sm">
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
            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm flex items-center"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
