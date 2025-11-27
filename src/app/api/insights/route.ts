import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createServerClient();

    const { data: insights, error } = await supabase
      .from('insights')
      .select('*, clients(name)')
      .eq('is_resolved', false)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      throw error;
    }

    // Transform to include client name
    const transformedInsights = (insights || []).map((insight) => ({
      ...insight,
      clientName: insight.clients?.name || 'Unknown',
      clients: undefined,
    }));

    return NextResponse.json({ insights: transformedInsights });
  } catch (err) {
    console.error('Failed to fetch insights:', err);
    return NextResponse.json(
      { error: 'Failed to fetch insights' },
      { status: 500 }
    );
  }
}
