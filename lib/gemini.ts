import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not defined in environment variables');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// System instruction untuk membentuk persona AI
const systemInstruction = `
Kamu adalah Dr. Gizi, seorang ahli gizi dan kesehatan anak yang berpengalaman lebih dari 15 tahun dalam menangani kasus stunting di Indonesia. 

Karakteristik Kepribadian:
- Komunikatif dan ramah, menggunakan bahasa Indonesia yang mudah dipahami masyarakat umum
- Empati tinggi terhadap kondisi orang tua dan keluarga
- Memberikan penjelasan yang berbasis bukti ilmiah namun tidak menggunakan istilah medis yang rumit
- Fokus pada solusi praktis dan dapat diterapkan oleh keluarga dengan berbagai tingkat ekonomi

Keahlian:
- Analisis pertumbuhan dan perkembangan anak usia 0-5 tahun
- Deteksi dini risiko stunting berdasarkan data antropometri
- Penyusunan rekomendasi gizi yang disesuaikan dengan kondisi lokal Indonesia
- Pemahaman mendalam tentang faktor sosial, ekonomi, dan lingkungan yang mempengaruhi stunting

Prinsip Kerja:
1. Selalu berikan analisis yang objektif dan berbasis data
2. Hindari memberikan diagnosis medis final (rujuk ke dokter untuk kasus serius)
3. Berikan rekomendasi yang spesifik, terukur, dan dapat dilakukan
4. Sensitif terhadap kondisi ekonomi keluarga dalam memberikan saran
5. Tekankan pentingnya pemantauan rutin dan kolaborasi dengan tenaga kesehatan
6. Gunakan contoh makanan lokal Indonesia yang mudah didapat dan terjangkau

Batasan:
- Tidak memberikan resep obat atau suplemen tanpa konsultasi dokter
- Tidak menggantikan peran dokter atau tenaga medis profesional
- Fokus pada pencegahan dan deteksi dini, bukan pengobatan
`;

// Model configuration dengan system instruction
export const geminiModel = genAI.getGenerativeModel({ 
  model: 'models/gemini-2.5-flash',
  systemInstruction: systemInstruction,
});

// Helper function untuk generate text
export async function generateText(prompt: string): Promise<string> {
  try {
    const result = await geminiModel.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to generate text from Gemini API');
  }
}

// Helper function untuk chat conversation
export async function startChat(history: Array<{ role: string; parts: string[] }> = []) {
  const chat = geminiModel.startChat({
    history: history.map(msg => ({
      role: msg.role as 'user' | 'model',
      parts: msg.parts.map(part => ({ text: part })),
    })),
    generationConfig: {
      maxOutputTokens: 1000,
    },
  });
  
  return chat;
}

// Helper function untuk analisis stunting
export async function analyzeStuntingRisk(data: {
  beratBadan: number;
  tinggiBadan: number;
  umurBulan: number;
  jenisKelamin: string;
  beratLahir: number;
  panjangLahir: number;
  tinggiIbu?: number;
  tinggiAyah?: number;
}): Promise<{
  risikoStunting: 'RENDAH' | 'SEDANG' | 'TINGGI';
  tingkatKepercayaan: number;
  analisis: string;
  rekomendasi: string[];
}> {
  const prompt = `
Kamu adalah seorang ahli gizi dan kesehatan anak. Analisis data berikut untuk menentukan risiko stunting:

Data Bayi:
- Jenis Kelamin: ${data.jenisKelamin}
- Umur: ${data.umurBulan} bulan
- Berat Badan Saat Ini: ${data.beratBadan} gram
- Tinggi Badan Saat Ini: ${data.tinggiBadan} cm
- Berat Lahir: ${data.beratLahir} gram
- Panjang Lahir: ${data.panjangLahir} cm
${data.tinggiIbu ? `- Tinggi Badan Ibu: ${data.tinggiIbu} cm` : ''}
${data.tinggiAyah ? `- Tinggi Badan Ayah: ${data.tinggiAyah} cm` : ''}

Berikan analisis dalam format JSON berikut:
{
  "risikoStunting": "RENDAH|SEDANG|TINGGI",
  "tingkatKepercayaan": 0.0-1.0,
  "analisis": "penjelasan singkat tentang kondisi bayi",
  "rekomendasi": ["rekomendasi 1", "rekomendasi 2", "rekomendasi 3"]
}

Pastikan response HANYA berupa JSON valid tanpa teks tambahan.
`;

  try {
    const result = await geminiModel.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from Gemini');
    }
    
    const analysis = JSON.parse(jsonMatch[0]);
    return analysis;
  } catch (error) {
    console.error('Gemini Analysis Error:', error);
    throw new Error('Failed to analyze stunting risk');
  }
}

