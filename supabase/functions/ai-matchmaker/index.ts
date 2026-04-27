// supabase/functions/ai-matchmaker/index.ts
// Deno Edge Function — AI volunteer-opportunity matching

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
    const { volunteer_id, opportunity_id } = await req.json()
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    const [{ data: vol }, { data: opp }] = await Promise.all([
      supabase.from('volunteer_profiles').select('skills, tier, location_lat, location_lng, points').eq('user_id', volunteer_id).single(),
      supabase.from('opportunities').select('skills_req, location_lat, location_lng, title').eq('id', opportunity_id).single(),
    ])

    if (!vol || !opp) throw new Error('Data not found')

    // Calculate distance (Haversine approx)
    const R = 6371
    const dLat = (opp.location_lat - vol.location_lat) * Math.PI / 180
    const dLon = (opp.location_lng - vol.location_lng) * Math.PI / 180
    const a = Math.sin(dLat/2)**2 + Math.cos(vol.location_lat * Math.PI / 180) * Math.cos(opp.location_lat * Math.PI / 180) * Math.sin(dLon/2)**2
    const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

    const prompt = `You are an AI matching engine for a volunteer platform in Andhra Pradesh, India.

Rate the compatibility between a volunteer and an opportunity on a scale of 0-100.

Volunteer:
- Skills: ${vol.skills?.join(', ') || 'None listed'}
- Tier: ${vol.tier}
- Points: ${vol.points}
- Distance to opportunity: ${distance.toFixed(1)} km

Opportunity:
- Title: ${opp.title}
- Required Skills: ${opp.skills_req?.join(', ') || 'None specified'}

Respond with ONLY a JSON object: {"score": <number 0-100>, "reason": "<one sentence>"}
Consider: skill overlap (40%), proximity (30%), volunteer tier (20%), experience via points (10%)`

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 100, temperature: 0.2 }
        })
      }
    )

    const geminiData = await geminiRes.json()
    const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? '{"score":50}'
    const jsonMatch = text.match(/\{.*\}/)
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : { score: 50 }

    return new Response(JSON.stringify({ score: result.score, reason: result.reason }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (err) {
    return new Response(JSON.stringify({ score: 70, reason: 'Estimated match' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
