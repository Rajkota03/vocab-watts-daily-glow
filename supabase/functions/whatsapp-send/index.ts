import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

// Define types
interface Contact {
  wa_id: string;
  phone_e164: string;
  last_incoming_ts?: number;
}

interface Message {
  id: string;
  direction: 'in' | 'out';
  to?: string;
  from?: string;
  body?: string;
  template_name?: string;
  status?: string;
  timestamp: string;
}

interface WhatsAppConfig {
  id: string;
  token: string;
  phone_number_id: string;
  display_name?: string;
  display_status?: string;
}

// Simple in-memory storage (replace with actual database in production)
let contacts: Contact[] = [];
let messages: Message[] = [];

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    const { action, ...payload } = requestData;

    console.log('WhatsApp-send request:', { action, payload });

    // Handle different request formats for compatibility
    if (requestData.checkConfig) {
      return await checkConfiguration();
    }

    // Handle template creation
    if (requestData.create_template || action === 'create_template') {
      return await createTemplate(requestData);
    }

    if (!action) {
      // Check for direct parameters (compatibility with existing calls)
      if (requestData.to && requestData.message) {
        return await sendTextMessage({ to: requestData.to, body: requestData.message });
      } else if (requestData.to && requestData.template) {
        return await sendTemplateMessage({
          to: requestData.to,
          name: requestData.template.name,
          language: requestData.template.language || 'en_US',
          bodyParams: requestData.template.parameters
        });
      }
    }

    switch (action) {
      case 'send_text':
        return await sendTextMessage(payload);
      case 'send_template':
        if (payload.create_template) {
          return await createTemplate(payload);
        }
        return await sendTemplateMessage(payload);
      case 'create_template':
        return await createTemplate(payload);
      case 'check_config':
        return await checkConfiguration();
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action or missing parameters', received: { action, payload } }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
    }
  } catch (error) {
    console.error('Error in whatsapp-send function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function sendTextMessage(payload: { to: string; body: string }) {
  try {
    const { to, body } = payload;

    if (!to || !body) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get config from database
    const configData = await getWhatsAppConfig();
    if (!configData) {
      return new Response(
        JSON.stringify({ error: 'WhatsApp not configured' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check if we can send free-form message (within 24 hours of last incoming message)
    const contact = contacts.find(c => c.phone_e164 === to);
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;

    if (!contact || !contact.last_incoming_ts || (now - contact.last_incoming_ts) > twentyFourHours) {
      return new Response(
        JSON.stringify({ error: 'outside_window' }),
        { 
          status: 409, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Send message via Meta Graph API
    const graphUrl = `https://graph.facebook.com/v21.0/${configData.phone_number_id}/messages`;
    const response = await fetch(graphUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${configData.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: to.replace('+', ''),
        type: 'text',
        text: {
          body: body
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Text message send error:', errorData);
      return new Response(
        JSON.stringify({ error: errorData.error?.message || 'Failed to send message' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const result = await response.json();

    // Log the message
    const message: Message = {
      id: result.messages?.[0]?.id || crypto.randomUUID(),
      direction: 'out',
      to,
      body,
      status: 'sent',
      timestamp: new Date().toISOString(),
    };

    messages.unshift(message);

    console.log('Text message sent successfully:', { to, messageId: result.messages?.[0]?.id });

    return new Response(
      JSON.stringify({ ok: true, message_id: result.messages?.[0]?.id }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error sending text message:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to send text message' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}

async function sendTemplateMessage(payload: { to: string; name: string; language: string; bodyParams?: string[] }) {
  try {
    const { to, name, language, bodyParams } = payload;

    if (!to || !name || !language) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get config from database
    const configData = await getWhatsAppConfig();
    if (!configData) {
      return new Response(
        JSON.stringify({ error: 'WhatsApp not configured' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Prepare template message
    const templateMessage: any = {
      messaging_product: 'whatsapp',
      to: to.replace('+', ''),
      type: 'template',
      template: {
        name,
        language: {
          code: language
        }
      }
    };

    // Add parameters if provided
    if (bodyParams && bodyParams.length > 0) {
      templateMessage.template.components = [
        {
          type: 'body',
          parameters: bodyParams.map(param => ({
            type: 'text',
            text: param
          }))
        }
      ];
    }

    // Send template message via Meta Graph API
    const graphUrl = `https://graph.facebook.com/v21.0/${configData.phone_number_id}/messages`;
    const response = await fetch(graphUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${configData.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(templateMessage),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Template message send error:', errorData);
      return new Response(
        JSON.stringify({ error: errorData.error?.message || 'Failed to send template message' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const result = await response.json();

    // Log the message
    const message: Message = {
      id: result.messages?.[0]?.id || crypto.randomUUID(),
      direction: 'out',
      to,
      template_name: name,
      status: 'sent',
      timestamp: new Date().toISOString(),
    };

    messages.unshift(message);

    console.log('Template message sent successfully:', { to, template: name, messageId: result.messages?.[0]?.id });

    return new Response(
      JSON.stringify({ ok: true, message_id: result.messages?.[0]?.id }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error sending template message:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to send template message' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}

// Helper function to get WhatsApp configuration from database
async function getWhatsAppConfig(): Promise<WhatsAppConfig | null> {
  try {
    const { data, error } = await supabase
      .from('whatsapp_config')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching WhatsApp config:', error);
      return null;
    }

    if (!data) {
      console.log('No WhatsApp configuration found');
      return null;
    }

    // Get the Meta API credentials from secrets
    const token = Deno.env.get('META_ACCESS_TOKEN');
    const phoneNumberId = Deno.env.get('META_PHONE_NUMBER_ID');

    if (!token || !phoneNumberId) {
      console.error('Meta API credentials not configured in secrets');
      return null;
    }

    return {
      id: data.id,
      token,
      phone_number_id: phoneNumberId,
      display_name: data.display_name,
      display_status: data.display_status
    };
  } catch (error) {
    console.error('Error in getWhatsAppConfig:', error);
    return null;
  }
}

// Configuration check function
async function checkConfiguration() {
  try {
    const config = await getWhatsAppConfig();
    
    if (!config) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'WhatsApp configuration not found. Please configure Meta API credentials.' 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Test the configuration by making a simple request to Meta API
    try {
      const testUrl = `https://graph.facebook.com/v21.0/${config.phone_number_id}`;
      const testResponse = await fetch(testUrl, {
        headers: {
          'Authorization': `Bearer ${config.token}`,
        },
      });

      if (testResponse.ok) {
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Meta WhatsApp Business API is configured and accessible',
            display_name: config.display_name,
            display_status: config.display_status
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      } else {
        const errorData = await testResponse.json();
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Meta API error: ${errorData.error?.message || 'Invalid credentials'}` 
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
}

// Template creation function
async function createTemplate(payload: any) {
  try {
    const { name, category, language, body_text } = payload;
    
    console.log('Creating template:', { name, category, language, body_text });

    if (!name || !body_text) {
      return new Response(
        JSON.stringify({ error: 'Template name and body text are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get config from database
    const configData = await getWhatsAppConfig();
    if (!configData) {
      return new Response(
        JSON.stringify({ error: 'WhatsApp not configured' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create template via Meta Graph API
    const graphUrl = `https://graph.facebook.com/v21.0/${configData.phone_number_id}/message_templates`;
    
    const templatePayload = {
      name: name,
      category: category || 'UTILITY',
      language: language || 'en_US',
      components: [
        {
          type: 'BODY',
          text: body_text
        }
      ]
    };

    console.log('Sending template creation request to Meta API:', templatePayload);

    const response = await fetch(graphUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${configData.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(templatePayload),
    });

    const result = await response.json();
    console.log('Meta API response:', result);

    if (!response.ok) {
      console.error('Template creation error:', result);
      return new Response(
        JSON.stringify({ 
          ok: false,
          error: result.error?.message || 'Failed to create template',
          details: result
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Template created successfully:', result);

    return new Response(
      JSON.stringify({ 
        ok: true, 
        template_id: result.id,
        message: 'Template created successfully'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error creating template:', error);
    return new Response(
      JSON.stringify({ 
        ok: false,
        error: 'Failed to create template',
        details: error.message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}
    } catch (apiError) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Failed to connect to Meta API: ${apiError.message}` 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
  } catch (error) {
    console.error('Error in checkConfiguration:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Failed to check configuration' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}