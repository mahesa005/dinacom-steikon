/**
 * API Route: /api/stunting/explain
 * Method: POST
 * 
 * Endpoint untuk mendapatkan penjelasan prediksi dengan SHAP values
 */

import { NextRequest, NextResponse } from 'next/server';
import { explainStunting, type StuntingPredictionInput } from '@/lib/stunting-prediction';

export async function POST(request: NextRequest) {
  try {
    const body: StuntingPredictionInput = await request.json();

    // Validasi required fields
    const requiredFields = [
      'mother_height_cm',
      'father_height_cm',
      'mother_edu_level',
      'father_edu_level',
      'toilet_standard',
      'waste_mgmt_std',
    ];

    for (const field of requiredFields) {
      if (!(field in body)) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Call explanation service
    const result = await explainStunting(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.error, details: result.error.details },
        { status: result.error.status || 500 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Explanation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
