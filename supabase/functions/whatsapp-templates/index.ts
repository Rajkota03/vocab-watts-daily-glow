import { corsHeaders } from '../_shared/cors.ts';

// Define types
interface Template {
  id?: string;
  name: string;
  category: 'utility' | 'marketing';
  language: string;
  status: 'submitted' | 'approved' | 'rejected';
  body_text: string;
  example_params?: string[];
  created_at?: string;
  updated_at?: string;
}

// Simple in-memory storage (replace with actual database in production)
let templates: Template[] = [];

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
      case 'create':
        return await createTemplate(payload);
      case 'list':
        return await listTemplates();
      case 'update_status':
        return await updateTemplateStatus(payload);
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
    console.error('Error in whatsapp-templates function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function createTemplate(payload: Partial<Template>) {
  try {
    const { name, category, language, body_text, example_params } = payload;

    if (!name || !category || !language || !body_text) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get config (in real app, this would be from database)
    if (!configData || !configData.token || !configData.waba_id) {
      return new Response(
        JSON.stringify({ error: 'WhatsApp not configured' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Prepare template components
    const components = [
      {
        type: 'BODY',
        text: body_text,
        example: example_params ? {
          body_text: [example_params]
        } : undefined
      }
    ];

    // Create template via Meta Graph API
    const graphUrl = `https://graph.facebook.com/v21.0/${configData.waba_id}/message_templates`;
    const response = await fetch(graphUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${configData.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        category: category.toUpperCase(),
        language,
        components,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Template creation error:', errorData);
      return new Response(
        JSON.stringify({ error: errorData.error?.message || 'Failed to create template' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const result = await response.json();

    // Save template locally
    const template: Template = {
      id: result.id || crypto.randomUUID(),
      name,
      category,
      language,
      body_text,
      example_params,
      status: 'submitted',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    templates.push(template);

    console.log('Template created successfully:', { name, id: result.id });

    return new Response(
      JSON.stringify({ ok: true, template, template_id: result.id }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error creating template:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to create template' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}

async function listTemplates() {
  try {
    // Optionally fetch latest status from Meta API
    if (configData && configData.token && configData.waba_id) {
      try {
        const graphUrl = `https://graph.facebook.com/v21.0/${configData.waba_id}/message_templates`;
        const response = await fetch(graphUrl, {
          headers: {
            'Authorization': `Bearer ${configData.token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          // Update local templates with latest status
          if (data.data) {
            for (const remoteTemplate of data.data) {
              const localTemplate = templates.find(t => t.name === remoteTemplate.name);
              if (localTemplate) {
                localTemplate.status = remoteTemplate.status.toLowerCase();
                localTemplate.updated_at = new Date().toISOString();
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching template status:', error);
      }
    }

    return new Response(
      JSON.stringify({ templates }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error listing templates:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to list templates' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}

async function updateTemplateStatus(payload: { name: string; status: string }) {
  try {
    const { name, status } = payload;
    
    const template = templates.find(t => t.name === name);
    if (!template) {
      return new Response(
        JSON.stringify({ error: 'Template not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    template.status = status as 'submitted' | 'approved' | 'rejected';
    template.updated_at = new Date().toISOString();

    return new Response(
      JSON.stringify({ ok: true, template }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error updating template status:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to update template status' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}