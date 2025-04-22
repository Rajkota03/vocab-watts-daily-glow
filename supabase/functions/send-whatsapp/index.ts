import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WhatsAppRequest {
  to: string;
  message?: string;
  category?: string;
  isPro?: boolean;
  skipSubscriptionCheck?: boolean;
  userId?: string;
  scheduledTime?: string;
}

function formatWhatsAppNumber(number: string): string {
  if (number.startsWith('whatsapp:+')) {
    return number;
  }
  
  let cleaned = number.startsWith('whatsapp:') ? number.substring(9) : number;
  
  cleaned = cleaned.replace(/\D/g, '');
  
  if (!cleaned.startsWith('1') && !cleaned.startsWith('91')) {
    if (cleaned.length === 10) {
      cleaned = '91' + cleaned;
    } else {
      cleaned = '1' + cleaned;
    }
  }
  
  if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }
  
  return `whatsapp:${cleaned}`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { to, message, category, isPro, skipSubscriptionCheck, userId, scheduledTime } = await req.json() as WhatsAppRequest;

    if (scheduledTime) {
      const scheduledDate = new Date(scheduledTime);
      if (scheduledDate > new Date()) {
        const supabaseClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        const { error: scheduleError } = await supabaseClient
          .from('scheduled_messages')
          .insert({
            phone_number: to,
            message,
            category,
            is_pro: isPro,
            scheduled_time: scheduledTime,
            user_id: userId
          });

        if (scheduleError) {
          console.error('Error scheduling message:', scheduleError);
          throw new Error('Failed to schedule message');
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            scheduled: true,
            scheduledTime,
            message: "Message scheduled successfully"
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    let nickname = "there";
    if (userId) {
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('nick_name, first_name')
        .eq('id', userId)
        .single();

      if (profile) {
        nickname = profile.nick_name || profile.first_name;
      }
    }

    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    
    console.log('Twilio credentials check:', { 
      accountSid: accountSid ? `${accountSid.substring(0, 5)}...${accountSid.substring(accountSid.length - 3)}` : 'missing',
      authToken: authToken ? 'present (hidden)' : 'missing'
    });

    const fromNumber = 'whatsapp:+14155238886';

    if (!accountSid || !authToken) {
      const errorMessage = 'Missing Twilio credentials';
      console.error(errorMessage, { 
        hasSid: !!accountSid, 
        hasToken: !!authToken 
      });
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: errorMessage,
          details: { 
            message: "Please check that TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are set in Supabase environment variables."
          }
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const toNumber = formatWhatsAppNumber(to);
    
    let finalMessage = message;
    if (!finalMessage && category) {
      const vocabWords = [
        { word: "articulate", definition: "expressed, formulated, or presented with clarity", example: "She is known for her articulate explanations of complex topics." },
        { word: "resilient", definition: "able to withstand or recover quickly from difficult conditions", example: "The resilient community rebuilt after the disaster." },
        { word: "pragmatic", definition: "dealing with things sensibly and realistically", example: "We need a pragmatic approach to solve this issue." },
        { word: "perspicacious", definition: "having keen insight or understanding", example: "His perspicacious observation helped solve the mystery." },
        { word: "eloquent", definition: "fluent or persuasive in speaking or writing", example: "The politician gave an eloquent speech that moved the audience." }
      ];
      
      const header = `🌟 *Hi ${nickname}! Here are Your VocabSpark Words* 🌟\n\n`;
      const wordsList = vocabWords.map((word, index) => 
        `*${index + 1}. ${word.word}*\nDefinition: ${word.definition}\nExample: _"${word.example}"_\n\n`
      ).join('');
      const footer = isPro 
        ? `\n🚀 *${nickname}, thank you for being a Pro subscriber!*`
        : `\n👉 Hey ${nickname}, upgrade to Pro for custom word categories and more features!`;
      
      finalMessage = header + wordsList + footer;
    }
    
    if (finalMessage) {
      finalMessage += `\n\n---\nFirst time? You need to join the Twilio Sandbox first!\nSend 'join part-every' to +1 415 523 8886 on WhatsApp.`;
    } else {
      finalMessage = `Hello ${nickname}! This is a test message from VocabSpark.\n\n---\nFirst time? You need to join the Twilio Sandbox first!\nSend 'join part-every' to +1 415 523 8886 on WhatsApp.`;
    }
    
    console.log(`Sending WhatsApp message from ${fromNumber} to ${toNumber}`);
    console.log(`Message content (first 50 chars): ${finalMessage.substring(0, 50)}...`);

    try {
      const twilioResponse = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${btoa(`${accountSid}:${authToken}`)}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            To: toNumber,
            From: fromNumber,
            Body: finalMessage,
          }).toString(),
        }
      );

      const twilioData = await twilioResponse.json();
      
      console.log('Twilio response status:', twilioResponse.status);
      console.log('Twilio response data:', JSON.stringify(twilioData).substring(0, 200) + '...');

      if (!twilioResponse.ok) {
        console.error('Twilio API error:', JSON.stringify(twilioData));
        
        let errorMessage = twilioData.message || 'Failed to send WhatsApp message';
        let statusCode = twilioResponse.status || 500;
        
        if (twilioData.code === 20003 || statusCode === 401) {
          errorMessage = "Authentication failed. Please verify your Twilio credentials.";
        }
        
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: errorMessage,
            details: twilioData,
            status: statusCode,
            troubleshooting: "Verify that your TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are correct in Supabase environment variables."
          }),
          {
            status: statusCode,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      console.log('WhatsApp message sent successfully:', twilioData.sid);

      return new Response(
        JSON.stringify({ 
          success: true, 
          messageId: twilioData.sid,
          status: twilioData.status,
          details: twilioData,
          sandboxMode: true,
          to: toNumber,
          from: fromNumber
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } catch (twilioError) {
      console.error('Error during Twilio API call:', twilioError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: twilioError.message || 'Network error while calling Twilio API',
          details: {
            message: "There was an error communicating with the Twilio API.",
            originalError: String(twilioError)
          }
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error) {
    console.error('Error in send-whatsapp function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to send WhatsApp message',
        details: String(error)
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
