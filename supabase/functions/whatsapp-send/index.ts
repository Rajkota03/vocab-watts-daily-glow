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
  waba_id: string;
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

    // Handle initialization of WhatsApp config
    if (requestData.initConfig) {
      return await initializeConfiguration();
    }

    // Handle configuration check with detailed logging
    if (requestData.checkConfig) {
      return await checkConfiguration();
    }

    // Handle daily words sending (vocabulary words)
    if (requestData.category && requestData.to) {
      return await sendDailyWords(requestData);
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

// Daily words sending function
async function sendDailyWords(payload: any) {
  console.log('sendDailyWords called with payload:', payload);
  
  try {
    const { to, category, isPro, message } = payload;
    
    console.log('Sending daily words:', { to, category, isPro });

    if (!to) {
      console.log('No recipient phone number provided');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Recipient phone number is required' 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get config from database
    console.log('Getting WhatsApp config...');
    const configData = await getWhatsAppConfig();
    console.log('Config data received:', configData ? 'Found' : 'Not found');
    
    if (!configData) {
      console.log('No WhatsApp configuration found');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'WhatsApp not configured' 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    let finalMessage = message || `Here are your daily vocabulary words for ${category}. Enjoy learning!`;
    console.log('Initial message:', finalMessage);
    let firstWord: any = null;

    // If category is provided, generate vocabulary words
    if (category) {
      console.log(`Generating vocabulary words for category: ${category}`);
      try {
        const { data: wordsData, error: wordsError } = await supabase.functions.invoke('generate-vocab-words', {
          body: {
            category: category,
            count: isPro ? 5 : 3 // Pro users get more words
          }
        });

        console.log('Words generation result:', { wordsData, wordsError });

        if (wordsError) {
          console.error('Error generating words:', wordsError);
          // Don't throw, just continue with default message
          finalMessage = `📚 Your daily vocabulary words for ${category} are ready!`;
        } else if (wordsData && wordsData.words && wordsData.words.length > 0) {
          // Format the words into a nice message
          const wordsText = wordsData.words.map((word: any, index: number) => 
            `${index + 1}. *${word.word}*\n   📖 ${word.definition}\n   💡 Example: _${word.example}_`
          ).join('\n\n');
          
          // Keep reference to the first word for template params
          firstWord = wordsData.words[0];
          
          finalMessage = `🌟 *Daily Vocabulary - ${category.toUpperCase()}*\n\n${wordsText}\n\n📚 Keep learning! 🚀`;
          console.log('Generated vocabulary message');
        } else {
          console.log('No words returned from generation');
          finalMessage = `📚 Your daily vocabulary words for ${category} are ready!`;
        }
      } catch (error) {
        console.error('Error in vocabulary generation:', error);
        // Continue with the default message if word generation fails
        finalMessage = `📚 Your daily vocabulary words for ${category} are ready! Check your app for more details.`;
      }
    }

    // Try direct send using configured template (faster and avoids lookup)
    const configuredTemplate = Deno.env.get('WA_TEMPLATE_NAME');
    const configuredLocale = Deno.env.get('WA_TEMPLATE_LOCALE') || 'en_US';
    if (configuredTemplate) {
      try {
        const params = firstWord
          ? [
              'Learner',
              `${firstWord.word}`,
              `${firstWord.pronunciation || ''}`,
              `${firstWord.definition || ''}`,
              `${firstWord.example || ''}`
            ]
          : undefined;
        console.log('Attempting direct template send with', configuredTemplate);
        return await sendTemplateMessage({
          to,
          name: configuredTemplate,
          language: configuredLocale,
          bodyParams: params
        });
      } catch (directErr) {
        console.log('Direct template send failed, will try lookup fallback:', directErr);
      }
    }

    // Fallback: Fetch existing templates from Meta and try to use one
    console.log('Fetching templates from Meta API...');
    let templates = [];
    try {
      templates = await getMetaTemplates(configData);
      console.log(`Found ${templates.length} templates from Meta API`);
    } catch (error) {
      console.error('Error fetching Meta templates:', error);
      templates = [];
    }
    
    if (templates.length > 0) {
      // Look for an approved template that we can use
      const approvedTemplate = templates.find(t => t.status === 'APPROVED');
      
      if (approvedTemplate) {
        console.log('Using approved template:', approvedTemplate.name);
        try {
          // Try to send using the approved template
          return await sendTemplateMessage({
            to,
            name: approvedTemplate.name,
            language: approvedTemplate.language || 'en_US',
            bodyParams: approvedTemplate.components?.[0]?.text ? [] : [finalMessage]
          });
        } catch (templateError) {
          console.log('Template message failed:', templateError);
        }
      } else {
        console.log('No approved templates found, templates available:', templates.map(t => ({ name: t.name, status: t.status })));
      }
    } else {
      console.log('No templates found from Meta API');
    }

    // If template sending fails or no templates available, return the prepared message
    console.log('Returning success response with prepared message');
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Daily words prepared successfully',
        content: finalMessage,
        note: 'Template not available - message prepared for manual sending',
        templates_available: templates.length,
        approved_templates: templates.filter(t => t.status === 'APPROVED').length
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in sendDailyWords:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Failed to send daily words',
        details: error.message,
        stack: error.stack
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}

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
    console.log('Starting getWhatsAppConfig...');
    
    // First check if we have the required environment variables
    const token = Deno.env.get('META_ACCESS_TOKEN');
    const phoneNumberId = Deno.env.get('META_PHONE_NUMBER_ID');
    const wabaId = Deno.env.get('WA_WABA_ID');
    
    console.log('Environment check:', {
      hasToken: !!token,
      hasPhoneNumberId: !!phoneNumberId,
      hasWabaId: !!wabaId,
      tokenLength: token ? token.length : 0,
      phoneNumberId: phoneNumberId ? phoneNumberId.substring(0, 10) + '...' : 'missing',
      wabaId: wabaId ? wabaId.substring(0, 10) + '...' : 'missing'
    });

    if (!token || !phoneNumberId || !wabaId) {
      console.error('Meta API credentials not configured in secrets:', {
        token: !!token,
        phoneNumberId: !!phoneNumberId
      });
      return null;
    }

    // Try to get or create config in database
    console.log('Querying whatsapp_config table...');
    const { data, error } = await supabase
      .from('whatsapp_config')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    console.log('Database query result:', {
      hasData: !!data,
      error: error?.message,
      dataId: data?.id
    });

    if (error) {
      console.error('Error fetching WhatsApp config:', error);
      
      // Try to create a new config if none exists
      console.log('Attempting to create new config...');
      const { data: newData, error: insertError } = await supabase
        .from('whatsapp_config')
        .insert({
          provider: 'meta',
          webhook_verified: false,
        })
        .select()
        .single();
        
      console.log('Insert result:', {
        hasNewData: !!newData,
        insertError: insertError?.message
      });
      
      if (insertError) {
        console.error('Failed to create WhatsApp config:', insertError);
        return null;
      }
      
      // Use the newly created config
      return {
        id: newData.id,
        token,
        phone_number_id: phoneNumberId,
        waba_id: wabaId,
        display_name: 'Meta WhatsApp',
        display_status: 'active'
      };
    }

    if (!data) {
      console.log('No existing configuration found, creating new one...');
      const { data: newData, error: insertError } = await supabase
        .from('whatsapp_config')
        .insert({
          provider: 'meta',
          webhook_verified: false,
        })
        .select()
        .single();
        
      console.log('New config creation result:', {
        hasNewData: !!newData,
        insertError: insertError?.message
      });
      
      if (insertError) {
        console.error('Failed to create WhatsApp config:', insertError);
        return null;
      }
      
      return {
        id: newData.id,
        token,
        phone_number_id: phoneNumberId,
        waba_id: wabaId,
        display_name: 'Meta WhatsApp',
        display_status: 'active'
      };
    }

    console.log('Using existing configuration');
    return {
      id: data.id,
      token,
      phone_number_id: phoneNumberId,
      waba_id: wabaId,
      display_name: data.display_name || 'Meta WhatsApp',
      display_status: data.display_status || 'active'
    };
  } catch (error) {
    console.error('Exception in getWhatsAppConfig:', error);
    return null;
  }
}

// Helper function to fetch existing templates from Meta API
async function getMetaTemplates(config: WhatsAppConfig): Promise<any[]> {
  try {
    // Use the WABA ID for fetching message templates - this is the correct endpoint
    const graphUrl = `https://graph.facebook.com/v21.0/${config.waba_id}/message_templates?limit=200`;
    console.log('Fetching templates from:', graphUrl.replace(config.waba_id, config.waba_id.substring(0, 10) + '...'));
    
    const response = await fetch(graphUrl, {
      headers: {
        'Authorization': `Bearer ${config.token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to fetch templates:', errorData);
      return [];
    }

    const result = await response.json();
    console.log('Available templates from Meta:', result.data);
    return result.data || [];
  } catch (error) {
    console.error('Error fetching Meta templates:', error);
    return [];
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

// Initialize WhatsApp configuration function
async function initializeConfiguration() {
  try {
    // Check if configuration already exists
    const existingConfig = await getWhatsAppConfig();
    if (existingConfig) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'WhatsApp configuration already exists',
          phone_number_id: existingConfig.phone_number_id
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create initial configuration entry
    const { data, error } = await supabase
      .from('whatsapp_config')
      .insert({
        provider: 'meta',
        webhook_verified: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating WhatsApp config:', error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to create WhatsApp configuration' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'WhatsApp configuration initialized successfully',
        config_id: data.id
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error in initializeConfiguration:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Failed to initialize configuration' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}