import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const supabase = createServerClient();

    // Get Slack integration
    const { data: integration, error: integrationError } = await supabase
      .from('integrations')
      .select('*')
      .eq('type', 'slack')
      .single();

    if (integrationError || !integration) {
      return NextResponse.json(
        { error: 'Slack not connected' },
        { status: 400 }
      );
    }

    const accessToken = integration.access_token;

    // Get list of conversations (channels and DMs)
    const conversationsResponse = await fetch(
      'https://slack.com/api/conversations.list?types=public_channel,private_channel,im',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const conversationsData = await conversationsResponse.json();

    if (!conversationsData.ok) {
      console.error('Slack API error:', conversationsData);
      const errorMsg = conversationsData.error === 'missing_scope'
        ? `Missing scope: ${conversationsData.needed || 'unknown'}. Please disconnect and reconnect Slack.`
        : conversationsData.error || 'Failed to fetch conversations';
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const channels = conversationsData.channels || [];
    const allMessages: Array<{
      source: 'slack';
      source_id: string;
      thread_id: string;
      content: string;
      sender: string;
      timestamp: string;
    }> = [];

    // Fetch messages from each channel (last 7 days)
    const oneWeekAgo = Math.floor((Date.now() - 7 * 24 * 60 * 60 * 1000) / 1000);

    for (const channel of channels.slice(0, 10)) { // Limit to 10 channels
      const historyResponse = await fetch(
        `https://slack.com/api/conversations.history?channel=${channel.id}&oldest=${oneWeekAgo}&limit=50`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const historyData = await historyResponse.json();

      if (historyData.ok && historyData.messages) {
        for (const msg of historyData.messages) {
          if (msg.type === 'message' && msg.text && !msg.bot_id) {
            allMessages.push({
              source: 'slack',
              source_id: `${channel.id}-${msg.ts}`,
              thread_id: channel.id,
              content: msg.text,
              sender: msg.user || 'unknown',
              timestamp: new Date(parseFloat(msg.ts) * 1000).toISOString(),
            });
          }
        }
      }
    }

    // Get user info to resolve user IDs to names
    const userCache: Record<string, string> = {};
    const uniqueUsers = Array.from(new Set(allMessages.map(m => m.sender)));

    for (const userId of uniqueUsers.slice(0, 20)) { // Limit user lookups
      if (userId === 'unknown') continue;

      const userResponse = await fetch(
        `https://slack.com/api/users.info?user=${userId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const userData = await userResponse.json();
      if (userData.ok && userData.user) {
        userCache[userId] = userData.user.real_name || userData.user.name || userId;
      }
    }

    // Get all clients to match messages
    const { data: clients } = await supabase.from('clients').select('id, email, name, company');

    // Process and store messages
    for (const message of allMessages) {
      const senderName = userCache[message.sender] || message.sender;

      // Match to client by name appearing in message or sender name
      const matchedClient = clients?.find(
        (c) =>
          message.content.toLowerCase().includes(c.name.toLowerCase()) ||
          message.content.toLowerCase().includes((c.company || '').toLowerCase()) ||
          senderName.toLowerCase().includes(c.name.toLowerCase())
      );

      if (matchedClient) {
        await supabase.from('communications').upsert(
          {
            ...message,
            sender: senderName,
            client_id: matchedClient.id,
            analyzed: false,
          },
          {
            onConflict: 'source,source_id',
            ignoreDuplicates: true,
          }
        );
      }
    }

    // Update last sync time
    await supabase
      .from('integrations')
      .update({ last_sync: new Date().toISOString() })
      .eq('type', 'slack');

    return NextResponse.json({
      success: true,
      synced: allMessages.length,
      channels: channels.length,
    });
  } catch (err) {
    console.error('Slack sync error:', err);
    return NextResponse.json(
      { error: 'Sync failed' },
      { status: 500 }
    );
  }
}
