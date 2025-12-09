import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const supabase = createServerClient();

    // Fetch client
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();

    if (clientError || !client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Fetch client's communications
    const { data: communications } = await supabase
      .from('communications')
      .select('*')
      .eq('client_id', id)
      .order('timestamp', { ascending: false })
      .limit(20);

    // Fetch client's insights
    const { data: insights } = await supabase
      .from('insights')
      .select('*')
      .eq('client_id', id)
      .eq('is_resolved', false)
      .order('created_at', { ascending: false })
      .limit(10);

    return NextResponse.json({
      client,
      communications: communications || [],
      insights: insights || [],
    });
  } catch (err) {
    console.error('Failed to fetch client:', err);
    return NextResponse.json(
      { error: 'Failed to fetch client' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const supabase = createServerClient();

    // Only allow updating specific fields
    const allowedFields = [
      'name',
      'email',
      'company',
      'contract_value',
      'contract_type',
      'renewal_date',
      'project_status',
      'goals',
      'known_concerns',
      'key_contacts',
    ];

    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in body) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    updates.updated_at = new Date().toISOString();

    const { data: client, error } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Failed to update client:', error);
      return NextResponse.json(
        { error: 'Failed to update client' },
        { status: 500 }
      );
    }

    return NextResponse.json({ client });
  } catch (err) {
    console.error('Failed to update client:', err);
    return NextResponse.json(
      { error: 'Failed to update client' },
      { status: 500 }
    );
  }
}
