import { Baby } from 'lucide-react';

interface BabyDataFormProps {
  formData: {
    name: string;
    birthDate: string;
    gender: string;
    birthWeight: string;
    birthLength: string;
  };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export function BabyDataForm({ formData, onInputChange }: BabyDataFormProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
          <Baby className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Data Bayi</h3>
          <p className="text-sm text-gray-500">Informasi dasar tentang bayi</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nama Lengkap Bayi <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={onInputChange}
            required
            placeholder="Masukkan nama lengkap bayi"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tanggal Lahir <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="birthDate"
            value={formData.birthDate}
            onChange={onInputChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Jenis Kelamin <span className="text-red-500">*</span>
          </label>
          <select
            name="gender"
            value={formData.gender}
            onChange={onInputChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Pilih jenis kelamin</option>
            <option value="male">Laki-laki</option>
            <option value="female">Perempuan</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Berat Badan Lahir (kg) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="birthWeight"
            value={formData.birthWeight}
            onChange={onInputChange}
            required
            step="0.1"
            min="0"
            placeholder="contoh: 3.2"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Panjang Badan Lahir (cm) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="birthLength"
            value={formData.birthLength}
            onChange={onInputChange}
            required
            step="0.1"
            min="0"
            placeholder="contoh: 48.5"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
}
