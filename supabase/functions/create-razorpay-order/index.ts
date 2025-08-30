
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
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
    const key_id = Deno.env.get('RAZORPAY_KEY_ID')
    const key_secret = Deno.env.get('RAZORPAY_KEY_SECRET')

    if (!key_id || !key_secret) {
      throw new Error('Missing Razorpay credentials')
    }

    const razorpay = new Razorpay({
      key_id,
      key_secret,
    })

    const { amount, phoneNumber, isPro } = await req.json()

    // For pro subscriptions, create a subscription instead of one-time payment
    if (isPro) {
      // Create a subscription plan if it doesn't exist
      const plans = await razorpay.plans.all({ count: 1 })
      let planId = 'plan_monthly_pro_799'
      
      // Check if plan exists, if not create it
      try {
        await razorpay.plans.fetch(planId)
      } catch (error) {
        const plan = await razorpay.plans.create({
          period: 'monthly',
          interval: 1,
          item: {
            name: 'GLINTUP Pro Monthly',
            amount: amount,
            currency: 'INR',
            description: 'Monthly vocabulary learning subscription'
          }
        })
        planId = plan.id
      }

      // Create subscription
      const subscription = await razorpay.subscriptions.create({
        plan_id: planId,
        customer_notify: 1,
        total_count: 120, // 10 years worth of monthly renewals
        notes: {
          phone_number: phoneNumber,
          subscription_type: 'pro_monthly'
        }
      })

      return new Response(
        JSON.stringify({
          key: key_id,
          subscription_id: subscription.id,
          type: 'subscription',
          ...subscription
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    } else {
      // For free trials, create a one-time order (or skip entirely)
      const order = await razorpay.orders.create({
        amount: 100, // Minimal amount for verification
        currency: 'INR',
        notes: {
          phone_number: phoneNumber,
          subscription_type: 'trial'
        }
      })

      return new Response(
        JSON.stringify({
          key: key_id,
          type: 'order',
          ...order
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
