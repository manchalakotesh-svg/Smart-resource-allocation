import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Users, ArrowLeft, Mail, Phone, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

type Step = 'method' | 'otp' | 'profile'

export default function VolunteerAuth() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('method')
  const [method, setMethod] = useState<'email' | 'phone'>('email')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [showOtpField, setShowOtpField] = useState(false)

  const handleSendOTP = async () => {
    setLoading(true)
    try {
      if (method === 'email') {
        const { error } = await supabase.auth.signInWithOtp({ email })
        if (error) throw error
        toast.success('OTP sent to your email!')
      } else {
        const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`
        const { error } = await supabase.auth.signInWithOtp({ phone: formattedPhone })
        if (error) throw error
        toast.success('OTP sent to your phone!')
      }
      setShowOtpField(true)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send OTP'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    setLoading(true)
    try {
      let error
      if (method === 'email') {
        ({ error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'email' }))
      } else {
        const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`
        ;({ error } = await supabase.auth.verifyOtp({ phone: formattedPhone, token: otp, type: 'sms' }))
      }
      if (error) throw error

      // Create user record with volunteer role
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('users').upsert({
          id: user.id,
          email: user.email,
          phone: user.phone,
          role: 'volunteer',
          approved: false,
        })
      }
      toast.success('Verified! Complete your profile.')
      setStep('profile')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid OTP'
      toast.error(msg)
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
              <p className="text-gray-400 text-sm">Join Bridge India as a volunteer</p>
            </div>
          </div>

          {step === 'method' && (
            <div className="space-y-6 animate-in">
              <div className="flex gap-3">
                <button
                  onClick={() => setMethod('email')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all text-sm font-medium ${method === 'email' ? 'border-primary-500 bg-primary-500/10 text-primary-400' : 'border-gray-700 text-gray-400 hover:border-gray-600'}`}
                >
                  <Mail className="w-4 h-4" />Email OTP
                </button>
                <button
                  onClick={() => setMethod('phone')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all text-sm font-medium ${method === 'phone' ? 'border-primary-500 bg-primary-500/10 text-primary-400' : 'border-gray-700 text-gray-400 hover:border-gray-600'}`}
                >
                  <Phone className="w-4 h-4" />Phone OTP
                </button>
              </div>

              {method === 'email' ? (
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Email Address</label>
                  <input
                    id="volunteer-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input-field"
                  />
                </div>
              ) : (
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Phone Number</label>
                  <div className="flex gap-2">
                    <span className="input-field w-16 text-center shrink-0">+91</span>
                    <input
                      id="volunteer-phone"
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="9876543210"
                      className="input-field flex-1"
                    />
                  </div>
                </div>
              )}

              {showOtpField && (
                <div className="animate-in">
                  <label className="text-sm text-gray-400 mb-2 block">Enter OTP</label>
                  <input
                    id="volunteer-otp"
                    type="text"
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    placeholder="6-digit code"
                    className="input-field text-center text-2xl tracking-widest"
                    maxLength={6}
                  />
                </div>
              )}

              {!showOtpField ? (
                <button
                  onClick={handleSendOTP}
                  disabled={loading || (!email && !phone)}
                  className="btn-primary w-full disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send OTP'}
                </button>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={handleVerifyOTP}
                    disabled={loading || otp.length < 6}
                    className="btn-primary w-full disabled:opacity-50"
                  >
                    {loading ? 'Verifying...' : 'Verify & Continue'}
                  </button>
                  <button
                    onClick={handleSendOTP}
                    className="btn-outline w-full text-sm"
                  >
                    Resend OTP
                  </button>
                </div>
              )}
            </div>
          )}

          {step === 'profile' && (
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
  const [showPass, setShowPass] = useState(false)

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
        location_lat: 16.5062, // Default: Vijayawada AP
        location_lng: 80.6480,
        points: 20, // Profile completion bonus
        streak: 1,
        tier: 'newbie',
        last_active: new Date().toISOString(),
      })
      onComplete()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save profile'
      toast.error(msg)
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
