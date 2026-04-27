import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { ShieldCheck, ArrowLeft, Lock, Mail } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminAuth() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('users').select('role').eq('id', user.id).single()
        if (data?.role !== 'admin') {
          await supabase.auth.signOut()
          throw new Error('Access denied. Admin accounts only.')
        }
      }
      toast.success('Welcome, Admin!')
      navigate('/admin/dashboard')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-300 mb-8 transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />Back to Home
        </Link>
        <div className="card p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gray-700 rounded-2xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-gray-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
              <p className="text-gray-500 text-sm">Private access only</p>
            </div>
          </div>
          <div className="space-y-4 animate-in">
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-amber-400 text-sm">
              🔒 This portal is for authorized administrators only.
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Admin Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                <input id="admin-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@bridgeindia.org" className="input-field pl-10" />
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                <input id="admin-password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="input-field pl-10" onKeyDown={e => e.key === 'Enter' && handleLogin()} />
              </div>
            </div>
            <button onClick={handleLogin} disabled={loading || !email || !password} className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl transition-all disabled:opacity-50">
              {loading ? 'Authenticating...' : 'Login as Admin'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
