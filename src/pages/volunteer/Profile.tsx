import { useState, useEffect } from 'react'
import { db } from '../../lib/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { useAuth } from '../../context/AuthContext'
import Sidebar from '../../components/Sidebar'
import GamificationBar from '../../components/GamificationBar'
import { BADGES_CATALOG } from '../../lib/gamification'
import { Save, Award } from 'lucide-react'
import toast from 'react-hot-toast'

const SKILL_OPTIONS = [
  'Teaching', 'First Aid', 'Coding', 'Counseling', 'Photography', 'Cooking',
  'Medical', 'Legal Aid', 'Social Work', 'Agriculture', 'Construction', 'Translation', 'Music', 'Art'
]

export default function VolunteerProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [skills, setSkills] = useState<string[]>([])
  const [availability, setAvailability] = useState('weekends')
  const [name, setName] = useState('')
  const [occupation, setOccupation] = useState('')
  const [jobExp, setJobExp] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user) fetchProfile()
  }, [user])

  const fetchProfile = async () => {
    if (!user) return
    setLoading(true)
    try {
      const docRef = doc(db, 'volunteer_profiles', user.uid)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        const data = docSnap.data()
        setProfile(data)
        setSkills(data.skills || [])
        setAvailability(data.availability || 'weekends')
        setName(data.name || '')
        setOccupation(data.occupation || '')
        setJobExp(data.job_exp || '')
      } else {
        toast.error('Profile not found. Please complete your registration.')
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    try {
      const docRef = doc(db, 'volunteer_profiles', user.uid)
      await updateDoc(docRef, {
        name, occupation, skills, availability, job_exp: jobExp,
      })
      toast.success('Profile updated! +5 pts')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const toggleSkill = (skill: string) => {
    setSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill])
  }

  const earnedBadgeIds = ['first-step', 'week-warrior', 'storyteller']

  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-6 animate-in">
          <div>
            <h1 className="text-2xl font-bold text-white">My Profile</h1>
            <p className="text-gray-400 text-sm mt-1">Manage your skills, availability, and volunteer experience</p>
          </div>

          <GamificationBar
            points={profile?.points ?? 340}
            streak={profile?.streak ?? 7}
            tier={profile?.tier ?? 'reliable'}
            badges={earnedBadgeIds.length}
          />

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Edit Profile */}
            <div className="card p-6 space-y-4">
              <h2 className="font-semibold text-white text-lg">Personal Info</h2>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Full Name</label>
                <input id="profile-name" type="text" value={name} onChange={e => setName(e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Occupation</label>
                <input id="profile-occupation" type="text" value={occupation} onChange={e => setOccupation(e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Job Experience</label>
                <textarea id="profile-jobexp" value={jobExp} onChange={e => setJobExp(e.target.value)} rows={3} placeholder="Describe your professional background..." className="input-field resize-none" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Availability</label>
                <select id="profile-availability" value={availability} onChange={e => setAvailability(e.target.value)} className="input-field">
                  <option value="weekdays">Weekdays</option>
                  <option value="weekends">Weekends</option>
                  <option value="evenings">Evenings</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>
              <button onClick={handleSave} disabled={saving} id="btn-save-profile" className="btn-primary w-full flex items-center justify-center gap-2">
                <Save className="w-4 h-4" />{saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

            {/* Skills */}
            <div className="space-y-6">
              <div className="card p-6">
                <h2 className="font-semibold text-white text-lg mb-4">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {SKILL_OPTIONS.map(skill => (
                    <button
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                        skills.includes(skill)
                          ? 'bg-primary-500/20 text-primary-400 border border-primary-500/40'
                          : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      {skills.includes(skill) ? '✓ ' : '+ '}{skill}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-600 mt-3">{skills.length} skills selected</p>
              </div>

              {/* Badges */}
              <div className="card p-6">
                <h2 className="font-semibold text-white text-lg mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />My Badges
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {BADGES_CATALOG.map(badge => {
                    const earned = earnedBadgeIds.includes(badge.id)
                    return (
                      <div key={badge.id} className={`p-3 rounded-xl border text-center transition-all ${earned ? 'border-amber-500/40 bg-amber-500/10' : 'border-gray-800 bg-gray-900/50 opacity-40'}`}>
                        <div className="text-2xl mb-1">{badge.icon}</div>
                        <div className="text-xs font-medium text-white">{badge.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{badge.description}</div>
                        {earned && <div className="text-xs text-amber-400 mt-1">✓ Earned</div>}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
