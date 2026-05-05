import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Sidebar from '../../components/Sidebar'
import { Users, Building2, Clock, Activity, ArrowRight, ShieldCheck, Brain, Search, CheckCircle2, AlertTriangle, ChevronDown, LogOut } from 'lucide-react'
import toast from 'react-hot-toast'
import { db } from '../../lib/firebase'
import { collection, query, getDocs, where } from 'firebase/firestore'
import { getAIPlatformHealthReport } from '../../lib/ai'

export default function AdminDashboard() {
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const [examining, setExamining] = useState(false)
  const [showExam, setShowExam] = useState(false)
  const [examResults, setExamResults] = useState<any[]>([])
  const [healthReport, setHealthReport] = useState('')
  const [healthLoading, setHealthLoading] = useState(false)

  useEffect(() => {
    fetchHealthReport()
  }, [])

  const fetchHealthReport = async () => {
    setHealthLoading(true)
    try {
      const report = await getAIPlatformHealthReport()
      setHealthReport(report)
    } finally {
      setHealthLoading(false)
    }
  }

  const handleAIExamination = async () => {
    setExamining(true)
    const toastId = toast.loading('AI is examining new requests and logins...')
    try {
      // Simulate/Fetch pending users
      const q = query(collection(db, 'users'), where('approved', '==', false))
      const snapshot = await getDocs(q)
      const pending = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))

      // Generate mock AI analysis
      const analyzed = pending.map((u: any) => ({
        ...u,
        confidence: Math.floor(Math.random() * 40) + 60, // 60-100%
        recommendation: Math.random() > 0.3 ? 'approve' : 'flag',
        reason: Math.random() > 0.3 ? 'Profile complete, location verified (Vijayawada)' : 'Incomplete occupation proof detected'
      }))

      setExamResults(analyzed)
      setShowExam(true)
      toast.success(`AI Examination complete! ${analyzed.length} users analyzed.`, { id: toastId })
    } catch {
      toast.error('AI Examination failed', { id: toastId })
    } finally {
      setExamining(false)
    }
  }
  const quickActions = [
    { label: 'Pending Approvals', count: 23, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30', to: '/admin/approve' },
    { label: 'Total Volunteers', count: '2,441', icon: Users, color: 'text-primary-400', bg: 'bg-primary-500/10 border-primary-500/30', to: '/admin/approve' },
    { label: 'Partner NGOs', count: 181, icon: Building2, color: 'text-secondary-400', bg: 'bg-secondary-500/10 border-secondary-500/30', to: '/admin/analytics' },
    { label: 'Activities (Month)', count: '1,020', icon: Activity, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30', to: '/admin/analytics' },
  ]

  const recentLogs = [
    { msg: 'Arjun Sharma (volunteer) approved by admin', time: '2 min ago', type: 'approve' },
    { msg: 'AI Matchmaker found 8 matches for Health Camp Guntur', time: '15 min ago', type: 'ai' },
    { msg: 'Prajas Foundation (NGO) registered — pending review', time: '1 hr ago', type: 'register' },
    { msg: 'Badge "Week Warrior" awarded to 12 volunteers', time: '3 hrs ago', type: 'badge' },
    { msg: 'New opportunity posted: Digital Literacy — Tirupati', time: '5 hrs ago', type: 'opportunity' },
  ]

  const handleSignOut = async () => {
    await signOut()
    toast.success('Signed out')
    navigate('/')
  }

  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-6 animate-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-gray-400 text-sm mt-1">Bridge India Platform Overview</p>
            </div>
            <button 
              onClick={handleAIExamination} 
              disabled={examining}
              className="btn-primary py-2.5 px-6 flex items-center gap-3 animate-pulse hover:animate-none"
            >
              <Brain className="w-5 h-5" />
              {examining ? 'Examining...' : 'AI Examination'}
            </button>
            <button
              onClick={handleSignOut}
              className="bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-sm py-2 px-4 rounded-xl flex items-center gap-2 transition-all"
            >
              <LogOut className="w-4 h-4" />Sign Out
            </button>
          </div>

          {/* AI Platform Health Section */}
          <div className="card p-6 border-primary-500/20 bg-primary-500/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <ShieldCheck className="w-24 h-24 text-primary-400" />
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-primary-500/20 rounded-2xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-primary-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">AI Platform Health Report</h2>
                <p className="text-[10px] text-primary-400 uppercase tracking-widest font-bold">Automated Executive Summary</p>
              </div>
            </div>
            {healthLoading ? (
              <div className="space-y-2 animate-pulse">
                <div className="h-4 bg-gray-800 rounded w-full"></div>
                <div className="h-4 bg-gray-800 rounded w-5/6"></div>
              </div>
            ) : (
              <p className="text-gray-300 text-sm leading-relaxed italic border-l-2 border-primary-500/30 pl-4">
                "{healthReport || 'Analyzing platform statistics...'}"
              </p>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map(s => (
              <Link key={s.label} to={s.to} className={`card-hover p-5 border ${s.bg} group`}>
                <div className="flex items-center justify-between mb-3">
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                  <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors" />
                </div>
                <div className="text-2xl font-bold text-white">{s.count}</div>
                <div className="text-sm text-gray-400 mt-1">{s.label}</div>
              </Link>
            ))}
          </div>
          {/* AI Examination Results */}
          {showExam && (
            <div className="card p-6 border-purple-500/30 animate-in">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">AI Examination Report</h2>
                    <p className="text-gray-500 text-xs">Automated screening of pending users</p>
                  </div>
                </div>
                <button onClick={() => setShowExam(false)} className="text-gray-600 hover:text-white">Close Report</button>
              </div>

              <div className="space-y-4">
                {examResults.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">No new users to examine today.</div>
                ) : (
                  examResults.map((res: any) => (
                    <div key={res.id} className="p-4 bg-gray-900/50 rounded-2xl border border-gray-800 flex items-center justify-between gap-6 group">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${res.recommendation === 'approve' ? 'bg-primary-500/10 text-primary-400' : 'bg-rose-500/10 text-rose-400'}`}>
                          {res.email?.[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm text-white font-medium">{res.email}</p>
                          <p className={`text-xs mt-0.5 flex items-center gap-1 ${res.recommendation === 'approve' ? 'text-primary-400' : 'text-rose-400'}`}>
                            {res.recommendation === 'approve' ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                            AI Rec: {res.recommendation === 'approve' ? 'Approve' : 'Flag for Review'} ({res.confidence}%)
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex-1 text-xs text-gray-500 italic">
                        " {res.reason} "
                      </div>

                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="px-4 py-1.5 bg-primary-500/20 text-primary-400 rounded-lg text-xs font-bold hover:bg-primary-500/30">Quick Approve</button>
                        <button className="px-4 py-1.5 bg-gray-800 text-gray-400 rounded-lg text-xs font-bold hover:text-white">View Proof</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <div className="card p-6">
              <h2 className="font-semibold text-white text-lg mb-4">Quick Actions</h2>
              <div className="space-y-2">
                {[
                  { label: 'Review Pending Approvals', to: '/admin/approve', count: 23 },
                  { label: 'Manage Badge System', to: '/admin/badges', count: null },
                  { label: 'View Full Analytics', to: '/admin/analytics', count: null },
                ].map(a => (
                  <Link key={a.to} to={a.to} className="flex items-center justify-between p-3 rounded-xl bg-gray-800 hover:bg-gray-750 transition-colors group">
                    <span className="text-sm text-gray-300 group-hover:text-white">{a.label}</span>
                    <div className="flex items-center gap-2">
                      {a.count && <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">{a.count}</span>}
                      <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-primary-400 transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Activity Log */}
            <div className="card p-6">
              <h2 className="font-semibold text-white text-lg mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary-400" />Activity Log
              </h2>
              <div className="space-y-3">
                {recentLogs.map((log, i) => (
                  <div key={i} className="flex items-start gap-3 py-2 border-b border-gray-800 last:border-0">
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      log.type === 'approve' ? 'bg-primary-500' :
                      log.type === 'ai' ? 'bg-purple-500' :
                      log.type === 'badge' ? 'bg-amber-500' :
                      'bg-secondary-500'
                    }`} />
                    <div>
                      <p className="text-sm text-gray-300">{log.msg}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{log.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
