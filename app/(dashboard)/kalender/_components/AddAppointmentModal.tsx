import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface AddAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function AddAppointmentModal({ isOpen, onClose, onSave }: AddAppointmentModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tambah Jadwal Kontrol">
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pilih Pasien
          </label>
          <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option>Pilih pasien...</option>
            <option>SB001 - Aisyah Putri</option>
            <option>SB002 - Budi Santoso</option>
            <option>SB003 - Citra Lestari</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal</label>
            <input
              type="date"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Waktu</label>
            <input
              type="time"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Jenis Kunjungan
          </label>
          <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option>Pilih jenis...</option>
            <option>Kontrol Rutin</option>
            <option>Vaksinasi</option>
            <option>Konsultasi</option>
            <option>Tindakan</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Catatan</label>
          <textarea
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Tambahkan catatan (opsional)"
          />
        </div>

        <div className="flex space-x-3 pt-4">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Batalkan
          </Button>
          <Button className="flex-1" onClick={onSave}>
            Simpan Jadwal
          </Button>
        </div>
      </form>
    </Modal>
  );
}
