import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const supabase = createServerClient();

    // Check for deep sync parameter
    const url = new URL(request.url);
    const deepSync = url.searchParams.get('deep') === 'true';

    // Get Gmail integration
    const { data: integration, error: integrationError } = await supabase
      .from('integrations')
      .select('*')
      .eq('type', 'gmail')
      .single();

    if (integrationError || !integration) {
      return NextResponse.json(
        { error: 'Gmail not connected' },
        { status: 400 }
      );
    }

    // Check if token needs refresh
    let accessToken = integration.access_token;
    if (integration.expires_at && new Date(integration.expires_at) < new Date()) {
      // Refresh token
      const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
          refresh_token: integration.refresh_token,
          grant_type: 'refresh_token',
        }),
      });

      const tokens = await refreshResponse.json();
      if (refreshResponse.ok) {
        accessToken = tokens.access_token;

        // Update token in database
        await supabase
          .from('integrations')
          .update({
            access_token: tokens.access_token,
            expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
          })
          .eq('type', 'gmail');
      }
    }

    // Fetch emails - deep sync: 90 days, regular: 7 days
    const timeQuery = deepSync ? 'newer_than:90d' : 'newer_than:7d';
    const maxResults = deepSync ? 100 : 50;
    console.log(`Gmail sync mode: ${deepSync ? 'DEEP (90 days)' : 'Regular (7 days)'}`);

    const messagesResponse = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}&q=${timeQuery}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const messagesData = await messagesResponse.json();
    const messageIds = messagesData.messages?.map((m: { id: string }) => m.id) || [];

    // Fetch full message details
    const messages = await Promise.all(
      messageIds.slice(0, 20).map(async (id: string) => {
        const response = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=full`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        return response.json();
      })
    );

    // Process and store messages
    const processedMessages = messages.map((msg) => {
      const headers = msg.payload?.headers || [];
      const getHeader = (name: string) =>
        headers.find((h: { name: string }) => h.name.toLowerCase() === name.toLowerCase())?.value;

      // Extract body
      let body = '';
      if (msg.payload?.body?.data) {
        body = Buffer.from(msg.payload.body.data, 'base64').toString('utf-8');
      } else if (msg.payload?.parts) {
        const textPart = msg.payload.parts.find(
          (p: { mimeType: string }) => p.mimeType === 'text/plain'
        );
        if (textPart?.body?.data) {
          body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
        }
      }

      return {
        source: 'gmail' as const,
        source_id: msg.id,
        thread_id: msg.threadId,
        subject: getHeader('Subject'),
        content: body.slice(0, 10000), // Limit content size
        sender: getHeader('From'),
        recipient: getHeader('To'),
        timestamp: new Date(parseInt(msg.internalDate)).toISOString(),
      };
    });

    // Get all clients to match emails
    const { data: clients } = await supabase.from('clients').select('id, email, name, company');

    if (!clients || clients.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No clients found. Please add a client first.',
        found: processedMessages.length,
        stored: 0,
      });
    }

    // If single client, assign all messages to them
    const singleClient = clients.length === 1 ? clients[0] : null;
    let storedCount = 0;

    // Match messages to clients and insert
    for (const message of processedMessages) {
      let matchedClient = singleClient;

      if (!matchedClient) {
        // First try email matching
        matchedClient = clients.find(
          (c) =>
            c.email &&
            (message.sender?.toLowerCase().includes(c.email.toLowerCase()) ||
             message.recipient?.toLowerCase().includes(c.email.toLowerCase()))
        ) || null;

        // Then try name/company matching
        if (!matchedClient) {
          matchedClient = clients.find((c) => {
            const nameParts = c.name.toLowerCase().split(/\s+/);
            const companyParts = (c.company || '').toLowerCase().split(/\s+/);
            const senderLower = (message.sender || '').toLowerCase();
            const subjectLower = (message.subject || '').toLowerCase();
            const contentLower = (message.content || '').toLowerCase().slice(0, 500);

            return nameParts.some((part: string) =>
              part.length > 2 && (senderLower.includes(part) || subjectLower.includes(part))
            ) || companyParts.some((part: string) =>
              part.length > 2 && (senderLower.includes(part) || subjectLower.includes(part) || contentLower.includes(part))
            );
          }) || null;
        }
      }

      if (matchedClient) {
        const { error } = await supabase.from('communications').upsert(
          {
            ...message,
            client_id: matchedClient.id,
            analyzed: false,
          },
          {
            onConflict: 'source,source_id',
            ignoreDuplicates: true,
          }
        );
        if (!error) storedCount++;
      }
    }

    // Update last sync time
    await supabase
      .from('integrations')
      .update({ last_sync: new Date().toISOString() })
      .eq('type', 'gmail');

    return NextResponse.json({
      success: true,
      found: processedMessages.length,
      stored: storedCount,
    });
  } catch (err) {
    console.error('Gmail sync error:', err);
    return NextResponse.json(
      { error: 'Sync failed' },
      { status: 500 }
    );
  }
}
