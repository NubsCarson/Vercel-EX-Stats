import { NextResponse } from 'next/server';

export async function GET() {
  // You'll need to create these environment variables
  const VERCEL_CLIENT_ID = process.env.VERCEL_CLIENT_ID;
  const REDIRECT_URI = process.env.VERCEL_REDIRECT_URI || `${process.env.VERCEL_URL}/api/auth/callback`;

  if (!VERCEL_CLIENT_ID) {
    return NextResponse.json(
      { error: 'Missing VERCEL_CLIENT_ID environment variable' },
      { status: 500 }
    );
  }

  // Construct the Vercel OAuth URL
  const authUrl = new URL('https://vercel.com/oauth/authorize');
  authUrl.searchParams.append('client_id', VERCEL_CLIENT_ID);
  authUrl.searchParams.append('redirect_uri', REDIRECT_URI);
  authUrl.searchParams.append('scope', 'user deployments projects');

  // Redirect to Vercel's OAuth page
  return NextResponse.redirect(authUrl.toString());
} 