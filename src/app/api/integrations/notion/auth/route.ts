import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const NOTION_TOKEN = process.env.NOTION_TOKEN;

export async function GET() {
  // Use internal integration token (simpler than OAuth for single-user apps)
  if (!NOTION_TOKEN) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/integrations?error=notion_token_not_configured`
    );
  }

  try {
    // Verify the token works by fetching user info
    const userResponse = await fetch('https://api.notion.com/v1/users/me', {
      headers: {
        'Authorization': `Bearer ${NOTION_TOKEN}`,
        'Notion-Version': '2022-06-28',
      },
    });

    if (!userResponse.ok) {
      console.error('Notion token invalid');
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/integrations?error=invalid_notion_token`
      );
    }

    const userData = await userResponse.json();

    // Save to Supabase
    const supabase = createServerClient();

    const { error: dbError } = await supabase
      .from('integrations')
      .upsert({
        type: 'notion',
        access_token: NOTION_TOKEN,
        refresh_token: null,
        expires_at: null,
        metadata: {
          name: userData.name || 'Notion Integration',
          type: userData.type,
          bot_id: userData.bot?.owner?.user?.id || userData.id,
        },
        connected_at: new Date().toISOString(),
      }, {
        onConflict: 'type',
      });

    if (dbError) {
      throw dbError;
    }

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/integrations?success=notion`
    );
  } catch (err) {
    console.error('Notion connection error:', err);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/integrations?error=connection_failed`
    );
  }
}
