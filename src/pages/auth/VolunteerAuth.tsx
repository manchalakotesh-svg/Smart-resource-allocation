import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { Users, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

export default function VolunteerAuth() {
  const navigate = useNavigate()
  const { demoLogin } = useAuth()
  const [isLogin, setIsLogin] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [step, setStep] = useState<'auth' | 'profile'>('auth')

  const isValidPassword = (pwd: string) => {
    return pwd.length >= 8 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)
  }

  const handleSuccessfulAuth = async (user: any) => {
    if (user) {
      await supabase.from('users').upsert({
        id: user.id,
        email: user.email,
        role: 'volunteer',
        approved: false,
      })
      
      const { data: existingProfile } = await supabase
        .from('volunteer_profiles')
        .select('user_id')
        .eq('user_id', user.id)
        .single()
        
      if (existingProfile) {
        toast.success('Signed in successfully!')
        navigate('/volunteer/dashboard')
        return
      }
    }
    toast.success('Complete your profile to continue.')
    setStep('profile')
  }

  const handlePasswordAuth = async () => {
    if (!isLogin && !isValidPassword(password)) {
      toast.error('Password must be 8+ chars with an uppercase, a number, and a special character.')
      return
    }
    setLoading(true)
    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        await handleSuccessfulAuth(data.user)
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        await handleSuccessfulAuth(data.user)
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const handleProfileComplete = () => {
    toast.success('Profile submitted! Awaiting admin approval.')
    navigate('/volunteer/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-primary-400 mb-8 transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />Back to Home
        </Link>

        <div className="card p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-primary-500/20 rounded-2xl flex items-center justify-center">
              <Users className="w-6 h-6 text-primary-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Volunteer Portal</h1>
              <p className="text-gray-400 text-sm">{isLogin ? 'Sign in to your account' : 'Join Bridge India as a volunteer'}</p>
            </div>
          </div>

          {step === 'auth' ? (
            <div className="space-y-6 animate-in">
              <div className="flex p-1 bg-gray-900 rounded-xl mb-2">
                <button
                  onClick={() => setIsLogin(false)}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${!isLogin ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}
                >
                  Create Account
                </button>
                <button
                  onClick={() => setIsLogin(true)}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${isLogin ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}
                >
                  Sign In
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Email Address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="input-field" />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Password</label>
                  <div className="relative">
                    <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="input-field" />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3.5 text-gray-400 hover:text-white">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {!isLogin && (
                    <p className="text-xs text-gray-500 mt-2">Must be 8+ chars, 1 uppercase, 1 number, 1 special char.</p>
                  )}
                </div>
                <button onClick={handlePasswordAuth} disabled={loading || !email || !password} className="btn-primary w-full disabled:opacity-50 mt-2">
                  {loading ? 'Authenticating...' : (isLogin ? 'Sign In' : 'Create Account')}
                </button>
                <button onClick={() => { demoLogin('volunteer'); navigate('/volunteer/dashboard') }} className="btn-outline w-full mt-2 border-dashed border-gray-600 text-gray-400 hover:text-white">
                  Try Demo Account (Bypass)
                </button>
              </div>
            </div>
          ) : (
            <VolunteerProfileForm onComplete={handleProfileComplete} />
          )}
        </div>
      </div>
    </div>
  )
}

function VolunteerProfileForm({ onComplete }: { onComplete: () => void }) {
  const [name, setName] = useState('')
  const [occupation, setOccupation] = useState('')
  const [skills, setSkills] = useState('')
  const [availability, setAvailability] = useState('weekends')
  const [loading, setLoading] = useState(false)
  const [locationSet, setLocationSet] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      
      await supabase.from('volunteer_profiles').upsert({
        user_id: user.id,
        name,
        occupation,
        skills: skills.split(',').map(s => s.trim()),
        availability,
        location_lat: 16.5062,
        location_lng: 80.6480,
        points: 20,
        streak: 1,
        tier: 'newbie',
        last_active: new Date().toISOString(),
      })
      onComplete()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 animate-in">
      <h2 className="text-lg font-semibold text-white">Complete Your Profile</h2>
      
      <div>
        <label className="text-sm text-gray-400 mb-1 block">Full Name *</label>
        <input id="vol-name" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" className="input-field" />
      </div>
      
      <div>
        <label className="text-sm text-gray-400 mb-1 block">Occupation *</label>
        <input id="vol-occupation" type="text" value={occupation} onChange={e => setOccupation(e.target.value)} placeholder="e.g. Software Engineer, Teacher" className="input-field" />
      </div>
      
      <div>
        <label className="text-sm text-gray-400 mb-1 block">Skills (comma-separated)</label>
        <input id="vol-skills" type="text" value={skills} onChange={e => setSkills(e.target.value)} placeholder="Teaching, First Aid, Coding..." className="input-field" />
      </div>
      
      <div>
        <label className="text-sm text-gray-400 mb-1 block">Availability</label>
        <select id="vol-availability" value={availability} onChange={e => setAvailability(e.target.value)} className="input-field">
          <option value="weekdays">Weekdays</option>
          <option value="weekends">Weekends</option>
          <option value="evenings">Evenings</option>
          <option value="flexible">Flexible</option>
        </select>
      </div>

      <div>
        <label className="text-sm text-gray-400 mb-1 block">Upload Occupation Proof (optional)</label>
        <div className="border border-dashed border-gray-600 rounded-xl p-4 text-center text-gray-500 text-sm hover:border-primary-500/50 cursor-pointer transition-colors">
          Click to upload ID / certificate
        </div>
      </div>

      <div className="bg-primary-500/10 border border-primary-500/30 rounded-xl p-3">
        <button
          onClick={() => setLocationSet(true)}
          className="w-full text-sm text-primary-400 font-medium"
        >
          {locationSet ? '✅ Location pinned (Vijayawada, AP)' : '📍 Click to set your location on map'}
        </button>
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading || !name || !occupation}
        className="btn-primary w-full disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Submit Profile (+20 pts 🎉)'}
      </button>
    </div>
  )
}
