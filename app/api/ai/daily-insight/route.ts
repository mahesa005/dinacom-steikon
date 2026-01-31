import { NextResponse } from 'next/server';
import { generateDailyInsight } from '@/lib/gemini';

export async function GET() {
  try {
    const result = await generateDailyInsight();
    
    return NextResponse.json({ 
      success: true,
      insight: result.insight // Extract the insight string from the result object
    });
  } catch (error) {
    console.error('Error generating daily insight:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to generate daily insight',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
