import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { generateDigestSummary } from '@/lib/claude';
import type { Client, Insight } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const supabase = createServerClient();
    const today = new Date().toISOString().split('T')[0];

    // Delete existing digest for today to allow regeneration
    await supabase
      .from('digests')
      .delete()
      .eq('date', today);

    // Get all clients
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .order('health_score', { ascending: true });

    if (clientsError) throw clientsError;

    // Get recent insights (last 7 days, not filtered by is_resolved as column may not exist)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: insights, error: insightsError } = await supabase
      .from('insights')
      .select('*')
      .gte('created_at', weekAgo);

    // Log for debugging
    console.log('Insights found:', insights?.length || 0);

    if (insightsError) {
      console.error('Insights query error:', insightsError);
      // Don't throw - continue with empty insights if table issues
    }

    // Get recent communications for additional context
    const { data: communications } = await supabase
      .from('communications')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(20);

    console.log('Communications found:', communications?.length || 0);

    // Group insights by client, and include communication summaries if no insights
    const clientInsights = (clients || []).map((client: Client) => {
      const clientInsightsList = (insights || [])
        .filter((i: Insight) => i.client_id === client.id)
        .map((i: Insight) => i.description);

      // If no insights, create summaries from communications
      if (clientInsightsList.length === 0) {
        const clientComms = (communications || [])
          .filter((c: { client_id: string; content: string; sender: string }) => c.client_id === client.id)
          .slice(0, 3);

        if (clientComms.length > 0) {
          clientInsightsList.push(
            ...clientComms.map(c => `Recent message from ${c.sender}: "${c.content.slice(0, 100)}..."`)
          );
        }
      }

      return {
        client,
        insights: clientInsightsList,
      };
    }).filter(({ insights }) => insights.length > 0);

    // Generate summary with Claude
    const summary = await generateDigestSummary(
      clients || [],
      clientInsights
    );

    // Identify at-risk clients and opportunities
    const atRiskClients = (clients || [])
      .filter((c: Client) => c.status === 'at_risk')
      .map((c: Client) => c.id);

    const opportunities = (clients || [])
      .filter((c: Client) => c.status === 'opportunity')
      .map((c: Client) => c.id);

    // Create action items
    const actionItems = (insights || [])
      .filter((i: Insight) => i.type === 'risk' || i.type === 'action_needed')
      .slice(0, 5)
      .map((i: Insight) => {
        const client = (clients || []).find((c: Client) => c.id === i.client_id);
        return {
          client_id: i.client_id,
          client_name: client?.name || 'Unknown',
          type: i.type === 'risk' ? 'risk' : 'check_in',
          reason: i.description,
          suggested_message: i.suggested_message,
        };
      });

    // Save digest
    const { data: digest, error: digestError } = await supabase
      .from('digests')
      .insert({
        date: today,
        summary,
        at_risk_clients: atRiskClients,
        opportunities,
        action_items: actionItems,
      })
      .select()
      .single();

    if (digestError) throw digestError;

    return NextResponse.json({
      success: true,
      digest,
    });
  } catch (err) {
    console.error('Digest generation error:', err);
    return NextResponse.json(
      { error: 'Digest generation failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabase = createServerClient();

    // Get latest digest
    const { data: digest, error } = await supabase
      .from('digests')
      .select('*')
      .order('date', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return NextResponse.json({ digest });
  } catch (err) {
    console.error('Fetch digest error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch digest' },
      { status: 500 }
    );
  }
}
