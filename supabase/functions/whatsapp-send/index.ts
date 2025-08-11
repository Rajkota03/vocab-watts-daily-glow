import { corsHeaders } from '../_shared/cors.ts';

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

// Simple in-memory storage (replace with actual database in production)
let contacts: Contact[] = [];
let messages: Message[] = [];

// External config reference (in a real app, this would be from database)
let configData: any = null;

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...payload } = await req.json();

    switch (action) {
      case 'send_text':
        return await sendTextMessage(payload);
      case 'send_template':
        return await sendTemplateMessage(payload);
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

    // Get config (in real app, this would be from database)
    if (!configData || !configData.token || !configData.phone_number_id) {
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

    // Get config (in real app, this would be from database)
    if (!configData || !configData.token || !configData.phone_number_id) {
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