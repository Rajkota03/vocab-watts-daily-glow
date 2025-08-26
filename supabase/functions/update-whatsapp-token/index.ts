import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get WhatsApp configuration from environment variables
    const metaAccessToken = Deno.env.get('META_ACCESS_TOKEN')
    const metaPhoneNumberId = Deno.env.get('META_PHONE_NUMBER_ID')
    const whatsappVerifyToken = Deno.env.get('WHATSAPP_VERIFY_TOKEN')

    if (!metaAccessToken || !metaPhoneNumberId || !whatsappVerifyToken) {
      console.error('Missing required WhatsApp environment variables')
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'WhatsApp configuration missing. Please contact administrator.' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Update the WhatsApp configuration with tokens from environment
    const { data, error } = await supabase
      .from('whatsapp_config')
      .upsert({
        token: metaAccessToken,
        phone_number_id: metaPhoneNumberId,
        verify_token: whatsappVerifyToken,
        provider: 'meta',
        updated_at: new Date().toISOString()
      })
      .select()

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Token updated successfully:', data)

    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error updating token:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})