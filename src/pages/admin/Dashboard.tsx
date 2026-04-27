import { Link } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import { Users, Building2, Clock, Activity, ArrowRight, ShieldCheck } from 'lucide-react'

export default function AdminDashboard() {
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

  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-6 animate-in">
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-gray-400 text-sm mt-1">Bridge India Platform Overview</p>
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
