import Anthropic from '@anthropic-ai/sdk';
import type { AnalysisResult, DeepAnalysisResult, Communication, Client } from '@/types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// Deep analysis for transcripts and important communications
export async function analyzeTranscript(
  content: string,
  client: Client,
  context?: {
    meetingType?: string; // "weekly check-in", "project kickoff", "escalation call"
    attendees?: string[];
    previousConcerns?: string[];
  }
): Promise<DeepAnalysisResult> {
  const clientContext = `
Client: ${client.name} at ${client.company || 'their company'}
Status: ${client.status} | Health Score: ${client.health_score}/100
${client.contract_value ? `Contract: $${client.contract_value}/${client.contract_type || 'month'}` : ''}
${client.renewal_date ? `Renewal: ${client.renewal_date}` : ''}
${client.project_status ? `Current Project: ${client.project_status}` : ''}
${client.goals ? `Client Goals: ${client.goals}` : ''}
${client.known_concerns?.length ? `Known Concerns: ${client.known_concerns.join(', ')}` : ''}
${context?.meetingType ? `Meeting Type: ${context.meetingType}` : ''}
${context?.attendees?.length ? `Attendees: ${context.attendees.join(', ')}` : ''}
${context?.previousConcerns?.length ? `Previous Issues: ${context.previousConcerns.join(', ')}` : ''}`.trim();

  const prompt = `You are a relationship intelligence analyst helping a consultant manage client relationships. Analyze this communication/transcript and extract actionable insights.

${clientContext}

--- CONTENT TO ANALYZE ---
${content.slice(0, 8000)}
--- END CONTENT ---

Analyze deeply and return JSON with this exact structure:
{
  "executive_summary": "2-3 sentence overview of what happened and what matters most",
  "sentiment": "positive|neutral|negative|mixed",
  "sentiment_score": -1 to 1,

  "insights": [
    {
      "type": "risk|opportunity|commitment|concern|win",
      "title": "Specific title like 'Client frustrated about 2-week timeline delay' NOT generic 'timeline concerns'",
      "detail": "Full context explaining the insight",
      "quote": "Direct quote from the content if available",
      "impact": "low|medium|high",
      "action": "Specific action like 'Send revised timeline by Friday' NOT 'follow up'",
      "owner": "you|client|both",
      "deadline": "When to act, e.g., 'Within 24 hours' or 'Before Dec 15'"
    }
  ],

  "commitments": [
    {
      "who": "Name of person who committed",
      "what": "What they committed to do",
      "when": "When they said they'd do it",
      "status": "pending|at_risk|completed"
    }
  ],

  "relationship": {
    "trust_level": "strong|building|strained|unknown",
    "engagement": "highly_engaged|engaged|passive|disengaged",
    "trajectory": "improving|stable|declining",
    "warning_signs": ["specific warning sign"],
    "positive_signs": ["specific positive sign"]
  },

  "next_steps": [
    {
      "priority": 1,
      "action": "Specific action to take",
      "reason": "Why this matters",
      "suggested_message": "Draft message if applicable"
    }
  ],

  "topics": ["topic1", "topic2"],
  "open_questions": ["Question raised but not answered"]
}

IMPORTANT:
- Be SPECIFIC. "Client mentioned competitor" is useless. "Client met with Acme Corp last week and liked their pricing model" is useful.
- Every insight must have a concrete ACTION with a DEADLINE
- Identify who committed to what - these are critical to track
- Look for subtle signals: hesitation, enthusiasm, deflection, urgency
- Max 3 insights, prioritized by business impact
- If this is a meeting transcript, capture ALL commitments made by either party`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    messages: [{ role: 'user', content: prompt }],
  });

  const responseContent = response.content[0];
  if (responseContent.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }

  try {
    // Extract JSON from response (handle markdown code blocks)
    let jsonText = responseContent.text;
    const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1];
    }
    return JSON.parse(jsonText) as DeepAnalysisResult;
  } catch {
    console.error('Failed to parse deep analysis response:', responseContent.text);
    return {
      executive_summary: 'Analysis could not be completed',
      sentiment: 'neutral',
      sentiment_score: 0,
      insights: [],
      commitments: [],
      relationship: {
        trust_level: 'unknown',
        engagement: 'engaged',
        trajectory: 'stable',
      },
      next_steps: [],
      topics: [],
    };
  }
}

export async function analyzeConversation(
  communication: Communication,
  client: Client,
  recentHistory: Communication[] = []
): Promise<AnalysisResult> {
  // Build richer context from history
  const historyContext = recentHistory
    .slice(0, 5)
    .map(c => `[${c.source}] ${c.sender}: ${c.content.slice(0, 300)}`)
    .join('\n---\n');

  // Include client business context if available
  const clientContext = `Client: ${client.name} at ${client.company || 'their company'}
Status: ${client.status} | Health: ${client.health_score}/100
${client.contract_value ? `Contract: $${client.contract_value}` : ''}
${client.project_status ? `Project: ${client.project_status}` : ''}
${client.known_concerns?.length ? `Known issues: ${client.known_concerns.slice(0, 3).join(', ')}` : ''}`.trim();

  const prompt = `You are a relationship intelligence analyst. Analyze this client communication and extract actionable insights.

${clientContext}

${historyContext ? `Recent conversation history:\n${historyContext}\n` : ''}
NEW MESSAGE from ${communication.sender} via ${communication.source}:
Subject: ${communication.subject || 'N/A'}
---
${communication.content.slice(0, 2000)}
---

Return JSON (no markdown):
{
  "sentiment": "positive|neutral|negative",
  "sentiment_score": -1.0 to 1.0,
  "risk_signals": ["SPECIFIC risk with names/dates/amounts, e.g., 'Client mentioned evaluating Competitor X after Q1 renewal'"],
  "opportunity_signals": ["SPECIFIC opportunity, e.g., 'Asked about expanding to 3 more team members in January'"],
  "key_topics": ["topic1", "topic2"],
  "urgency": "low|medium|high",
  "suggested_response": "2-3 sentence personalized reply addressing their specific concern/question",
  "insight_title": "SPECIFIC title like 'Sarah concerned about Phase 2 timeline slippage' NOT 'timeline concerns'",
  "action_type": "respond|schedule_call|send_resource|monitor|celebrate"
}

CRITICAL RULES:
1. Be SPECIFIC - include names, dates, amounts, project names mentioned
2. "Client seems frustrated" is USELESS. "Client frustrated that dashboard delivery slipped from Dec 1 to Dec 15" is USEFUL
3. If they asked a question, suggested_response must answer it
4. Only flag as risk/opportunity if there's real evidence, not vague sentiment
5. insight_title should be specific enough to act on without reading the full message`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 600,
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
