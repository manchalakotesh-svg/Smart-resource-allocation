import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { db, storage } from '../../lib/firebase'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { ref, uploadBytes } from 'firebase/storage'
import { useAuth } from '../../context/AuthContext'
import Sidebar from '../../components/Sidebar'
import GamificationBar from '../../components/GamificationBar'
import { chatbotQuery, generateAIStory, getAIMatchScore, getAISkillRecommendations } from '../../lib/ai'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { FileText, Eye, Brain, Bell, Video, Calendar, MapPin, CheckCircle2, Clock, MessageSquare, Send, LogOut } from 'lucide-react'
import toast from 'react-hot-toast'
import jsPDF from 'jspdf'

// Demo data
const activityData = [
  { month: 'Nov', hours: 4 }, { month: 'Dec', hours: 8 }, { month: 'Jan', hours: 6 },
  { month: 'Feb', hours: 12 }, { month: 'Mar', hours: 9 }, { month: 'Apr', hours: 15 },
]

const recentActivities = [
  { id: 1, title: 'Teaching Math - Vijayawada NGO', date: '2026-04-25', hours: 3, verified: true, location: 'Vijayawada' },
  { id: 2, title: 'Health Camp Support - Guntur', date: '2026-04-20', hours: 5, verified: true, location: 'Guntur' },
  { id: 3, title: 'Tree Planting Drive', date: '2026-04-15', hours: 2, verified: false, location: 'Amaravati' },
]

