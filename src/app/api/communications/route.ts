import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createServerClient();

    // Get communications
    const { data: communications, error } = await supabase
      .from('communications')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Communications query error:', error);
      throw error;
    }

    console.log('Communications found:', communications?.length || 0);

    // Get clients to map names
    const { data: clients } = await supabase.from('clients').select('id, name');
    const clientMap: Record<string, string> = {};
    (clients || []).forEach((c: { id: string; name: string }) => {
      clientMap[c.id] = c.name;
    });

    // Transform to include client name
    const transformedCommunications = (communications || []).map((comm) => ({
      ...comm,
      client_name: clientMap[comm.client_id] || 'Unknown',
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
