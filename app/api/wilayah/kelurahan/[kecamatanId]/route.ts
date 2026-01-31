/**
 * API Route: /api/wilayah/kelurahan/[kecamatanId]
 * Method: GET
 * 
 * Mendapatkan daftar kelurahan berdasarkan kecamatan dari API emsifa.com
 */

import { NextRequest, NextResponse } from 'next/server';

const API_BASE = 'https://www.emsifa.com/api-wilayah-indonesia/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ kecamatanId: string }> }
) {
  try {
    const { kecamatanId } = await params;
    
    const response = await fetch(`${API_BASE}/villages/${kecamatanId}.json`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch villages');
    }
    
    const villages = await response.json();
    
    return NextResponse.json({
      success: true,
      data: villages,
    });
  } catch (error) {
    console.error('Error fetching villages:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data kelurahan/desa' },
      { status: 500 }
    );
  }
}
