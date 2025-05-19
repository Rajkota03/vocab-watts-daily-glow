
// Import necessary libraries
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

// Define AiSensy templates API URL - making businessId optional
const aisensyTemplatesUrl = (apiKey: string) => 
  `https://api.aisensy.com/campaign/templates?apiKey=${apiKey}`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // --- Extract credentials from environment variables ---
    const apiKey = Deno.env.get("AISENSY_API_KEY");
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "AiSensy API key is not configured",
          details: {
            apiKey: "missing"
          }
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }
    
    // Parse request data
    let action = "list";
    try {
      const requestBody = await req.json();
      action = requestBody.action || "list";
    } catch (e) {
      // If request doesn't have a JSON body, default to list action
      console.log("No request body or invalid JSON, using default action:", action);
    }
    
    // Fetch templates from AiSensy API
    const response = await fetch(aisensyTemplatesUrl(apiKey), {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch templates: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Return the templates
    return new Response(
      JSON.stringify({
        success: true,
        templates: data.templates || [],
        count: data.templates?.length || 0,
        details: {
          status: response.status,
          apiResponse: data
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Error fetching AiSensy templates:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        templates: []
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  }
});
