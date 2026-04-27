import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import Sidebar from '../../components/Sidebar'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts'
import { Users, MessageSquare, Plus, CheckCircle2, Clock, Zap } from 'lucide-react'
import { chatbotQuery } from '../../lib/ai'
import toast from 'react-hot-toast'

const applicantData = [
  { week: 'W1', applied: 4 }, { week: 'W2', applied: 8 }, { week: 'W3', applied: 6 },
  { week: 'W4', applied: 12 }, { week: 'W5', applied: 9 }, { week: 'W6', applied: 15 },
]

const recentApplicants = [
  { id: 1, name: 'Priya Reddy', skills: ['Teaching', 'Counseling'], tier: 'elite', score: 94, status: 'pending' },
  { id: 2, name: 'Suresh Kumar', skills: ['First Aid', 'Medical'], tier: 'reliable', score: 81, status: 'accepted' },
  { id: 3, name: 'Lakshmi Devi', skills: ['Social Work'], tier: 'newbie', score: 67, status: 'pending' },
]

export default function NGODashboard() {
  const { user } = useAuth()
  const [chatMsg, setChatMsg] = useState('')
  const [chatReply, setChatReply] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [showChat, setShowChat] = useState(false)

  const handleChat = async () => {
    if (!chatMsg.trim()) return
    setChatLoading(true)
    try {
      const reply = await chatbotQuery(chatMsg, user?.id || 'demo')
      setChatReply(reply)
    } catch {
      setChatReply('Sorry, I could not process your query. Please try again.')
    } finally {
      setChatLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-6 animate-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">NGO Dashboard</h1>
              <p className="text-gray-400 text-sm mt-1">Manage volunteers and opportunities</p>
            </div>
            <button
              onClick={() => setShowChat(!showChat)}
              id="btn-chatbot"
              className="btn-secondary text-sm py-2 px-4 flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />AI Assistant
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Active Volunteers', value: '24', icon: Users, color: 'text-primary-400' },
              { label: 'Open Opportunities', value: '3', icon: Plus, color: 'text-secondary-400' },
              { label: 'Pending Applicants', value: '7', icon: Clock, color: 'text-amber-400' },
              { label: 'AI Matches Found', value: '12', icon: Zap, color: 'text-purple-400' },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
                <div className="text-2xl font-bold text-white">{s.value}</div>
                <div className="text-xs text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Chatbot */}
          {showChat && (
            <div className="card p-6 animate-in">
              <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-secondary-400" />NGO AI Assistant
              </h2>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <input
                    id="chatbot-input"
                    type="text"
                    value={chatMsg}
                    onChange={e => setChatMsg(e.target.value)}
                    placeholder="Ask anything about volunteers, postings, or impact..."
                    className="input-field flex-1"
                    onKeyDown={e => e.key === 'Enter' && handleChat()}
                  />
                  <button onClick={handleChat} disabled={chatLoading} id="chatbot-send" className="btn-secondary px-6 disabled:opacity-50">
                    {chatLoading ? '...' : 'Send'}
                  </button>
                </div>
                {chatReply && (
                  <div className="bg-secondary-500/10 border border-secondary-500/30 rounded-xl p-4 text-gray-300 text-sm animate-in">
                    <div className="text-secondary-400 text-xs font-medium mb-2">🤖 AI Assistant</div>
                    {chatReply}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Charts + Applicants */}
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Applications Over Time</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={applicantData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="week" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#f9fafb' }} />
                  <Bar dataKey="applied" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Top AI Matches */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />AI-Recommended Volunteers
              </h2>
              <div className="space-y-3">
                {recentApplicants.map(a => (
                  <div key={a.id} className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0">
                    <div>
                      <p className="text-sm text-white font-medium">{a.name}</p>
                      <div className="flex gap-1.5 mt-1">
                        {a.skills.map(s => (
                          <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">{s}</span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-secondary-400 font-bold text-sm">{a.score}% match</div>
                      <span className={`text-xs mt-0.5 inline-block ${a.tier === 'elite' ? 'text-secondary-400' : a.tier === 'reliable' ? 'text-primary-400' : 'text-yellow-400'}`}>
                        {a.tier === 'elite' ? '🔵 Elite' : a.tier === 'reliable' ? '🟢 Reliable' : '🟡 Newbie'}
                      </span>
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
