import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0"
import { createHmac } from "https://deno.land/std@0.168.0/node/crypto.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-razorpay-signature",
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const webhookSecret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET')
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Get the raw body and signature
    const body = await req.text()
    const signature = req.headers.get('x-razorpay-signature')
    
    // Verify webhook signature if secret is provided
    if (webhookSecret && signature) {
      const expectedSignature = createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex')
      
      if (expectedSignature !== signature) {
        console.error('Invalid webhook signature')
        return new Response('Invalid signature', { status: 401 })
      }
    }
    
    const event = JSON.parse(body)
    console.log('Razorpay webhook event:', event.event, event.payload?.subscription?.entity?.id)
    
    switch (event.event) {
      case 'subscription.activated': {
        const subscription = event.payload.subscription.entity
        const phoneNumber = subscription.notes?.phone_number
        
        if (phoneNumber) {
          // Update subscription status to active and extend end date
          const { error } = await supabase
            .from('user_subscriptions')
            .update({
              subscription_ends_at: new Date(subscription.current_end * 1000).toISOString(),
              razorpay_subscription_id: subscription.id,
              subscription_status: 'active'
            })
            .eq('phone_number', phoneNumber)
          
          if (error) {
            console.error('Error updating subscription:', error)
          } else {
            console.log('Subscription activated for:', phoneNumber)
          }
        }
        break
      }
      
      case 'subscription.charged': {
        const subscription = event.payload.subscription.entity
        const payment = event.payload.payment.entity
        const phoneNumber = subscription.notes?.phone_number
        
        if (phoneNumber) {
          // Extend subscription end date for another month
          const currentEnd = new Date(subscription.current_end * 1000)
          const newEnd = new Date(currentEnd.getTime() + (30 * 24 * 60 * 60 * 1000)) // Add 30 days
          
          const { error } = await supabase
            .from('user_subscriptions')
            .update({
              subscription_ends_at: newEnd.toISOString(),
              razorpay_payment_id: payment.id,
              subscription_status: 'active'
            })
            .eq('phone_number', phoneNumber)
          
          if (error) {
            console.error('Error updating subscription after charge:', error)
          } else {
            console.log('Subscription renewed for:', phoneNumber, 'until:', newEnd.toISOString())
          }
        }
        break
      }
      
      case 'subscription.cancelled': {
        const subscription = event.payload.subscription.entity
        const phoneNumber = subscription.notes?.phone_number
        
        if (phoneNumber) {
          // Keep subscription active until current period ends, but mark as cancelled
          const { error } = await supabase
            .from('user_subscriptions')
            .update({
              // Don't change subscription_ends_at - let it expire naturally
              razorpay_subscription_id: subscription.id,
              subscription_status: 'cancelled'
            })
            .eq('phone_number', phoneNumber)
          
          if (error) {
            console.error('Error updating cancelled subscription:', error)
          } else {
            console.log('Subscription cancelled for:', phoneNumber)
          }
        }
        break
      }
      
      case 'subscription.completed': {
        const subscription = event.payload.subscription.entity
        const phoneNumber = subscription.notes?.phone_number
        
        if (phoneNumber) {
          // Mark subscription as ended
          const { error } = await supabase
            .from('user_subscriptions')
            .update({
              is_pro: false,
              subscription_ends_at: new Date().toISOString(),
              subscription_status: 'expired'
            })
            .eq('phone_number', phoneNumber)
          
          if (error) {
            console.error('Error completing subscription:', error)
          } else {
            console.log('Subscription completed for:', phoneNumber)
          }
        }
        break
      }
      
      default:
        console.log('Unhandled webhook event:', event.event)
    }
    
    return new Response('OK', {
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
      status: 200,
    })
    
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
