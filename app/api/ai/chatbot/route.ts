import { NextRequest, NextResponse } from 'next/server';
import { chatbotQueryDatabase } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, conversationHistory } = body;

    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Question is required' },
        { status: 400 }
      );
    }

    // Call Gemini chatbot function
    const result = await chatbotQueryDatabase(question, conversationHistory);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Chatbot API Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Check if it's a rate limit error
    const isRateLimitError = errorMessage.includes('429') || 
                              errorMessage.includes('Too Many Requests') ||
                              errorMessage.includes('quota');
    
    // Check if it's a network error
    const isNetworkError = errorMessage.includes('fetch') || 
                           errorMessage.includes('ECONNREFUSED') ||
                           errorMessage.includes('network');
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process chatbot request',
        message: errorMessage,
        errorType: isRateLimitError ? 'RATE_LIMIT' : isNetworkError ? 'NETWORK' : 'UNKNOWN',
        suggestion: isRateLimitError 
          ? 'API quota exceeded. Please wait a moment or upgrade your Gemini API plan.'
          : isNetworkError
          ? 'Network connection failed. Please check your internet connection.'
          : 'An unexpected error occurred. Please try again or contact support.'
      },
      { status: isRateLimitError ? 429 : 500 }
    );
  }
}
