import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import Sidebar from '../../components/Sidebar'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Users, MessageSquare, Plus, Zap, Clock, Brain, MapPin, Search } from 'lucide-react'
import { chatbotQuery, generateNGOImpactSummary } from '../../lib/ai'
import { db } from '../../lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { collection, query, getDocs, where } from 'firebase/firestore'

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
  const navigate = useNavigate()
  const [chatMsg, setChatMsg] = useState('')
  const [chatReply, setChatReply] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [impactSummary, setImpactSummary] = useState('')
  const [summaryLoading, setSummaryLoading] = useState(false)
  
  // AI Match States
  const [showMatch, setShowMatch] = useState(false)
  const [matchInputs, setMatchInputs] = useState({ occupation: '', skill: '', timing: 'weekends', place: '' })
  const [matchedVolunteers, setMatchedVolunteers] = useState<any[]>([])
  const [matching, setMatching] = useState(false)

  useEffect(() => {
    if (user) {
      fetchProfile()
      // Run AI summary in background, don't wait for it
      fetchSummary()
    }
  }, [user])

  const fetchSummary = async () => {
    if (!user) return
    setSummaryLoading(true)
    try {
      const summary = await generateNGOImpactSummary(user.uid)
      setImpactSummary(summary)
    } finally {
      setSummaryLoading(false)
    }
  }

  const fetchProfile = async () => {
    if (!user) return
    try {
      const userDoc = await getDoc(doc(db, 'ngo_profiles', user.uid))
      if (userDoc.exists()) {
        setProfile(userDoc.data())
      } else {
        toast.error('Please complete your NGO profile first.')
        navigate('/auth/ngo')
      }
    } catch (error) {
      console.error('Error fetching NGO profile:', error)
    }
  }

  const handleChat = async () => {
    if (!chatMsg.trim()) return
    setChatLoading(true)
    try {
      // Using uid instead of id for Firebase
      const reply = await chatbotQuery(chatMsg, user?.uid || 'demo')
      setChatReply(reply)
    } catch {
      setChatReply('Sorry, I could not process your query. Please try again.')
    } finally {
      setChatLoading(false)
    }
  }

  const handleAIMatch = async () => {
    setMatching(true)
    const toastId = toast.loading('AI is scanning community profiles...')
    try {
      // Simulate/Fetch matching from public_profiles
      const q = query(collection(db, 'public_profiles'))
      const snapshot = await getDocs(q)
      const all = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
      
      // Filter logic (Simplified for prototype)
      const results = all.filter((v: any) => {
        const occMatch = !matchInputs.occupation || v.occupation?.toLowerCase().includes(matchInputs.occupation.toLowerCase())
        const skillMatch = !matchInputs.skill || v.skills?.some((s: string) => s.toLowerCase().includes(matchInputs.skill.toLowerCase()))
        return occMatch && skillMatch
      }).slice(0, 5)

      setMatchedVolunteers(results)
      toast.success(`Found ${results.length} matching volunteers!`, { id: toastId })
    } catch {
      toast.error('AI Match failed', { id: toastId })
    } finally {
      setMatching(false)
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
            <div className="flex gap-3">
              <button
                onClick={() => setShowMatch(!showMatch)}
                className="btn-primary text-sm py-2 px-4 flex items-center gap-2"
              >
                <Brain className="w-4 h-4" />AI Match Volunteers
              </button>
              <button
                onClick={() => setShowChat(!showChat)}
                id="btn-chatbot"
                className="btn-secondary text-sm py-2 px-4 flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />AI Assistant
              </button>
            </div>
          </div>

          {/* AI Impact Summary Section */}
          <div className="card p-6 border-secondary-500/20 bg-secondary-500/5 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Zap className="w-24 h-24 text-secondary-400" />
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-secondary-500/20 rounded-xl flex items-center justify-center">
                <Brain className="w-5 h-5 text-secondary-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">AI Impact Summary</h2>
                <p className="text-[10px] text-secondary-400 uppercase tracking-widest font-bold">Auto-Generated Analysis</p>
              </div>
            </div>
            {summaryLoading ? (
              <div className="space-y-2 animate-pulse">
                <div className="h-4 bg-gray-800 rounded w-full"></div>
                <div className="h-4 bg-gray-800 rounded w-5/6"></div>
                <div className="h-4 bg-gray-800 rounded w-4/6"></div>
              </div>
            ) : (
              <p className="text-gray-300 text-sm leading-relaxed italic">
                "{impactSummary || 'Complete your profile to generate an AI impact summary.'}"
              </p>
            )}
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

          {/* AI Match Feature */}
          {showMatch && (
            <div className="card p-6 border-primary-500/30 animate-in">
              <div className="flex items-center gap-2 mb-6">
                <Brain className="w-6 h-6 text-primary-400" />
                <h2 className="text-xl font-bold text-white">AI Volunteer Matcher</h2>
              </div>
              
              <div className="grid md:grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block uppercase font-bold tracking-wider">Required Occupation</label>
                  <input 
                    type="text" 
                    value={matchInputs.occupation} 
                    onChange={e => setMatchInputs({...matchInputs, occupation: e.target.value})} 
                    placeholder="e.g. Teacher, Doctor" 
                    className="input-field" 
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block uppercase font-bold tracking-wider">Target Skill</label>
                  <input 
                    type="text" 
                    value={matchInputs.skill} 
                    onChange={e => setMatchInputs({...matchInputs, skill: e.target.value})} 
                    placeholder="e.g. Math, First Aid" 
                    className="input-field" 
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block uppercase font-bold tracking-wider">Timing</label>
                  <select 
                    value={matchInputs.timing} 
                    onChange={e => setMatchInputs({...matchInputs, timing: e.target.value})} 
                    className="input-field"
                  >
                    <option value="weekends">Weekends</option>
                    <option value="weekdays">Weekdays</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block uppercase font-bold tracking-wider">Location / Place</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                    <input 
                      type="text" 
                      value={matchInputs.place} 
                      onChange={e => setMatchInputs({...matchInputs, place: e.target.value})} 
                      placeholder="e.g. Vijayawada" 
                      className="input-field pl-10" 
                    />
                  </div>
                </div>
              </div>

              <button 
                onClick={handleAIMatch} 
                disabled={matching}
                className="btn-primary w-full py-4 flex items-center justify-center gap-3 text-lg"
              >
                {matching ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
                {matching ? 'AI is Matching...' : 'Find Best Volunteers'}
              </button>

              {matchedVolunteers.length > 0 && (
                <div className="mt-8 space-y-4 animate-in">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-gray-800 pb-2">AI Recommended Candidates</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {matchedVolunteers.map((v: any) => (
                      <div key={v.id} className="p-4 bg-gray-900 rounded-2xl border border-gray-800 hover:border-primary-500/30 transition-all flex items-center justify-between">
                        <div>
                          <p className="text-white font-bold">{v.name}</p>
                          <p className="text-xs text-gray-500">{v.occupation} • {v.points} pts</p>
                          <div className="flex gap-1 mt-1">
                            {v.skills?.slice(0, 2).map((s: string) => (
                              <span key={s} className="text-[10px] px-1.5 py-0.5 bg-gray-800 text-gray-400 rounded-md uppercase">{s}</span>
                            ))}
                          </div>
                        </div>
                        <button className="text-xs bg-primary-500/20 text-primary-400 px-3 py-1.5 rounded-lg font-bold hover:bg-primary-500/30">Connect</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

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
