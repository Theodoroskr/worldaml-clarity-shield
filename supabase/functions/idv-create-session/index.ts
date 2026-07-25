import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { customer_id } = await req.json()
    if (!customer_id || typeof customer_id !== 'string') {
      return new Response(JSON.stringify({ error: 'customer_id is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Verify the customer belongs to the user's organisation
    const { data: customer } = await supabase
      .from('suite_customers')
      .select('organisation_id')
      .eq('id', customer_id)
      .single()

    if (!customer) {
      return new Response(JSON.stringify({ error: 'Customer not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: membership } = await supabase
      .from('suite_org_members')
      .select('id')
      .eq('organisation_id', customer.organisation_id)
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return new Response(JSON.stringify({ error: 'Access denied' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Create a pending IDV session
    const { data: session, error: insertError } = await supabase
      .from('suite_idv_sessions')
      .insert({
        customer_id,
        user_id: user.id,
        organisation_id: customer.organisation_id,
        status: 'pending',
      })
      .select('id')
      .single()

    if (insertError) {
      return new Response(JSON.stringify({ error: insertError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Placeholder: in production this would redirect to an Identomat or other IDV hosted session
    const redirectUrl = `${Deno.env.get('SITE_URL') || 'https://worldaml.com'}/suite/idv?session_id=${session.id}`

    return new Response(JSON.stringify({ session_id: session.id, redirect_url: redirectUrl, status: 'pending' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('idv-create-session error:', err)
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
