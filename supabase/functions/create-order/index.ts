import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// In-memory rate limiting store
// Note: In production with multiple instances, use Redis or database-backed rate limiting
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Rate limit configuration: max 5 orders per email per 10 minutes
const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000 // 10 minutes

function checkRateLimit(key: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now()
  const entry = rateLimitStore.get(key)

  // Clean up expired entries periodically
  if (rateLimitStore.size > 1000) {
    for (const [k, v] of rateLimitStore.entries()) {
      if (v.resetTime < now) {
        rateLimitStore.delete(k)
      }
    }
  }

  if (!entry || entry.resetTime < now) {
    // New window
    rateLimitStore.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS })
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1, resetIn: RATE_LIMIT_WINDOW_MS }
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    // Rate limit exceeded
    return { allowed: false, remaining: 0, resetIn: entry.resetTime - now }
  }

  // Increment count
  entry.count++
  return { allowed: true, remaining: RATE_LIMIT_MAX - entry.count, resetIn: entry.resetTime - now }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!

    // Get auth token from request
    const authHeader = req.headers.get('Authorization')
    
    // Create client for user authentication check
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader || '' } }
    })

    // Admin client for database operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    const { items, productId, customerEmail, customerName, paymentMethod, paymentId, total: providedTotal } = await req.json()

    // Support both single product (legacy) and multi-product cart checkout
    let orderItems: Array<{ id: string; title: string; price: number; quantity?: number }> = []
    
    if (items && Array.isArray(items) && items.length > 0) {
      // Multi-product cart checkout
      orderItems = items
    } else if (productId) {
      // Legacy single product checkout - will be populated below
      orderItems = [{ id: productId, title: '', price: 0 }]
    } else {
      console.error('Missing items or productId')
      return new Response(
        JSON.stringify({ error: 'Cart items or Product ID is required' }),
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

    // Rate limiting check - use normalized email as key
    const rateLimitKey = customerEmail.toLowerCase().trim()
    const rateLimit = checkRateLimit(rateLimitKey)
    
    if (!rateLimit.allowed) {
      console.warn('Rate limit exceeded for:', rateLimitKey)
      return new Response(
        JSON.stringify({ 
          error: 'Too many order attempts. Please try again later.',
          retryAfter: Math.ceil(rateLimit.resetIn / 1000)
        }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Retry-After': String(Math.ceil(rateLimit.resetIn / 1000))
          } 
        }
      )
    }

    // Get current user (optional - allows guest checkout)
    const { data: { user } } = await supabaseClient.auth.getUser()

    // Get product IDs to verify
    const productIds = orderItems.map(item => item.id)

    // Verify all products exist and are active
    const { data: products, error: productsError } = await supabaseAdmin
      .from('products')
      .select('id, title, price, is_active')
      .in('id', productIds)
      .eq('is_active', true)

    if (productsError) {
      console.error('Products fetch error:', productsError)
      return new Response(
        JSON.stringify({ error: 'Failed to verify products' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!products || products.length === 0) {
      console.error('No valid products found')
      return new Response(
        JSON.stringify({ error: 'No valid products found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify all requested products were found
    const foundProductIds = new Set(products.map(p => p.id))
    const missingProducts = productIds.filter(id => !foundProductIds.has(id))
    
    if (missingProducts.length > 0) {
      console.error('Some products not found:', missingProducts)
      return new Response(
        JSON.stringify({ error: 'Some products are not available', missing: missingProducts }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Build verified order items with server-side prices (security: never trust client prices)
    const verifiedItems = products.map(product => ({
      id: product.id,
      title: product.title,
      price: product.price,
      quantity: orderItems.find(i => i.id === product.id)?.quantity || 1
    }))

    // Calculate total from verified server-side prices
    const calculatedTotal = verifiedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)

    console.log('Creating order:', { 
      itemCount: verifiedItems.length, 
      customerEmail, 
      userId: user?.id,
      total: calculatedTotal 
    })

    // Create order record with 'paid' status
    // In production, this would be called after actual payment verification
    const orderData = {
      user_id: user?.id || null,
      customer_email: customerEmail,
      customer_name: customerName || null,
      items: verifiedItems,
      total: calculatedTotal,
      status: 'paid',
      payment_method: paymentMethod || 'demo',
      payment_id: paymentId || `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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

    console.log('Order created successfully:', order.id)

    return new Response(
      JSON.stringify({ 
        orderId: order.id,
        message: 'Order created successfully',
        itemCount: verifiedItems.length,
        total: calculatedTotal
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
