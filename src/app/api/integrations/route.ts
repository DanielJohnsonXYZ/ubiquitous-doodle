import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createServerClient();

    const { data: integrations, error } = await supabase
      .from('integrations')
      .select('id, type, connected_at, last_sync, metadata');

    if (error) {
      throw error;
    }

    return NextResponse.json({ integrations: integrations || [] });
  } catch (err) {
    console.error('Failed to fetch integrations:', err);
    return NextResponse.json(
      { error: 'Failed to fetch integrations' },
      { status: 500 }
    );
  }
}
