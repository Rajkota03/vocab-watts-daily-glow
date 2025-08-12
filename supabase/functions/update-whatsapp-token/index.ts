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

    // Update the WhatsApp configuration with new token
    const { data, error } = await supabase
      .from('whatsapp_config')
      .upsert({
        token: 'EAAXbVrl8PJkBPFpwqILHVNZA0YU0b3Qylm0K3o2vD28ARaiGd4kiASqbbf98NyBcc9n3VpptZAzuaeoCYAU060kpIHpP2i5mVBy2srBhE6i04Ma05B7zK2o9Fu7SglLiSqF1axgEUcufZCZCWk2JcfIXK53AbC12PNrYXvqpwZBi6lHFszjjbMN0ukpER5HTKcAZDZD',
        phone_number_id: '1210928836703397',
        verify_token: 'glintup_verify_2024',
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