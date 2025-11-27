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
  const historyContext = recentHistory
    .slice(0, 5)
    .map(c => `[${c.timestamp}] ${c.sender}: ${c.content.slice(0, 500)}`)
    .join('\n\n');

  const prompt = `You are an AI relationship intelligence analyst. Analyze the following client communication and provide insights.

CLIENT CONTEXT:
- Name: ${client.name}
- Company: ${client.company || 'Unknown'}
- Current Status: ${client.status}
- Health Score: ${client.health_score}/100

RECENT COMMUNICATION HISTORY:
${historyContext || 'No recent history available'}

NEW COMMUNICATION TO ANALYZE:
Source: ${communication.source}
Subject: ${communication.subject || 'N/A'}
From: ${communication.sender}
Date: ${communication.timestamp}

Content:
${communication.content}

---

Analyze this communication and respond with a JSON object containing:
1. sentiment: "positive", "neutral", or "negative"
2. sentiment_score: number from -1 (very negative) to 1 (very positive)
3. risk_signals: array of specific risk indicators found (e.g., "delayed response mentioned", "frustration with timeline", "considering alternatives")
4. opportunity_signals: array of potential opportunities (e.g., "mentioned expansion", "asked about additional services", "positive feedback")
5. key_topics: array of main topics discussed
6. urgency: "low", "medium", or "high" based on how quickly this needs attention
7. suggested_response: a brief suggested response if action is needed (in a warm, professional tone)

Respond ONLY with valid JSON, no other text.`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
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
      `${client.name} (${client.status}, score: ${client.health_score}): ${insights.join('; ')}`
    )
    .join('\n');

  const prompt = `You are an AI Chief of Staff providing a morning briefing. Based on the following client relationship data, write a concise, actionable summary (2-3 paragraphs max).

CLIENT SUMMARIES:
${clientSummaries}

Write a brief executive summary that:
1. Highlights the most urgent items needing attention
2. Notes any opportunities to pursue
3. Gives a general health overview of the client portfolio

Be direct, specific, and actionable. Use a professional but warm tone.`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 500,
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
  const prompt = `Write a brief outreach message to a client based on the following context.

CLIENT: ${client.name} at ${client.company || 'their company'}
CONTEXT: ${context}
TONE: ${tone}

Write a short, genuine message (2-4 sentences) that:
- Feels personal, not templated
- Addresses the specific context
- Has a clear purpose or call to action
- Sounds like a real person, not AI

Just provide the message text, nothing else.`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 300,
    messages: [{ role: 'user', content: prompt }],
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }

  return content.text;
}
