'use client';

import { useAuth } from '@/components/AuthProvider';
import {
  demoClients,
  demoInsights,
  demoCommunications,
  demoIntegrations,
  demoDigest
} from '@/lib/demoData';

export function useDemoMode() {
  const { isDemo } = useAuth();

  // Wrapper for fetch that returns demo data in demo mode
  const demoFetch = async (url: string, options?: RequestInit): Promise<Response> => {
    if (!isDemo) {
      return fetch(url, options);
    }

    // Return demo data based on the URL
    const demoResponses: Record<string, unknown> = {
      '/api/clients': { clients: demoClients },
      '/api/insights': { insights: demoInsights },
      '/api/communications': { communications: demoCommunications },
      '/api/integrations': { integrations: demoIntegrations },
      '/api/digest': demoDigest,
    };

    // Match URL pattern
    const baseUrl = url.split('?')[0];

    // Handle client detail pages
    if (baseUrl.match(/\/api\/clients\/demo-\d+/)) {
      const clientId = baseUrl.split('/').pop();
      const client = demoClients.find(c => c.id === clientId);
      const clientComms = demoCommunications.filter(c => c.client_id === clientId);
      const clientInsights = demoInsights.filter(i => i.client_id === clientId);

      return new Response(JSON.stringify({
        client,
        communications: clientComms,
        insights: clientInsights,
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = demoResponses[baseUrl];

    if (data) {
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // For POST requests in demo mode, simulate success
    if (options?.method === 'POST') {
      // Simulate sync response
      if (baseUrl.includes('/sync')) {
        return new Response(JSON.stringify({
          success: true,
          found: 5,
          stored: 3,
          message: 'Demo mode: Simulated sync complete',
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Simulate analysis response
      if (baseUrl.includes('/analyze')) {
        return new Response(JSON.stringify({
          success: true,
          analyzed: 5,
          message: 'Demo mode: Simulated analysis complete',
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Default POST response
      return new Response(JSON.stringify({
        success: true,
        message: 'Demo mode: Action simulated',
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Default response for unknown endpoints
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  };

  return {
    isDemo,
    demoFetch,
    demoClients,
    demoInsights,
    demoCommunications,
    demoIntegrations,
    demoDigest,
  };
}
