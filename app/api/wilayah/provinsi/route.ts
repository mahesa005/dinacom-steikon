/**
 * API Route: /api/wilayah/provinsi
 * Method: GET
 * 
 * Mendapatkan daftar provinsi dari API emsifa.com
 */

import { NextResponse } from 'next/server';

const API_BASE = 'https://www.emsifa.com/api-wilayah-indonesia/api';

export async function GET() {
  try {
    const response = await fetch(`${API_BASE}/provinces.json`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch provinces');
    }
    
    const provinces = await response.json();
    
    return NextResponse.json({
      success: true,
      data: provinces,
    });
  } catch (error) {
    console.error('Error fetching provinces:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data provinsi' },
      { status: 500 }
    );
  }
}
