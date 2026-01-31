import { NextRequest, NextResponse } from 'next/server';
import { generateText } from '@/lib/gemini';
import { prisma } from '@/lib/prisma';

// GET /api/stunting/insight - Generate weekly AI insight based on patient data
export async function GET(request: NextRequest) {
  try {
    // Get all babies with their latest control data
    const bayiList = await prisma.bayi.findMany({
      include: {
        historyKontrol: {
          orderBy: { tanggalKontrol: 'desc' },
          take: 1,
        },
      },
    });

    // Calculate statistics
    const totalBayi = bayiList.length;
    let highRisk = 0;
    let mediumRisk = 0;
    let lowRisk = 0;
    let needsCheckup = 0;

    const today = new Date();
    
    bayiList.forEach((bayi) => {
      const latestControl = bayi.historyKontrol[0];
      
      if (latestControl) {
        if (latestControl.statusStunting === 'HIGH') highRisk++;
        else if (latestControl.statusStunting === 'MEDIUM') mediumRisk++;
        else lowRisk++;

        // Check if needs checkup (last control > 30 days ago)
        const lastControlDate = new Date(latestControl.tanggalKontrol);
        const daysSinceControl = Math.floor((today.getTime() - lastControlDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceControl > 30) needsCheckup++;
      } else {
        // No control history yet, needs first checkup
        needsCheckup++;
        mediumRisk++; // Default to medium risk if no data
      }
    });

    // If no data, return default insight
    if (totalBayi === 0) {
      return NextResponse.json({
        success: true,
        data: {
          insight: 'Belum ada data pasien yang terdaftar. Mulai daftarkan bayi untuk mendapatkan insight AI.',
          stats: { totalBayi: 0, highRisk: 0, mediumRisk: 0, lowRisk: 0, needsCheckup: 0 },
        },
      });
    }

    // Generate insight using Gemini
    const prompt = `
Berdasarkan data berikut dari sistem pemantauan stunting Puskesmas:
- Total bayi terdaftar: ${totalBayi}
- Risiko tinggi stunting: ${highRisk} bayi (${Math.round((highRisk / totalBayi) * 100)}%)
- Risiko sedang: ${mediumRisk} bayi (${Math.round((mediumRisk / totalBayi) * 100)}%)
- Risiko rendah: ${lowRisk} bayi (${Math.round((lowRisk / totalBayi) * 100)}%)
- Butuh kontrol segera (>30 hari tanpa kontrol): ${needsCheckup} bayi

Sebagai Dr. Gizi, berikan insight singkat (2-3 kalimat) untuk petugas kesehatan mengenai:
1. Kondisi keseluruhan
2. Prioritas tindakan yang perlu dilakukan minggu ini

Format: paragraf singkat tanpa bullet point, langsung ke intinya.
`;

    try {
      const insight = await generateText(prompt);
      
      return NextResponse.json({
        success: true,
        data: {
          insight: insight.trim(),
          stats: { totalBayi, highRisk, mediumRisk, lowRisk, needsCheckup },
        },
      });
    } catch (geminiError) {
      // If Gemini fails, return a default insight based on data
      console.error('Gemini API error:', geminiError);
      
      let defaultInsight = '';
      if (highRisk > 0) {
        defaultInsight = `Terdapat ${highRisk} bayi dengan risiko tinggi stunting yang memerlukan perhatian segera. `;
      }
      if (needsCheckup > 0) {
        defaultInsight += `${needsCheckup} bayi belum melakukan kontrol dalam 30 hari terakhir dan perlu dijadwalkan kunjungan.`;
      }
      if (!defaultInsight) {
        defaultInsight = `Dari ${totalBayi} bayi yang terdaftar, mayoritas dalam kondisi baik. Tetap lakukan pemantauan rutin untuk menjaga kesehatan optimal.`;
      }

      return NextResponse.json({
        success: true,
        data: {
          insight: defaultInsight,
          stats: { totalBayi, highRisk, mediumRisk, lowRisk, needsCheckup },
        },
      });
    }
  } catch (error) {
    console.error('Get insight error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil insight AI' },
      { status: 500 }
    );
  }
}
