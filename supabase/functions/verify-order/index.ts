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

    const { orderId } = await req.json()

    if (!orderId) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Order ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(orderId)) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Invalid order ID format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get current user (optional)
    const { data: { user } } = await supabaseClient.auth.getUser()

    // Verify order exists and is paid
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, status, user_id, items, total, customer_email')
      .eq('id', orderId)
      .in('status', ['paid', 'completed', 'delivered'])
      .single()

    if (orderError || !order) {
      console.log('Order not found or not paid:', orderId)
      return new Response(
        JSON.stringify({ valid: false, error: 'Order not found or payment not verified' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // For authenticated users, verify they own the order
    // For guest orders (user_id is null), allow access with orderId only
    if (user && order.user_id && order.user_id !== user.id) {
      console.log('User does not own this order')
      return new Response(
        JSON.stringify({ valid: false, error: 'Unauthorized' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get product details for the order items
    const items = order.items as Array<{ id: string }>
    const productIds = items.map(item => item.id)

    const { data: products, error: productsError } = await supabaseAdmin
      .from('products')
      .select('id, title, price, image_url')
      .in('id', productIds)

    if (productsError) {
      console.error('Error fetching products:', productsError)
    }

    // Return order info with products (excluding sensitive file_url)
    return new Response(
      JSON.stringify({ 
        valid: true,
        order: {
          id: order.id,
          status: order.status,
          total: order.total,
          items: products || [],
          hasFiles: true // Indicates downloads are available
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in verify-order function:', error)
    return new Response(
      JSON.stringify({ valid: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
