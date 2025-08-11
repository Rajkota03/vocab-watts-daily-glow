import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, ...payload } = await req.json();

    switch (action) {
      case 'save_config':
        return await saveConfig(supabase, payload);
      case 'get_config':
        return await getConfig(supabase);
      case 'submit_display_name':
        return await submitDisplayName(supabase, payload);
      case 'get_display_name_status':
        return await getDisplayNameStatus(supabase);
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

async function saveConfig(supabase: any, payload: { token: string; phone_number_id: string; verify_token: string }) {
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
    
    // Check if config already exists
    const { data: existingConfig } = await supabase
      .from('whatsapp_config')
      .select('*')
      .limit(1);

    const configData = {
      token,
      phone_number_id,
      verify_token,
      waba_id: meData.id,
    };

    let result;
    if (existingConfig && existingConfig.length > 0) {
      // Update existing config
      result = await supabase
        .from('whatsapp_config')
        .update(configData)
        .eq('id', existingConfig[0].id)
        .select()
        .single();
    } else {
      // Insert new config
      result = await supabase
        .from('whatsapp_config')
        .insert(configData)
        .select()
        .single();
    }

    if (result.error) {
      console.error('Database error:', result.error);
      return new Response(
        JSON.stringify({ error: 'Failed to save configuration' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

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

async function getConfig(supabase: any) {
  try {
    const { data, error } = await supabase
      .from('whatsapp_config')
      .select('*')
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to get configuration' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    return new Response(
      JSON.stringify({ config: data || null }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error getting config:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to get configuration' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}

async function submitDisplayName(supabase: any, payload: { display_name: string }) {
  try {
    const { display_name } = payload;

    // Get current config
    const { data: configData, error: configError } = await supabase
      .from('whatsapp_config')
      .select('*')
      .limit(1)
      .single();

    if (configError || !configData) {
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

    // Update config in database
    const { error: updateError } = await supabase
      .from('whatsapp_config')
      .update({
        display_name,
        display_status: 'pending',
      })
      .eq('id', configData.id);

    if (updateError) {
      console.error('Error updating display name:', updateError);
    }

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

async function getDisplayNameStatus(supabase: any) {
  try {
    // Get current config
    const { data: configData, error: configError } = await supabase
      .from('whatsapp_config')
      .select('*')
      .limit(1)
      .single();

    if (configError || !configData) {
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
      await supabase
        .from('whatsapp_config')
        .update({
          display_status: status,
          display_status_reason: reason,
        })
        .eq('id', configData.id);
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