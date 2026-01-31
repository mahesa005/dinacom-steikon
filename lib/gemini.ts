import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not defined in environment variables');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Model configuration
export const geminiModel = genAI.getGenerativeModel({ 
  model: 'gemini-pro' 
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

export default genAI;
