import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createServerClient();

    const { data: communications, error } = await supabase
      .from('communications')
      .select('*, clients(name)')
      .order('timestamp', { ascending: false })
      .limit(50);

    if (error) {
      throw error;
    }

    // Transform to include client name
    const transformedCommunications = (communications || []).map((comm) => ({
      ...comm,
      client_name: comm.clients?.name || 'Unknown',
      clients: undefined,
    }));

    return NextResponse.json({ communications: transformedCommunications });
  } catch (err) {
    console.error('Failed to fetch communications:', err);
    return NextResponse.json(
      { error: 'Failed to fetch communications' },
      { status: 500 }
    );
  }
}
