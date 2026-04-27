import { useState } from 'react'
import Sidebar from '../../components/Sidebar'
import { CheckCircle2, XCircle, Eye, Users } from 'lucide-react'
import toast from 'react-hot-toast'

const DEMO_APPLICANTS = [
  { id: 1, name: 'Priya Reddy', occupation: 'Teacher', skills: ['Teaching', 'Counseling'], tier: 'elite', streak: 14, points: 620, opportunity: 'Education Drive', status: 'pending' },
  { id: 2, name: 'Suresh Kumar', occupation: 'Nurse', skills: ['First Aid', 'Medical'], tier: 'reliable', streak: 8, points: 290, opportunity: 'Health Camp', status: 'accepted' },
  { id: 3, name: 'Anjali Singh', occupation: 'Photographer', skills: ['Photography', 'Art'], tier: 'newbie', streak: 2, points: 45, opportunity: 'Awareness Drive', status: 'pending' },
  { id: 4, name: 'Ravi Teja', occupation: 'Software Engineer', skills: ['Coding', 'Teaching'], tier: 'reliable', streak: 11, points: 380, opportunity: 'Digital Literacy', status: 'rejected' },
]

export default function ViewApplicants() {
  const [applicants, setApplicants] = useState(DEMO_APPLICANTS)
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all')

  const updateStatus = (id: number, status: 'accepted' | 'rejected') => {
    setApplicants(prev => prev.map(a => a.id === id ? { ...a, status } : a))
    toast.success(`Applicant ${status}!`)
  }

  const filtered = filter === 'all' ? applicants : applicants.filter(a => a.status === filter)

  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-6 animate-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Applicants</h1>
              <p className="text-gray-400 text-sm mt-1">Review and manage volunteer applications</p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400">{applicants.length} total</span>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2">
            {(['all', 'pending', 'accepted', 'rejected'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${filter === f ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'text-gray-500 hover:text-gray-300 border border-gray-800'}`}>
                {f} {f !== 'all' && `(${applicants.filter(a => a.status === f).length})`}
              </button>
            ))}
          </div>

          {/* Applicant Cards */}
          <div className="space-y-4">
            {filtered.map(a => (
              <div key={a.id} className="card p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500/30 to-secondary-500/30 rounded-xl flex items-center justify-center text-lg shrink-0">
                    {a.name[0]}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-white">{a.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${a.tier === 'elite' ? 'bg-secondary-500/20 text-secondary-400' : a.tier === 'reliable' ? 'bg-primary-500/20 text-primary-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                        {a.tier === 'elite' ? '🔵 Elite' : a.tier === 'reliable' ? '🟢 Reliable' : '🟡 Newbie'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{a.occupation} • {a.opportunity}</p>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {a.skills.map(s => <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">{s}</span>)}
                    </div>
                    <div className="flex gap-3 mt-1.5 text-xs text-gray-500">
                      <span>🔥 {a.streak}d streak</span>
                      <span>⭐ {a.points} pts</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {a.status === 'pending' ? (
                    <>
                      <button onClick={() => updateStatus(a.id, 'accepted')} id={`accept-${a.id}`} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary-500/10 text-primary-400 hover:bg-primary-500/20 text-sm transition-all">
                        <CheckCircle2 className="w-4 h-4" />Accept
                      </button>
                      <button onClick={() => updateStatus(a.id, 'rejected')} id={`reject-${a.id}`} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 text-sm transition-all">
                        <XCircle className="w-4 h-4" />Reject
                      </button>
                    </>
                  ) : (
                    <span className={`text-sm font-medium capitalize px-3 py-2 rounded-xl ${a.status === 'accepted' ? 'text-primary-400 bg-primary-500/10' : 'text-red-400 bg-red-500/10'}`}>
                      {a.status === 'accepted' ? '✓ Accepted' : '✗ Rejected'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
