import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

async function sendTestAdminNotification() {
  try {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    // Get actual subscription data for a realistic test
    const { data: subscriptions } = await supabase
      .from('user_subscriptions')
      .select('*')
      .or(`trial_ends_at.gte.${now.toISOString()},subscription_ends_at.gte.${now.toISOString()},and(is_pro.eq.true,subscription_ends_at.is.null)`);

    // Get recent outbox messages for today to simulate real data
    const { data: todayMessages } = await supabase
      .from('outbox_messages')
      .select('*')
      .gte('send_at', `${today}T00:00:00.000Z`)
      .lt('send_at', `${today}T23:59:59.999Z`);

    const totalSubscriptions = subscriptions?.length || 0;
    const successfulSchedules = Math.floor(totalSubscriptions * 0.9); // Simulate 90% success
    const partialSchedules = Math.floor(totalSubscriptions * 0.05); // Simulate 5% partial
    const failedSchedules = totalSubscriptions - successfulSchedules - partialSchedules;
    const totalMessages = todayMessages?.length || 0;

    // Create mock results for demonstration
    const mockResults = [
      { status: 'scheduled', messagesCount: 3 },
      { status: 'scheduled', messagesCount: 3 },
      { status: 'partial', messagesCount: 2 },
      ...(failedSchedules > 0 ? [{ status: 'failed', phone: '+91XXXXXXXXX', error: 'Test error for demonstration' }] : [])
    ];

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">🧪 TEST - GlintUp Daily Scheduler Report</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Date: ${today}</p>
          <p style="margin: 5px 0 0 0; background: rgba(255,255,255,0.2); padding: 5px 10px; border-radius: 15px; display: inline-block; font-size: 12px;">This is a test email</p>
        </div>
        
        <div style="padding: 20px; background-color: #f8f9fa;">
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 20px;">
            <div style="background: white; padding: 15px; border-radius: 8px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h3 style="margin: 0 0 5px 0; color: #28a745; font-size: 24px;">${successfulSchedules}</h3>
              <p style="margin: 0; color: #666; font-size: 14px;">Successful</p>
            </div>
            <div style="background: white; padding: 15px; border-radius: 8px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h3 style="margin: 0 0 5px 0; color: #dc3545; font-size: 24px;">${failedSchedules}</h3>
              <p style="margin: 0; color: #666; font-size: 14px;">Failed</p>
            </div>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h3 style="margin: 0 0 15px 0; color: #333;">Summary</h3>
            <ul style="margin: 0; padding-left: 20px; color: #666;">
              <li>Total Active Subscriptions: ${totalSubscriptions}</li>
              <li>Successfully Scheduled: ${successfulSchedules}</li>
              <li>Partially Scheduled: ${partialSchedules}</li>
              <li>Failed: ${failedSchedules}</li>
              <li>Total Messages Scheduled Today: ${totalMessages}</li>
            </ul>
          </div>
          
          <div style="background: #e3f2fd; border: 1px solid #90caf9; padding: 20px; border-radius: 8px; margin-top: 20px;">
            <h3 style="margin: 0 0 15px 0; color: #1565c0;">📊 Test Data Notice</h3>
            <p style="margin: 0; color: #1565c0; font-size: 14px;">
              This is a test email with simulated statistics. Actual daily reports will contain real scheduling results.
            </p>
          </div>
        </div>
        
        <div style="background: #667eea; color: white; padding: 15px; text-align: center; font-size: 12px;">
          <p style="margin: 0;">🧪 This is a TEST notification from GlintUp Daily Scheduler</p>
          <p style="margin: 5px 0 0 0; opacity: 0.8;">Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</p>
        </div>
      </div>
    `;

    await resend.emails.send({
      from: 'GlintUp System <noreply@glintup.com>',
      to: ['admin@glintup.com'],
      subject: `🧪 TEST - Daily Scheduler Report - ${today}`,
      html: emailHtml,
    });

    console.log('Test admin notification email sent successfully');
    return { success: true, message: 'Test email sent successfully' };
  } catch (error) {
    console.error('Failed to send test admin notification email:', error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Test daily report email started');
    
    const result = await sendTestAdminNotification();

    return new Response(
      JSON.stringify({
        success: true,
        message: result.message,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in test-daily-report:', error);
    return new Response(
      JSON.stringify({
        success: false,
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