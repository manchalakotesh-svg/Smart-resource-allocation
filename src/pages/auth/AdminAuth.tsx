import { useNavigate, Link } from 'react-router-dom'
import { ShieldCheck, ArrowLeft, ExternalLink } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function AdminAuth() {
  const navigate = useNavigate()
  const { demoLogin } = useAuth()

  const handlePrototypeAccess = () => {
    demoLogin('admin')
    toast.success('Prototype Access Granted')
    navigate('/admin/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-300 mb-8 transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />Back to Home
        </Link>
        <div className="card p-8 text-center">
          <div className="flex flex-col items-center gap-3 mb-8">
            <div className="w-16 h-16 bg-gray-700/50 rounded-2xl flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
              <p className="text-gray-500 text-sm">System Administration</p>
            </div>
          </div>
          
          <div className="space-y-6 animate-in">
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6">
              <p className="text-amber-400 font-medium leading-relaxed">
                "As it is prototype admin pass is disabled"
              </p>
              <p className="text-amber-500/60 text-xs mt-2 italic">
                Full authentication will be enabled in the production version.
              </p>
            </div>

            <button 
              onClick={handlePrototypeAccess}
              className="w-full py-4 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-2xl transition-all flex items-center justify-center gap-3 border border-gray-700 hover:border-gray-600 shadow-lg group"
            >
              Enter Admin Dashboard <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <p className="text-gray-600 text-xs">
              Authorized personnel only. All actions are logged.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
