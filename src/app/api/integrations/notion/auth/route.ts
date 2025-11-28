import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const NOTION_CLIENT_ID = process.env.NOTION_CLIENT_ID!;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/notion/callback`;

export async function GET() {
  const authUrl = new URL('https://api.notion.com/v1/oauth/authorize');

  authUrl.searchParams.set('client_id', NOTION_CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('owner', 'user');

  return NextResponse.redirect(authUrl.toString());
}
