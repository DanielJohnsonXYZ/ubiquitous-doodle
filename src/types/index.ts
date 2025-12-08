export type ClientStatus = 'healthy' | 'at_risk' | 'opportunity' | 'neutral';

export interface Client {
  id: string;
  name: string;
  email?: string;
  company?: string;
  status: ClientStatus;
  health_score: number; // 0-100
  last_contact: string;
  created_at: string;
  updated_at: string;
  // Business context for richer insights
  contract_value?: number; // Monthly or annual value
  contract_type?: 'monthly' | 'annual' | 'project';
  renewal_date?: string;
  project_status?: string; // e.g., "Phase 2 - Dashboard development"
  known_concerns?: string[]; // Tracked issues from past conversations
  goals?: string; // What success looks like for this client
  key_contacts?: string[]; // Names of people you interact with
}

export interface Communication {
  id: string;
  client_id: string;
  source: 'gmail' | 'slack' | 'notion' | 'transcript' | 'manual';
  source_id: string; // Original ID from the source
  subject?: string;
  content: string;
  sender: string;
  recipient?: string;
  timestamp: string;
  analyzed: boolean;
  created_at: string;
}

export interface Insight {
  id: string;
  client_id: string;
  communication_id?: string;
  type: 'risk' | 'opportunity' | 'sentiment' | 'action_needed';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  evidence: string[]; // Snippets from communications
  suggested_action?: string;
  suggested_message?: string;
  is_resolved: boolean;
  created_at: string;
}

export interface Digest {
  id: string;
  date: string;
  summary: string;
  at_risk_clients: string[];
  opportunities: string[];
  action_items: DigestActionItem[];
  sent_at?: string;
  created_at: string;
}

export interface DigestActionItem {
  client_id: string;
  client_name: string;
  type: 'risk' | 'opportunity' | 'check_in';
  reason: string;
  suggested_message?: string;
}

export interface Integration {
  id: string;
  type: 'gmail' | 'slack' | 'notion';
  access_token: string;
  refresh_token?: string;
  expires_at?: string;
  metadata?: Record<string, unknown>;
  connected_at: string;
}

export interface AnalysisResult {
  sentiment: 'positive' | 'neutral' | 'negative';
  sentiment_score: number; // -1 to 1
  risk_signals: string[];
  opportunity_signals: string[];
  key_topics: string[];
  urgency: 'low' | 'medium' | 'high';
  suggested_response?: string;
  insight_title?: string; // Specific, actionable title
  action_type?: 'respond' | 'schedule_call' | 'send_resource' | 'monitor' | 'celebrate';
}

// Enhanced analysis for transcripts and deep analysis
export interface DeepAnalysisResult {
  // Core findings
  executive_summary: string; // 2-3 sentence overview
  sentiment: 'positive' | 'neutral' | 'negative' | 'mixed';
  sentiment_score: number;

  // Actionable insights (max 3, prioritized)
  insights: {
    type: 'risk' | 'opportunity' | 'commitment' | 'concern' | 'win';
    title: string; // Specific: "Client concerned about Q1 timeline slippage"
    detail: string; // Context and evidence
    quote?: string; // Direct quote from transcript
    impact: 'low' | 'medium' | 'high'; // Business impact
    action: string; // Specific next step: "Send revised timeline by Friday"
    owner: 'you' | 'client' | 'both'; // Who needs to act
    deadline?: string; // When to act: "Within 48 hours"
  }[];

  // Commitments made (by either party)
  commitments: {
    who: string; // "Daniel" or "Client (Sarah)"
    what: string; // "Send proposal draft"
    when?: string; // "By end of week"
    status: 'pending' | 'at_risk' | 'completed';
  }[];

  // Relationship signals
  relationship: {
    trust_level: 'strong' | 'building' | 'strained' | 'unknown';
    engagement: 'highly_engaged' | 'engaged' | 'passive' | 'disengaged';
    trajectory: 'improving' | 'stable' | 'declining';
    warning_signs?: string[];
    positive_signs?: string[];
  };

  // Recommended follow-up
  next_steps: {
    priority: 1 | 2 | 3;
    action: string;
    reason: string;
    suggested_message?: string;
  }[];

  // Topics discussed (for tracking over time)
  topics: string[];

  // Questions raised but not answered
  open_questions?: string[];
}
