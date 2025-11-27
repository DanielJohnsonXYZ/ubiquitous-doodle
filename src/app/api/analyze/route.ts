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
      .select('*, clients(*)')
      .eq('analyzed', false)
      .order('timestamp', { ascending: false })
      .limit(10);

    if (commError) {
      throw commError;
    }

    if (!communications || communications.length === 0) {
      return NextResponse.json({ message: 'No new communications to analyze' });
    }

    const results = [];

    for (const comm of communications) {
      const client = comm.clients as Client;

      // Get recent history for context
      const { data: history } = await supabase
        .from('communications')
        .select('*')
        .eq('client_id', client.id)
        .neq('id', comm.id)
        .order('timestamp', { ascending: false })
        .limit(5);

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

      // Create insights based on analysis
      if (analysis.risk_signals.length > 0) {
        await supabase.from('insights').insert({
          client_id: client.id,
          communication_id: comm.id,
          type: 'risk',
          severity: analysis.urgency,
          title: 'Risk signal detected',
          description: analysis.risk_signals.join('. '),
          evidence: [comm.content.slice(0, 200)],
          suggested_action: 'Review and respond',
        });
      }

      if (analysis.opportunity_signals.length > 0) {
        await supabase.from('insights').insert({
          client_id: client.id,
          communication_id: comm.id,
          type: 'opportunity',
          severity: 'medium',
          title: 'Opportunity detected',
          description: analysis.opportunity_signals.join('. '),
          evidence: [comm.content.slice(0, 200)],
          suggested_action: 'Follow up',
        });
      }

      // Update client health score based on sentiment
      const sentimentImpact = Math.round(analysis.sentiment_score * 10);
      const newScore = Math.max(0, Math.min(100, client.health_score + sentimentImpact));

      // Determine new status
      let newStatus = client.status;
      if (analysis.risk_signals.length > 0 && analysis.urgency === 'high') {
        newStatus = 'at_risk';
      } else if (analysis.opportunity_signals.length > 0) {
        newStatus = 'opportunity';
      } else if (newScore >= 70) {
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
