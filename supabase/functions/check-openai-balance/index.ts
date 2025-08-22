import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not found in environment variables');
    }

    // Check usage
    const usageResponse = await fetch('https://api.openai.com/v1/usage', {
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!usageResponse.ok) {
      throw new Error(`OpenAI API error: ${usageResponse.status} ${usageResponse.statusText}`);
    }

    const usageData = await usageResponse.json();
    
    // Check subscription (for limits and granted amount)
    const subscriptionResponse = await fetch('https://api.openai.com/v1/dashboard/billing/subscription', {
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    let subscriptionData = null;
    if (subscriptionResponse.ok) {
      subscriptionData = await subscriptionResponse.json();
    }

    // Get current month usage
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const billingResponse = await fetch(`https://api.openai.com/v1/dashboard/billing/usage?start_date=${startDate.toISOString().split('T')[0]}&end_date=${endDate.toISOString().split('T')[0]}`, {
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    let billingData = null;
    if (billingResponse.ok) {
      billingData = await billingResponse.json();
    }

    const result = {
      total_granted: subscriptionData?.hard_limit_usd || subscriptionData?.plan?.title === 'Free' ? 5.00 : null,
      total_used: billingData ? billingData.total_usage / 100 : null, // Convert cents to dollars
      effective_hard_limit: subscriptionData?.hard_limit_usd,
      system_hard_limit: subscriptionData?.system_hard_limit_usd,
      plan_title: subscriptionData?.plan?.title,
      monthly_usage: billingData?.total_usage ? billingData.total_usage / 100 : null,
    };

    console.log('OpenAI balance check result:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error checking OpenAI balance:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Failed to fetch OpenAI usage data. Please verify your API key has the necessary permissions.'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});