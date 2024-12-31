import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  const VERCEL_CLIENT_ID = process.env.VERCEL_CLIENT_ID;
  const VERCEL_CLIENT_SECRET = process.env.VERCEL_CLIENT_SECRET;

  if (!VERCEL_CLIENT_ID || !VERCEL_CLIENT_SECRET) {
    return NextResponse.json(
      { error: 'Missing environment variables' },
      { status: 500 }
    );
  }

  try {
    // Exchange the code for an access token
    const tokenResponse = await fetch('https://api.vercel.com/v2/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: VERCEL_CLIENT_ID,
        client_secret: VERCEL_CLIENT_SECRET,
        code,
        redirect_uri: process.env.VERCEL_REDIRECT_URI || `${process.env.VERCEL_URL}/api/auth/callback`,
      }),
    });

    const data = await tokenResponse.json();

    if (!tokenResponse.ok) {
      throw new Error(data.error || 'Failed to exchange code for token');
    }

    // Here you would typically store the access token securely
    // For now, we'll just redirect back to the homepage
    // In a real app, you'd want to store this in a secure session or cookie
    return NextResponse.redirect(new URL('/', request.url));
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
} 