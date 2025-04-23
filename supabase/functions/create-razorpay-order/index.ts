
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

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
    const { phoneNumber, category, isPro } = await req.json();

    // Validate the request
    if (!phoneNumber) {
      return new Response(
        JSON.stringify({ error: 'Phone number is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the Razorpay API key and secret
    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID');
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
    
    if (!razorpayKeyId || !razorpayKeySecret) {
      console.error('Missing Razorpay credentials');
      return new Response(
        JSON.stringify({ error: 'Missing Razorpay credentials' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If trial, create subscription without payment
    if (!isPro) {
      console.log('Creating free trial subscription');
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: { 
            id: `free_trial_${Date.now()}`,
            amount: 0,
            freeSignup: true 
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate amount for pro subscription (₹149 = 14900 paise)
    const amount = 14900;
    
    // Create an order in Razorpay
    console.log('Creating Razorpay order for Pro subscription');
    const auth = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: amount,
        currency: 'INR',
        receipt: `glintup_${Date.now()}`,
        notes: {
          phone_number: phoneNumber,
          category: category || 'general',
          plan: 'pro'
        }
      })
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Razorpay API error:', result);
      return new Response(
        JSON.stringify({ error: 'Failed to create order', details: result }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Razorpay order created successfully:', result);
    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          ...result,
          key: razorpayKeyId // Add key for frontend initialization
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error handling request:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
