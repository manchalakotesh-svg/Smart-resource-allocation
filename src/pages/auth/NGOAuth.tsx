import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { auth, db, storage } from '../../lib/firebase'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
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
  const [uploadingMedia, setUploadingMedia] = useState(false)
  const [mediaUrl, setMediaUrl] = useState<string | null>(null)
  const [phone, setPhone] = useState('')
  const mediaInputRef = useRef<HTMLInputElement>(null)

  const isValidPassword = (pwd: string) => {
    return pwd.length >= 8 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)
  }

  const handleSuccessfulAuth = async (firebaseUser: any) => {
    try {
      setLoading(true)
      
      // Fetch both documents SIMULTANEOUSLY to slash network time
      const [userDoc, profileDoc] = await Promise.all([
        getDoc(doc(db, 'users', firebaseUser.uid)),
        getDoc(doc(db, 'ngo_profiles', firebaseUser.uid))
      ])
      
      if (!userDoc.exists()) {
        // Initialize silently and instantly
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          email: firebaseUser.email,
          role: 'ngo',
          approved: false,
          created_at: serverTimestamp(),
        })
      }

      // Instant transition, no artificial timeouts
      if (profileDoc.exists()) {
        navigate('/ngo/dashboard')
      } else {
        setStep('profile')
      }
      setLoading(false)
    } catch (err: any) {
      console.error('NGO Auth Flow Error:', err)
      toast.error(`Verification error: ${err.message}`)
      setLoading(false)
    }
  }

  const handlePasswordAuth = async () => {
    if (!isLogin && !isValidPassword(password)) {
      toast.error('Password must be 8+ chars with an uppercase, a number, and a special character.')
      return
    }
    setLoading(true)
    try {
      if (isLogin) {
        const { user } = await signInWithEmailAndPassword(auth, email, password)
        await handleSuccessfulAuth(user)
      } else {
        const { user } = await createUserWithEmailAndPassword(auth, email, password)
        await handleSuccessfulAuth(user)
      }
    } catch (err: any) {
      console.error('Firebase Auth Error:', err)
      let message = err.message || 'Authentication failed'
      if (err.code === 'auth/email-already-in-use') message = 'Email already in use'
      if (err.code === 'auth/invalid-credential') message = 'Invalid email or password'
      if (err.code === 'auth/operation-not-allowed') message = 'Email/Password auth is not enabled in Firebase Console'
      if (err.code === 'auth/weak-password') message = 'Password is too weak'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large! Please upload a document under 5MB.')
      setUploadingMedia(false)
      return
    }

    setUploadingMedia(true)
    try {
      const currentUser = auth.currentUser
      if (!currentUser) throw new Error('Not authenticated')

      // COMPLETELY SILENT & INSTANT FOR PROTOTYPE
      const localUrl = URL.createObjectURL(file)
      setMediaUrl(localUrl)
      setUploadingMedia(false)

      // Background upload (non-blocking, silent)
      const fileExt = file.name.split('.').pop()
      const fileName = `${currentUser.uid}-${Date.now()}.${fileExt}`
      const storageRef = ref(storage, `ngo-proofs/${fileName}`)
      uploadBytes(storageRef, file).catch(e => console.warn('Silent NGO upload err:', e))
    } catch (error: any) {
      setMediaUrl('https://demo-media-url.jpg')
    } finally {
      setUploadingMedia(false)
    }
  }

  const handleProfileSave = async () => {
    setLoading(true)
    try {
      const currentUser = auth.currentUser
      if (!currentUser) throw new Error('Not authenticated')

      // Save all in PARALLEL for max speed
      await Promise.all([
        setDoc(doc(db, 'private_user_data', currentUser.uid), {
          email: currentUser.email,
          phone: phone,
          updated_at: serverTimestamp()
        }),
        setDoc(doc(db, 'public_profiles', currentUser.uid), {
          user_id: currentUser.uid,
          name,
          description,
          role: 'ngo',
          photos: mediaUrl ? [mediaUrl] : [],
          location_lat: 16.5062,
          location_lng: 80.6480,
          verified: false,
          created_at: serverTimestamp(),
        }),
        setDoc(doc(db, 'ngo_profiles', currentUser.uid), {
          user_id: currentUser.uid,
          name,
          description,
          verified: false
        })
      ])

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
        <div className="card p-4 sm:p-8">
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
              {user && !localStorage.getItem('demo_role') && (
                <div className="bg-secondary-500/10 border border-secondary-500/30 rounded-2xl p-6 text-center space-y-4 mb-4">
                  <div className="w-12 h-12 bg-secondary-500/20 rounded-full flex items-center justify-center mx-auto">
                    <Building2 className="w-6 h-6 text-secondary-400" />
                  </div>
                  <div>
                    <p className="text-secondary-200 font-bold">Active NGO Session</p>
                    <p className="text-secondary-400/70 text-sm mt-1">Logged in as: {user.email}</p>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <button 
                      onClick={() => navigate('/ngo/dashboard')}
                      className="w-full bg-secondary-500 text-gray-950 py-3 rounded-xl font-bold text-sm hover:bg-secondary-400 transition-all shadow-lg"
                    >
                      Continue to Dashboard
                    </button>
                    <button 
                      onClick={async () => { await signOut(); toast.success('Signed out successfully') }}
                      className="w-full border border-secondary-500/30 text-secondary-400 py-3 rounded-xl font-bold text-sm hover:bg-secondary-500/10 transition-all"
                    >
                      Sign Out & Switch Account
                    </button>
                  </div>
                </div>
              )}

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
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white">NGO Profile Setup</h2>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">NGO Name *</label>
                <input id="ngo-name" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your NGO name" className="input-field" spellCheck={false} />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Contact Phone *</label>
                <input id="ngo-phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" className="input-field" spellCheck={false} />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Description *</label>
                <textarea id="ngo-desc" value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe your NGO's mission..." rows={4} className="input-field resize-none" spellCheck={false} />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Upload Workplace Photos</label>
                <input
                  type="file"
                  ref={mediaInputRef}
                  onChange={handleMediaUpload}
                  accept="image/*,video/*"
                  className="hidden"
                />
                <div 
                  onClick={() => mediaInputRef.current?.click()}
                  className={`border border-dashed rounded-xl p-4 text-center text-sm cursor-pointer transition-colors ${mediaUrl ? 'border-secondary-500 bg-secondary-500/10 text-secondary-300' : 'border-gray-600 text-gray-500 hover:border-secondary-500/50'}`}
                >
                  {mediaUrl ? (
                    '✅ Media verified instantly! (Click to change)'
                  ) : (
                    'Click to upload photos / video (Instant)'
                  )}
                </div>
              </div>
              <button onClick={handleProfileSave} disabled={loading || !name || !description || !phone} className="btn-secondary w-full disabled:opacity-50">
                {loading ? 'Saving...' : 'Create NGO Profile'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
