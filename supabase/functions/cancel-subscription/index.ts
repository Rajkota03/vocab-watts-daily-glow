import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0"
import Razorpay from "npm:razorpay"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID')!
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET')!
    
    if (!razorpayKeyId || !razorpayKeySecret) {
      throw new Error('Razorpay credentials not configured')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    })

    // Get user from JWT token
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (userError || !user) {
      throw new Error('Invalid user token')
    }

    console.log('Cancelling subscription for user:', user.id)

    // Get user's active subscription
    const { data: subscription, error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_pro', true)
      .gt('subscription_ends_at', new Date().toISOString())
      .single()

    if (subscriptionError || !subscription) {
      return new Response(
        JSON.stringify({ error: 'No active subscription found' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      )
    }

    // Cancel subscription with Razorpay if subscription ID exists
    if (subscription.razorpay_subscription_id) {
      try {
        console.log('Cancelling Razorpay subscription:', subscription.razorpay_subscription_id)
        await razorpay.subscriptions.cancel(subscription.razorpay_subscription_id, {
          cancel_at_cycle_end: 1 // Cancel at the end of current billing cycle
        })
        console.log('Razorpay subscription cancelled successfully')
      } catch (razorpayError) {
        console.error('Error cancelling Razorpay subscription:', razorpayError)
        // Continue with local cancellation even if Razorpay fails
      }
    }

    // Update subscription status in database
    const { error: updateError } = await supabase
      .from('user_subscriptions')
      .update({
        subscription_status: 'cancelled'
      })
      .eq('user_id', user.id)

    if (updateError) {
      throw new Error(`Failed to update subscription status: ${updateError.message}`)
    }

    console.log('Subscription cancelled successfully for user:', user.id)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Subscription cancelled successfully. You will continue to have access until the end of your current billing period.',
        subscription_ends_at: subscription.subscription_ends_at
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error: any) {
    console.error('Error cancelling subscription:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to cancel subscription' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})