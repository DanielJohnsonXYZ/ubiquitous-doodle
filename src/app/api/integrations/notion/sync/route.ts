import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

interface NotionPage {
  id: string;
  created_time: string;
  last_edited_time: string;
  properties: Record<string, { title?: Array<{ plain_text: string }> }>;
  url: string;
}

interface NotionComment {
  id: string;
  created_time: string;
  rich_text: Array<{ plain_text: string }>;
  created_by: { id: string; name?: string };
}

export async function POST(request: Request) {
  try {
    const supabase = createServerClient();

    // Check for deep sync parameter
    const url = new URL(request.url);
    const deepSync = url.searchParams.get('deep') === 'true';

    // Get Notion integration
    const { data: integration, error: integrationError } = await supabase
      .from('integrations')
      .select('*')
      .eq('type', 'notion')
      .single();

    if (integrationError || !integration) {
      return NextResponse.json(
        { error: 'Notion not connected' },
        { status: 400 }
      );
    }

    const accessToken = integration.access_token;
    const notionVersion = '2022-06-28';

    // Search for all pages
    const searchResponse = await fetch('https://api.notion.com/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Notion-Version': notionVersion,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filter: { property: 'object', value: 'page' },
        page_size: deepSync ? 100 : 50,
      }),
    });

    const searchData = await searchResponse.json();

    if (!searchResponse.ok) {
      console.error('Notion search error:', searchData);
      return NextResponse.json(
        { error: searchData.message || 'Failed to search Notion' },
        { status: 400 }
      );
    }

    const pages: NotionPage[] = searchData.results || [];
    console.log(`Notion sync: Found ${pages.length} pages, mode: ${deepSync ? 'DEEP' : 'Regular'}`);

    // Get all clients to match
    const { data: clients } = await supabase.from('clients').select('id, email, name, company');

    if (!clients || clients.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No clients found. Please add a client first.',
        found: pages.length,
        stored: 0,
      });
    }

    const singleClient = clients.length === 1 ? clients[0] : null;
    let storedCount = 0;

    // Process each page
    for (const page of pages) {
      // Get page title
      const titleProp = Object.values(page.properties).find(p => p.title);
      const pageTitle = titleProp?.title?.map(t => t.plain_text).join('') || 'Untitled';

      // Fetch comments for this page
      const commentsResponse = await fetch(
        `https://api.notion.com/v1/comments?block_id=${page.id}&page_size=50`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Notion-Version': notionVersion,
          },
        }
      );

      const commentsData = await commentsResponse.json();
      const comments: NotionComment[] = commentsData.results || [];

      // Match page to client
      let matchedClient = singleClient;

      if (!matchedClient) {
        matchedClient = clients.find((c) => {
          const nameParts = c.name.toLowerCase().split(/\s+/);
          const companyParts = (c.company || '').toLowerCase().split(/\s+/);
          const titleLower = pageTitle.toLowerCase();

          return nameParts.some((part: string) =>
            part.length > 2 && titleLower.includes(part)
          ) || companyParts.some((part: string) =>
            part.length > 2 && titleLower.includes(part)
          );
        }) || null;
      }

      if (!matchedClient) continue;

      // Store page as a communication
      const { error: pageError } = await supabase.from('communications').upsert(
        {
          source: 'notion',
          source_id: `page-${page.id}`,
          thread_id: page.id,
          subject: pageTitle,
          content: `Notion page: ${pageTitle}. Last edited: ${page.last_edited_time}`,
          sender: 'Notion',
          timestamp: page.last_edited_time,
          client_id: matchedClient.id,
          analyzed: false,
        },
        {
          onConflict: 'source,source_id',
          ignoreDuplicates: false, // Update on edit
        }
      );

      if (!pageError) storedCount++;

      // Store comments as communications
      for (const comment of comments) {
        const commentText = comment.rich_text.map(t => t.plain_text).join('');
        if (!commentText) continue;

        const { error: commentError } = await supabase.from('communications').upsert(
          {
            source: 'notion',
            source_id: `comment-${comment.id}`,
            thread_id: page.id,
            subject: `Comment on: ${pageTitle}`,
            content: commentText,
            sender: comment.created_by.name || 'Unknown',
            timestamp: comment.created_time,
            client_id: matchedClient.id,
            analyzed: false,
          },
          {
            onConflict: 'source,source_id',
            ignoreDuplicates: true,
          }
        );

        if (!commentError) storedCount++;
      }
    }

    // Update last sync time
    await supabase
      .from('integrations')
      .update({ last_sync: new Date().toISOString() })
      .eq('type', 'notion');

    return NextResponse.json({
      success: true,
      found: pages.length,
      stored: storedCount,
    });
  } catch (err) {
    console.error('Notion sync error:', err);
    return NextResponse.json(
      { error: 'Sync failed' },
      { status: 500 }
    );
  }
}