// ===== FUNGSI 1: Generate Insight dari SHAP Values =====
/**
 * Menghasilkan insight yang mudah dipahami dari hasil analisis SHAP
 * Format disesuaikan dengan UI: Status Risiko, Faktor Penyebab, dan Rekomendasi Tindakan
 * 
 * @param shapResult - Hasil analisis dari Python API yang berisi SHAP values
 * @returns Object berisi status risiko, faktor penyebab utama, dan rekomendasi tindakan
 */
export async function generateSHAPInsights(shapResult: {
  is_stunting: number;
  stunting_risk: string;
  confidence: number;
  shap_values: {
    mother_height_cm?: number;
    father_height_cm?: number;
    mother_edu_level?: number;
    father_edu_level?: number;
    toilet_standard?: number;
    waste_mgmt_std?: number;
    [key: string]: number | undefined;
  };
  input_features: {
    mother_height_cm?: number;
    father_height_cm?: number;
    mother_edu_level?: number;
    father_edu_level?: number;
    toilet_standard?: number;
    waste_mgmt_std?: number;
    [key: string]: number | undefined;
  };
}): Promise<{
  statusRisiko: {
    skorRisiko: number;
    levelRisiko: 'Risiko Rendah' | 'Risiko Sedang' | 'Risiko Tinggi';
    penjelasan: string;
  };
  faktorPenyebab: Array<{
    nama: string;
    nilai: string;
    persentasePengaruh: number;
    penjelasan: string;
    mengapaIniPenting: string;
  }>;
  rekomendasiTindakan: Array<{
    judul: string;
    deskripsi: string;
    prioritas: 'Prioritas Tinggi' | 'Prioritas Sedang' | 'Prioritas Rendah';
    icon: string;
    dayLabel?: string;
  }>;
}> {
  
  // Mapping nama variabel ke label yang mudah dipahami
  const variableLabels: { [key: string]: string } = {
    mother_height_cm: 'Tinggi Badan Ibu',
    father_height_cm: 'Tinggi Badan Ayah',
    mother_edu_level: 'Tingkat Pendidikan Ibu',
    father_edu_level: 'Tingkat Pendidikan Ayah',
    toilet_standard: 'Standar Fasilitas Toilet',
    waste_mgmt_std: 'Standar Pengelolaan Sampah',
  };

  // Mapping level pendidikan
  const educationLevels: { [key: number]: string } = {
    0: 'Tidak Sekolah',
    1: 'SD',
    2: 'SMP',
    3: 'SMA',
    4: 'Diploma/Sarjana',
  };

  // Prepare data untuk prompt
  const shapEntries = Object.entries(shapResult.shap_values)
    .filter(([_, value]) => value !== undefined)
    .map(([key, value]) => {
      const inputValue = shapResult.input_features[key];
      let valueDisplay = inputValue?.toString() || 'N/A';
      
      // Format nilai untuk variabel tertentu
      if (key.includes('edu_level') && typeof inputValue === 'number') {
        valueDisplay = `${educationLevels[inputValue] || 'Unknown'} (${inputValue})`;
      } else if (key.includes('height')) {
        valueDisplay = `${inputValue} cm`;
      } else if (key.includes('standard') || key.includes('std')) {
        valueDisplay = inputValue === 1 ? 'Memenuhi Standar' : 'Tidak Memenuhi Standar';
      }

      return {
        variable: key,
        label: variableLabels[key] || key,
        value: inputValue,
        valueDisplay,
        shapValue: value,
      };
    })
    .sort((a, b) => Math.abs(b.shapValue!) - Math.abs(a.shapValue!)); // Sort by impact

  const prompt = `
Sebagai Dr. Gizi, analisis hasil prediksi stunting berikut ini dan berikan insight dalam format yang mudah dipahami:

STATUS PREDIKSI:
- Risiko Stunting: ${shapResult.stunting_risk}
- Skor Risiko: ${(shapResult.confidence * 100).toFixed(0)}%

FAKTOR-FAKTOR YANG DIANALISIS (SHAP Values):
${shapEntries.map(entry => 
  `- ${entry.label}: ${entry.valueDisplay}
   Pengaruh: ${entry.shapValue?.toFixed(4)} ${entry.shapValue! > 0 ? '(Meningkatkan risiko)' : entry.shapValue! < 0 ? '(Menurunkan risiko)' : '(Netral)'}`
).join('\n')}

TUGAS ANDA:
Berikan analisis dalam format JSON berikut (sesuai UI yang diminta):

{
  "statusRisiko": {
    "penjelasan": "Penjelasan singkat (1-2 kalimat) tentang status risiko berdasarkan skor. Contoh: 'Monitoring rutin dan edukasi gizi diperlukan'"
  },
  "faktorPenyebab": [
    {
      "nama": "Nama Faktor (contoh: Tinggi Ibu, Pendapatan Keluarga, Kunjungan ANC)",
      "nilai": "Nilai yang mudah dipahami (contoh: '150 cm (150-155 cm)', '< 1 juta', '2 kali (< 6 kali)')",
      "persentasePengaruh": 15,  // Hitung dari absolute SHAP value, dikonversi ke persentase (0-100)
      "penjelasan": "1-2 kalimat penjelasan faktor ini",
      "mengapaIniPenting": "1-2 kalimat mengapa faktor ini berkontribusi pada risiko stunting"
    }
  ],
  "rekomendasiTindakan": [
    {
      "judul": "Judul rekomendasi (singkat, actionable)",
      "deskripsi": "Deskripsi detail tindakan yang harus dilakukan",
      "prioritas": "Prioritas Tinggi|Prioritas Sedang|Prioritas Rendah",
      "icon": "🏠|🍼|🍎|📚|📅|💊|🏥",  // Pilih icon yang sesuai
      "dayLabel": "Day-1|Week-1|Month-1"  // Optional, untuk timeline
    }
  ]
}

PANDUAN KHUSUS:
1. **Faktor Penyebab**: Urutkan dari persentase pengaruh tertinggi (top 3-5 faktor saja)
   - Persentase dihitung dari absolute SHAP value relatif terhadap total
   - Contoh format nilai: "150 cm (150-155 cm)", "< 1 juta", "2 kali (< 6 kali)"

2. **Rekomendasi Tindakan**: Berikan 5-7 rekomendasi konkret yang:
   - SPESIFIK dan ACTIONABLE (bukan saran umum)
   - Disesuaikan dengan faktor risiko yang ditemukan
   - Menggunakan contoh lokal Indonesia (tempe, tahu, telur, ikan)
   - Prioritas Tinggi: faktor yang sangat urgent dan bisa diubah
   - Prioritas Sedang: penting tapi tidak immediate
   - Gunakan icon yang relevan untuk visualisasi

3. **Bahasa**: Empati, tidak menghakimi, fokus pada solusi praktis

Response HANYA JSON valid, tanpa markdown atau teks tambahan.
`;

  try {
    const result = await geminiModel.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from Gemini');
    }
    
    const aiInsights = JSON.parse(jsonMatch[0]);
    
    // Calculate risk level based on confidence
    let levelRisiko: 'Risiko Rendah' | 'Risiko Sedang' | 'Risiko Tinggi';
    if (shapResult.confidence < 0.35) levelRisiko = 'Risiko Rendah';
    else if (shapResult.confidence <= 0.75) levelRisiko = 'Risiko Sedang';
    else levelRisiko = 'Risiko Tinggi';

    return {
      statusRisiko: {
        skorRisiko: Math.round(shapResult.confidence * 100),
        levelRisiko,
        penjelasan: aiInsights.statusRisiko.penjelasan,
      },
      faktorPenyebab: aiInsights.faktorPenyebab,
      rekomendasiTindakan: aiInsights.rekomendasiTindakan,
    };
  } catch (error) {
    console.error('Gemini SHAP Analysis Error:', error);
    throw new Error('Failed to generate SHAP insights');
  }
}

