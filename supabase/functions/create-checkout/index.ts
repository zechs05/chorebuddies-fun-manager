
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"
import Stripe from 'https://esm.sh/stripe@13.6.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

const PLANS = {
  free: { price: 0 },
  pro: { price_id: 'price_CHANGE_THIS' }, // You'll need to replace this with your Stripe price ID
  enterprise: { price_id: 'price_CHANGE_THIS' }, // You'll need to replace this with your Stripe price ID
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { planId, userId } = await req.json()
    
    // Get the user's email from Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
    const { data: userData, error: userError } = await supabaseClient
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .single()

    if (userError || !userData?.email) {
      throw new Error('User not found')
    }

    // Free plan doesn't need Stripe checkout
    if (planId === 'free') {
      await supabaseClient
        .from('subscriptions')
        .update({ tier: 'free' })
        .eq('user_id', userId)
      
      return new Response(
        JSON.stringify({ message: 'Subscribed to free plan' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const plan = PLANS[planId as keyof typeof PLANS]
    if (!plan?.price_id) {
      throw new Error('Invalid plan selected')
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer_email: userData.email,
      line_items: [{ price: plan.price_id, quantity: 1 }],
      mode: 'subscription',
      success_url: `${req.headers.get('origin')}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/pricing`,
      metadata: {
        userId,
      },
    })

    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
