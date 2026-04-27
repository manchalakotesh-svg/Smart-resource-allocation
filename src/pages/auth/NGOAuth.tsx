import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { Building2, ArrowLeft, Mail, KeyRound, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

export default function NGOAuth() {
  const navigate = useNavigate()
  const { demoLogin } = useAuth()
  const [method, setMethod] = useState<'password' | 'email'>('password')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'auth' | 'profile'>('auth')
  const [isLogin, setIsLogin] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [showPass, setShowPass] = useState(false)

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

  const handleSendOTP = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({ email })
      if (error) throw error
      toast.success('OTP sent to NGO email!')
      setOtpSent(true)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'email' })
      if (error) throw error
      const { data: { user } } = await supabase.auth.getUser()
      await handleSuccessfulAuth(user)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Invalid OTP')
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

              <div className="flex gap-2">
                <button onClick={() => setMethod('password')} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border transition-all text-sm font-medium ${method === 'password' ? 'border-secondary-500 bg-secondary-500/10 text-secondary-400' : 'border-gray-700 text-gray-400 hover:border-gray-600'}`}>
                  <KeyRound className="w-4 h-4" />Password
                </button>
                <button onClick={() => setMethod('email')} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border transition-all text-sm font-medium ${method === 'email' ? 'border-secondary-500 bg-secondary-500/10 text-secondary-400' : 'border-gray-700 text-gray-400 hover:border-gray-600'}`}>
                  <Mail className="w-4 h-4" />Email OTP
                </button>
              </div>

              {method === 'password' ? (
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
              ) : (
                <div className="space-y-4 animate-in">
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Official NGO Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="contact@yourngo.org" className="input-field" />
                  </div>
                  {otpSent && (
                    <div className="animate-in">
                      <label className="text-sm text-gray-400 mb-1 block">Enter OTP</label>
                      <input type="text" value={otp} onChange={e => setOtp(e.target.value)} placeholder="6-digit code" className="input-field text-center text-2xl tracking-widest" maxLength={6} />
                    </div>
                  )}
                  {!otpSent ? (
                    <div className="space-y-3">
                      <button onClick={handleSendOTP} disabled={loading || !email} className="btn-secondary w-full disabled:opacity-50">
                        {loading ? 'Sending...' : 'Send OTP'}
                      </button>
                      <button onClick={() => { demoLogin('ngo'); navigate('/ngo/dashboard') }} className="btn-outline w-full border-dashed border-gray-600 text-gray-400 hover:text-white">
                        Try Demo Account (Bypass)
                      </button>
                    </div>
                  ) : (
                    <button onClick={handleVerifyOTP} disabled={loading || otp.length < 6} className="btn-secondary w-full disabled:opacity-50">
                      {loading ? 'Verifying...' : 'Verify & Continue'}
                    </button>
                  )}
                </div>
              )}
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
