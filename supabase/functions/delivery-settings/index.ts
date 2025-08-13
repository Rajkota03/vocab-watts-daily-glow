import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { method } = req;
    const url = new URL(req.url);
    const userId = url.searchParams.get('user_id');

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'user_id is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (method === 'GET') {
      // Get user delivery settings
      const { data: settings, error: settingsError } = await supabase
        .from('user_delivery_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (settingsError && settingsError.code !== 'PGRST116') {
        throw settingsError;
      }

      const { data: customTimes, error: timesError } = await supabase
        .from('user_custom_times')
        .select('*')
        .eq('user_id', userId)
        .order('position');

      if (timesError) {
        throw timesError;
      }

      return new Response(
        JSON.stringify({
          settings: settings || null,
          customTimes: customTimes || []
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    if (method === 'POST') {
      const body = await req.json();
      const { wordsPerDay, mode, customTimes, timezone } = body;

      // Validate input
      if (!wordsPerDay || wordsPerDay < 1 || wordsPerDay > 5) {
        return new Response(
          JSON.stringify({ error: 'wordsPerDay must be between 1 and 5' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      if (!mode || !['auto', 'custom'].includes(mode)) {
        return new Response(
          JSON.stringify({ error: 'mode must be auto or custom' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Save delivery settings
      const { error: settingsError } = await supabase
        .from('user_delivery_settings')
        .upsert({
          user_id: userId,
          words_per_day: wordsPerDay,
          mode: mode,
          timezone: timezone || 'UTC'
        });

      if (settingsError) {
        throw settingsError;
      }

      // Handle custom times
      if (mode === 'custom' && customTimes && Array.isArray(customTimes)) {
        // Delete existing custom times
        await supabase
          .from('user_custom_times')
          .delete()
          .eq('user_id', userId);

        // Insert new custom times
        const customTimesData = customTimes
          .slice(0, wordsPerDay)
          .map((time: string, index: number) => ({
            user_id: userId,
            position: index + 1,
            time: time
          }));

        const { error: timesError } = await supabase
          .from('user_custom_times')
          .insert(customTimesData);

        if (timesError) {
          throw timesError;
        }
      }

      // Generate today's schedule
      const todaySchedule = await generateTodaySchedule(userId, wordsPerDay, mode, customTimes);

      return new Response(
        JSON.stringify({
          success: true,
          todaySchedule
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in delivery-settings:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

async function generateTodaySchedule(userId: string, wordsPerDay: number, mode: string, customTimes?: string[]) {
  // Generate times based on mode
  let times: string[];
  
  if (mode === 'auto') {
    times = generateAutoTimes(wordsPerDay);
  } else {
    times = customTimes?.slice(0, wordsPerDay) || generateAutoTimes(wordsPerDay);
  }

  // Get user's timezone (default to UTC)
  const { data: settings } = await supabase
    .from('user_delivery_settings')
    .select('timezone')
    .eq('user_id', userId)
    .single();

  const timezone = settings?.timezone || 'UTC';
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  return times.map((time, index) => ({
    position: index + 1,
    time: time,
    sendAt: `${today}T${time}:00`,
    timezone: timezone
  }));
}

function generateAutoTimes(wordCount: number): string[] {
  const start = 9; // 9 AM
  const end = 21; // 9 PM
  const interval = (end - start) / Math.max(1, wordCount - 1);
  
  return Array.from({ length: wordCount }, (_, i) => {
    const hour = Math.round(start + (i * interval));
    return `${hour.toString().padStart(2, '0')}:00`;
  });
}