// ===== FUNGSI 2: Generate Daily Insight untuk Dashboard =====
/**
 * Menghasilkan insight harian berdasarkan data real dari database
 * Insight disesuaikan dengan kondisi pasien yang ada di sistem
 * 
 * @param date - Tanggal untuk generate insight (optional, default today)
 * @returns Insight AI yang mudah dipahami dengan rekomendasi aksi
 */
export async function generateDailyInsight(date?: Date): Promise<{
  title: string;
  insight: string;
  actionButtons: Array<{
    label: string;
    action: string;
  }>;
}> {
  const today = date || new Date();
  const dayOfWeek = today.toLocaleDateString('id-ID', { weekday: 'long' });
  const dateStr = today.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  
  try {
    // Import database function
    const { getAllBayiForChatbot } = await import('./db/bayi');
    
    // Fetch data from database automatically
    const allBayi = await getAllBayiForChatbot();
    
    // If no data, provide insight about getting started
    if (allBayi.length === 0) {
      return {
        title: "Insight AI Hari Ini",
        insight: "Sistem Anda siap digunakan! Mulai dengan menambahkan data pasien pertama Anda melalui halaman Input Data. Setelah ada data pasien, saya akan memberikan insight dan analisis yang lebih spesifik berdasarkan kondisi pasien di wilayah Anda.",
        actionButtons: [
          { label: "Tambah Pasien", action: "add_patient" },
          { label: "Pelajari Lebih Lanjut", action: "learn_more" }
        ],
      };
    }

    // Calculate comprehensive statistics
    const totalPasien = allBayi.length;
    
    const risikoTinggi = allBayi.filter(b => 
      b.historyKontrol[0]?.statusStunting === 'TINGGI'
    ).length;
    
    const risikoSedang = allBayi.filter(b => 
      b.historyKontrol[0]?.statusStunting === 'SEDANG'
    ).length;
    
    const risikoRendah = allBayi.filter(b => 
      b.historyKontrol[0]?.statusStunting === 'RENDAH'
    ).length;

    const belumDiperiksa = allBayi.filter(b => 
      !b.historyKontrol[0]?.statusStunting
    ).length;

    // Calculate age distribution
    const usia0_6 = allBayi.filter(b => {
      const birthDate = new Date(b.tanggalLahir);
      const ageMonths = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
      return ageMonths >= 0 && ageMonths <= 6;
    }).length;

    const usia7_24 = allBayi.filter(b => {
      const birthDate = new Date(b.tanggalLahir);
      const ageMonths = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
      return ageMonths >= 7 && ageMonths <= 24;
    }).length;

    const usia25_60 = allBayi.filter(b => {
      const birthDate = new Date(b.tanggalLahir);
      const ageMonths = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
      return ageMonths >= 25 && ageMonths <= 60;
    }).length;

    // Get patients needing checkup (no control in last 30 days)
    const needCheckup = allBayi.filter(b => {
      if (!b.historyKontrol[0]) return true;
      const lastControl = new Date(b.historyKontrol[0].tanggalKontrol);
      const daysSinceControl = Math.floor((today.getTime() - lastControl.getTime()) / (1000 * 60 * 60 * 24));
      return daysSinceControl > 30;
    }).length;

    // Get gender distribution
    const lakiLaki = allBayi.filter(b => b.jenisKelamin === 'LAKI-LAKI').length;
    const perempuan = allBayi.filter(b => b.jenisKelamin === 'PEREMPUAN').length;

    // Build data summary
    const dataSummary = `
DATA PASIEN WILAYAH ANDA (${dayOfWeek}, ${dateStr}):

RINGKASAN UMUM:
- Total Pasien Terdaftar: ${totalPasien}
- Jenis Kelamin: Laki-laki ${lakiLaki}, Perempuan ${perempuan}

DISTRIBUSI RISIKO STUNTING:
- Risiko Tinggi: ${risikoTinggi} pasien (${totalPasien > 0 ? Math.round((risikoTinggi/totalPasien)*100) : 0}%)
- Risiko Sedang: ${risikoSedang} pasien (${totalPasien > 0 ? Math.round((risikoSedang/totalPasien)*100) : 0}%)
- Risiko Rendah: ${risikoRendah} pasien (${totalPasien > 0 ? Math.round((risikoRendah/totalPasien)*100) : 0}%)
- Belum Diperiksa: ${belumDiperiksa} pasien

DISTRIBUSI USIA:
- 0-6 bulan (ASI Eksklusif): ${usia0_6} pasien
- 7-24 bulan (MPASI & 1000 HPK): ${usia7_24} pasien
- 25-60 bulan (Balita): ${usia25_60} pasien

STATUS PEMANTAUAN:
- Perlu Kontrol Rutin (>30 hari): ${needCheckup} pasien
- Sudah Kontrol Rutin (<30 hari): ${totalPasien - needCheckup} pasien

WILAYAH/PUSKESMAS:
- ${allBayi[0]?.createdBy?.namaPuskesmas || 'Tidak Diketahui'}
`;

    const prompt = `
Sebagai Dr. Gizi, analisis data REAL pasien stunting di wilayah ini dan berikan insight harian yang ACTIONABLE dan SPESIFIK.

${dataSummary}

TUGAS ANDA:
Berikan insight harian dalam format JSON yang:
1. Berdasarkan DATA REAL di atas (bukan insight umum)
2. Menyoroti PRIORITAS atau CONCERN utama hari ini
3. Memberikan REKOMENDASI AKSI konkret yang bisa langsung dilakukan
4. Motivasional dan memberdayakan tenaga kesehatan

{
  "title": "Insight AI Hari Ini",
  "insight": "Insight 2-3 kalimat yang SPESIFIK tentang kondisi pasien Anda. Sebutkan angka konkret, identifikasi prioritas, dan berikan rekomendasi aksi. Harus ACTIONABLE dan RELEVANT dengan data hari ini.",
  "actionButtons": [
    {
      "label": "Lihat Detail",
      "action": "view_details"
    },
    {
      "label": "Bagikan ke Tim",
      "action": "share"
    }
  ]
}

PANDUAN INSIGHT BERDASARKAN DATA:
1. **Jika ada pasien risiko tinggi**: Fokus pada jumlah dan urgensi tindakan
   Contoh: "Perhatian! Saat ini ada ${risikoTinggi} pasien dengan risiko tinggi stunting (${Math.round((risikoTinggi/totalPasien)*100)}% dari total). Prioritaskan kunjungan rumah dan evaluasi faktor risiko utama seperti sanitasi dan asupan gizi untuk pasien-pasien ini."

2. **Jika banyak yang perlu kontrol**: Fokus pada pemantauan rutin
   Contoh: "${needCheckup} pasien belum kontrol dalam 30 hari terakhir. Jadwalkan pemeriksaan rutin minggu ini untuk memastikan pertumbuhan tetap terpantau dan intervensi dini bisa dilakukan."

3. **Jika banyak usia 0-6 bulan**: Fokus pada ASI Eksklusif
   Contoh: "${usia0_6} bayi Anda berusia 0-6 bulan - periode emas ASI Eksklusif. Pastikan edukasi tentang teknik menyusui yang benar dan deteksi dini masalah laktasi untuk semua ibu."

4. **Jika banyak usia 7-24 bulan**: Fokus pada MPASI dan 1000 HPK
   Contoh: "${usia7_24} pasien berada di fase kritis 1000 Hari Pertama Kehidupan (7-24 bulan). Fokus pada kualitas MPASI dengan protein hewani (telur, ikan) dan pemantauan growth chart secara intensif."

5. **Jika distribusi risiko bagus (lebih banyak rendah)**: Motivasi & maintenance
   Contoh: "Kerja bagus! ${risikoRendah} pasien (${Math.round((risikoRendah/totalPasien)*100)}%) memiliki risiko rendah. Pertahankan dengan edukasi berkelanjutan dan pastikan pemantauan rutin tetap konsisten untuk mencegah growth faltering."

6. **Jika ada yang belum diperiksa**: Fokus pada screening
   Contoh: "${belumDiperiksa} pasien belum memiliki data pemeriksaan stunting. Lakukan screening dan pengukuran antropometri segera untuk mendapatkan baseline data dan rencana intervensi."

PENTING:
- Gunakan ANGKA KONKRET dari data
- Berikan AKSI SPESIFIK yang bisa dilakukan hari/minggu ini
- Bahasa MOTIVASIONAL tapi tetap urgent jika ada concern
- Sebutkan KELOMPOK PASIEN yang jadi prioritas (risiko tinggi, perlu kontrol, dll)

Response HANYA JSON valid, tanpa markdown atau teks tambahan.
`;

    const result = await geminiModel.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from Gemini');
    }
    
    const aiInsight = JSON.parse(jsonMatch[0]);
    
    return {
      title: aiInsight.title || "Insight AI Hari Ini",
      insight: aiInsight.insight,
      actionButtons: aiInsight.actionButtons || [
        { label: "Lihat Detail", action: "view_details" },
        { label: "Bagikan ke Tim", action: "share" }
      ],
    };
  } catch (error) {
    console.error('Gemini Daily Insight Error:', error);
    
    // Fallback insight if AI fails
    return {
      title: "Insight AI Hari Ini",
      insight: "Sistem sedang mengalami kendala dalam menghasilkan insight. Silakan refresh halaman atau hubungi administrator jika masalah berlanjut.",
      actionButtons: [
        { label: "Refresh", action: "refresh" },
        { label: "Bantuan", action: "help" }
      ],
    };
  }
}

