import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { analyzeConversation } from '@/lib/claude';
import type { Client, Communication } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const supabase = createServerClient();

    // Get unanalyzed communications
    const { data: communications, error: commError } = await supabase
      .from('communications')
      .select('*')
      .eq('analyzed', false)
      .order('timestamp', { ascending: false })
      .limit(10);

    if (commError) {
      console.error('Communications query error:', commError);
      throw commError;
    }

    if (!communications || communications.length === 0) {
      return NextResponse.json({ message: 'No new communications to analyze', analyzed: 0 });
    }

    // Get all clients
    const { data: clients } = await supabase.from('clients').select('*');
    const clientMap: Record<string, Client> = {};
    (clients || []).forEach((c: Client) => {
      clientMap[c.id] = c;
    });

    // Pre-fetch recent history for all relevant clients (fixes N+1 query)
    const clientIds = Array.from(new Set(communications.map(c => c.client_id)));
    const commIds = communications.map(c => c.id);

    const { data: allHistory } = await supabase
      .from('communications')
      .select('*')
      .in('client_id', clientIds)
      .not('id', 'in', `(${commIds.join(',')})`)
      .order('timestamp', { ascending: false })
      .limit(50); // Get enough for all clients

    // Group history by client_id
    const historyByClient: Record<string, Communication[]> = {};
    (allHistory || []).forEach((h: Communication) => {
      if (!historyByClient[h.client_id]) {
        historyByClient[h.client_id] = [];
      }
      if (historyByClient[h.client_id].length < 3) {
        historyByClient[h.client_id].push(h);
      }
    });

    const results = [];

    for (const comm of communications) {
      const client = clientMap[comm.client_id];

      if (!client) {
        console.error('No client found for communication:', comm.id);
        continue;
      }

      // Use pre-fetched history
      const history = historyByClient[client.id] || [];

      // Analyze with Claude
      const analysis = await analyzeConversation(
        comm as Communication,
        client,
        (history as Communication[]) || []
      );

      // Store analysis result
      await supabase.from('analysis_cache').upsert({
        communication_id: comm.id,
        ...analysis,
        analyzed_at: new Date().toISOString(),
      }, {
        onConflict: 'communication_id',
      });

      // Calculate sentiment trend from history
      let sentimentTrend = 'stable';
      if (history.length > 0) {
        // Compare current sentiment with recent average (if we had cached analysis)
        const recentSentiments = history.map(() => 0); // Default neutral
        const avgRecent = recentSentiments.reduce((a, b) => a + b, 0) / recentSentiments.length;
        if (analysis.sentiment_score > avgRecent + 0.3) sentimentTrend = 'improving';
        else if (analysis.sentiment_score < avgRecent - 0.3) sentimentTrend = 'declining';
      }

      // Create insights with specific titles from Claude
      if (analysis.risk_signals.length > 0) {
        const insightTitle = analysis.insight_title || `Risk: ${analysis.risk_signals[0].slice(0, 50)}`;
        await supabase.from('insights').insert({
          client_id: client.id,
          communication_id: comm.id,
          type: 'risk',
          severity: analysis.urgency,
          title: insightTitle,
          description: analysis.risk_signals.join('. '),
          evidence: [`"${comm.content.slice(0, 150)}..." - ${comm.sender} via ${comm.source}`],
          suggested_action: analysis.suggested_response || 'Review and respond promptly',
        });
      }

      if (analysis.opportunity_signals.length > 0) {
        const insightTitle = analysis.insight_title || `Opportunity: ${analysis.opportunity_signals[0].slice(0, 50)}`;
        await supabase.from('insights').insert({
          client_id: client.id,
          communication_id: comm.id,
          type: 'opportunity',
          severity: analysis.urgency === 'high' ? 'high' : 'medium',
          title: insightTitle,
          description: analysis.opportunity_signals.join('. '),
          evidence: [`"${comm.content.slice(0, 150)}..." - ${comm.sender} via ${comm.source}`],
          suggested_action: analysis.suggested_response || 'Follow up to explore further',
        });
      }

      // Create sentiment trend insight if declining
      if (sentimentTrend === 'declining' && analysis.sentiment === 'negative') {
        await supabase.from('insights').insert({
          client_id: client.id,
          communication_id: comm.id,
          type: 'risk',
          severity: 'medium',
          title: `Declining sentiment trend with ${client.name}`,
          description: `Communication sentiment is trending negative. Recent topics: ${analysis.key_topics.join(', ') || 'general discussion'}`,
          evidence: [`Current sentiment: ${analysis.sentiment} (${analysis.sentiment_score})`],
          suggested_action: 'Schedule a check-in call to address any concerns',
        });
      }

      // Update client health score - weighted by urgency and trend
      const urgencyMultiplier = analysis.urgency === 'high' ? 1.5 : analysis.urgency === 'medium' ? 1.2 : 1;
      const trendBonus = sentimentTrend === 'improving' ? 5 : sentimentTrend === 'declining' ? -5 : 0;
      const sentimentImpact = Math.round(analysis.sentiment_score * 10 * urgencyMultiplier) + trendBonus;
      const newScore = Math.max(0, Math.min(100, client.health_score + sentimentImpact));

      // Determine new status - use OR logic for at_risk
      let newStatus = client.status;
      if (analysis.risk_signals.length > 0 || analysis.urgency === 'high') {
        newStatus = 'at_risk';
      } else if (analysis.opportunity_signals.length > 0) {
        newStatus = 'opportunity';
      } else if (newScore >= 70 && sentimentTrend !== 'declining') {
        newStatus = 'healthy';
      }

      await supabase
        .from('clients')
        .update({
          health_score: newScore,
          status: newStatus,
        })
        .eq('id', client.id);

      // Mark communication as analyzed
      await supabase
        .from('communications')
        .update({ analyzed: true })
        .eq('id', comm.id);

      results.push({
        communication_id: comm.id,
        client_name: client.name,
        analysis,
      });
    }

    return NextResponse.json({
      success: true,
      analyzed: results.length,
      results,
    });
  } catch (err) {
    console.error('Analysis error:', err);
    return NextResponse.json(
      { error: 'Analysis failed' },
      { status: 500 }
    );
  }
}
