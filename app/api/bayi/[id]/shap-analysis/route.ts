import { NextRequest, NextResponse } from 'next/server';
import { generateSHAPInsights } from '@/lib/gemini';
import { createHasilAnalisis, getLatestHasilAnalisis } from '@/lib/db/hasil-analisis';
import { getBayiById } from '@/lib/db/bayi';

// GET: Retrieve existing SHAP analysis
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: nomorPasien } = await params;

    // Get bayi by nomorPasien first
    const bayi = await getBayiById(nomorPasien);
    if (!bayi) {
      return NextResponse.json(
        {
          success: false,
          error: 'Patient not found',
        },
        { status: 404 }
      );
    }

    // Get latest SHAP analysis from database using the actual database ID
    const latestAnalysis = await getLatestHasilAnalisis(bayi.id, 'SHAP_ANALYSIS');

    if (!latestAnalysis) {
      return NextResponse.json({
        success: false,
        message: 'Belum ada analisis SHAP untuk pasien ini',
        hasAnalysis: false,
      });
    }

    // Parse the stored JSON data
    const dataInput = JSON.parse(latestAnalysis.dataInput);
    const hasilPrediksi = JSON.parse(latestAnalysis.hasilPrediksi);

    return NextResponse.json({
      success: true,
      hasAnalysis: true,
      data: {
        id: latestAnalysis.id,
        createdAt: latestAnalysis.createdAt,
        tingkatKepercayaan: latestAnalysis.tingkatKepercayaan,
        shapResult: dataInput,
        insights: hasilPrediksi,
      },
    });
  } catch (error) {
    console.error('Error fetching SHAP analysis:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch SHAP analysis',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST: Generate new SHAP analysis
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: nomorPasien } = await params;
    const body = await request.json();

    // Validate required SHAP result data
    if (!body.shapResult) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required field: shapResult',
        },
        { status: 400 }
      );
    }

    const shapResult = body.shapResult;

    // Verify patient exists by nomorPasien
    const bayi = await getBayiById(nomorPasien);
    if (!bayi) {
      return NextResponse.json(
        {
          success: false,
          error: 'Patient not found',
        },
        { status: 404 }
      );
    }

    // Generate SHAP insights using Gemini AI
    const insights = await generateSHAPInsights(shapResult);

    // Save to database using the actual database ID
    const hasilAnalisis = await createHasilAnalisis({
      bayiId: bayi.id,
      jenisAnalisis: 'SHAP_ANALYSIS',
      hasilPrediksi: JSON.stringify(insights), // Store full insights object
      tingkatKepercayaan: shapResult.confidence,
      dataInput: JSON.stringify(shapResult), // Store SHAP result for reference
      rekomendasiTindakan: insights.rekomendasiTindakan
        .map((r) => `${r.judul}: ${r.deskripsi}`)
        .join('\n\n'),
      catatanAI: `Analisis SHAP Generated - ${insights.statusRisiko.levelRisiko}`,
    });

    return NextResponse.json({
      success: true,
      message: 'SHAP analysis generated and saved successfully',
      data: {
        id: hasilAnalisis.id,
        createdAt: hasilAnalisis.createdAt,
        insights,
      },
    });
  } catch (error) {
    console.error('Error generating SHAP analysis:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate SHAP analysis',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
