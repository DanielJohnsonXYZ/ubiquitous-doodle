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
}

export interface Communication {
  id: string;
  client_id: string;
  source: 'gmail' | 'slack' | 'notion';
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
}
