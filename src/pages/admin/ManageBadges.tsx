import { useState } from 'react'
import Sidebar from '../../components/Sidebar'
import { BADGES_CATALOG } from '../../lib/gamification'
import { Plus, Edit2, Trash2, Award } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ManageBadges() {
  const [badges, setBadges] = useState(BADGES_CATALOG)
  const [newBadge, setNewBadge] = useState({ name: '', icon: '🏅', description: '' })
  const [showForm, setShowForm] = useState(false)

  const handleAddBadge = () => {
    if (!newBadge.name || !newBadge.description) { toast.error('Fill all fields'); return }
    const id = newBadge.name.toLowerCase().replace(/\s+/g, '-')
    setBadges(prev => [...prev, { ...newBadge, id }])
    setNewBadge({ name: '', icon: '🏅', description: '' })
    setShowForm(false)
    toast.success('Badge created!')
  }

  const handleDelete = (id: string) => {
    setBadges(prev => prev.filter(b => b.id !== id))
    toast.success('Badge deleted')
  }

  const POINTS_CONFIG = [
    { action: 'Daily Login', points: 5, key: 'dailyLogin' },
    { action: 'Activity Hour', points: 10, key: 'activityHour' },
    { action: 'Badge Earned', points: 50, key: 'badgeEarned' },
    { action: 'Profile Completed', points: 20, key: 'profileCompleted' },
    { action: 'Video Uploaded', points: 15, key: 'videoUploaded' },
    { action: 'Shadow Session', points: 25, key: 'shadowSession' },
  ]

  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-6 animate-in">
          <div>
            <h1 className="text-2xl font-bold text-white">Manage Badges & Points</h1>
            <p className="text-gray-400 text-sm mt-1">Configure the gamification system</p>
          </div>

          {/* Points Table */}
          <div className="card p-6">
            <h2 className="font-semibold text-white text-lg mb-4">Points Configuration</h2>
            <div className="grid md:grid-cols-2 gap-3">
              {POINTS_CONFIG.map(p => (
                <div key={p.key} className="flex items-center justify-between bg-gray-800 rounded-xl px-4 py-3">
                  <span className="text-gray-300 text-sm">{p.action}</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      defaultValue={p.points}
                      className="w-16 bg-gray-700 border border-gray-600 rounded-lg px-2 py-1 text-sm text-white text-center outline-none focus:border-primary-500"
                    />
                    <span className="text-xs text-gray-500">pts</span>
                  </div>
                </div>
              ))}
            </div>
            <button className="btn-primary mt-4 text-sm py-2 px-6">Save Points Config</button>
          </div>

          {/* Badges List */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-white text-lg flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />Badges ({badges.length})
              </h2>
              <button onClick={() => setShowForm(true)} id="btn-add-badge" className="btn-primary text-sm py-2 px-4 flex items-center gap-2">
                <Plus className="w-4 h-4" />Add Badge
              </button>
            </div>

            {showForm && (
              <div className="bg-gray-800 rounded-xl p-4 mb-4 animate-in space-y-3">
                <h3 className="text-sm font-semibold text-white">New Badge</h3>
                <div className="grid grid-cols-3 gap-3">
                  <input id="badge-icon" type="text" value={newBadge.icon} onChange={e => setNewBadge(p => ({ ...p, icon: e.target.value }))} placeholder="🏅" className="input-field text-center text-2xl" />
                  <input id="badge-name" type="text" value={newBadge.name} onChange={e => setNewBadge(p => ({ ...p, name: e.target.value }))} placeholder="Badge name" className="input-field col-span-2" />
                </div>
                <input id="badge-desc" type="text" value={newBadge.description} onChange={e => setNewBadge(p => ({ ...p, description: e.target.value }))} placeholder="Badge description / criteria" className="input-field" />
                <div className="flex gap-2">
                  <button onClick={handleAddBadge} className="btn-primary text-sm py-2 px-4">Create Badge</button>
                  <button onClick={() => setShowForm(false)} className="btn-outline text-sm py-2 px-4">Cancel</button>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-3">
              {badges.map(badge => (
                <div key={badge.id} className="flex items-center justify-between bg-gray-800 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{badge.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-white">{badge.name}</p>
                      <p className="text-xs text-gray-500">{badge.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-500 hover:text-gray-300 transition-colors">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(badge.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
