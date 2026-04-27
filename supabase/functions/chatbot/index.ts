// supabase/functions/chatbot/index.ts
// Deno Edge Function — NGO query chatbot powered by Gemini

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { message, ngo_id } = await req.json()
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    // Fetch NGO context
    const { data: ngo } = await supabase.from('ngo_profiles').select('name, description').eq('user_id', ngo_id).single()

    const prompt = `You are a helpful assistant for "${ngo?.name || 'an NGO'}" on the Bridge India volunteer platform in Andhra Pradesh, India.

NGO Description: ${ngo?.description || 'A social impact organization'}

A visitor asks: "${message}"

Respond helpfully and concisely (2-3 sentences max). Focus on volunteering, social impact, and how Bridge India can help. If unsure, suggest contacting the NGO directly.`

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 200, temperature: 0.7 }
        })
      }
    )

    const geminiData = await geminiRes.json()
    const response = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? 'Thank you for your query. Our team will respond shortly.'

    return new Response(JSON.stringify({ response }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (err) {
    return new Response(JSON.stringify({ response: 'Thank you for reaching out. For immediate assistance, please contact us at support@bridgeindia.org' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
