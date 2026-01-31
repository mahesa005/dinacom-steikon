'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Lock, Mail, Eye, EyeOff, User, Phone, Building2, MapPin } from 'lucide-react';
import Link from 'next/link';

interface WilayahOption {
  id: string;
  name: string; // API emsifa.com menggunakan 'name' bukan 'nama'
}

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Wilayah data
  const [provinsiList, setProvinsiList] = useState<WilayahOption[]>([]);
  const [kotaList, setKotaList] = useState<WilayahOption[]>([]);
  const [kecamatanList, setKecamatanList] = useState<WilayahOption[]>([]);
  const [kelurahanList, setKelurahanList] = useState<WilayahOption[]>([]);
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    namaPuskesmas: '',
    provinsi: '',
    kota: '',
    kecamatan: '',
    kelurahan: '',
  });

  // Load provinsi saat component mount
  useEffect(() => {
    fetchProvinsi();
  }, []);

  const fetchProvinsi = async () => {
    try {
      const res = await fetch('/api/wilayah/provinsi');
      const data = await res.json();
      if (data.success) {
        setProvinsiList(data.data);
      }
    } catch (err) {
      console.error('Error fetching provinsi:', err);
    }
  };

  const fetchKota = async (provinsiId: string) => {
    try {
      const res = await fetch(`/api/wilayah/kota/${provinsiId}`);
      const data = await res.json();
      if (data.success) {
        setKotaList(data.data);
        setKecamatanList([]);
        setKelurahanList([]);
      }
    } catch (err) {
      console.error('Error fetching kota:', err);
    }
  };

  const fetchKecamatan = async (kotaId: string) => {
    try {
      const res = await fetch(`/api/wilayah/kecamatan/${kotaId}`);
      const data = await res.json();
      if (data.success) {
        setKecamatanList(data.data);
        setKelurahanList([]);
      }
    } catch (err) {
      console.error('Error fetching kecamatan:', err);
    }
  };

  const fetchKelurahan = async (kecamatanId: string) => {
    try {
      const res = await fetch(`/api/wilayah/kelurahan/${kecamatanId}`);
      const data = await res.json();
      if (data.success) {
        setKelurahanList(data.data);
      }
    } catch (err) {
      console.error('Error fetching kelurahan:', err);
    }
  };

  const handleProvinsiChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const selectedProvinsi = provinsiList.find(p => p.id === value);
    setFormData({ 
      ...formData, 
      provinsi: selectedProvinsi?.name || '',
      kota: '',
      kecamatan: '',
      kelurahan: ''
    });
    if (value) {
      fetchKota(value);
    } else {
      setKotaList([]);
      setKecamatanList([]);
      setKelurahanList([]);
    }
  };

  const handleKotaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const selectedKota = kotaList.find(k => k.id === value);
    setFormData({ 
      ...formData, 
      kota: selectedKota?.name || '',
      kecamatan: '',
      kelurahan: ''
    });
    if (value) {
      fetchKecamatan(value);
    } else {
      setKecamatanList([]);
      setKelurahanList([]);
    }
  };

  const handleKecamatanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const selectedKecamatan = kecamatanList.find(k => k.id === value);
    setFormData({ 
      ...formData, 
      kecamatan: selectedKecamatan?.name || '',
      kelurahan: ''
    });
    if (value) {
      fetchKelurahan(value);
    } else {
      setKelurahanList([]);
    }
  };

  const handleKelurahanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const selectedKelurahan = kelurahanList.find(k => k.id === value);
    setFormData({ 
      ...formData, 
      kelurahan: selectedKelurahan?.name || ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validasi password match
    if (formData.password !== formData.confirmPassword) {
      setError('Password tidak cocok');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          namaPuskesmas: formData.namaPuskesmas,
          provinsi: formData.provinsi,
          kota: formData.kota,
          kecamatan: formData.kecamatan,
          kelurahan: formData.kelurahan,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Registrasi gagal');
        setLoading(false);
        return;
      }

      // Simpan user data ke localStorage
      localStorage.setItem('user', JSON.stringify(data.data));
      
      // Simpan token ke cookie untuk middleware
      document.cookie = `token=${data.token || 'authenticated'}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 hari

      // Redirect ke dashboard
      router.push('/dashboard');
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-teal-50 to-indigo-50 px-4 py-12">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <Image
              src="/logo/logo-text.png"
              alt="Stunting Sentinel"
              width={250}
              height={80}
              className="w-auto h-16"
              priority
            />
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Daftar akun baru
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Username untuk login"
                />
              </div>
            </div>

            <div>
              <label htmlFor="namaPuskesmas" className="block text-sm font-medium text-gray-700 mb-2">
                Nama Puskesmas
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building2 className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="namaPuskesmas"
                  name="namaPuskesmas"
                  type="text"
                  required
                  value={formData.namaPuskesmas}
                  onChange={(e) => setFormData({ ...formData, namaPuskesmas: e.target.value })}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Nama puskesmas Anda"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="provinsi" className="block text-sm font-medium text-gray-700 mb-2">
                  Provinsi
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="provinsi"
                    name="provinsi"
                    required
                    onChange={handleProvinsiChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="">Pilih Provinsi</option>
                    {provinsiList.map((prov) => (
                      <option key={prov.id} value={prov.id}>
                        {prov.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="kota" className="block text-sm font-medium text-gray-700 mb-2">
                  Kota/Kabupaten
                </label>
                <select
                  id="kota"
                  name="kota"
                  required
                  onChange={handleKotaChange}
                  disabled={!formData.provinsi}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-gray-100"
                >
                  <option value="">Pilih Kota/Kabupaten</option>
                  {kotaList.map((kota) => (
                    <option key={kota.id} value={kota.id}>
                      {kota.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="kecamatan" className="block text-sm font-medium text-gray-700 mb-2">
                  Kecamatan
                </label>
                <select
                  id="kecamatan"
                  name="kecamatan"
                  required
                  onChange={handleKecamatanChange}
                  disabled={!formData.kota}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-gray-100"
                >
                  <option value="">Pilih Kecamatan</option>
                  {kecamatanList.map((kec) => (
                    <option key={kec.id} value={kec.id}>
                      {kec.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="kelurahan" className="block text-sm font-medium text-gray-700 mb-2">
                  Kelurahan/Desa
                </label>
                <select
                  id="kelurahan"
                  name="kelurahan"
                  required
                  onChange={handleKelurahanChange}
                  disabled={!formData.kecamatan}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-gray-100"
                >
                  <option value="">Pilih Kelurahan/Desa</option>
                  {kelurahanList.map((kel) => (
                    <option key={kel.id} value={kel.id}>
                      {kel.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Konfirmasi Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                />
              </div>
              <div className="ml-2 text-sm">
                <label htmlFor="terms" className="text-gray-700">
                  Saya setuju dengan{' '}
                  <a href="#" className="font-medium text-teal-600 hover:text-teal-500">
                    Syarat & Ketentuan
                  </a>{' '}
                  dan{' '}
                  <a href="#" className="font-medium text-teal-600 hover:text-teal-500">
                    Kebijakan Privasi
                  </a>
                </label>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Memproses...' : 'Daftar'}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Sudah punya akun?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link href="/login">
                <Button variant="outline" className="w-full">
                  Masuk
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