// ===== FUNGSI 3: Chatbot untuk Query Database =====
/**
 * Chatbot interaktif yang menjawab pertanyaan tentang data pasien
 * OTOMATIS mengambil data dari database, tidak perlu input manual
 * 
 * @param userQuestion - Pertanyaan dari user
 * @param conversationHistory - Riwayat percakapan sebelumnya (optional)
 * @returns Jawaban chatbot dengan insights dan follow-up suggestions
 */
export async function chatbotQueryDatabase(
  userQuestion: string,
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    message: string;
  }>
): Promise<{
  answer: string;
  insights: string[];
  suggestedQuestions: string[];
  dataVisualizationHint?: string;
}> {
  
  try {
    // Import database function
    const { getAllBayiForChatbot } = await import('./db/bayi');
    
    // Fetch data from database automatically
    const allBayi = await getAllBayiForChatbot();
    
    if (allBayi.length === 0) {
      return {
        answer: 'Maaf, saat ini belum ada data pasien di database. Silakan tambahkan data pasien terlebih dahulu melalui halaman Input Data.',
        insights: [
          'Database masih kosong, tidak ada pasien yang terdaftar.',
          'Mulai dengan menambahkan data bayi dan orang tua melalui form Input Data.',
        ],
        suggestedQuestions: [
          'Bagaimana cara menambahkan data pasien baru?',
          'Apa saja informasi yang diperlukan untuk mendaftar pasien?',
        ],
      };
    }

    // Calculate statistics
    const risikoTinggi = allBayi.filter(b => 
      b.historyKontrol[0]?.statusStunting === 'TINGGI'
    ).length;
    
    const risikoSedang = allBayi.filter(b => 
      b.historyKontrol[0]?.statusStunting === 'SEDANG'
    ).length;
    
    const risikoRendah = allBayi.filter(b => 
      b.historyKontrol[0]?.statusStunting === 'RENDAH'
    ).length;

    // Prepare complete patient data
    const allPatientsData = allBayi.map(bayi => {
      const birthDate = new Date(bayi.tanggalLahir);
      const today = new Date();
      const umurBulan = Math.floor(
        (today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
      );
      
      const latestControl = bayi.historyKontrol[0];

      return {
        // Data Bayi Lengkap
        nama: bayi.nama,
        nomorPasien: bayi.nomorPasien,
        nik: bayi.nik || 'Tidak ada',
        tanggalLahir: bayi.tanggalLahir.toLocaleDateString('id-ID'),
        tempatLahir: bayi.tempatLahir,
        jenisKelamin: bayi.jenisKelamin,
        umurBulan,
        beratLahir: bayi.beratLahir,
        panjangLahir: bayi.panjangLahir,
        golonganDarah: bayi.golonganDarah || 'Tidak ada',
        alamat: bayi.alamat,
        
        // Data Orang Tua Lengkap
        namaIbu: bayi.namaIbu,
        namaAyah: bayi.namaAyah,
        nomorHpOrangTua: bayi.nomorHpOrangTua,
        
        // Data Kontrol Terakhir
        beratBadan: latestControl?.beratBadan || bayi.beratLahir,
        tinggiBadan: latestControl?.tinggiBadan || bayi.panjangLahir,
        risikoStunting: latestControl?.statusStunting || 'BELUM DIPERIKSA',
        statusGizi: latestControl?.statusGizi || 'Belum dianalisis',
        tanggalKontrol: latestControl ? latestControl.tanggalKontrol.toISOString() : bayi.createdAt.toISOString(),
        catatanKontrol: latestControl?.catatanTambahan || 'Tidak ada',
        
        // History Kontrol Lengkap
        jumlahKontrol: bayi.historyKontrol.length,
        historyKontrol: bayi.historyKontrol.map(h => ({
          tanggal: h.tanggalKontrol.toLocaleDateString('id-ID'),
          umurBulan: h.umurBulan,
          beratBadan: h.beratBadan,
          tinggiBadan: h.tinggiBadan,
          statusStunting: h.statusStunting,
          statusGizi: h.statusGizi,
          catatan: h.catatanTambahan
        })),
        
        // Hasil Analisis AI Lengkap
        jumlahAnalisis: bayi.hasilAnalisis?.length || 0,
        hasilAnalisis: bayi.hasilAnalisis?.map(a => ({
          tanggal: a.createdAt.toLocaleDateString('id-ID'),
          jenisAnalisis: a.jenisAnalisis,
          hasilPrediksi: a.hasilPrediksi,
          tingkatKepercayaan: a.tingkatKepercayaan,
          rekomendasiTindakan: a.rekomendasiTindakan,
          catatanAI: a.catatanAI
        })) || [],
        
        // Data Puskesmas
        puskesmas: bayi.createdBy?.namaPuskesmas || 'Tidak diketahui',
        petugasPendaftar: bayi.createdBy?.username || 'Tidak diketahui',
        tanggalDaftar: bayi.createdAt.toLocaleDateString('id-ID'),
      };
    });

    const wilayah = allBayi[0]?.createdBy?.namaPuskesmas || 'Tidak Diketahui';
    
    // Build context string from database
    const totalPasien = allBayi.length;
    
    let contextString = `
RINGKASAN DATA DARI DATABASE:
- Wilayah: ${wilayah}
- Total Pasien: ${totalPasien}
- Risiko Tinggi: ${risikoTinggi} (${totalPasien > 0 ? Math.round((risikoTinggi/totalPasien)*100) : 0}%)
- Risiko Sedang: ${risikoSedang} (${totalPasien > 0 ? Math.round((risikoSedang/totalPasien)*100) : 0}%)
- Risiko Rendah: ${risikoRendah} (${totalPasien > 0 ? Math.round((risikoRendah/totalPasien)*100) : 0}%)

DATA LENGKAP SEMUA PASIEN (${allPatientsData.length} pasien):
${allPatientsData.map((p, i) => 
  `${i+1}. ${p.nama} [${p.nomorPasien}]
   - Jenis Kelamin: ${p.jenisKelamin}
   - Umur: ${p.umurBulan} bulan (Lahir: ${p.tanggalLahir} di ${p.tempatLahir})
   - Alamat: ${p.alamat}
   - Golongan Darah: ${p.golonganDarah}
   - Orang Tua: Ibu ${p.namaIbu}, Ayah ${p.namaAyah}
   - Kontak: ${p.nomorHpOrangTua}
   - Berat Lahir: ${p.beratLahir}g, Panjang Lahir: ${p.panjangLahir}cm
   - Kondisi Terakhir: BB ${typeof p.beratBadan === 'number' ? p.beratBadan.toFixed(0) : p.beratBadan}g, TB ${typeof p.tinggiBadan === 'number' ? p.tinggiBadan.toFixed(1) : p.tinggiBadan}cm
   - Status: ${p.risikoStunting}, Gizi: ${p.statusGizi}
   - Jumlah Kontrol: ${p.jumlahKontrol} kali
   - Puskesmas: ${p.puskesmas}
   - Petugas: ${p.petugasPendaftar}
   - Terdaftar: ${p.tanggalDaftar}
   
   HISTORY KONTROL (${p.historyKontrol.length} pemeriksaan):
   ${p.historyKontrol.map((h: any, idx: number) => 
     `   ${idx+1}. ${h.tanggal} (${h.umurBulan} bulan)
      BB: ${h.beratBadan}g, TB: ${h.tinggiBadan}cm
      Status: ${h.statusStunting || 'N/A'}, Gizi: ${h.statusGizi || 'N/A'}
      Catatan: ${h.catatan || 'Tidak ada'}`
   ).join('\n')}
   
   HASIL ANALISIS AI (${p.jumlahAnalisis} analisis):
   ${p.hasilAnalisis.length > 0 ? p.hasilAnalisis.map((a: any, idx: number) => 
     `   ${idx+1}. ${a.tanggal} - ${a.jenisAnalisis}
      Prediksi: ${a.hasilPrediksi}
      Kepercayaan: ${a.tingkatKepercayaan ? (a.tingkatKepercayaan * 100).toFixed(0) + '%' : 'N/A'}
      Rekomendasi: ${a.rekomendasiTindakan || 'Tidak ada'}
      Catatan AI: ${a.catatanAI || 'Tidak ada'}`
   ).join('\n') : '   Belum ada analisis AI'}`
).join('\n\n')}
`;

    // Build conversation history
    let historyString = '';
    if (conversationHistory && conversationHistory.length > 0) {
      historyString = `
RIWAYAT PERCAKAPAN:
${conversationHistory.slice(-5).map(h => `${h.role === 'user' ? 'User' : 'Dr. Gizi'}: ${h.message}`).join('\n')}
`;
    }

    // 4. Generate response with Gemini
    const prompt = `
Kamu adalah Dr. Gizi, asisten AI untuk analisis data stunting. Seorang tenaga kesehatan bertanya tentang data pasien mereka.

${contextString}
${historyString}

PERTANYAAN USER:
"${userQuestion}"

TUGAS ANDA:
Jawab pertanyaan user berdasarkan data REAL dari database di atas dalam format JSON:

{
  "answer": "Jawaban lengkap dan informatif. Gunakan data konkret dari database. Berikan penjelasan yang jelas, spesifik, dan actionable."
}

PANDUAN MENJAWAB:
1. **Akurasi Data**: Gunakan HANYA data yang tersedia dari database. Jangan membuat asumsi atau data fiktif.
2. **Relevansi**: Fokus pada pertanyaan user dengan jawaban yang lengkap dan detail.
3. **Actionable**: Berikan informasi yang bisa langsung ditindaklanjuti oleh tenaga kesehatan.
4. **Empati**: Gunakan bahasa yang supportif dan motivasional.
5. **Spesifik**: Sebutkan angka konkret, nama pasien dengan nomor pasien (jika relevan), atau pola tertentu.
4. **Empati**: Gunakan bahasa yang supportif dan motivasional.
5. **Spesifik**: Sebutkan angka konkret, nama pasien dengan nomor pasien (jika relevan), atau pola tertentu.

CONTOH PERTANYAAN & JAWABAN:
Q: "Berapa jumlah pasien risiko tinggi?"
A: "Saat ini terdapat 24 pasien dengan risiko tinggi stunting dari total 150 pasien (16%). Angka ini cukup signifikan dan memerlukan perhatian khusus."

Q: "Siapa pasien yang perlu prioritas?"
A: "Berdasarkan data, pasien dengan nomor [nomor] dan [nomor] perlu prioritas karena risiko tinggi dengan faktor yang bisa segera diintervensi."

Q: "Apa faktor risiko dominan?"
A: "Sanitasi buruk menjadi faktor dominan pada 15 dari 24 kasus risiko tinggi (62.5%), diikuti tinggi ibu rendah dan pendidikan rendah."

CATATAN:
- Jika data kosong atau tidak cukup, jelaskan dan sarankan langkah untuk mengisi data
- Jika pertanyaan di luar konteks, arahkan ke topik yang relevan
- Sebutkan nomor pasien saat mereferensikan pasien spesifik

Response HANYA JSON valid, tanpa markdown atau teks tambahan.
`;

    const result = await geminiModel.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from Gemini');
    }
    
    const chatResponse = JSON.parse(jsonMatch[0]);
    
    return {
      answer: chatResponse.answer,
      insights: [],
      suggestedQuestions: [],
      dataVisualizationHint: undefined,
    };
  } catch (error) {
    console.error('Gemini Chatbot Error:', error);
    throw new Error('Failed to process chatbot query: ' + (error as Error).message);
  }
}

export default genAI;
