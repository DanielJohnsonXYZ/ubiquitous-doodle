import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const SLACK_CLIENT_ID = process.env.SLACK_CLIENT_ID!;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/slack/callback`;

const SCOPES = [
  'channels:history',
  'channels:read',
  'im:history',
  'im:read',
  'users:read',
].join(',');

export async function GET() {
  const authUrl = new URL('https://slack.com/oauth/v2/authorize');

  authUrl.searchParams.set('client_id', SLACK_CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
  authUrl.searchParams.set('user_scope', SCOPES);

  return NextResponse.redirect(authUrl.toString());
}
