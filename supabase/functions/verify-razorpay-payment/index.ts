import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createHmac } from "https://deno.land/std@0.177.0/node/crypto.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!

    if (!razorpayKeySecret) {
      console.error('Razorpay secret not configured')
      return new Response(
        JSON.stringify({ error: 'Payment gateway not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get auth token from request
    const authHeader = req.headers.get('Authorization')
    
    // Create client for user authentication check
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader || '' } }
    })

    // Admin client for database operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      items,
      customerEmail,
      customerName,
      total
    } = await req.json()

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return new Response(
        JSON.stringify({ error: 'Missing payment verification data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id
    const expectedSignature = createHmac("sha256", razorpayKeySecret)
      .update(body)
      .digest("hex")

    if (expectedSignature !== razorpay_signature) {
      console.error('Payment signature verification failed')
      return new Response(
        JSON.stringify({ error: 'Payment verification failed', valid: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Payment signature verified successfully')

    // Get current user (optional - allows guest checkout)
    const { data: { user } } = await supabaseClient.auth.getUser()

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!customerEmail || !emailRegex.test(customerEmail)) {
      return new Response(
        JSON.stringify({ error: 'Valid email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get product IDs to verify
    const productIds = items.map((item: { id: string }) => item.id)

    // Verify all products exist and are active
    const { data: products, error: productsError } = await supabaseAdmin
      .from('products')
      .select('id, title, price, is_active')
      .in('id', productIds)
      .eq('is_active', true)

    if (productsError || !products || products.length === 0) {
      console.error('Products verification failed:', productsError)
      return new Response(
        JSON.stringify({ error: 'Failed to verify products' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Build verified order items with server-side prices
    const verifiedItems = products.map(product => ({
      id: product.id,
      title: product.title,
      price: product.price,
      quantity: items.find((i: { id: string }) => i.id === product.id)?.quantity || 1
    }))

    // Calculate total from verified server-side prices
    const calculatedTotal = verifiedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)

    // Create order record with 'paid' status
    const orderData = {
      user_id: user?.id || null,
      customer_email: customerEmail,
      customer_name: customerName || null,
      items: verifiedItems,
      total: calculatedTotal,
      status: 'paid',
      payment_method: 'razorpay',
      payment_id: razorpay_payment_id,
    }

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert(orderData)
      .select('id')
      .single()

    if (orderError) {
      console.error('Order creation failed:', orderError)
      return new Response(
        JSON.stringify({ error: 'Failed to create order' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Order created successfully after payment verification:', order.id)

    return new Response(
      JSON.stringify({ 
        valid: true,
        orderId: order.id,
        message: 'Payment verified and order created successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in verify-razorpay-payment function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', valid: false }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
