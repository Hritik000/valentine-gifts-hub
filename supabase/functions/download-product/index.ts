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
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!

    // Get auth token from request
    const authHeader = req.headers.get('Authorization')
    
    // Create client for user authentication check
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader || '' } }
    })

    // Admin client for storage operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    const { productId, orderId } = await req.json()

    if (!productId || !orderId) {
      return new Response(
        JSON.stringify({ error: 'Product ID and Order ID are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get current user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    
    if (authError) {
      console.error('Auth error:', authError)
    }

    // Verify the order exists and contains this product
    // For guest orders, we verify by order ID only
    // For authenticated users, we also verify user_id
    // Check for 'paid' or 'completed' status (supports multiple payment status conventions)
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .in('status', ['paid', 'completed', 'delivered'])
      .single()

    if (orderError || !order) {
      console.error('Order verification failed:', orderError)
      return new Response(
        JSON.stringify({ error: 'Order not found or payment not verified' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // For authenticated users, verify they own the order
    // For guest orders (user_id is null), allow access with order ID only
    if (user && order.user_id && order.user_id !== user.id) {
      console.error('User does not own this order')
      return new Response(
        JSON.stringify({ error: 'Unauthorized access to this order' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if the product is in the order items
    const items = order.items as Array<{ id: string }>
    const productInOrder = items.some(item => item.id === productId)

    if (!productInOrder) {
      return new Response(
        JSON.stringify({ error: 'Product not found in this order' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get the product file URL
    const { data: product, error: productError } = await supabaseAdmin
      .from('products')
      .select('file_url, title')
      .eq('id', productId)
      .single()

    if (productError || !product?.file_url) {
      console.error('Product fetch error:', productError)
      return new Response(
        JSON.stringify({ error: 'Product file not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse the file URL to extract bucket name and file path
    // file_url can be:
    // 1. Full URL: https://xxx.supabase.co/storage/v1/object/public/bucket-name/path/to/file.ext
    // 2. Relative path: path/to/file.ext or /path/to/file.ext
    
    let bucketName = ''
    let filePath = ''
    
    const fullUrlMatch = product.file_url.match(/\/storage\/v1\/object\/(?:public|sign)\/([^\/]+)\/(.+)$/)
    
    if (fullUrlMatch) {
      // Full URL - extract bucket and path
      bucketName = fullUrlMatch[1]
      filePath = fullUrlMatch[2]
      console.log(`Parsed full URL - Bucket: ${bucketName}, Path: ${filePath}`)
    } else {
      // Assume it's a relative path and try both buckets
      filePath = product.file_url.replace(/^\/+/, '')
      console.log(`Relative path detected: ${filePath}`)
    }
    
    // Clean up double slashes in file path
    filePath = filePath.replace(/^\/+/, '').replace(/\/+/g, '/')
    
    console.log(`Attempting to generate signed URL for file: ${filePath}`)
    
    let signedUrl = null
    let signedUrlError = null
    
    // If we know the bucket from URL, try that first
    if (bucketName) {
      const { data: directUrl, error: directError } = await supabaseAdmin
        .storage
        .from(bucketName)
        .createSignedUrl(filePath, 3600)
      
      if (!directError && directUrl) {
        signedUrl = directUrl
        console.log(`Signed URL generated from ${bucketName} bucket`)
      } else {
        console.log(`Direct bucket ${bucketName} failed:`, directError?.message)
        signedUrlError = directError
      }
    }
    
    // Fallback: try digital-products bucket first
    if (!signedUrl) {
      const { data: primaryUrl, error: primaryError } = await supabaseAdmin
        .storage
        .from('digital-products')
        .createSignedUrl(filePath, 3600)
      
      if (!primaryError && primaryUrl) {
        signedUrl = primaryUrl
        console.log('Signed URL generated from digital-products bucket')
      } else {
        console.log('Primary bucket failed, trying yourdigitalproducts bucket:', primaryError?.message)
        
        // Fallback to yourdigitalproducts bucket
        const { data: fallbackUrl, error: fallbackError } = await supabaseAdmin
          .storage
          .from('yourdigitalproducts')
          .createSignedUrl(filePath, 3600)
        
        if (!fallbackError && fallbackUrl) {
          signedUrl = fallbackUrl
          console.log('Signed URL generated from yourdigitalproducts bucket')
        } else {
          signedUrlError = fallbackError || primaryError
          console.error('All buckets failed:', signedUrlError?.message)
        }
      }
    }

    if (signedUrlError || !signedUrl) {
      console.error('Signed URL error:', signedUrlError)
      return new Response(
        JSON.stringify({ error: 'Failed to generate download URL', details: signedUrlError?.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Download URL generated for product ${productId} in order ${orderId}`)

    return new Response(
      JSON.stringify({ 
        downloadUrl: signedUrl.signedUrl,
        fileName: product.title
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in download-product function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
