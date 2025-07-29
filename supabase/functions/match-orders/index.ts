import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Verify the JWT token
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )
    
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Use service role for database operations
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { movieId } = await req.json()

    // Find matching buy and sell orders
    const { data: buyOrders } = await supabase
      .from('orders')
      .select('*')
      .eq('movie_id', movieId)
      .eq('order_type', 'buy')
      .eq('status', 'open')
      .order('price', { ascending: false })

    const { data: sellOrders } = await supabase
      .from('orders')
      .select('*')
      .eq('movie_id', movieId)
      .eq('order_type', 'sell')
      .eq('status', 'open')
      .order('price', { ascending: true })

    // Match orders
    if (buyOrders && sellOrders) {
      for (const buyOrder of buyOrders) {
        for (const sellOrder of sellOrders) {
          if (buyOrder.price >= sellOrder.price) {
            const tradeQuantity = Math.min(buyOrder.quantity - buyOrder.filled_quantity, sellOrder.quantity - sellOrder.filled_quantity)
            
            if (tradeQuantity > 0) {
              // Execute trade
              await supabase.from('trades').insert({
                buyer_id: buyOrder.user_id,
                seller_id: sellOrder.user_id,
                movie_id: movieId,
                buy_order_id: buyOrder.id,
                sell_order_id: sellOrder.id,
                price: sellOrder.price,
                quantity: tradeQuantity
              })

              // Update orders
              await supabase.from('orders').update({
                filled_quantity: buyOrder.filled_quantity + tradeQuantity,
                status: (buyOrder.filled_quantity + tradeQuantity >= buyOrder.quantity) ? 'filled' : 'open'
              }).eq('id', buyOrder.id)

              await supabase.from('orders').update({
                filled_quantity: sellOrder.filled_quantity + tradeQuantity,
                status: (sellOrder.filled_quantity + tradeQuantity >= sellOrder.quantity) ? 'filled' : 'open'
              }).eq('id', sellOrder.id)
            }
          }
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})