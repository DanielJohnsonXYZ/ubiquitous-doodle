import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import Anthropic from '@anthropic-ai/sdk';

export const dynamic = 'force-dynamic';

const anthropic = new Anthropic();

export async function POST(request: NextRequest) {
  try {
    const { clientId, clientName, company } = await request.json();

    if (!clientId || !clientName) {
      return NextResponse.json(
        { error: 'Client ID and name are required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Get recent communications for context
    const { data: communications } = await supabase
      .from('communications')
      .select('content, sender, timestamp')
      .eq('client_id', clientId)
      .order('timestamp', { ascending: false })
      .limit(5);

    const recentMessages = (communications || [])
      .map((c) => `${c.sender}: ${c.content}`)
      .join('\n');

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: `You are helping a consultant write a brief, friendly follow-up message to their client.

Client: ${clientName}${company ? ` (${company})` : ''}

Recent conversation context:
${recentMessages || 'No recent messages'}

Write a short, professional but warm follow-up message (2-3 sentences). Don't include a subject line, just the message body. Be conversational, not formal.`,
        },
      ],
    });

    const content = response.content[0];
    const message = content.type === 'text' ? content.text : '';

    return NextResponse.json({ message });
  } catch (err) {
    console.error('Generate message error:', err);
    return NextResponse.json(
      { error: 'Failed to generate message' },
      { status: 500 }
    );
  }
}
