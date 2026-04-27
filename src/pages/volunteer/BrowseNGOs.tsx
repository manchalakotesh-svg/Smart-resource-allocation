import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import Sidebar from '../../components/Sidebar'
import { getAIMatchScore } from '../../lib/ai'
import { MapPin, Users, Star, Building2, Filter, Search, Zap } from 'lucide-react'
import toast from 'react-hot-toast'

const DEMO_NGOS = [
  {
    id: '1', name: 'Education First Foundation', description: 'Providing quality education to underprivileged children across Vijayawada.',
    location: 'Vijayawada, Krishna District', skills: ['Teaching', 'Counseling'], slots: 5, verified: true, distance: 0.8,
    photos: [], volunteers: 24, rating: 4.8,
  },
  {
    id: '2', name: 'Sanjeevani Health NGO', description: 'Free healthcare services for rural communities in Guntur district.',
    location: 'Guntur', skills: ['Medical', 'First Aid', 'Social Work'], slots: 3, verified: true, distance: 12,
    photos: [], volunteers: 18, rating: 4.6,
  },
  {
    id: '3', name: 'Green Andhra Initiative', description: 'Environmental conservation and awareness programs across AP.',
    location: 'Amaravati', skills: ['Agriculture', 'Photography'], slots: 8, verified: false, distance: 25,
    photos: [], volunteers: 31, rating: 4.5,
  },
  {
    id: '4', name: 'Digital Literacy Mission', description: 'Teaching digital skills to elders and rural youth.',
    location: 'Tirupati', skills: ['Coding', 'Teaching'], slots: 6, verified: true, distance: 40,
    photos: [], volunteers: 15, rating: 4.9,
  },
]

export default function BrowseNGOs() {
  const { user } = useAuth()
  const [ngos, setNgos] = useState(DEMO_NGOS)
  const [search, setSearch] = useState('')
  const [filterSkill, setFilterSkill] = useState('')
  const [matchScores, setMatchScores] = useState<Record<string, number>>({})
  const [applying, setApplying] = useState<string | null>(null)

  const filtered = ngos.filter(n =>
    n.name.toLowerCase().includes(search.toLowerCase()) &&
    (filterSkill === '' || n.skills.some(s => s.toLowerCase().includes(filterSkill.toLowerCase())))
  )

  const getMatchScore = async (ngoId: string) => {
    const score = await getAIMatchScore(user!.id, ngoId)
    setMatchScores(prev => ({ ...prev, [ngoId]: score }))
  }

  const handleApply = async (ngoId: string, ngoName: string) => {
    setApplying(ngoId)
    try {
      const { data: { user: u } } = await supabase.auth.getUser()
      if (!u) throw new Error('Not logged in')
      // In real app: insert into applications table
      await new Promise(r => setTimeout(r, 1000)) // Simulate API
      toast.success(`Applied to ${ngoName}! +10 pts earned`)
    } catch {
      toast.error('Application failed')
    } finally {
      setApplying(null)
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-6 animate-in">
          <div>
            <h1 className="text-2xl font-bold text-white">Browse NGOs</h1>
            <p className="text-gray-400 text-sm mt-1">Find opportunities matched to your skills in Andhra Pradesh</p>
          </div>

          {/* Search & Filter */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
              <input
                id="browse-search"
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search NGOs..."
                className="input-field pl-10"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
              <input
                id="browse-filter-skill"
                type="text"
                value={filterSkill}
                onChange={e => setFilterSkill(e.target.value)}
                placeholder="Filter by skill..."
                className="input-field pl-10 w-48"
              />
            </div>
          </div>

          {/* NGO Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {filtered.map(ngo => (
              <div key={ngo.id} className="card-hover p-6 space-y-4">
                {/* NGO Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-secondary-500/30 to-primary-500/30 rounded-2xl flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-secondary-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{ngo.name}</h3>
                      <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        {ngo.location} • {ngo.distance}km away
                      </div>
                    </div>
                  </div>
                  {ngo.verified && (
                    <span className="text-xs px-2 py-1 rounded-full bg-primary-500/10 text-primary-400 border border-primary-500/30">✓ Verified</span>
                  )}
                </div>

                <p className="text-gray-400 text-sm">{ngo.description}</p>

                {/* Skills */}
                <div className="flex flex-wrap gap-2">
                  {ngo.skills.map(s => (
                    <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-gray-800 text-gray-300 border border-gray-700">{s}</span>
                  ))}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" />{ngo.volunteers} volunteers</span>
                  <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400" />{ngo.rating}</span>
                  <span className="text-primary-400">{ngo.slots} slots open</span>
                </div>

                {/* Match Score */}
                {matchScores[ngo.id] && (
                  <div className="flex items-center gap-2 text-sm">
                    <Zap className="w-4 h-4 text-secondary-400" />
                    <span className="text-gray-400">AI Match Score:</span>
                    <span className="font-bold text-secondary-400">{matchScores[ngo.id]}%</span>
                    <div className="flex-1 h-1.5 bg-gray-700 rounded-full">
                      <div className="h-full bg-secondary-500 rounded-full" style={{ width: `${matchScores[ngo.id]}%` }} />
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-1">
                  <button
                    onClick={() => getMatchScore(ngo.id)}
                    id={`match-score-${ngo.id}`}
                    className="flex-1 btn-outline text-sm py-2"
                  >
                    Check AI Match
                  </button>
                  <button
                    onClick={() => handleApply(ngo.id, ngo.name)}
                    id={`apply-ngo-${ngo.id}`}
                    disabled={applying === ngo.id}
                    className="flex-1 btn-primary text-sm py-2 disabled:opacity-50"
                  >
                    {applying === ngo.id ? 'Applying...' : 'Apply Now'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
