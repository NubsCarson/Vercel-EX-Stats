import { NextResponse } from 'next/server';

export async function GET() {
  const token = process.env.VERCEL_ACCESS_TOKEN?.trim();

  if (!token) {
    return NextResponse.json(
      { error: 'Missing VERCEL_ACCESS_TOKEN environment variable' },
      { status: 500 }
    );
  }

  try {
    // Test the token by making a request to Vercel's API
    const response = await fetch('https://api.vercel.com/v2/user', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    console.log('Vercel API Response:', {
      status: response.status,
      data: data
    });

    if (!response.ok) {
      return NextResponse.json(
        { 
          error: 'Token verification failed',
          details: data
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to verify token', 
        details: { message: error?.message || 'Unknown error' } 
      },
      { status: 500 }
    );
  }
} 