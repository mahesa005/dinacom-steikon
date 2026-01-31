# Setup Cron Job untuk Notifikasi Otomatis Jadwal Pemeriksaan

Sistem ini akan mengirim notifikasi WhatsApp otomatis ke orang tua ketika jadwal pemeriksaan bayi sudah masuk periode (rentang awal).

## 📋 Prasyarat

1. Schema database sudah diupdate (run migration)
2. WhatsApp API sudah dikonfigurasi di `.env`
3. CRON_SECRET_KEY sudah diset di `.env`

## 🔄 Run Migration

Setelah schema diupdate, jalankan:

```bash
npx prisma migrate dev --name add_notification_tracking
npx prisma generate
```

## 🚀 Setup Cron Job

### Opsi 1: Menggunakan cron-job.org (Gratis & Mudah)

1. Daftar di https://cron-job.org
2. Buat cron job baru dengan setting:
   - **URL**: `https://your-domain.com/api/cron/check-jadwal?secret=YOUR_SECRET_KEY`
   - **Schedule**: Setiap hari jam 08:00 pagi
   - **Cron Expression**: `0 8 * * *`
   - **Timezone**: Asia/Jakarta (WIB)
3. Save dan aktifkan

### Opsi 2: Vercel Cron Jobs

Tambahkan di `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/check-jadwal?secret=YOUR_SECRET_KEY",
      "schedule": "0 8 * * *"
    }
  ]
}
```

### Opsi 3: GitHub Actions (Gratis untuk public repo)

Buat file `.github/workflows/cron-notification.yml`:

```yaml
name: Check Jadwal Pemeriksaan

on:
  schedule:
    # Runs at 01:00 UTC (08:00 WIB) every day
    - cron: '0 1 * * *'
  workflow_dispatch: # Allow manual trigger

jobs:
  check-jadwal:
    runs-on: ubuntu-latest
    steps:
      - name: Call Cron Endpoint
        run: |
          curl -X GET "${{ secrets.APP_URL }}/api/cron/check-jadwal?secret=${{ secrets.CRON_SECRET_KEY }}"
```

Tambahkan secrets di GitHub:
- `APP_URL`: URL aplikasi Anda
- `CRON_SECRET_KEY`: Secret key dari .env

### Opsi 4: EasyCron

1. Daftar di https://www.easycron.com
2. Buat cron job dengan URL endpoint
3. Set schedule dan timezone

## 🧪 Testing Manual

Test endpoint secara manual:

```bash
# Menggunakan curl
curl -X GET "http://localhost:3000/api/cron/check-jadwal?secret=YOUR_SECRET_KEY"

# Atau menggunakan PowerShell
Invoke-RestMethod -Uri "http://localhost:3000/api/cron/check-jadwal?secret=YOUR_SECRET_KEY"
```

Response yang diharapkan:

```json
{
  "success": true,
  "summary": {
    "totalChecked": 5,
    "successCount": 5,
    "failCount": 0,
    "timestamp": "2026-01-31T08:00:00.000Z"
  },
  "results": [
    {
      "jadwalId": "xxx",
      "bayiNama": "Bayi Test",
      "status": "success",
      "message": "Pesan WhatsApp berhasil dikirim"
    }
  ]
}
```

## 📝 Cara Kerja

1. **Cron job berjalan setiap hari jam 08:00 pagi**
2. Sistem akan query jadwal pemeriksaan dengan kriteria:
   - `rentangAwal` <= hari ini (sudah masuk periode)
   - `status` = SCHEDULED (belum selesai/terlewat)
   - `notifikasiTerkirim` = false (belum dikirim)
3. Untuk setiap jadwal yang memenuhi kriteria:
   - Kirim notifikasi WhatsApp ke nomor orang tua
   - Update field `notifikasiTerkirim` menjadi `true`
   - Catat `tanggalNotifikasi`
4. Log hasil pengiriman (success/failed)

## 📱 Format Pesan WhatsApp

```
🏥 *PENGINGAT JADWAL PEMERIKSAAN STUNTING*

👶 Nama Bayi: *[Nama Bayi]*
👩 Nama Ibu: [Nama Ibu]
📅 Umur: [X] bulan

🗓️ *JADWAL PEMERIKSAAN*
Periode: [Tanggal Awal] - [Tanggal Akhir]

⚠️ Mohon untuk segera membawa bayi ke Posyandu/Puskesmas untuk pemeriksaan rutin dalam rentang waktu tersebut.

Pemeriksaan rutin sangat penting untuk memantau tumbuh kembang bayi dan mencegah stunting.

Terima kasih atas perhatiannya! 🙏
```

## 🔒 Keamanan

- Endpoint dilindungi dengan secret key
- Hanya request dengan secret yang benar yang akan diproses
- Secret key disimpan di environment variable
- Jangan commit secret key ke repository

## 📊 Monitoring

Cek log untuk monitoring:
- Success/fail count
- Error messages
- Timestamp eksekusi

Tambahkan monitoring service jika perlu:
- Sentry untuk error tracking
- New Relic untuk performance monitoring
- Custom logging ke database

## ⚙️ Configuration

Di `.env`:

```env
# Secret key untuk autentikasi cron job
CRON_SECRET_KEY="your-random-secret-key-here-change-this-in-production"

# WhatsApp API configuration
WHATSAPP_API_URL="https://your-whatsapp-gateway.com/api/send"
WHATSAPP_API_TOKEN="your-whatsapp-api-token"
```

## 🐛 Troubleshooting

**Notifikasi tidak terkirim:**
1. Cek log error di console
2. Pastikan WhatsApp API credentials benar
3. Cek format nomor HP (harus 628xxx)
4. Verifikasi cron job berjalan di waktu yang tepat

**Database error:**
1. Pastikan migration sudah di-run
2. Cek koneksi database
3. Verifikasi field `notifikasiTerkirim` ada di schema

**Authentication error:**
1. Pastikan CRON_SECRET_KEY sama di .env dan cron job setup
2. Cek URL endpoint sudah benar

## 📈 Optimasi

Untuk traffic tinggi:
- Implementasi job queue (Bull, BullMQ)
- Rate limiting untuk WhatsApp API
- Batch processing untuk banyak notifikasi
- Retry mechanism untuk failed notifications
