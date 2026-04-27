import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Building2, ArrowLeft, Mail } from 'lucide-react'
import toast from 'react-hot-toast'

export default function NGOAuth() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'auth' | 'profile'>('auth')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

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
      if (user) {
        await supabase.from('users').upsert({ id: user.id, email: user.email, role: 'ngo', approved: false })
      }
      toast.success('Verified! Complete your NGO profile.')
      setStep('profile')
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
              <p className="text-gray-400 text-sm">Register or login as an NGO</p>
            </div>
          </div>

          {step === 'auth' ? (
            <div className="space-y-4 animate-in">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Official NGO Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                  <input id="ngo-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="contact@yourngo.org" className="input-field pl-10" />
                </div>
              </div>
              {otpSent && (
                <div className="animate-in">
                  <label className="text-sm text-gray-400 mb-1 block">Enter OTP</label>
                  <input id="ngo-otp" type="text" value={otp} onChange={e => setOtp(e.target.value)} placeholder="6-digit code" className="input-field text-center text-2xl tracking-widest" maxLength={6} />
                </div>
              )}
              {!otpSent ? (
                <button onClick={handleSendOTP} disabled={loading || !email} className="btn-secondary w-full disabled:opacity-50">
                  {loading ? 'Sending...' : 'Send OTP'}
                </button>
              ) : (
                <button onClick={handleVerifyOTP} disabled={loading || otp.length < 6} className="btn-secondary w-full disabled:opacity-50">
                  {loading ? 'Verifying...' : 'Verify & Continue'}
                </button>
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
