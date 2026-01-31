/**
 * API Route: /api/wilayah/kota/[provinsiId]
 * Method: GET
 * 
 * Mendapatkan daftar kota/kabupaten berdasarkan provinsi dari API emsifa.com
 */

import { NextRequest, NextResponse } from 'next/server';

const API_BASE = 'https://www.emsifa.com/api-wilayah-indonesia/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provinsiId: string }> }
) {
  try {
    const { provinsiId } = await params;
    
    const response = await fetch(`${API_BASE}/regencies/${provinsiId}.json`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch regencies');
    }
    
    const regencies = await response.json();
    
    return NextResponse.json({
      success: true,
      data: regencies,
    });
  } catch (error) {
    console.error('Error fetching regencies:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data kota/kabupaten' },
      { status: 500 }
    );
  }
}
