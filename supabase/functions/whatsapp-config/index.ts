import { corsHeaders } from '../_shared/cors.ts';

// Define types
interface WhatsAppConfig {
  id?: string;
  token: string;
  phone_number_id: string;
  verify_token: string;
  waba_id?: string;
  display_name?: string;
  display_status?: 'pending' | 'approved' | 'rejected';
  display_status_reason?: string;
  created_at?: string;
  updated_at?: string;
}

// Simple in-memory storage (replace with actual database in production)
let configData: WhatsAppConfig | null = null;

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...payload } = await req.json();

    switch (action) {
      case 'save_config':
        return await saveConfig(payload);
      case 'get_config':
        return await getConfig();
      case 'submit_display_name':
        return await submitDisplayName(payload);
      case 'get_display_name_status':
        return await getDisplayNameStatus();
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
    }
  } catch (error) {
    console.error('Error in whatsapp-config function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function saveConfig(payload: { token: string; phone_number_id: string; verify_token: string }) {
  try {
    const { token, phone_number_id, verify_token } = payload;

    if (!token || !phone_number_id || !verify_token) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Verify the token with Meta Graph API
    const graphUrl = `https://graph.facebook.com/v21.0/me`;
    const response = await fetch(graphUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: 'Invalid access token' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const meData = await response.json();
    
    // Save configuration
    configData = {
      id: crypto.randomUUID(),
      token,
      phone_number_id,
      verify_token,
      waba_id: meData.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log('WhatsApp config saved successfully:', { waba_id: meData.id });

    return new Response(
      JSON.stringify({ ok: true, waba_id: meData.id }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error saving config:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to verify token' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}

async function getConfig() {
  return new Response(
    JSON.stringify({ config: configData }),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

async function submitDisplayName(payload: { display_name: string }) {
  try {
    const { display_name } = payload;

    if (!configData || !configData.token || !configData.phone_number_id) {
      return new Response(
        JSON.stringify({ error: 'WhatsApp not configured' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Submit display name to Meta Graph API
    const graphUrl = `https://graph.facebook.com/v21.0/${configData.phone_number_id}/display_name`;
    const response = await fetch(graphUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${configData.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        display_name,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return new Response(
        JSON.stringify({ error: errorData.error?.message || 'Failed to submit display name' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Update config
    configData = {
      ...configData,
      display_name,
      display_status: 'pending',
      updated_at: new Date().toISOString(),
    };

    console.log('Display name submitted successfully');

    return new Response(
      JSON.stringify({ ok: true }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error submitting display name:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to submit display name' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}

async function getDisplayNameStatus() {
  try {
    if (!configData || !configData.token || !configData.phone_number_id) {
      return new Response(
        JSON.stringify({ error: 'WhatsApp not configured' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get display name status from Meta Graph API
    const graphUrl = `https://graph.facebook.com/v21.0/${configData.phone_number_id}/display_name`;
    const response = await fetch(graphUrl, {
      headers: {
        'Authorization': `Bearer ${configData.token}`,
      },
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: 'Failed to get display name status' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const data = await response.json();
    const status = data.status || 'pending';
    const reason = data.rejection_reason;

    // Update config if status changed
    if (configData.display_status !== status) {
      configData = {
        ...configData,
        display_status: status,
        display_status_reason: reason,
        updated_at: new Date().toISOString(),
      };
    }

    return new Response(
      JSON.stringify({ status, reason }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error getting display name status:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to get display name status' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}