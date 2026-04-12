const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const GATEWAY_URL = 'https://ai.lovable.dev/v1/chat/completions'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

    // Fetch recent transactions
    const { data: txs } = await supabase
      .from('suite_transactions')
      .select('amount, currency, direction, counterparty, counterparty_country, risk_flag, description, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(200)

    if (!txs || txs.length === 0) {
      return new Response(JSON.stringify({ error: 'No transactions to analyze' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Fetch existing rules
    const { data: existingRules } = await supabase
      .from('suite_alert_rules')
      .select('name, conditions, severity')
      .eq('user_id', user.id)

    const apiKey = Deno.env.get('LOVABLE_API_KEY')
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'AI not configured. Enable Lovable AI in Connectors.' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const prompt = `You are a compliance analyst AI. Analyze these ${txs.length} transactions and suggest alert rules.

TRANSACTIONS (sample):
${JSON.stringify(txs.slice(0, 50), null, 1)}

EXISTING RULES:
${JSON.stringify(existingRules || [], null, 1)}

Respond ONLY with valid JSON in this exact format:
{
  "summary": "Brief risk analysis of the transaction portfolio (2-3 sentences)",
  "flagged_patterns": [
    {"pattern": "description of suspicious pattern", "severity": "critical|high|medium|low", "affected_count": 5}
  ],
  "suggested_rules": [
    {
      "name": "Rule Name",
      "severity": "critical|high|medium|low",
      "conditions": [{"field": "amount|counterparty_country|direction|currency", "operator": "gt|eq|in|contains", "value": "threshold"}],
      "rationale": "Why this rule is needed"
    }
  ]
}

Guidelines:
- Don't suggest rules that duplicate existing ones
- Focus on AML/CFT compliance patterns
- Consider high-risk jurisdictions, structuring, rapid succession, unusual amounts
- Suggest 3-6 actionable rules
- Be specific with thresholds based on actual data patterns`

    const aiRes = await fetch(GATEWAY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    })

    if (!aiRes.ok) {
      const errText = await aiRes.text()
      console.error('AI error:', errText)
      return new Response(JSON.stringify({ error: 'AI analysis failed' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const aiData = await aiRes.json()
    const content = aiData.choices?.[0]?.message?.content
    if (!content) {
      return new Response(JSON.stringify({ error: 'Empty AI response' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const analysis = JSON.parse(content)

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Error:', err)
    return new Response(JSON.stringify({ error: 'Internal error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
