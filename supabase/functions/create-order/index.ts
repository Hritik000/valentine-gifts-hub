import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_PUBLISHABLE_KEY')!

    // Get auth token from request
    const authHeader = req.headers.get('Authorization')
    
    // Create client for user authentication check
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader || '' } }
    })

    // Admin client for database operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    const { productId, customerEmail, customerName, paymentMethod, paymentId } = await req.json()

    // Validate required fields
    if (!productId) {
      console.error('Missing productId')
      return new Response(
        JSON.stringify({ error: 'Product ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!customerEmail) {
      console.error('Missing customerEmail')
      return new Response(
        JSON.stringify({ error: 'Customer email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(customerEmail)) {
      console.error('Invalid email format:', customerEmail)
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get current user (optional - allows guest checkout)
    const { data: { user } } = await supabaseClient.auth.getUser()

    // Verify product exists and get price
    const { data: product, error: productError } = await supabaseAdmin
      .from('products')
      .select('id, title, price, is_active')
      .eq('id', productId)
      .eq('is_active', true)
      .single()

    if (productError || !product) {
      console.error('Product not found:', productError)
      return new Response(
        JSON.stringify({ error: 'Product not found or not available' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create order record with 'paid' status
    // In production, this would be called after actual payment verification
    const orderData = {
      user_id: user?.id || null,
      customer_email: customerEmail,
      customer_name: customerName || null,
      items: [{ id: product.id, title: product.title, price: product.price }],
      total: product.price,
      status: 'paid',
      payment_method: paymentMethod || 'demo',
      payment_id: paymentId || `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    }

    console.log('Creating order:', { productId, customerEmail, userId: user?.id })

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

    console.log('Order created successfully:', order.id)

    return new Response(
      JSON.stringify({ 
        orderId: order.id,
        message: 'Order created successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in create-order function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
