import { useState } from 'react'
import Sidebar from '../../components/Sidebar'
import { CheckCircle2, XCircle, Eye, Filter, Search, MapPin, Phone, Mail } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'

const PENDING_USERS = [
  { id: 'v1', name: 'Arjun Sharma', email: 'arjun@email.com', phone: '+91 9876543210', role: 'volunteer', occupation: 'Doctor', location: 'Guntur', proofUrl: 'proof.pdf', submittedAt: '2026-04-26' },
  { id: 'v2', name: 'Kavitha Rao', email: 'kavitha@email.com', phone: '+91 9123456789', role: 'volunteer', occupation: 'Teacher', location: 'Nellore', proofUrl: 'id_card.jpg', submittedAt: '2026-04-25' },
  { id: 'n1', name: 'Prajas Foundation', email: 'contact@prajas.org', phone: '+91 9988776655', role: 'ngo', occupation: 'NGO', location: 'Kurnool', proofUrl: 'reg_cert.pdf', submittedAt: '2026-04-24' },
  { id: 'v3', name: 'Srinivas Reddy', email: 'srinivas@email.com', phone: '+91 9871234560', role: 'volunteer', occupation: 'Engineer', location: 'Visakhapatnam', proofUrl: 'employee_id.jpg', submittedAt: '2026-04-23' },
]

export default function ApproveVolunteers() {
  const [users, setUsers] = useState(PENDING_USERS)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'volunteer' | 'ngo'>('all')
  const [processing, setProcessing] = useState<string | null>(null)

  const handleAction = async (id: string, name: string, approve: boolean) => {
    setProcessing(id)
    try {
      await supabase.from('users').update({ approved: approve }).eq('id', id)
      setUsers(prev => prev.filter(u => u.id !== id))
      toast.success(`${name} ${approve ? 'approved ✓' : 'rejected ✗'}`)
    } catch {
      // Demo mode
      setUsers(prev => prev.filter(u => u.id !== id))
      toast.success(`${name} ${approve ? 'approved ✓' : 'rejected ✗'} (demo)`)
    } finally {
      setProcessing(null)
    }
  }

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) &&
    (roleFilter === 'all' || u.role === roleFilter)
  )

  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-6 animate-in">
          <div>
            <h1 className="text-2xl font-bold text-white">Approve Users</h1>
            <p className="text-gray-400 text-sm mt-1">Verify and approve volunteer/NGO registrations</p>
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
              <input id="approve-search" type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name..." className="input-field pl-10" />
            </div>
            <div className="flex gap-2">
              {(['all', 'volunteer', 'ngo'] as const).map(f => (
                <button key={f} onClick={() => setRoleFilter(f)} className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${roleFilter === f ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'border border-gray-800 text-gray-500 hover:text-gray-300'}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* User Cards */}
          {filtered.length === 0 ? (
            <div className="card p-12 text-center">
              <CheckCircle2 className="w-12 h-12 text-primary-500 mx-auto mb-3" />
              <p className="text-gray-400">All users have been reviewed!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map(u => (
                <div key={u.id} className="card p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${u.role === 'ngo' ? 'bg-secondary-500/20' : 'bg-primary-500/20'}`}>
                        {u.name[0]}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-white">{u.name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${u.role === 'ngo' ? 'bg-secondary-500/20 text-secondary-400' : 'bg-primary-500/20 text-primary-400'}`}>
                            {u.role.toUpperCase()}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-2 text-xs text-gray-400">
                          <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{u.email}</span>
                          <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{u.phone}</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{u.location}</span>
                          <span>📋 {u.occupation} • Submitted {u.submittedAt}</span>
                        </div>
                        <div className="mt-2">
                          <a href="#" className="text-xs text-secondary-400 hover:underline flex items-center gap-1">
                            <Eye className="w-3 h-3" />View Proof Document: {u.proofUrl}
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleAction(u.id, u.name, true)}
                        id={`approve-${u.id}`}
                        disabled={processing === u.id}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-500/10 text-primary-400 hover:bg-primary-500/20 text-sm font-medium transition-all disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4" />Approve
                      </button>
                      <button
                        onClick={() => handleAction(u.id, u.name, false)}
                        id={`reject-${u.id}`}
                        disabled={processing === u.id}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 text-sm font-medium transition-all disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
