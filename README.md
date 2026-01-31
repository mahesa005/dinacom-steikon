# 🏥 STEIKON - Sistem Terpadu Identifikasi Stunting dan Kontrol Bayi

![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?style=flat&logo=next.js)
![React](https://img.shields.io/badge/React-19.2.3-blue?style=flat&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-7.3.0-2D3748?style=flat&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?style=flat&logo=postgresql)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=flat&logo=tailwind-css)

Sistem monitoring dan prediksi stunting berbasis AI untuk Puskesmas dengan integrasi Gemini AI dan analisis SHAP untuk explainable AI.

---

## 📋 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Tech Stack](#-tech-stack)
- [Struktur Database](#-struktur-database)
- [API Endpoints](#-api-endpoints)
- [Setup & Installation](#-setup--installation)
- [Environment Variables](#-environment-variables)
- [Development](#-development)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Dokumentasi Tambahan](#-dokumentasi-tambahan)

---

## ✨ Fitur Utama

### 🎯 Dashboard Monitoring
- **Real-time Statistics**: Total pasien, distribusi risiko (Tinggi/Sedang/Rendah)
- **Data Pasien Terkini**: Tabel interaktif dengan filtering dan sorting
- **AI Daily Insight**: Insight harian yang di-cache 24 jam menggunakan Gemini AI
- **Perlu Tindakan Segera**: Alert untuk pasien high-risk
- **Risk Distribution Chart**: Visualisasi distribusi risiko

### 🧠 AI-Powered Features
- **Prediksi Stunting**: Machine learning model untuk prediksi risiko stunting
- **SHAP Analysis**: Explainable AI untuk transparansi hasil prediksi
- **AI Chatbot**: Chatbot terintegrasi dengan database query untuk konsultasi real-time
- **Automated Insights**: Generate insight otomatis berdasarkan data pasien

### 👶 Manajemen Pasien
- **Registrasi Bayi**: Form input data lengkap (bayi, orang tua, lingkungan)
- **Riwayat Pemeriksaan**: History kontrol pertumbuhan dan perkembangan
- **Jadwal Pemeriksaan**: Sistem penjadwalan otomatis dengan milestone tracking
- **Detail Modal**: View lengkap informasi pasien dengan tabs

### 📅 Sistem Kalender & Notifikasi
- **Calendar View**: Visualisasi jadwal pemeriksaan bulanan
- **Appointment Management**: CRUD jadwal dengan status tracking (SCHEDULED/COMPLETED/MISSED)
- **WhatsApp Integration**: Notifikasi otomatis via WhatsApp API
- **Cron Job**: Background task untuk cek jadwal dan kirim reminder

### 🔐 Autentikasi & Otorisasi
- **User Registration**: Registrasi petugas Puskesmas
- **Login System**: Authentication dengan bcrypt password hashing
- **Session Management**: Secure session handling

---

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 16.1.6 (App Router)
- **UI Library**: React 19.2.3
- **Styling**: Tailwind CSS 4.0
- **Icons**: Lucide React
- **Language**: TypeScript 5.0

### Backend
- **Runtime**: Node.js
- **API**: Next.js API Routes (RESTful)
- **Database ORM**: Prisma 7.3.0
- **Database**: PostgreSQL (Supabase)
- **AI Integration**: Google Gemini AI (@google/generative-ai)

### Additional Tools
- **Password Hashing**: bcryptjs
- **Testing**: tsx (TypeScript execution)
- **Linting**: ESLint 9
- **Deployment**: Vercel

---

## 🗄 Struktur Database

### Models Utama

#### **User**
```prisma
model User {
  id             String   @id @default(cuid())
  username       String   @unique
  password       String   // Hashed dengan bcrypt
  namaPuskesmas  String
  provinsi       String
  kota           String
  kecamatan      String
  kelurahan      String
  bayiRegistered Bayi[]
}
```

#### **Bayi**
```prisma
model Bayi {
  id              String            @id @default(cuid())
  nomorPasien     String            @unique
  nik             String?           @unique
  nama            String
  tanggalLahir    DateTime
  jenisKelamin    String
  beratLahir      Float
  panjangLahir    Float
  namaIbu         String
  namaAyah        String
  nomorHpOrangTua String
  alamat          String
  hasilAnalisis   HasilAnalisisAI[]
  historyKontrol  HistoryKontrol[]
  jadwalPemeriksaan JadwalPemeriksaan[]
}
```

#### **HistoryKontrol**
```prisma
model HistoryKontrol {
  id              String   @id @default(cuid())
  bayiId          String
  tanggalKontrol  DateTime
  umurBulan       Int
  beratBadan      Float
  tinggiBadan     Float
  statusGizi      String?
  statusStunting  String?  // HIGH/MEDIUM/LOW
  catatanTambahan String?
}
```

#### **HasilAnalisisAI**
```prisma
model HasilAnalisisAI {
  id                  String   @id @default(cuid())
  bayiId              String
  jenisAnalisis       String
  hasilPrediksi       String   // JSON: {statusRisiko: {skorRisiko, levelRisiko, penjelasan}}
  tingkatKepercayaan  Float?
  dataInput           String   // JSON: SHAP values
  rekomendasiTindakan String?
  catatanAI           String?
}
```

#### **JadwalPemeriksaan**
```prisma
model JadwalPemeriksaan {
  id                  String       @id @default(cuid())
  bayiId              String
  targetUmurBulan     Int          // Milestone: 0, 1, 2, dst
  rentangAwal         DateTime     // Earliest allowed date
  rentangAkhir        DateTime     // Latest allowed date
  status              JadwalStatus // SCHEDULED/COMPLETED/MISSED
  notifikasiTerkirim  Boolean
  tanggalNotifikasi   DateTime?
}
```

#### **DailyInsight**
```prisma
model DailyInsight {
  id        String   @id @default(cuid())
  tanggal   DateTime @unique  // Date without time
  insight   String             // AI-generated insight
  stats     String             // JSON: statistics
}
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register petugas Puskesmas
- `POST /api/auth/login` - Login user

### Baby Management
- `GET /api/bayi` - Get all babies with filters
- `POST /api/bayi` - Create new baby registration
- `GET /api/bayi/[id]` - Get specific baby details
- `GET /api/bayi/[id]/kontrol` - Get baby's control history
- `POST /api/bayi/[id]/kontrol` - Add new control record
- `GET /api/bayi/[id]/analisis` - Get AI analysis history
- `POST /api/bayi/[id]/analisis` - Create AI analysis
- `GET /api/bayi/[id]/grafik` - Get growth chart data
- `GET /api/bayi/[id]/shap-analysis` - Get SHAP analysis
- `POST /api/bayi/[id]/shap-analysis` - Generate SHAP analysis

### Stunting Prediction
- `POST /api/stunting/predict` - Predict stunting risk
- `POST /api/stunting/explain` - Get SHAP explanation
- `GET /api/stunting/insight` - Get daily AI insight (cached 24h)

### AI Chatbot
- `POST /api/ai/chatbot` - Query AI chatbot with conversation history
- `GET /api/ai/daily-insight` - Get daily insight (alternative endpoint)

### Regional Data
- `GET /api/wilayah/provinsi` - Get all provinces
- `GET /api/wilayah/kota/[provinsiId]` - Get cities by province
- `GET /api/wilayah/kecamatan/[kotaId]` - Get districts by city
- `GET /api/wilayah/kelurahan/[kecamatanId]` - Get villages by district

### Cron Jobs
- `GET /api/cron/check-jadwal` - Check schedules and send notifications (Vercel Cron)

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js 20+ 
- PostgreSQL database (atau Supabase account)
- Google Gemini API key

### Installation Steps

1. **Clone Repository**
```bash
git clone https://github.com/mahesa005/dinacom-steikon.git
cd dinacom-steikon
```

2. **Install Dependencies**
```bash
npm install
```

3. **Setup Environment Variables**
```bash
cp .env.example .env
```
Edit `.env` dengan kredensial Anda (lihat section [Environment Variables](#-environment-variables))

4. **Setup Database**
```bash
# Generate Prisma client
npm run db:generate

# Push schema ke database
npm run db:push

# (Optional) Run migrations
npm run db:migrate
```

5. **Run Development Server**
```bash
npm run dev
```

6. **Open Browser**
```
http://localhost:3000
```

---

## 🔐 Environment Variables

Buat file `.env` di root directory dengan isi:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
DIRECT_URL="postgresql://user:password@host:5432/database?schema=public"

# Google Gemini AI
GEMINI_API_KEY="your-gemini-api-key-here"

# WhatsApp API (Optional - untuk notifikasi)
WHATSAPP_API_URL="https://api.whatsapp.com/send"
WHATSAPP_API_TOKEN="your-whatsapp-token"

# Cron Secret (untuk Vercel Cron)
CRON_SECRET="your-secret-key-for-cron"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Cara Mendapatkan API Keys:

1. **Gemini API Key**: 
   - Kunjungi [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Generate API key baru

2. **PostgreSQL (Supabase)**:
   - Buat project di [Supabase](https://supabase.com)
   - Copy connection string dari Project Settings > Database

---

## 💻 Development

### Available Scripts

```bash
# Development
npm run dev              # Start dev server (port 3000)

# Building
npm run build           # Build production bundle
npm start               # Start production server

# Database
npm run db:generate     # Generate Prisma client
npm run db:push         # Push schema to database
npm run db:migrate      # Run migrations
npm run db:studio       # Open Prisma Studio

# Testing
npm run test:crud       # Test CRUD operations
npm run test:db         # Test database connection

# Linting
npm run lint            # Run ESLint
```

### Project Structure

```
dinacom-steikon/
├── app/                          # Next.js App Router
│   ├── (dashboard)/             # Dashboard routes (with layout)
│   │   ├── dashboard/          # Main dashboard page
│   │   ├── daftar-pasien/      # Patient list page
│   │   ├── input-data/         # Data input form
│   │   ├── kalender/           # Calendar view
│   │   └── pengaturan/         # Settings page
│   ├── api/                     # API routes
│   │   ├── auth/               # Authentication endpoints
│   │   ├── bayi/               # Baby management endpoints
│   │   ├── stunting/           # Stunting prediction endpoints
│   │   ├── ai/                 # AI chatbot & insights
│   │   ├── wilayah/            # Regional data endpoints
│   │   └── cron/               # Cron job endpoints
│   ├── generated/prisma/       # Generated Prisma client
│   ├── login/                   # Login page
│   ├── register/                # Register page
│   ├── layout.tsx              # Root layout
│   └── globals.css             # Global styles
├── components/                  # React components
│   ├── dashboard/              # Dashboard-specific components
│   ├── layout/                 # Layout components (Header, Sidebar)
│   └── ui/                     # Reusable UI components
├── lib/                         # Utility libraries
│   ├── db/                     # Database helper functions
│   ├── hooks/                  # Custom React hooks
│   ├── gemini.ts               # Gemini AI integration
│   ├── prisma.ts               # Prisma client instance
│   ├── stunting-prediction.ts  # Prediction logic
│   └── whatsapp.ts             # WhatsApp integration
├── prisma/                      # Database
│   ├── schema.prisma           # Database schema
│   ├── migrations/             # Migration files
│   └── seed.sql                # Seed data
├── public/                      # Static assets
├── types/                       # TypeScript type definitions
└── package.json                # Dependencies
```

---

## 🧪 Testing

### API Testing

Test chatbot API:
```bash
bash test-chatbot-api.sh
```

Test SHAP analysis:
```bash
bash test-shap-api.sh
```

Test weekly insight:
```bash
npm run tsx test-weekly-insight.ts
```

### Manual Testing

1. **Test Prediksi Stunting**:
   - Input data bayi baru
   - Lihat hasil prediksi di detail modal
   - Verify SHAP explanation

2. **Test Chatbot**:
   - Buka dashboard
   - Klik "Tanya AI" di card Insight Harian
   - Tanyakan tentang statistik pasien

3. **Test Notifikasi**:
   - Tambah jadwal pemeriksaan
   - Trigger cron job: `GET /api/cron/check-jadwal`
   - Verify notifikasi WhatsApp terkirim

---

## 🌐 Deployment

### Deploy ke Vercel

1. **Push ke GitHub**
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. **Import di Vercel**
   - Login ke [Vercel](https://vercel.com)
   - Click "New Project"
   - Import repository GitHub

3. **Configure Environment Variables**
   - Add semua environment variables dari `.env`
   - Pastikan `DATABASE_URL` dan `GEMINI_API_KEY` sudah diisi

4. **Configure Cron Jobs** (Optional)
   - File: `vercel.json`
   ```json
   {
     "crons": [{
       "path": "/api/cron/check-jadwal",
       "schedule": "0 8 * * *"
     }]
   }
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Access your app at `https://your-app.vercel.app`

### Post-Deployment

1. **Run Database Migrations**
```bash
npx prisma migrate deploy
```

2. **Verify API Endpoints**
   - Test `/api/bayi`
   - Test `/api/stunting/insight`
   - Test cron endpoint dengan `CRON_SECRET`

3. **Monitor Logs**
   - Check Vercel dashboard untuk errors
   - Monitor database queries di Supabase

---

## 📚 Dokumentasi Tambahan

- **[CHATBOT_IMPLEMENTATION.md](./CHATBOT_IMPLEMENTATION.md)** - Detail implementasi AI chatbot
- **[CRON_SETUP.md](./CRON_SETUP.md)** - Setup cron jobs untuk notifikasi
- **[INTEGRATION_SUMMARY.md](./INTEGRATION_SUMMARY.md)** - Summary integrasi sistem
- **[BUG_FIXES_SUMMARY.md](./BUG_FIXES_SUMMARY.md)** - History bug fixes

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

This project is private and proprietary.

---

## 👥 Team

**DINACOM - STEIKON Team**
- Repository: [mahesa005/dinacom-steikon](https://github.com/mahesa005/dinacom-steikon)

---

## 🐛 Known Issues & Roadmap

### Known Issues
- [ ] Drift detected in database migrations (gunakan `prisma db push` untuk sync)
- [ ] SHAP analysis membutuhkan Python backend (currently mocked)

### Roadmap
- [ ] Export data ke Excel/PDF
- [ ] Multi-language support (EN/ID)
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Email notification support
- [ ] Role-based access control (Admin/Staff)

---

## 📞 Support

Untuk pertanyaan atau issues, silakan:
1. Open an issue di [GitHub Issues](https://github.com/mahesa005/dinacom-steikon/issues)
2. Contact team via email

---

**Built with ❤️ by DINACOM Team**
