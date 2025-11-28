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

    // Build channel name lookup
    const channelNames: Record<string, string> = {};
    for (const ch of channels) {
      channelNames[ch.id] = ch.name || ch.id;
    }

    const allMessages: Array<{
      source: 'slack';
      source_id: string;
      thread_id: string;
      content: string;
      sender: string;
      timestamp: string;
      channel_name: string;
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
              channel_name: channel.name || 'dm',
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

    // If there's only one client, assign all messages to them
    // Otherwise try smart matching
    const defaultClient = clients?.length === 1 ? clients[0] : null;

    let storedCount = 0;

    // Process and store ALL messages
    for (const message of allMessages) {
      const senderName = userCache[message.sender] || message.sender;

      // Smart matching: check for partial name matches
      let matchedClient = clients?.find((c) => {
        const nameParts = c.name.toLowerCase().split(/\s+/);
        const companyParts = (c.company || '').toLowerCase().split(/\s+/);
        const contentLower = message.content.toLowerCase();
        const senderLower = senderName.toLowerCase();
        const channelLower = message.channel_name.toLowerCase();

        // Check if any part of client name/company appears in message, sender, or channel
        return nameParts.some(part =>
          part.length > 2 && (
            contentLower.includes(part) ||
            senderLower.includes(part) ||
            channelLower.includes(part)
          )
        ) || companyParts.some(part =>
          part.length > 2 && (
            contentLower.includes(part) ||
            senderLower.includes(part) ||
            channelLower.includes(part)
          )
        );
      });

      // If no match but only one client, assign to them
      if (!matchedClient && defaultClient) {
        matchedClient = defaultClient;
      }

      // Store the message if we have a client to assign it to
      if (matchedClient) {
        const { error } = await supabase.from('communications').upsert(
          {
            source: message.source,
            source_id: message.source_id,
            thread_id: message.thread_id,
            content: message.content,
            sender: senderName,
            timestamp: message.timestamp,
            client_id: matchedClient.id,
            analyzed: false,
          },
          {
            onConflict: 'source,source_id',
            ignoreDuplicates: true,
          }
        );

        if (!error) {
          storedCount++;
        }
      }
    }

    // Update last sync time
    await supabase
      .from('integrations')
      .update({ last_sync: new Date().toISOString() })
      .eq('type', 'slack');

    return NextResponse.json({
      success: true,
      found: allMessages.length,
      stored: storedCount,
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
