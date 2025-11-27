-- Relationship Intelligence Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clients table
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  company VARCHAR(255),
  status VARCHAR(20) DEFAULT 'neutral' CHECK (status IN ('healthy', 'at_risk', 'opportunity', 'neutral')),
  health_score INTEGER DEFAULT 50 CHECK (health_score >= 0 AND health_score <= 100),
  last_contact TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Communications table (stores messages from all sources)
CREATE TABLE communications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  source VARCHAR(20) NOT NULL CHECK (source IN ('gmail', 'slack', 'notion')),
  source_id VARCHAR(255) NOT NULL, -- Original ID from the source platform
  thread_id VARCHAR(255), -- For grouping related messages
  subject VARCHAR(500),
  content TEXT NOT NULL,
  sender VARCHAR(255) NOT NULL,
  recipient VARCHAR(255),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  analyzed BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(source, source_id)
);

-- Insights table (AI-generated insights)
CREATE TABLE insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  communication_id UUID REFERENCES communications(id) ON DELETE SET NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('risk', 'opportunity', 'sentiment', 'action_needed')),
  severity VARCHAR(10) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high')),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  evidence JSONB DEFAULT '[]', -- Array of message snippets
  suggested_action VARCHAR(255),
  suggested_message TEXT,
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Digests table (daily summaries)
CREATE TABLE digests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL UNIQUE,
  summary TEXT NOT NULL,
  at_risk_clients JSONB DEFAULT '[]', -- Array of client IDs
  opportunities JSONB DEFAULT '[]', -- Array of client IDs
  action_items JSONB DEFAULT '[]', -- Array of action item objects
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Integrations table (OAuth tokens and settings)
CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(20) NOT NULL CHECK (type IN ('gmail', 'slack', 'notion')),
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}', -- Store additional data like workspace ID, email, etc.
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_sync TIMESTAMP WITH TIME ZONE,

  UNIQUE(type)
);

-- Analysis results cache (for performance)
CREATE TABLE analysis_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  communication_id UUID REFERENCES communications(id) ON DELETE CASCADE UNIQUE,
  sentiment VARCHAR(10) CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  sentiment_score DECIMAL(3, 2), -- -1.00 to 1.00
  risk_signals JSONB DEFAULT '[]',
  opportunity_signals JSONB DEFAULT '[]',
  key_topics JSONB DEFAULT '[]',
  urgency VARCHAR(10) CHECK (urgency IN ('low', 'medium', 'high')),
  suggested_response TEXT,
  analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_communications_client_id ON communications(client_id);
CREATE INDEX idx_communications_timestamp ON communications(timestamp DESC);
CREATE INDEX idx_communications_source ON communications(source);
CREATE INDEX idx_communications_analyzed ON communications(analyzed);
CREATE INDEX idx_insights_client_id ON insights(client_id);
CREATE INDEX idx_insights_type ON insights(type);
CREATE INDEX idx_insights_is_resolved ON insights(is_resolved);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_health_score ON clients(health_score);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update client's last_contact when new communication is added
CREATE OR REPLACE FUNCTION update_client_last_contact()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE clients
  SET last_contact = NEW.timestamp
  WHERE id = NEW.client_id
  AND (last_contact IS NULL OR last_contact < NEW.timestamp);
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update last_contact
CREATE TRIGGER update_client_last_contact_trigger
  AFTER INSERT ON communications
  FOR EACH ROW
  EXECUTE FUNCTION update_client_last_contact();
