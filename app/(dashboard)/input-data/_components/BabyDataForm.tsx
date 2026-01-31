import { Baby } from 'lucide-react';

interface BabyDataFormProps {
  formData: {
    name: string;
    birthDate: string;
    birthPlace: string;
    gender: string;
    birthWeight: string;
    birthLength: string;
    patientNumber: string;
    nik: string;
    address: string;
    bloodType: string;
  };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export function BabyDataForm({ formData, onInputChange }: BabyDataFormProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
        <div className="w-12 h-12 bg-teal-50 rounded-lg flex items-center justify-center">
          <Baby className="w-6 h-6 text-teal-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Data Bayi</h3>
          <p className="text-sm text-gray-500">Informasi dasar tentang bayi</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nomor Pasien <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="patientNumber"
            value={formData.patientNumber}
            readOnly
            disabled
            placeholder="Auto-generated"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">Nomor pasien dibuat otomatis</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            NIK (Opsional)
          </label>
          <input
            type="text"
            name="nik"
            value={formData.nik}
            onChange={onInputChange}
            placeholder="16 digit NIK"
            maxLength={16}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>

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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tempat Lahir <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="birthPlace"
            value={formData.birthPlace}
            onChange={onInputChange}
            required
            placeholder="Kota/Kabupaten lahir"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Golongan Darah (Opsional)
          </label>
          <select
            name="bloodType"
            value={formData.bloodType}
            onChange={onInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="">Pilih golongan darah</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="AB">AB</option>
            <option value="O">O</option>
          </select>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Alamat Lengkap <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={onInputChange}
            required
            placeholder="Jalan, RT/RW, Kelurahan, Kecamatan, Kota"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
}
