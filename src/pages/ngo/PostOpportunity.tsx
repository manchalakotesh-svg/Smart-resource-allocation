import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import Sidebar from '../../components/Sidebar'
import { Plus, MapPin, DollarSign } from 'lucide-react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const SKILL_OPTIONS = ['Teaching', 'First Aid', 'Coding', 'Medical', 'Social Work', 'Photography', 'Agriculture', 'Legal Aid']

export default function PostOpportunity() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [skills, setSkills] = useState<string[]>([])
  const [slots, setSlots] = useState(5)
  const [donationGoal, setDonationGoal] = useState(0)
  const [location, setLocation] = useState('Vijayawada, Andhra Pradesh')
  const [loading, setLoading] = useState(false)

  const toggleSkill = (s: string) => setSkills(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])

  const handlePost = async () => {
    setLoading(true)
    try {
      const { data: { user: u } } = await supabase.auth.getUser()
      await supabase.from('opportunities').insert({
        ngo_id: u!.id,
        title, description,
        skills_req: skills,
        slots, location,
        location_lat: 16.5062,
        location_lng: 80.6480,
        donation_goal: donationGoal > 0 ? donationGoal : null,
      })
      toast.success('Opportunity posted! AI matching started.')
      navigate('/ngo/applicants')
    } catch {
      toast.error('Failed to post opportunity')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-6 animate-in">
          <div>
            <h1 className="text-2xl font-bold text-white">Post an Opportunity</h1>
            <p className="text-gray-400 text-sm mt-1">AI will automatically match volunteers to this opportunity</p>
          </div>
          <div className="card p-6 space-y-5">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Opportunity Title *</label>
              <input id="opp-title" type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Community Health Awareness Camp" className="input-field" />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Description *</label>
              <textarea id="opp-desc" value={description} onChange={e => setDescription(e.target.value)} rows={4} placeholder="Describe the opportunity, requirements, and expected outcomes..." className="input-field resize-none" />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Skills Required</label>
              <div className="flex flex-wrap gap-2">
                {SKILL_OPTIONS.map(s => (
                  <button key={s} onClick={() => toggleSkill(s)} className={`px-3 py-1.5 rounded-lg text-sm transition-all ${skills.includes(s) ? 'bg-secondary-500/20 text-secondary-400 border border-secondary-500/40' : 'bg-gray-800 text-gray-400 border border-gray-700'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Volunteer Slots</label>
                <input id="opp-slots" type="number" min={1} max={100} value={slots} onChange={e => setSlots(Number(e.target.value))} className="input-field" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />Donation Goal (₹, optional)
                </label>
                <input id="opp-donation" type="number" min={0} value={donationGoal} onChange={e => setDonationGoal(Number(e.target.value))} placeholder="0 = no goal" className="input-field" />
              </div>
            </div>
            {donationGoal > 0 && (
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Donation Slider Preview</label>
                <input type="range" min={0} max={100000} step={1000} value={donationGoal} onChange={e => setDonationGoal(Number(e.target.value))} className="w-full accent-primary-500" />
                <div className="text-primary-400 font-semibold mt-1">Goal: ₹{donationGoal.toLocaleString('en-IN')}</div>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-800/50 rounded-xl px-4 py-3">
              <MapPin className="w-4 h-4 text-primary-400" />
              <input type="text" value={location} onChange={e => setLocation(e.target.value)} className="bg-transparent flex-1 outline-none text-gray-300" />
            </div>
            <button onClick={handlePost} disabled={loading || !title || !description} id="btn-post-opportunity" className="btn-secondary w-full flex items-center justify-center gap-2 disabled:opacity-50">
              <Plus className="w-4 h-4" />{loading ? 'Posting...' : 'Post Opportunity'}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
