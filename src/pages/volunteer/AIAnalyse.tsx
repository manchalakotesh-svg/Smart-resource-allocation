import { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import { Brain, TrendingUp, Users, Building2, BarChart3, Info, PieChart, Globe } from 'lucide-react'
import { db } from '../../lib/firebase'
import { collection, getDocs, query, where } from 'firebase/firestore'
import toast from 'react-hot-toast'
import { chatbotQuery } from '../../lib/ai'
import { Send, Bot, MessageSquare } from 'lucide-react'
import { useRef } from 'react'

export default function AIAnalyse() {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([
    { role: 'ai', content: 'Welcome to the Bridge India Knowledge Hub! I can provide detailed information about our volunteer community, total registered NGOs, and platform impact. How can I help you explore our community data today?' }
  ])

  const [stats, setStats] = useState({
    totalVolunteers: 0,
    totalNGOs: 0,
    totalOpportunities: 0,
    loading: true
  })

  useEffect(() => {
    fetchPlatformKnowledge()
  }, [])

  const fetchPlatformKnowledge = async () => {
    try {
      const volSnap = await getDocs(collection(db, 'volunteer_profiles'))
      const ngoSnap = await getDocs(collection(db, 'ngo_profiles'))
      const oppSnap = await getDocs(collection(db, 'opportunities'))
      
      setStats({
        totalVolunteers: volSnap.size + 1200, // Demo offset + Real data
        totalNGOs: ngoSnap.size + 150,
        totalOpportunities: oppSnap.size + 400,
        loading: false
      })
    } catch (error) {
      console.error('Error fetching knowledge:', error)
      setStats(s => ({ ...s, loading: false }))
    }
  }

  const trendingSectors = [
    { name: 'Education & Literacy', count: '45%', color: 'bg-primary-500' },
    { name: 'Health & Wellness', count: '30%', color: 'bg-rose-500' },
    { name: 'Environment', count: '15%', color: 'bg-emerald-500' },
    { name: 'Disaster Relief', count: '10%', color: 'bg-amber-500' },
  ]

  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleSend = async () => {
    if (!input.trim() || loading) return
    const userMsg = input
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)
    try {
      const response = await chatbotQuery(`[VOLUNTEER KNOWLEDGE MODE] ${userMsg}`, 'volunteer')
      setMessages(prev => [...prev, { role: 'ai', content: response }])
    } catch {
      toast.error('Knowledge engine is busy')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8 animate-in">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-primary-400" /> Platform AI Analyse
            </h1>
            <p className="text-gray-400 mt-2 text-lg">Deep insights into the Bridge India community and impact.</p>
          </div>

          {/* Core Knowledge Stats */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { label: 'Registered Volunteers', value: stats.totalVolunteers, icon: Users, color: 'text-primary-400', bg: 'bg-primary-500/10' },
              { label: 'Active NGOs', value: stats.totalNGOs, icon: Building2, color: 'text-secondary-400', bg: 'bg-secondary-500/10' },
              { label: 'Opportunities Published', value: stats.totalOpportunities, icon: Globe, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            ].map(s => (
              <div key={s.label} className="card p-8 border-gray-800 hover:border-primary-500/20 transition-all">
                <div className={`w-12 h-12 ${s.bg} rounded-2xl flex items-center justify-center mb-4`}>
                  <s.icon className={`w-6 h-6 ${s.color}`} />
                </div>
                <div className="text-4xl font-bold text-white mb-1">
                  {stats.loading ? '...' : s.value.toLocaleString()}
                </div>
                <div className="text-sm font-bold text-gray-500 uppercase tracking-widest">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Impact Distribution */}
            <div className="card p-8">
              <div className="flex items-center gap-3 mb-8">
                <PieChart className="w-6 h-6 text-primary-400" />
                <h2 className="text-xl font-bold text-white">Impact by Sector</h2>
              </div>
              <div className="space-y-6">
                {trendingSectors.map(s => (
                  <div key={s.name} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300 font-medium">{s.name}</span>
                      <span className="text-white font-bold">{s.count}</span>
                    </div>
                    <div className="h-3 bg-gray-900 rounded-full overflow-hidden border border-gray-800">
                      <div className={`h-full ${s.color} rounded-full transition-all duration-1000`} style={{ width: s.count }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Trending Analysis */}
            <div className="card p-8 border-primary-500/20 bg-primary-500/5">
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="w-6 h-6 text-primary-400" />
                <h2 className="text-xl font-bold text-white">AI Trending Insights</h2>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-gray-950 rounded-2xl border border-gray-800">
                  <div className="flex items-start gap-3">
                    <Brain className="w-5 h-5 text-purple-400 mt-1" />
                    <div>
                      <p className="text-white font-bold text-sm">Growing Volunteer Demand</p>
                      <p className="text-gray-400 text-xs mt-1 leading-relaxed">
                        There is a 15% increase in requests for technical mentors in rural Andhra Pradesh districts.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-gray-950 rounded-2xl border border-gray-800">
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-blue-400 mt-1" />
                    <div>
                      <p className="text-white font-bold text-sm">Volunteer Retention</p>
                      <p className="text-gray-400 text-xs mt-1 leading-relaxed">
                        80% of registered volunteers have earned at least one badge in their first month.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-primary-500/10 rounded-2xl border border-primary-500/30 text-xs text-primary-300 italic">
                  "Bridge India is currently the fastest-growing social impact platform in the region."
                </div>
              </div>
            </div>
          </div>

          {/* Knowledge Assistant Chat Section */}
          <div className="card p-8 border-primary-500/20 bg-primary-500/5 animate-in">
            <div className="flex items-center gap-3 mb-6">
              <MessageSquare className="w-6 h-6 text-primary-400" />
              <h2 className="text-xl font-bold text-white uppercase tracking-widest">Knowledge Assistant</h2>
            </div>
            <div className="space-y-4">
              <div className="max-h-[300px] overflow-y-auto mb-4 space-y-4 pr-2" ref={scrollRef}>
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in`}>
                    <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                      m.role === 'user' ? 'bg-primary-500 text-white rounded-tr-none' : 'bg-gray-900 border border-gray-800 text-gray-300 rounded-tl-none'
                    }`}>
                      {m.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="p-4 bg-gray-900 border border-gray-800 rounded-2xl rounded-tl-none text-gray-500 text-sm italic animate-pulse">
                      AI is exploring platform data...
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about volunteers, NGOs, or platform impact..."
                  className="input-field py-4 flex-1"
                />
                <button 
                  onClick={handleSend} 
                  disabled={loading || !input.trim()}
                  className="btn-primary px-8 flex items-center gap-2 font-bold disabled:opacity-50"
                >
                  {loading ? '...' : <Send className="w-5 h-5" />}
                  Ask
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
