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

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...payload } = await req.json();

    switch (action) {
      case 'list':
        return await listMessages(payload);
      case 'add_contact':
        return await addContact(payload);
      case 'log_message':
        return await logMessage(payload);
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
    console.error('Error in whatsapp-messages function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function listMessages(payload: { limit?: number; offset?: number }) {
  try {
    const { limit = 10, offset = 0 } = payload;
    
    const paginatedMessages = messages
      .slice(offset, offset + limit)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return new Response(
      JSON.stringify({ 
        messages: paginatedMessages,
        total: messages.length,
        limit,
        offset
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error listing messages:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to list messages' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}

async function addContact(payload: { wa_id: string; phone_e164: string }) {
  try {
    const { wa_id, phone_e164 } = payload;

    if (!wa_id || !phone_e164) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check if contact already exists
    let contact = contacts.find(c => c.wa_id === wa_id);
    
    if (contact) {
      // Update last incoming timestamp
      contact.last_incoming_ts = Date.now();
      contact.phone_e164 = phone_e164;
    } else {
      // Create new contact
      contact = {
        wa_id,
        phone_e164,
        last_incoming_ts: Date.now(),
      };
      contacts.push(contact);
    }

    console.log('Contact updated:', { wa_id, phone_e164 });

    return new Response(
      JSON.stringify({ ok: true, contact }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error adding contact:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to add contact' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}

async function logMessage(payload: Partial<Message>) {
  try {
    const message: Message = {
      id: payload.id || crypto.randomUUID(),
      direction: payload.direction || 'in',
      to: payload.to,
      from: payload.from,
      body: payload.body,
      template_name: payload.template_name,
      status: payload.status,
      timestamp: payload.timestamp || new Date().toISOString(),
    };

    messages.unshift(message);

    // Keep only last 1000 messages to prevent memory issues
    if (messages.length > 1000) {
      messages = messages.slice(0, 1000);
    }

    console.log('Message logged:', { id: message.id, direction: message.direction });

    return new Response(
      JSON.stringify({ ok: true, message }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error logging message:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to log message' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}
