import { useState } from 'react'
import Sidebar from '../../components/Sidebar'
import { Brain, MapPin, Search, User, Award, MessageSquare } from 'lucide-react'
import { db } from '../../lib/firebase'
import { collection, query, getDocs } from 'firebase/firestore'
import toast from 'react-hot-toast'

const demoVolunteers = [
  { id: 'demo-1', name: 'Dr. Aruna Devi', occupation: 'General Physician', place: 'Vijayawada', points: 450, tier: 'Elite', skills: ['Medical Camp', 'First Aid', 'Public Health'] },
  { id: 'demo-2', name: 'Rajesh Varma', occupation: 'Mathematics Teacher', place: 'Guntur', points: 320, tier: 'Reliable', skills: ['Tutoring', 'Youth Mentorship', 'Math'] },
  { id: 'demo-3', name: 'Sneha Kapur', occupation: 'Software Engineer', place: 'Visakhapatnam', points: 280, tier: 'Reliable', skills: ['Digital Literacy', 'Coding', 'Web Basics'] },
  { id: 'demo-4', name: 'Manoj Kumar', occupation: 'Structural Engineer', place: 'Tirupati', points: 150, tier: 'Newbie', skills: ['Reconstruction', 'Safety Audit', 'Planning'] },
  { id: 'demo-5', name: 'Lakshmi Prasad', occupation: 'Social Worker', place: 'Nellore', points: 510, tier: 'Elite', skills: ['Counseling', 'Ngo Management', 'Grant Writing'] },
]

export default function AIMatchmaking() {
  const [matchInputs, setMatchInputs] = useState({ occupation: '', skill: '', timing: 'weekends', place: '' })
  const [matchedVolunteers, setMatchedVolunteers] = useState<any[]>([])
  const [matching, setMatching] = useState(false)

  const handleAIMatch = async () => {
    setMatching(true)
    const toastId = toast.loading('AI is scanning community profiles...')
    try {
      const q = query(collection(db, 'public_profiles'))
      const snapshot = await getDocs(q)
      const all = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
      
      const results = all.filter((v: any) => {
        const occMatch = !matchInputs.occupation || v.occupation?.toLowerCase().includes(matchInputs.occupation.toLowerCase())
        const skillMatch = !matchInputs.skill || v.skills?.some((s: string) => s.toLowerCase().includes(matchInputs.skill.toLowerCase()))
        return occMatch && skillMatch
      }).slice(0, 10)

      // Mix in demo data if results are low
      const finalResults = results.length > 2 ? results : [...results, ...demoVolunteers.filter(dv => {
        const occMatch = !matchInputs.occupation || dv.occupation.toLowerCase().includes(matchInputs.occupation.toLowerCase())
        return occMatch
      })].slice(0, 8)

      setMatchedVolunteers(finalResults)
      toast.success(`AI found ${finalResults.length} perfect matches!`, { id: toastId })
    } catch {
      toast.error('AI Matchmaking failed', { id: toastId })
    } finally {
      setMatching(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-8 animate-in">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Brain className="w-8 h-8 text-primary-400" /> AI Matchmaking
            </h1>
            <p className="text-gray-400 mt-2 text-lg">Find the perfect volunteers for your NGO's specific needs.</p>
          </div>

          <div className="card p-8 border-primary-500/20 bg-primary-500/5">
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-500 mb-2 block uppercase font-bold tracking-widest">Required Occupation</label>
                  <input 
                    type="text" 
                    value={matchInputs.occupation} 
                    onChange={e => setMatchInputs({...matchInputs, occupation: e.target.value})} 
                    placeholder="e.g. Teacher, Nurse, Developer" 
                    className="input-field py-3" 
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-2 block uppercase font-bold tracking-widest">Target Skill</label>
                  <input 
                    type="text" 
                    value={matchInputs.skill} 
                    onChange={e => setMatchInputs({...matchInputs, skill: e.target.value})} 
                    placeholder="e.g. Mathematics, First Aid" 
                    className="input-field py-3" 
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-500 mb-2 block uppercase font-bold tracking-widest">Work Timing</label>
                  <select 
                    value={matchInputs.timing} 
                    onChange={e => setMatchInputs({...matchInputs, timing: e.target.value})} 
                    className="input-field py-3"
                  >
                    <option value="weekends">Weekends Only</option>
                    <option value="weekdays">Weekdays Only</option>
                    <option value="flexible">Flexible / Any Time</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-2 block uppercase font-bold tracking-widest">Location / District</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                    <input 
                      type="text" 
                      value={matchInputs.place} 
                      onChange={e => setMatchInputs({...matchInputs, place: e.target.value})} 
                      placeholder="e.g. Vijayawada, Guntur" 
                      className="input-field pl-10 py-3" 
                    />
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={handleAIMatch} 
              disabled={matching}
              className="btn-primary w-full py-4 flex items-center justify-center gap-3 text-xl font-bold shadow-xl shadow-primary-500/10"
            >
              {matching ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search className="w-6 h-6" />
              )}
              {matching ? 'AI Matchmaker is Searching...' : 'Generate AI Matches'}
            </button>
          </div>

          {matchedVolunteers.length > 0 && (
            <div className="space-y-6 animate-in">
              <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                <h3 className="text-xl font-bold text-white">Top AI Recommendations</h3>
                <span className="text-primary-400 text-sm font-medium">{matchedVolunteers.length} results found</span>
              </div>
              <div className="grid gap-4">
                {matchedVolunteers.map((v: any) => (
                  <div key={v.id} className="card p-6 border-gray-800 hover:border-primary-500/30 transition-all flex flex-col md:flex-row items-center justify-between gap-6 group">
                    <div className="flex items-center gap-5 flex-1">
                      <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center shrink-0 border border-gray-800">
                        <User className="w-8 h-8 text-gray-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <p className="text-xl font-bold text-white">{v.name}</p>
                          <span className="text-[10px] px-2 py-0.5 bg-primary-500/10 text-primary-400 rounded-full font-bold uppercase tracking-wider">{v.tier}</span>
                        </div>
                        <p className="text-gray-400 text-sm mt-1">{v.occupation} • {v.place || 'Andhra Pradesh'}</p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {v.skills?.map((s: string) => (
                            <span key={s} className="text-[10px] px-2 py-1 bg-gray-800 text-gray-500 rounded border border-gray-700 font-bold uppercase">{s}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-3 shrink-0">
                      <div className="flex items-center gap-2 text-amber-500">
                        <Award className="w-5 h-5" />
                        <span className="text-lg font-bold">{v.points} pts</span>
                      </div>
                      <button className="btn-primary py-2 px-6 flex items-center gap-2 text-sm font-bold shadow-lg">
                        <MessageSquare className="w-4 h-4" /> Connect Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
