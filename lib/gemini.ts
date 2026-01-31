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
  model: 'gemini-pro',
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
      "icon": "",  // Icon removed
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
    if (shapResult.confidence < 0.3) levelRisiko = 'Risiko Rendah';
    else if (shapResult.confidence < 0.6) levelRisiko = 'Risiko Sedang';
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

export default genAI;
