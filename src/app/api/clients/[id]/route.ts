import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const supabase = createServerClient();

    // Fetch client
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();

    if (clientError || !client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Fetch client's communications
    const { data: communications } = await supabase
      .from('communications')
      .select('*')
      .eq('client_id', id)
      .order('timestamp', { ascending: false })
      .limit(20);

    // Fetch client's insights
    const { data: insights } = await supabase
      .from('insights')
      .select('*')
      .eq('client_id', id)
      .eq('is_resolved', false)
      .order('created_at', { ascending: false })
      .limit(10);

    return NextResponse.json({
      client,
      communications: communications || [],
      insights: insights || [],
    });
  } catch (err) {
    console.error('Failed to fetch client:', err);
    return NextResponse.json(
      { error: 'Failed to fetch client' },
      { status: 500 }
    );
  }
}
