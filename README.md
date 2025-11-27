# Relationship Intelligence

AI-powered client relationship monitoring that helps you never miss important signals in your communications.

## Features

- **Multi-Channel Monitoring**: Connect Gmail, Slack, and Notion to analyze all client communications
- **AI-Powered Analysis**: Uses Claude to detect sentiment, risks, and opportunities
- **Real-Time Dashboard**: See client health at a glance with explainable insights
- **Daily Digest**: Get a morning briefing with action items and suggested messages
- **Smart Outreach**: AI-generated messages in your tone for quick follow-ups

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd relationship-intelligence
npm install
```

### 2. Set Up Supabase

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to SQL Editor and run the migration in `supabase/migrations/001_initial_schema.sql`
4. Copy your project URL and keys from Settings → API

### 3. Set Up Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (for server-side operations)
- `ANTHROPIC_API_KEY` - Your Claude API key from [console.anthropic.com](https://console.anthropic.com)

### 4. Set Up Gmail Integration (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable the Gmail API
4. Create OAuth 2.0 credentials (Web application)
5. Add `http://localhost:3000/api/integrations/gmail/callback` as authorized redirect URI
6. Copy Client ID and Secret to your `.env.local`

### 5. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Deployment to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add all environment variables in the Vercel dashboard
4. Update OAuth redirect URIs to use your production URL
5. Deploy!

## Project Structure

```
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   │   ├── analyze/       # AI analysis endpoint
│   │   │   ├── digest/        # Daily digest generation
│   │   │   └── integrations/  # OAuth callbacks
│   │   └── dashboard/         # Dashboard pages
│   ├── components/            # React components
│   ├── lib/                   # Utilities
│   │   ├── claude.ts          # Claude API integration
│   │   └── supabase.ts        # Database client
│   └── types/                 # TypeScript types
├── supabase/
│   └── migrations/            # Database schema
└── .env.example               # Environment template
```

## API Endpoints

- `POST /api/analyze` - Analyze unprocessed communications
- `POST /api/digest` - Generate daily digest
- `GET /api/digest` - Get latest digest
- `GET /api/integrations/gmail/auth` - Start Gmail OAuth flow
- `POST /api/integrations/gmail/sync` - Sync Gmail messages

## Adding a Client

1. Go to Dashboard → Clients
2. Click "Add Client"
3. Enter client name, company, and email
4. The email is used to match incoming communications

## How Analysis Works

1. **Sync**: Communications are pulled from connected integrations
2. **Match**: Messages are matched to clients based on email/sender
3. **Analyze**: Claude analyzes each message for:
   - Sentiment (positive/neutral/negative)
   - Risk signals (frustration, delays, concerns)
   - Opportunity signals (expansion, satisfaction, referrals)
4. **Score**: Client health scores are updated based on analysis
5. **Alert**: Insights are created for significant findings

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **AI**: Claude API (Anthropic)
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## License

MIT

