import { NextRequest, NextResponse } from 'next/server';
import { createBayi, getAllBayi } from '@/lib/db';
import { generateJadwalPemeriksaan } from '@/lib/jadwal';
import { predictStunting, explainStunting, type StuntingPredictionInput } from '@/lib/stunting-prediction';

// GET /api/bayi - Get all bayi dengan filter
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const filters = {
      statusAktif: searchParams.get('statusAktif') === 'true',
      provinsi: searchParams.get('provinsi') || undefined,
      kota: searchParams.get('kota') || undefined,
      kecamatan: searchParams.get('kecamatan') || undefined,
      kelurahan: searchParams.get('kelurahan') || undefined,
      search: searchParams.get('search') || undefined,
    };

    const bayiList = await getAllBayi(filters);

    return NextResponse.json({
      success: true,
      data: bayiList,
      count: bayiList.length,
    });
  } catch (error) {
    console.error('Get bayi error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data bayi' },
      { status: 500 }
    );
  }
}

// POST /api/bayi - Create bayi baru
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validasi required fields (exclude createdById karena akan di-handle otomatis)
    const requiredFields = [
      'nomorPasien', 'nama', 'tanggalLahir', 'tempatLahir', 'jenisKelamin',
      'beratLahir', 'panjangLahir', 'namaIbu', 'namaAyah', 'nomorHpOrangTua',
      'alamat'
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Field ${field} wajib diisi` },
          { status: 400 }
        );
      }
    }

    // Convert tanggalLahir ke Date
    body.tanggalLahir = new Date(body.tanggalLahir);

    // Handle NIK: jika kosong, set ke null untuk menghindari unique constraint error
    if (!body.nik || body.nik.trim() === '') {
      body.nik = null;
    }

    // Extract parent data untuk prediction (tidak masuk database bayi)
    const parentData = {
      tinggiIbu: body.tinggiIbu,
      tinggiAyah: body.tinggiAyah,
      pendidikanIbu: body.pendidikanIbu,
      pendidikanAyah: body.pendidikanAyah,
      fasilitas_toilet: body.fasilitas_toilet,
      pengelolaan_sampah: body.pengelolaan_sampah,
    };

    // Remove parent data dari body sebelum create bayi
    const { tinggiIbu, tinggiAyah, pendidikanIbu, pendidikanAyah, fasilitas_toilet, pengelolaan_sampah, ...bayiData } = body;

    const bayi = await createBayi(bayiData);

    // Auto create first control schedule (1 week from now at 09:00)
    const firstControlDate = new Date();
    firstControlDate.setDate(firstControlDate.getDate() + 7);
  
    // Generate jadwal pemeriksaan otomatis sampai umur 2 tahun
    // Default risk level: MEDIUM (akan di-update setelah pemeriksaan pertama)
    // Gunakan bayi.id (internal ID), bukan nomorPasien
    try {
      await generateJadwalPemeriksaan(
        bayi.id, // Internal ID dari database
        bayi.tanggalLahir,
        'MEDIUM' // Default risk level untuk bayi baru
      );
    } catch (jadwalError) {
      console.error('Error generating jadwal:', jadwalError);
      // Lanjutkan walaupun gagal membuat jadwal
    }

    // Auto-predict stunting risk jika data orang tua lengkap
    let analisisAI = null;
    if (parentData.tinggiIbu && parentData.tinggiAyah && 
        parentData.pendidikanIbu !== undefined && parentData.pendidikanAyah !== undefined &&
        parentData.fasilitas_toilet !== undefined && parentData.pengelolaan_sampah !== undefined) {
      
      try {
        console.log('[AUTO-PREDICT] Starting prediction for new baby:', bayi.nama);
        
        // Prepare prediction input
        const predictionInput: StuntingPredictionInput = {
          mother_height_cm: parentData.tinggiIbu,
          father_height_cm: parentData.tinggiAyah,
          mother_edu_level: parentData.pendidikanIbu,
          father_edu_level: parentData.pendidikanAyah,
          toilet_standard: parentData.fasilitas_toilet,
          waste_mgmt_std: parentData.pengelolaan_sampah,
        };

        // Step 1: Call prediction API
        const predictionResult = await predictStunting(predictionInput);
        if (!predictionResult.success) {
          console.error('[AUTO-PREDICT] Prediction failed:', predictionResult.error);
          throw new Error('Prediction failed');
        }

        // Step 2: Call explain API untuk SHAP values
        const explainResult = await explainStunting(predictionInput);
        if (!explainResult.success) {
          console.error('[AUTO-PREDICT] Explain failed:', explainResult.error);
          throw new Error('Explain failed');
        }

        console.log('[AUTO-PREDICT] Calling shap-analysis endpoint to generate insights...');

        // Step 3: Call POST shap-analysis endpoint untuk generate insights dengan Gemini
        // dan otomatis save ke database
        const shapAnalysisResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/bayi/${bayi.nomorPasien}/shap-analysis`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              shapResult: {
                is_stunting: predictionResult.data.is_stunting ? 1 : 0,
                stunting_risk: predictionResult.data.is_stunting ? 'HIGH' : 'LOW',
                confidence: predictionResult.data.confidence,
                shap_values: explainResult.data.shap_values,
                input_features: predictionInput,
              },
            }),
          }
        );

        if (!shapAnalysisResponse.ok) {
          const errorData = await shapAnalysisResponse.json();
          console.error('[AUTO-PREDICT] SHAP analysis failed:', errorData);
          throw new Error('SHAP analysis failed');
        }

        const shapAnalysisData = await shapAnalysisResponse.json();
        analisisAI = shapAnalysisData.data;

        console.log('[AUTO-PREDICT] Analysis completed and saved successfully:', analisisAI.id);
      } catch (predictionError) {
        console.error('[AUTO-PREDICT] Error during auto-prediction:', predictionError);
        // Continue even if auto-prediction fails
      }
    } else {
      console.log('[AUTO-PREDICT] Skipped - incomplete parent data');
    }

    return NextResponse.json({
      success: true,
      message: analisisAI 
        ? 'Bayi berhasil didaftarkan, jadwal pemeriksaan telah dibuat, dan analisis AI telah dilakukan'
        : 'Bayi berhasil didaftarkan dan jadwal pemeriksaan telah dibuat',
      data: {
        bayi,
        analisisAI: analisisAI ? {
          id: analisisAI.id,
          createdAt: analisisAI.createdAt,
          insights: analisisAI.insights,
        } : null,
      },
    });
  } catch (error: any) {
    console.error('Create bayi error:', error);
    console.error('Error stack:', error?.stack);
    console.error('Error message:', error?.message);

    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Nomor pasien atau NIK sudah terdaftar' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Gagal mendaftarkan bayi',
        details: error?.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}
