
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

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
    // Initialize Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Create message_logs table for tracking WhatsApp message statuses
    const createMessageLogsTableQuery = `
      CREATE TABLE IF NOT EXISTS public.message_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        message_sid TEXT UNIQUE,
        to_number TEXT NOT NULL,
        status TEXT NOT NULL,
        error_code TEXT,
        error_message TEXT,
        message_type TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
      );
      
      -- Set up RLS policies
      ALTER TABLE public.message_logs ENABLE ROW LEVEL SECURITY;
      
      -- Create policy for admins to view all logs
      DROP POLICY IF EXISTS "Admins can view all message logs" ON public.message_logs;
      CREATE POLICY "Admins can view all message logs" 
        ON public.message_logs 
        FOR SELECT 
        USING (auth.jwt() -> 'role' = 'admin');
        
      -- Create policy to allow the webhook function to insert/update logs
      DROP POLICY IF EXISTS "Functions can insert message logs" ON public.message_logs;
      CREATE POLICY "Functions can insert message logs" 
        ON public.message_logs 
        FOR INSERT WITH CHECK (true);
        
      DROP POLICY IF EXISTS "Functions can update message logs" ON public.message_logs;
      CREATE POLICY "Functions can update message logs" 
        ON public.message_logs 
        FOR UPDATE USING (true);
        
      -- Add updated_at trigger
      CREATE OR REPLACE FUNCTION public.handle_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = now();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
      
      DROP TRIGGER IF EXISTS set_message_logs_updated_at ON public.message_logs;
      CREATE TRIGGER set_message_logs_updated_at
      BEFORE UPDATE ON public.message_logs
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_updated_at();
    `;

    const { error: createTableError } = await supabaseAdmin.rpc(
      'run_sql', 
      { query: createMessageLogsTableQuery }
    );
    
    if (createTableError) {
      console.error("Error creating message_logs table:", createTableError);
      return new Response(
        JSON.stringify({ success: false, error: createTableError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "WhatsApp message_logs table created successfully",
        instructions: [
          "The message_logs table will track WhatsApp message delivery statuses",
          "Webhook events from Twilio will update the message status automatically"
        ]
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Unexpected error creating WhatsApp tables:", error);
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
