// Demo data for showcasing the app without real data

import type { Client, Insight, Communication } from '@/types';

export const demoClients: Client[] = [
  {
    id: 'demo-1',
    name: 'Sarah Chen',
    company: 'TechVentures Inc',
    email: 'sarah@techventures.com',
    status: 'healthy',
    health_score: 85,
    last_contact: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-2',
    name: 'Michael Rodriguez',
    company: 'Growth Labs',
    email: 'michael@growthlabs.io',
    status: 'at_risk',
    health_score: 42,
    last_contact: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-3',
    name: 'Emily Watson',
    company: 'Startup Studio',
    email: 'emily@startupstudio.co',
    status: 'opportunity',
    health_score: 78,
    last_contact: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-4',
    name: 'James Park',
    company: 'Innovation Corp',
    email: 'james@innovationcorp.com',
    status: 'healthy',
    health_score: 92,
    last_contact: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const demoInsights: (Insight & { clientName: string })[] = [
  {
    id: 'insight-1',
    client_id: 'demo-2',
    clientName: 'Michael Rodriguez',
    type: 'risk',
    title: 'Delayed Response Pattern',
    description: 'Michael has taken 5+ days to respond to the last 3 emails. This is unusual compared to his typical 24-hour response time. Consider reaching out via phone.',
    severity: 'high',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    source: 'gmail',
  },
  {
    id: 'insight-2',
    client_id: 'demo-3',
    clientName: 'Emily Watson',
    type: 'opportunity',
    title: 'Expansion Interest Detected',
    description: 'Emily mentioned "scaling to other departments" in her last Slack message. This could be a great opportunity to discuss expanded services.',
    severity: 'medium',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    source: 'slack',
  },
  {
    id: 'insight-3',
    client_id: 'demo-1',
    clientName: 'Sarah Chen',
    type: 'positive',
    title: 'Strong Engagement',
    description: 'Sarah has been highly responsive and mentioned being "very happy with the progress" in yesterday\'s email thread.',
    severity: 'low',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    source: 'gmail',
  },
  {
    id: 'insight-4',
    client_id: 'demo-4',
    clientName: 'James Park',
    type: 'positive',
    title: 'Referral Mention',
    description: 'James mentioned he\'d "recommend us to his network" during the project review call notes in Notion.',
    severity: 'medium',
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    source: 'notion',
  },
];

export const demoCommunications: Communication[] = [
  {
    id: 'comm-1',
    client_id: 'demo-1',
    source: 'gmail',
    source_id: 'email-1',
    subject: 'Re: Q1 Project Update',
    content: 'Thanks for the update! Everything looks great. I\'m very happy with the progress so far. Let\'s schedule a call next week to discuss the next phase.',
    sender: 'sarah@techventures.com',
    recipient: 'daniel@wescalestartups.com',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    analyzed: true,
    sentiment: 'positive',
  },
  {
    id: 'comm-2',
    client_id: 'demo-2',
    source: 'gmail',
    source_id: 'email-2',
    subject: 'Re: Checking in',
    content: 'Hi, sorry for the delayed response. We\'ve been going through some internal restructuring. Will get back to you soon on the proposal.',
    sender: 'michael@growthlabs.io',
    recipient: 'daniel@wescalestartups.com',
    timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    analyzed: true,
    sentiment: 'neutral',
  },
  {
    id: 'comm-3',
    client_id: 'demo-3',
    source: 'slack',
    source_id: 'slack-1',
    subject: 'Direct Message',
    content: 'Hey! Quick question - do you think we could scale this to other departments? The marketing team has been asking about similar solutions.',
    sender: 'Emily Watson',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    analyzed: true,
    sentiment: 'positive',
  },
  {
    id: 'comm-4',
    client_id: 'demo-4',
    source: 'notion',
    source_id: 'notion-1',
    subject: 'Project Review Notes',
    content: 'Excellent work on the delivery. Results exceeded expectations. Would definitely recommend to my network. Looking forward to Phase 2.',
    sender: 'James Park',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    analyzed: true,
    sentiment: 'positive',
  },
];

export const demoIntegrations = [
  {
    id: 'demo-gmail',
    type: 'gmail',
    connected_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    last_sync: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    metadata: { email: 'demo@example.com' },
  },
  {
    id: 'demo-slack',
    type: 'slack',
    connected_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    last_sync: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    metadata: { name: 'Demo Workspace' },
  },
];

export const demoDigest = {
  generated_at: new Date().toISOString(),
  summary: `Good morning! Here's your client relationship digest for today.

**Attention Needed:**
- Michael Rodriguez (Growth Labs) hasn't responded in 14 days - consider a phone call
- 1 client flagged as at-risk

**Opportunities:**
- Emily Watson mentioned scaling to other departments - follow up on expansion
- James Park indicated he'd refer you to his network

**Positive Signals:**
- Sarah Chen expressed satisfaction with project progress
- Overall client health is strong at 74% average

**Recommended Actions:**
1. Call Michael Rodriguez to check in on the proposal
2. Send Emily a proposal for multi-department implementation
3. Ask James for a testimonial or introduction`,
  clients_summary: [
    { name: 'Sarah Chen', status: 'healthy', action: 'No action needed' },
    { name: 'Michael Rodriguez', status: 'at_risk', action: 'Urgent: Follow up by phone' },
    { name: 'Emily Watson', status: 'opportunity', action: 'Send expansion proposal' },
    { name: 'James Park', status: 'healthy', action: 'Request referral/testimonial' },
  ],
};
