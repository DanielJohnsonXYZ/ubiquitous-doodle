import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { analyzeTranscript } from '@/lib/claude';
import type { Client } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      client_id,
      content,
      title,
      meeting_type,
      attendees
    } = body;

    if (!client_id || !content) {
      return NextResponse.json(
        { error: 'client_id and content are required' },
        { status: 400 }
      );
    }

    if (content.length < 50) {
      return NextResponse.json(
        { error: 'Content too short. Please provide more context.' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Get client with full context
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', client_id)
      .single();

    if (clientError || !client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Get previous concerns from recent insights
    const { data: recentInsights } = await supabase
      .from('insights')
      .select('title, description')
      .eq('client_id', client_id)
      .eq('type', 'risk')
      .order('created_at', { ascending: false })
      .limit(5);

    const previousConcerns = recentInsights?.map(i => i.title) || [];

    // Analyze with deep analysis
    const analysis = await analyzeTranscript(
      content,
      client as Client,
      {
        meetingType: meeting_type,
        attendees: attendees,
        previousConcerns,
      }
    );

    // Store the transcript as a communication
    const { data: comm, error: commError } = await supabase
      .from('communications')
      .insert({
        client_id,
        source: 'transcript',
        source_id: `transcript_${Date.now()}`,
        subject: title || `Meeting notes - ${new Date().toLocaleDateString()}`,
        content: content.slice(0, 50000), // Store full transcript
        sender: 'Meeting',
        timestamp: new Date().toISOString(),
        analyzed: true,
      })
      .select()
      .single();

    if (commError) {
      console.error('Failed to store transcript:', commError);
    }

    // Store each insight
    for (const insight of analysis.insights) {
      await supabase.from('insights').insert({
        client_id,
        communication_id: comm?.id,
        type: insight.type === 'win' ? 'opportunity' : insight.type === 'concern' ? 'risk' : insight.type as 'risk' | 'opportunity',
        severity: insight.impact,
        title: insight.title,
        description: `${insight.detail}${insight.quote ? `\n\nQuote: "${insight.quote}"` : ''}`,
        evidence: insight.quote ? [insight.quote] : [],
        suggested_action: `${insight.action}${insight.deadline ? ` (${insight.deadline})` : ''}`,
      });
    }

    // Store commitments as action_needed insights
    for (const commitment of analysis.commitments) {
      await supabase.from('insights').insert({
        client_id,
        communication_id: comm?.id,
        type: 'action_needed',
        severity: commitment.status === 'at_risk' ? 'high' : 'medium',
        title: `Commitment: ${commitment.what}`,
        description: `${commitment.who} committed to: ${commitment.what}${commitment.when ? ` by ${commitment.when}` : ''}`,
        evidence: [],
        suggested_action: commitment.status === 'at_risk' ? 'Follow up immediately' : 'Track for completion',
      });
    }

    // Update client health and status based on analysis
    const sentimentImpact = Math.round(analysis.sentiment_score * 15);
    const trajectoryBonus = analysis.relationship.trajectory === 'improving' ? 5
      : analysis.relationship.trajectory === 'declining' ? -10 : 0;

    const newScore = Math.max(0, Math.min(100, client.health_score + sentimentImpact + trajectoryBonus));

    let newStatus = client.status;
    if (analysis.relationship.trajectory === 'declining' || analysis.relationship.trust_level === 'strained') {
      newStatus = 'at_risk';
    } else if (analysis.insights.some(i => i.type === 'opportunity')) {
      newStatus = 'opportunity';
    } else if (newScore >= 70) {
      // If not declining (handled above) and score is good, mark healthy
      newStatus = 'healthy';
    }

    // Update known concerns if new ones found
    const newConcerns = analysis.insights
      .filter(i => i.type === 'risk' || i.type === 'concern')
      .map(i => i.title);

    const updatedConcerns = Array.from(new Set([
      ...(client.known_concerns || []),
      ...newConcerns
    ])).slice(0, 10); // Keep last 10

    await supabase
      .from('clients')
      .update({
        health_score: newScore,
        status: newStatus,
        last_contact: new Date().toISOString(),
        known_concerns: updatedConcerns,
      })
      .eq('id', client_id);

    return NextResponse.json({
      success: true,
      analysis,
      stored: {
        communication_id: comm?.id,
        insights_created: analysis.insights.length,
        commitments_tracked: analysis.commitments.length,
      },
      client_updated: {
        health_score: newScore,
        status: newStatus,
      },
    });
  } catch (err) {
    console.error('Transcript analysis error:', err);
    return NextResponse.json(
      { error: 'Analysis failed' },
      { status: 500 }
    );
  }
}
