import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { type: string } }
) {
  try {
    const { type } = params;
    const supabase = createServerClient();

    // Check for specific account ID (for multi-account support)
    const url = new URL(request.url);
    const accountId = url.searchParams.get('id');

    let query = supabase.from('integrations').delete();

    if (accountId) {
      // Delete specific account by ID
      query = query.eq('id', accountId);
    } else {
      // Delete all accounts of this type (backwards compatible)
      query = query.eq('type', type);
    }

    const { error } = await query;

    if (error) {
      console.error('Failed to delete integration:', error);
      return NextResponse.json(
        { error: 'Failed to disconnect' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Disconnect error:', err);
    return NextResponse.json(
      { error: 'Failed to disconnect' },
      { status: 500 }
    );
  }
}
