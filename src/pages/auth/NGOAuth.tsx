import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { Building2, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

export default function NGOAuth() {
  const navigate = useNavigate()
  const { user, signOut, demoLogin } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'auth' | 'profile'>('auth')
  const [isLogin, setIsLogin] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [showPass, setShowPass] = useState(false)

  if (user) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="card p-8 max-w-sm w-full text-center space-y-6 animate-in">
          <div className="w-16 h-16 bg-secondary-500/20 rounded-full flex items-center justify-center mx-auto">
            <Building2 className="w-8 h-8 text-secondary-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Already Signed In</h2>
            <p className="text-gray-400 text-sm mt-2">You must sign out of your current account before you can sign in or register a new NGO.</p>
          </div>
          <div className="space-y-3">
            <button onClick={() => signOut()} className="btn-secondary w-full">Sign Out Now</button>
            <button onClick={() => navigate(-1)} className="btn-outline w-full text-gray-400 border-gray-800">Go Back</button>
          </div>
        </div>
      </div>
    )
  }

  const isValidPassword = (pwd: string) => {
    return pwd.length >= 8 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)
  }

  const handleSuccessfulAuth = async (user: any) => {
    if (user) {
      await supabase.from('users').upsert({ id: user.id, email: user.email, role: 'ngo', approved: false })
      
      const { data: existingProfile } = await supabase
        .from('ngo_profiles')
        .select('user_id')
        .eq('user_id', user.id)
        .single()
        
      if (existingProfile) {
        toast.success('Signed in successfully!')
        navigate('/ngo/dashboard')
        return
      }
    }
    toast.success('Complete your NGO profile to continue.')
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

  const handleProfileSave = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      await supabase.from('ngo_profiles').upsert({
        user_id: user.id,
        name,
        description,
        photos: [],
        location_lat: 16.5062,
        location_lng: 80.6480,
        verified: false,
      })
      toast.success('NGO profile created! Awaiting admin verification.')
      navigate('/ngo/dashboard')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-secondary-400 mb-8 transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />Back to Home
        </Link>
        <div className="card p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-secondary-500/20 rounded-2xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-secondary-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">NGO Portal</h1>
              <p className="text-gray-400 text-sm">{isLogin ? 'Sign in to your NGO account' : 'Register your NGO'}</p>
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

              <div className="space-y-4 animate-in">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Official NGO Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="contact@yourngo.org" className="input-field" />
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
                <button onClick={handlePasswordAuth} disabled={loading || !email || !password} className="btn-secondary w-full disabled:opacity-50 mt-2">
                  {loading ? 'Authenticating...' : (isLogin ? 'Sign In' : 'Create Account')}
                </button>
                <button onClick={() => { demoLogin('ngo'); navigate('/ngo/dashboard') }} className="btn-outline w-full mt-2 border-dashed border-gray-600 text-gray-400 hover:text-white">
                  Try Demo Account (Bypass)
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-in">
              <h2 className="text-lg font-semibold text-white">NGO Profile Setup</h2>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">NGO Name *</label>
                <input id="ngo-name" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your NGO name" className="input-field" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Description *</label>
                <textarea id="ngo-desc" value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe your NGO's mission..." rows={4} className="input-field resize-none" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Upload Workplace Photos</label>
                <div className="border border-dashed border-gray-600 rounded-xl p-4 text-center text-gray-500 text-sm hover:border-secondary-500/50 cursor-pointer transition-colors">
                  Click to upload photos / video (max 30s)
                </div>
              </div>
              <button onClick={handleProfileSave} disabled={loading || !name || !description} className="btn-secondary w-full disabled:opacity-50">
                {loading ? 'Saving...' : 'Create NGO Profile'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
