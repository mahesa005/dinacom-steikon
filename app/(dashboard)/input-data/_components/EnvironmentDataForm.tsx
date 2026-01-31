import { Home } from 'lucide-react';

interface EnvironmentDataFormProps {
  formData: {
    toiletFacility: string;
    wasteManagement: string;
    waterAccess: string;
  };
  onInputChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export function EnvironmentDataForm({ formData, onInputChange }: EnvironmentDataFormProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
        <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
          <Home className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Lingkungan & Sanitasi</h3>
          <p className="text-sm text-gray-500">Kondisi fasilitas di rumah</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fasilitas Toilet <span className="text-red-500">*</span>
          </label>
          <select
            name="toiletFacility"
            value={formData.toiletFacility}
            onChange={onInputChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="">Pilih kondisi fasilitas toilet</option>
            <option value="good">Baik - Toilet bersih dengan septik tank</option>
            <option value="adequate">Cukup - Toilet sederhana layak pakai</option>
            <option value="poor">Buruk - Tidak ada toilet atau tidak layak</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Penilaian berdasarkan kebersihan dan kelayakan fasilitas toilet
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pengelolaan Sampah <span className="text-red-500">*</span>
          </label>
          <select
            name="wasteManagement"
            value={formData.wasteManagement}
            onChange={onInputChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="">Pilih kondisi pengelolaan sampah</option>
            <option value="good">Baik - Sampah dikelola dengan baik (TPA/diangkut)</option>
            <option value="adequate">Cukup - Sampah dibakar atau dikubur</option>
            <option value="poor">Buruk - Sampah berserakan atau tidak dikelola</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Cara pengelolaan sampah rumah tangga
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Akses Air Bersih <span className="text-red-500">*</span>
          </label>
          <select
            name="waterAccess"
            value={formData.waterAccess}
            onChange={onInputChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="">Pilih kondisi akses air bersih</option>
            <option value="good">Baik - Air PAM atau sumur bor dengan kualitas baik</option>
            <option value="adequate">Cukup - Sumur gali atau mata air</option>
            <option value="poor">Buruk - Sumber air tidak layak atau jauh</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Ketersediaan dan kualitas sumber air untuk kebutuhan sehari-hari
          </p>
        </div>
      </div>

      <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
        <p className="text-sm text-teal-800">
          <strong>Catatan:</strong> Data lingkungan dan sanitasi sangat penting untuk analisis
          risiko stunting. Pastikan informasi yang diberikan akurat.
        </p>
      </div>
    </div>
  );
}
