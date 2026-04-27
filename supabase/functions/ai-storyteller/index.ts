// supabase/functions/ai-storyteller/index.ts
// Deno Edge Function — Gemini AI volunteer story generator

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
    const { volunteer_id } = await req.json()
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    // Fetch volunteer data
    const { data: profile } = await supabase
      .from('volunteer_profiles')
      .select('name, skills, occupation, points, streak, tier')
      .eq('user_id', volunteer_id)
      .single()

    const { data: activities } = await supabase
      .from('activities')
      .select('hours, date')
      .eq('volunteer_id', volunteer_id)
      .limit(10)

    const totalHours = activities?.reduce((sum: number, a: { hours: number }) => sum + a.hours, 0) ?? 0

    const prompt = `You are a compassionate writer creating inspiring volunteer stories for Bridge India — a volunteer platform in Andhra Pradesh, India.

Write a heartfelt 3-paragraph story about this volunteer's journey:
- Name: ${profile?.name || 'Anonymous Volunteer'}
- Occupation: ${profile?.occupation || 'Not specified'}
- Skills: ${profile?.skills?.join(', ') || 'Various skills'}
- Total Volunteer Hours: ${totalHours}
- Current Streak: ${profile?.streak || 0} days
- Points Earned: ${profile?.points || 0}
- Current Tier: ${profile?.tier || 'newbie'}

Make it inspiring, personal, and rooted in the Andhra Pradesh community context. Focus on the impact they are making.`

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 500, temperature: 0.8 }
        })
      }
    )

    const geminiData = await geminiRes.json()
    const story = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? 'Story generation failed.'

    // Log AI usage
    await supabase.from('ai_logs').insert({
      function_name: 'ai-storyteller',
      input_hash: volunteer_id,
      output_summary: story.substring(0, 100),
    })

    return new Response(JSON.stringify({ story }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
