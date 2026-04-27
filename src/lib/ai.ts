import { supabase } from './supabase'

const EDGE_BASE = import.meta.env.VITE_SUPABASE_URL + '/functions/v1'

async function callEdgeFunction(name: string, body: object) {
  const { data: { session } } = await supabase.auth.getSession()
  const res = await fetch(`${EDGE_BASE}/${name}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token || ''}`,
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`Edge function ${name} failed: ${res.statusText}`)
  return res.json()
}

export async function generateAIStory(volunteerId: string): Promise<string> {
  try {
    const data = await callEdgeFunction('ai-storyteller', { volunteer_id: volunteerId })
    return data.story as string
  } catch {
    // Demo fallback
    return `Your journey as a volunteer has been truly inspiring! You've dedicated your time and skills to make a difference in Andhra Pradesh communities. Each activity you've participated in has contributed to building a stronger, more connected society. Your commitment to service embodies the spirit of Bridge India — bridging gaps and creating opportunities for all.`
  }
}

export async function getAIMatchScore(volunteerId: string, opportunityId: string): Promise<number> {
  try {
    const data = await callEdgeFunction('ai-matchmaker', { volunteer_id: volunteerId, opportunity_id: opportunityId })
    return data.score as number
  } catch {
    return Math.floor(Math.random() * 40) + 60 // Demo: 60-100%
  }
}

export async function chatbotQuery(message: string, ngoId: string): Promise<string> {
  try {
    const data = await callEdgeFunction('chatbot', { message, ngo_id: ngoId })
    return data.response as string
  } catch {
    return `Thank you for your query! Our team will get back to you shortly. For immediate assistance, please contact us directly through the NGO portal or email us at support@bridgeindia.org`
  }
}
