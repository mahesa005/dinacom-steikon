import { Users } from 'lucide-react';

interface ParentDataFormProps {
  formData: {
    motherName: string;
    motherPhone: string;
    motherEducation: string;
    motherHeight: string;
    fatherName: string;
    fatherEducation: string;
    fatherHeight: string;
  };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export function ParentDataForm({ formData, onInputChange }: ParentDataFormProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
        <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
          <Users className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Data Orang Tua</h3>
          <p className="text-sm text-gray-500">Informasi tentang ibu dan ayah</p>
        </div>
      </div>

      {/* Mother Data */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Data Ibu</h4>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Ibu <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="motherName"
              value={formData.motherName}
              onChange={onInputChange}
              required
              placeholder="Nama lengkap ibu"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nomor Telepon <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="motherPhone"
              value={formData.motherPhone}
              onChange={onInputChange}
              required
              placeholder="08123456789"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pendidikan Terakhir <span className="text-red-500">*</span>
            </label>
            <select
              name="motherEducation"
              value={formData.motherEducation}
              onChange={onInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Pilih pendidikan</option>
              <option value="SD">SD</option>
              <option value="SMP">SMP</option>
              <option value="SMA">SMA</option>
              <option value="D3">D3</option>
              <option value="S1">S1</option>
              <option value="S2">S2</option>
              <option value="S3">S3</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tinggi Badan (cm) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="motherHeight"
              value={formData.motherHeight}
              onChange={onInputChange}
              required
              step="0.1"
              min="0"
              placeholder="contoh: 155.5"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Father Data */}
      <div className="pt-6 border-t border-gray-200">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Data Ayah</h4>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Ayah <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="fatherName"
              value={formData.fatherName}
              onChange={onInputChange}
              required
              placeholder="Nama lengkap ayah"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pendidikan Terakhir <span className="text-red-500">*</span>
            </label>
            <select
              name="fatherEducation"
              value={formData.fatherEducation}
              onChange={onInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Pilih pendidikan</option>
              <option value="SD">SD</option>
              <option value="SMP">SMP</option>
              <option value="SMA">SMA</option>
              <option value="D3">D3</option>
              <option value="S1">S1</option>
              <option value="S2">S2</option>
              <option value="S3">S3</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tinggi Badan (cm) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="fatherHeight"
              value={formData.fatherHeight}
              onChange={onInputChange}
              required
              step="0.1"
              min="0"
              placeholder="contoh: 170.5"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
