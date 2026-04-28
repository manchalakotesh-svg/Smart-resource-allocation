import { useState, useEffect } from 'react'
import { db } from '../lib/firebase'
import { collection, query, limit, getDocs, orderBy } from 'firebase/firestore'
import Sidebar from '../components/Sidebar'
import { User, Award, MessageSquare, Search, Filter } from 'lucide-react'

interface PublicProfile {
  id: string
  name: string
  bio: string
  skills: string[]
  tier: string
  points: number
}

export default function PublicProfiles() {
  const [profiles, setProfiles] = useState<PublicProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchProfiles()
  }, [])

  const fetchProfiles = async () => {
    try {
      const q = query(collection(db, 'public_profiles'), orderBy('last_active', 'desc'), limit(50))
      const querySnapshot = await getDocs(q)
      const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PublicProfile))
      setProfiles(docs)
    } catch (error) {
      console.error('Error fetching profiles:', error)
    } finally {
      setLoading(false)
    }
  }

  const filtered = profiles.filter(p => 
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.skills?.some(s => s.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-8 animate-in">
          <div>
            <h1 className="text-3xl font-bold text-white">Community Profiles</h1>
            <p className="text-gray-400 mt-2 text-lg">Meet the amazing volunteers making an impact across Andhra Pradesh.</p>
          </div>

          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
              <input 
                type="text" 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                placeholder="Search by name or skills (e.g. 'Teaching', 'Arjun')..." 
                className="input-field pl-12 py-3.5 text-base" 
              />
            </div>
            <button className="px-6 py-2 border border-gray-800 rounded-2xl text-gray-400 hover:text-white hover:border-gray-700 transition-all flex items-center gap-2">
              <Filter className="w-4 h-4" /> Filters
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="card p-20 text-center">
              <User className="w-16 h-16 text-gray-800 mx-auto mb-4" />
              <p className="text-gray-500 text-xl font-medium">No public profiles found yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
              {filtered.map(profile => (
                <div key={profile.id} className="card p-6 group hover:border-primary-500/30 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-2xl flex items-center justify-center shrink-0">
                      <User className="w-7 h-7 text-primary-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-white truncate">{profile.name}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${profile.tier === 'elite' ? 'bg-blue-500/10 text-blue-400' : 'bg-primary-500/10 text-primary-400'}`}>
                          {profile.tier?.toUpperCase() || 'NEWBIE'}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mt-2 line-clamp-2 leading-relaxed">
                        {profile.bio || "Joined Bridge India to make a difference in the community."}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mt-4">
                        {profile.skills?.map(skill => (
                          <span key={skill} className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 bg-gray-900 text-gray-500 rounded-md border border-gray-800">
                            {skill}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-800">
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-amber-500" />
                          <span className="text-sm font-bold text-gray-300">{profile.points || 0} pts</span>
                        </div>
                        <button className="flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300 transition-colors font-medium">
                          <MessageSquare className="w-4 h-4" /> Message
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