export default function VolunteerDashboard() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<any>(null)
  const [skillRecs, setSkillRecs] = useState<string[]>([])
  const [story, setStory] = useState('')
  const [storyLoading, setStoryLoading] = useState(false)
  const [matchScore, setMatchScore] = useState<number | null>(null)
  const [notification, setNotification] = useState<string | null>('📍 New opportunity 0.8km away: Health Camp in Vijayawada')
  const [activeTab, setActiveTab] = useState<'activities' | 'story' | 'shadow'>('activities')
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const [chatMsg, setChatMsg] = useState('')
  const [chatReply, setChatReply] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [showChat, setShowChat] = useState(false)

  useEffect(() => {
    if (user) fetchProfile()
  }, [user])

  const fetchProfile = async () => {
    if (!user) return
    try {
      const userDoc = await getDoc(doc(db, 'volunteer_profiles', user.uid))
      if (userDoc.exists()) {
        setProfile(userDoc.data())
        // Start AI fetch but don't AWAIT it here - let it load in background
        getAISkillRecommendations(user.uid).then(recs => setSkillRecs(recs))
      } else {
        // If profile doesn't exist, redirect to complete it
        toast.error('Please complete your profile first.')
        navigate('/auth/volunteer')
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const handleGenerateStory = async () => {
    if (!user) return
    setStoryLoading(true)
    setActiveTab('story')
    try {
      const s = await generateAIStory(user.uid)
      setStory(s)
    } catch {
      toast.error('Story generation failed')
    } finally {
      setStoryLoading(false)
    }
  }

  const handleDownloadCert = () => {
    const doc = new jsPDF()
    doc.setFontSize(22)
    doc.setTextColor(16, 185, 129)
    doc.text('Bridge India — Volunteer Certificate', 20, 30)
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.text(`This certifies that ${profile?.name || 'Volunteer'}`, 20, 55)
    doc.text('has actively volunteered and contributed to the community', 20, 70)
    doc.text('of Andhra Pradesh through Bridge India platform.', 20, 85)
    doc.setFontSize(12)
    doc.setTextColor(100, 100, 100)
    doc.text(`Total Hours: ${activityData.reduce((a, b) => a + b.hours, 0)} hours`, 20, 110)
    doc.text(`Points Earned: ${profile?.points || 340}`, 20, 125)
    doc.text(`Tier: ${profile?.tier || 'Reliable'}`, 20, 140)
    doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 20, 155)
    doc.save(`BridgeIndia_Certificate_${profile?.name || 'Volunteer'}.pdf`)
    toast.success('Certificate downloaded!')
  }

  const handleGetMatchScore = async () => {
    if (!user) return
    const score = await getAIMatchScore(user.uid, 'demo-opp')
    setMatchScore(score)
  }

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    if (file.size > 50 * 1024 * 1024) {
      toast.error('Video must be under 50MB')
      return
    }

    setUploadingVideo(true)
    const toastId = toast.loading('Uploading story video...')

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.uid}-${Date.now()}.${fileExt}`
      const storageRef = ref(storage, `stories/${fileName}`)

      await uploadBytes(storageRef, file)

      toast.success('Story video uploaded! Earn +15 points after verification.', { id: toastId })
    } catch (error: any) {
      toast.error(`Upload failed: ${error.message}`, { id: toastId })
    } finally {
      setUploadingVideo(false)
      if (videoInputRef.current) videoInputRef.current.value = ''
    }
  }

  const handleChat = async () => {
    if (!chatMsg.trim()) return
    setChatLoading(true)
    try {
      const reply = await chatbotQuery(chatMsg, user?.uid || 'volunteer-demo')
      setChatReply(reply)
    } catch {
      setChatReply('I am having trouble connecting. Please try again.')
    } finally {
      setChatLoading(false)
    }
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
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Welcome back, {profile?.name || 'Volunteer'} 👋</h1>
              <p className="text-gray-400 text-sm mt-1">Your volunteer dashboard • Andhra Pradesh</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowChat(!showChat)}
                className="btn-secondary text-sm py-2 px-4 flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />AI Assistant
              </button>
              <button onClick={handleDownloadCert} id="download-cert" className="btn-outline text-sm py-2 px-4 flex items-center gap-2">
                <FileText className="w-4 h-4" />PDF Certificate
              </button>
              <button
                onClick={handleSignOut}
                className="bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-sm py-2 px-4 rounded-xl flex items-center gap-2 transition-all"
              >
                <LogOut className="w-4 h-4" />Sign Out
              </button>
            </div>
          </div>

          {/* Proximity notification */}
          {notification && (
            <div className="flex items-center justify-between bg-primary-500/10 border border-primary-500/30 rounded-xl px-5 py-3 animate-in">
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 text-primary-400" />
                <span className="text-primary-300 text-sm font-medium">{notification}</span>
              </div>
              <button onClick={() => setNotification(null)} className="text-gray-500 hover:text-gray-300 text-lg">×</button>
            </div>
          )}

          {/* Gamification Bar */}
          <GamificationBar
            points={profile?.points ?? 340}
            streak={profile?.streak ?? 7}
            tier={profile?.tier ?? 'reliable'}
            badges={3}
          />

          {/* AI Skill Path Section */}
          <div className="card p-6 border-primary-500/20 bg-primary-500/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Brain className="w-32 h-32 text-primary-400" />
            </div>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-500/20 rounded-2xl flex items-center justify-center">
                  <Brain className="w-6 h-6 text-primary-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">AI Skill Path</h2>
                  <p className="text-xs text-primary-400 font-bold uppercase tracking-widest">Personalized Recommendations</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                {skillRecs.length > 0 ? (
                  skillRecs.map(skill => (
                    <div key={skill} className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-xl flex items-center gap-2 group/skill hover:border-primary-500/50 transition-all cursor-default">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                      <span className="text-sm font-medium text-gray-300">{skill}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 text-sm italic">Analyzing platform needs...</div>
                )}
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Hours', value: '54', icon: Clock, color: 'text-secondary-400' },
              { label: 'Activities', value: '12', icon: CheckCircle2, color: 'text-primary-400' },
              { label: 'NGOs Joined', value: '4', icon: MapPin, color: 'text-amber-400' },
              { label: 'AI Match Score', value: matchScore ? `${matchScore}%` : '—', icon: Brain, color: 'text-purple-400' },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
                <div className="text-2xl font-bold text-white">{s.value}</div>
                <div className="text-xs text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Dedicated AI Assistant & Doubts Section */}
          <div className="card p-8 border-primary-500/20 bg-primary-500/5 animate-in">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-primary-500 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Ask AI Doubts</h2>
                <p className="text-gray-400 text-xs">Clear your personal doubts about volunteering or the platform</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={chatMsg}
                  onChange={e => setChatMsg(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleChat()}
                  placeholder="e.g. How do I earn the 'Reliable' badge? or How can I contact an NGO?"
                  className="input-field py-4 flex-1 text-base shadow-inner"
                />
                <button 
                  onClick={handleChat} 
                  disabled={chatLoading}
                  className="btn-primary px-8 flex items-center gap-2 text-base font-bold shadow-xl shadow-primary-500/20 disabled:opacity-50"
                >
                  {chatLoading ? 'Analyzing...' : <Send className="w-5 h-5" />}
                  Ask AI
                </button>
              </div>
              {chatReply && (
                <div className="p-6 bg-gray-950 rounded-3xl border border-gray-800 text-gray-300 leading-relaxed shadow-2xl animate-in">
                  <div className="text-primary-400 text-[10px] font-black uppercase tracking-[0.2em] mb-3">Bridge AI Response</div>
                  {chatReply}
                </div>
              )}
            </div>
          </div>

          {/* AI Assistant Chat Section */}
          {showChat && (
            <div className="card p-6 border-secondary-500/30 animate-in">
              <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-secondary-400" /> Volunteer AI Assistant
              </h2>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={chatMsg}
                    onChange={e => setChatMsg(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleChat()}
                    placeholder="Ask about your hours, badges, or how to join an NGO..."
                    className="input-field flex-1"
                  />
                  <button 
                    onClick={handleChat} 
                    disabled={chatLoading}
                    className="btn-secondary px-6 flex items-center gap-2 disabled:opacity-50"
                  >
                    {chatLoading ? '...' : <Send className="w-4 h-4" />}
                    Send
                  </button>
                </div>
                {chatReply && (
                  <div className="p-4 bg-gray-900 rounded-2xl border border-gray-800 text-sm text-gray-300 animate-in">
                    <div className="text-secondary-400 text-[10px] font-bold uppercase tracking-widest mb-2">Gemini AI Assistant</div>
                    {chatReply}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Main Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Activity Chart */}
            <div className="lg:col-span-2 card p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Activity History (Hours)</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#f9fafb' }} />
                  <Bar dataKey="hours" fill="#10B981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* AI Features Panel */}
            <div className="space-y-4">
              <div className="card p-4 space-y-3">
                <h3 className="text-sm font-semibold text-gray-300">AI Features</h3>
                <button onClick={handleGenerateStory} id="btn-ai-story" className="w-full flex items-center gap-3 p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl text-purple-300 hover:bg-purple-500/20 transition-colors text-sm">
                  <Brain className="w-4 h-4" />Generate AI Story
                </button>
                <button onClick={handleGetMatchScore} id="btn-match-score" className="w-full flex items-center gap-3 p-3 bg-secondary-500/10 border border-secondary-500/30 rounded-xl text-secondary-300 hover:bg-secondary-500/20 transition-colors text-sm">
                  <CheckCircle2 className="w-4 h-4" />Check Match Score
                </button>
                <button
                  onClick={() => setActiveTab('shadow')}
                  id="btn-shadow"
                  className="w-full flex items-center gap-3 p-3 bg-primary-500/10 border border-primary-500/30 rounded-xl text-primary-300 hover:bg-primary-500/20 transition-colors text-sm"
                >
                  <Eye className="w-4 h-4" />Shadow Volunteering
                </button>
                <input
                  type="file"
                  ref={videoInputRef}
                  onChange={handleVideoUpload}
                  accept="video/*"
                  className="hidden"
                />
                <button 
                  onClick={() => videoInputRef.current?.click()}
                  disabled={uploadingVideo}
                  className="w-full flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 hover:bg-amber-500/20 transition-colors text-sm disabled:opacity-50"
                >
                  {uploadingVideo ? (
                    <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Video className="w-4 h-4" />
                  )}
                  {uploadingVideo ? 'Uploading...' : 'Upload 30s Story Video'}
                </button>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="card">
            <div className="flex border-b border-gray-800">
              {(['activities', 'story', 'shadow'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 text-sm font-medium capitalize transition-colors ${activeTab === tab ? 'text-primary-400 border-b-2 border-primary-500' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  {tab === 'shadow' ? 'Shadow Sessions' : tab === 'story' ? 'AI Story' : 'Recent Activities'}
                </button>
              ))}
            </div>

            <div className="p-6">
              {activeTab === 'activities' && (
                <div className="space-y-3">
                  {recentActivities.map(a => (
                    <div key={a.id} className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${a.verified ? 'bg-primary-500' : 'bg-gray-600'}`} />
                        <div>
                          <p className="text-sm text-white font-medium">{a.title}</p>
                          <p className="text-xs text-gray-500">{a.date} • {a.location} • {a.hours}h</p>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${a.verified ? 'bg-primary-500/10 text-primary-400' : 'bg-gray-700 text-gray-400'}`}>
                        {a.verified ? 'Verified' : 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'story' && (
                <div className="animate-in">
                  {storyLoading ? (
                    <div className="flex items-center gap-3 text-gray-400">
                      <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                      Gemini AI is crafting your story...
                    </div>
                  ) : story ? (
                    <div className="bg-gray-800 rounded-xl p-6">
                      <div className="text-primary-400 text-2xl mb-3">✨ Your Volunteer Journey</div>
                      <p className="text-gray-300 leading-relaxed">{story}</p>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Brain className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                      <p className="text-gray-500">Click "Generate AI Story" to create your personalized volunteer narrative</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'shadow' && (
                <div className="space-y-4 animate-in">
                  <p className="text-gray-400 text-sm">Observe live NGO sessions before committing to volunteer. Learn and connect!</p>
                  {[
                    { ngo: 'Education First Foundation', time: 'Today 3:00 PM', topic: 'After-school tutoring session', viewers: 12 },
                    { ngo: 'Health for All NGO', time: 'Tomorrow 10:00 AM', topic: 'Community health awareness camp', viewers: 8 },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-gray-800 rounded-xl border border-gray-700">
                      <div>
                        <p className="text-sm font-medium text-white">{s.ngo}</p>
                        <p className="text-xs text-gray-400">{s.topic}</p>
                        <p className="text-xs text-primary-400 mt-1">{s.time} • {s.viewers} watching</p>
                      </div>
                      <button className="btn-primary text-xs py-2 px-4">Join</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
