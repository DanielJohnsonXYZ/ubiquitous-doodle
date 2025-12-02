import Anthropic from '@anthropic-ai/sdk';
import type { AnalysisResult, Communication, Client } from '@/types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function analyzeConversation(
  communication: Communication,
  client: Client,
  recentHistory: Communication[] = []
): Promise<AnalysisResult> {
  // Limit history to reduce tokens - summarize instead of full content
  const historyContext = recentHistory
    .slice(0, 3)
    .map(c => `${c.sender}: ${c.content.slice(0, 150)}...`)
    .join('\n');

  const prompt = `Analyze this client communication. Client: ${client.name} (${client.company || 'Unknown'}), Status: ${client.status}, Score: ${client.health_score}/100

Recent context:
${historyContext || 'None'}

New message from ${communication.sender} via ${communication.source}:
${communication.content.slice(0, 1000)}

Return JSON only:
{"sentiment":"positive|neutral|negative","sentiment_score":-1 to 1,"risk_signals":[],"opportunity_signals":[],"key_topics":[],"urgency":"low|medium|high","suggested_response":"brief reply if needed"}`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 400,
    messages: [{ role: 'user', content: prompt }],
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }

  try {
    return JSON.parse(content.text) as AnalysisResult;
  } catch {
    console.error('Failed to parse Claude response:', content.text);
    return {
      sentiment: 'neutral',
      sentiment_score: 0,
      risk_signals: [],
      opportunity_signals: [],
      key_topics: [],
      urgency: 'low',
    };
  }
}

export async function generateDigestSummary(
  clients: Client[],
  recentInsights: { client: Client; insights: string[] }[]
): Promise<string> {
  const clientSummaries = recentInsights
    .map(({ client, insights }) =>
      `${client.name} (${client.status}, ${client.health_score}%): ${insights.slice(0, 3).join('; ')}`
    )
    .join('\n');

  const prompt = `Morning briefing for client relationships. Write 2-3 concise paragraphs.

Clients:
${clientSummaries || 'No client data available'}

Cover: 1) Urgent items needing attention 2) Opportunities 3) Portfolio health overview. Be direct and actionable.`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 350,
    messages: [{ role: 'user', content: prompt }],
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }

  return content.text;
}

export async function generateOutreachMessage(
  client: Client,
  context: string,
  tone: 'warm' | 'professional' | 'casual' = 'professional'
): Promise<string> {
  const prompt = `Write a ${tone} 2-3 sentence message to ${client.name} at ${client.company || 'their company'}.
Context: ${context.slice(0, 300)}
Be genuine, specific, include a call to action. Message only, no quotes.`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 150,
    messages: [{ role: 'user', content: prompt }],
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }

  return content.text;
}
