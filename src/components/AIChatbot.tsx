import { useState, useRef, useEffect } from 'react'
import { MessageSquare, X, Send, Bot, Minimize2 } from 'lucide-react'
import { chatbotQuery } from '../lib/ai'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function AIChatbot() {
  const { user, role } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([
    { role: 'ai', content: `Hello! I am your Bridge India AI. How can I help you with your ${role} journey today?` }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages])

  if (!user) return null

  const handleSend = async () => {
    if (!input.trim() || loading) return
    const userMsg = input
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)

    try {
      const response = await chatbotQuery(`[GLOBAL PORTAL MODE] ${userMsg}`, user.uid)
      setMessages(prev => [...prev, { role: 'ai', content: response }])
    } catch {
      toast.error('AI Assistant is currently busy')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-[999999] flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="w-[calc(100vw-2rem)] sm:w-80 md:w-96 bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden mb-4 animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-primary-600 p-4 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3 text-white">
              <Bot className="w-6 h-6" />
              <div>
                <p className="text-sm font-bold leading-none">Bridge AI Assistant</p>
                <p className="text-[10px] opacity-80 mt-1 uppercase tracking-widest font-bold">Always Online</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors">
              <Minimize2 className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="h-80 overflow-y-auto p-4 space-y-4 bg-gray-900" ref={scrollRef}>
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                  m.role === 'user' 
                    ? 'bg-primary-500 text-white rounded-tr-none shadow-md' 
                    : 'bg-gray-800 text-gray-300 rounded-tl-none border border-gray-700'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-800 p-3 rounded-2xl rounded-tl-none border border-gray-700 flex gap-1 items-center">
                  <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" />
                  <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 bg-gray-950 border-t border-gray-800">
            <div className="flex gap-2 bg-gray-900 border border-gray-700 rounded-xl p-1.5 focus-within:border-primary-500/50 transition-all">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Ask your doubts..."
                className="flex-1 bg-transparent border-0 focus:ring-0 text-white text-xs px-2"
              />
              <button 
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="bg-primary-500 hover:bg-primary-400 disabled:opacity-50 text-white p-2 rounded-lg transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bubble Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 ${
          isOpen ? 'bg-gray-800 rotate-90' : 'bg-primary-500 hover:bg-primary-400'
        }`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        {!isOpen && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full border-2 border-gray-950 animate-ping" />
        )}
      </button>
    </div>
  )
}
