import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not set. Running in demo mode.')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)

export type UserRole = 'volunteer' | 'ngo' | 'admin'

export interface UserProfile {
  id: string
  email: string
  phone?: string
  role: UserRole
  approved: boolean
  created_at: string
}

export interface VolunteerProfile {
  user_id: string
  name: string
  avatar_url?: string
  skills: string[]
  availability: string
  occupation: string
  proof_url?: string
  location_lat: number
  location_lng: number
  points: number
  streak: number
  last_active: string
  tier: 'newbie' | 'reliable' | 'elite'
  job_exp?: string
}

export interface NGOProfile {
  user_id: string
  name: string
  description: string
  photos: string[]
  video_url?: string
  location_lat: number
  location_lng: number
  verified: boolean
  website?: string
  contact_email?: string
}

export interface Opportunity {
  id: string
  ngo_id: string
  title: string
  description: string
  skills_req: string[]
  location: string
  location_lat: number
  location_lng: number
  donation_goal?: number
  slots: number
  created_at: string
  ngo_profile?: NGOProfile
}

export interface Badge {
  id: string
  name: string
  icon: string
  description: string
}
