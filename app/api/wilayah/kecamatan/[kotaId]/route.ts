/**
 * API Route: /api/wilayah/kecamatan/[kotaId]
 * Method: GET
 * 
 * Mendapatkan daftar kecamatan berdasarkan kota dari API emsifa.com
 */

import { NextRequest, NextResponse } from 'next/server';

const API_BASE = 'https://www.emsifa.com/api-wilayah-indonesia/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ kotaId: string }> }
) {
  try {
    const { kotaId } = await params;
    
    const response = await fetch(`${API_BASE}/districts/${kotaId}.json`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch districts');
    }
    
    const districts = await response.json();
    
    return NextResponse.json({
      success: true,
      data: districts,
    });
  } catch (error) {
    console.error('Error fetching districts:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data kecamatan' },
      { status: 500 }
    );
  }
}
