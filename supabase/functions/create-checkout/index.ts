
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"
import Stripe from 'https://esm.sh/stripe@13.6.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

// Configured with your actual Stripe price IDs
const PLANS = {
  free: { price: 0 },
  pro: { price_id: 'price_1QvXoeCkL5ed5EgTpd1uTwAq' }, // $14.99 CAD ParentPal Pro
  enterprise: { price_id: 'price_1QvXp3CkL5ed5EgT4ZwapF6n' } // $22.99 CAD ParentPro Ultimate
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
    
    // Get user profile from Supabase
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
      console.error('User not found:', userError)
      throw new Error('User not found')
    }

    // Handle free plan subscription
    if (planId === 'free') {
      const { error: updateError } = await supabaseClient
        .from('subscriptions')
        .update({ tier: 'free' })
        .eq('user_id', userId)
      
      if (updateError) {
        console.error('Error updating subscription:', updateError)
        throw new Error('Failed to update subscription')
      }
      
      return new Response(
        JSON.stringify({ message: 'Subscribed to free plan' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate plan
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
