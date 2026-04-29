import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ShieldCheck, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { auth, db } from '../../lib/firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import toast from 'react-hot-toast'

export default function AdminAuth() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password)
      
      // Verify admin role in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid))
      if (userDoc.exists() && userDoc.data().role === 'admin') {
        toast.success('Admin access granted')
        navigate('/admin/dashboard')
      } else {
        await auth.signOut()
        toast.error('Unauthorized: This account does not have administrative privileges.')
      }
    } catch (err: any) {
      console.error('Admin Auth Error:', err)
      toast.error('Invalid admin credentials or network error.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-primary-400 mb-8 transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />Back to Home
        </Link>
        
        <div className="card p-8">
          <div className="flex flex-col items-center gap-3 mb-8">
            <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center border border-gray-800">
              <ShieldCheck className="w-8 h-8 text-primary-400" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
              <p className="text-gray-500 text-sm">Secure Administrative Access</p>
            </div>
          </div>
          
          <div className="space-y-6 text-center">
            <div className="bg-primary-900/20 border border-primary-500/20 rounded-xl p-6 mb-6">
              <p className="text-primary-400 font-medium">
                As it is a prototype, admin pass is disabled.
              </p>
            </div>
            
            <button 
              onClick={() => navigate('/admin/dashboard')}
              className="btn-primary w-full block text-center"
            >
              Enter Admin Dashboard
            </button>
          </div>

          <p className="text-center text-[10px] text-gray-600 mt-8 uppercase tracking-widest">
            Restricted System • Authorized Personnel Only
          </p>
        </div>
      </div>
    </div>
  )
}
