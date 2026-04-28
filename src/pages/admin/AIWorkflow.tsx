import { useState, useRef, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import { Brain, Send, Bot, ShieldCheck, UserCheck, AlertCircle, Activity, Layout } from 'lucide-react'
import { chatbotQuery } from '../../lib/ai'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function AIWorkflow() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([
    { role: 'ai', content: 'Hello Admin! I am your AI Workflow Analyst. I am here to examine all platform activities and provide detailed analysis for any questions you ask. How can I assist you with platform oversight today?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading) return
    
    const userMsg = input
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)

    try {
      const response = await chatbotQuery(`[ADMIN WORKFLOW MODE] ${userMsg}`, user?.uid || 'admin')
      setMessages(prev => [...prev, { role: 'ai', content: response }])
    } catch {
      toast.error('AI Workflow assistant is currently offline')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col relative">
        {/* Header */}
        <div className="p-6 border-b border-gray-800 bg-gray-950/50 backdrop-blur-md z-10 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Brain className="w-7 h-7 text-purple-400" /> AI Admin Workflow
            </h1>
            <p className="text-gray-400 text-sm mt-1">Examine platform activity and manage work through AI</p>
          </div>
          <div className="flex gap-4">
            <div className="px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-xl flex items-center gap-2 text-purple-300 text-xs font-bold">
              <ShieldCheck className="w-4 h-4" /> AI MODERATION ACTIVE
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6" ref={scrollRef}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Examine New Logins', icon: UserCheck, color: 'text-primary-400', desc: 'Scan for suspicious IPs or patterns' },
              { label: 'Analyze NGO Requests', icon: Activity, color: 'text-secondary-400', desc: 'Verify mission statements and proof' },
              { label: 'Platform Summary', icon: Layout, color: 'text-amber-400', desc: 'Get a real-time health report' },
            ].map(tool => (
              <button 
                key={tool.label}
                onClick={() => setInput(`AI, please ${tool.label.toLowerCase()}`)}
                className="card p-4 hover:border-purple-500/30 transition-all text-left group"
              >
                <tool.icon className={`w-5 h-5 ${tool.color} mb-2`} />
                <p className="text-white font-bold text-sm group-hover:text-purple-300 transition-colors">{tool.label}</p>
                <p className="text-gray-500 text-xs mt-1">{tool.desc}</p>
              </button>
            ))}
          </div>

          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in`}>
              <div className={`max-w-2xl flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-primary-500' : 'bg-purple-600 shadow-lg shadow-purple-500/20'}`}>
                  {m.role === 'user' ? <ShieldCheck className="w-5 h-5 text-white" /> : <Bot className="w-6 h-6 text-white" />}
                </div>
                <div className={`p-5 rounded-3xl text-sm leading-relaxed ${m.role === 'user' ? 'bg-primary-600 text-white rounded-tr-none' : 'bg-gray-900 border border-gray-800 text-gray-200 rounded-tl-none'}`}>
                  {m.content}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start animate-pulse">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-2xl bg-purple-600 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div className="p-5 rounded-3xl bg-gray-900 border border-gray-800 text-gray-400 text-sm">
                  AI is examining the database...
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-6 bg-gray-950 border-t border-gray-800">
          <div className="max-w-4xl mx-auto flex gap-4 bg-gray-900 border border-gray-700 rounded-2xl p-2 shadow-2xl focus-within:border-purple-500/50 transition-all">
            <input 
              type="text" 
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Examine platform work: 'Summarize today's volunteer signups' or 'Verify NGO Prajas Foundation'..." 
              className="flex-1 bg-transparent border-0 focus:ring-0 text-white text-sm px-4"
            />
            <button 
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white p-3 rounded-xl transition-all shadow-lg"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <div className="text-center mt-3 text-[10px] text-gray-600 uppercase tracking-widest font-bold">
            Powered by Bridge India AI Orchestrator
          </div>
        </div>
      </main>
    </div>
  )
}
