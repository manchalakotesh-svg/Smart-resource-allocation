import Sidebar from '../../components/Sidebar'
import { Award, Star, Zap, Shield, Heart, TrendingUp } from 'lucide-react'

const badges = [
  { id: 1, name: 'First Impact', desc: 'Completed your first volunteer activity', icon: Heart, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30', earned: true },
  { id: 2, name: 'Skill Master', desc: 'Contributed 10+ hours in a specific skill', icon: Star, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', earned: true },
  { id: 3, name: 'Weekly Warrior', desc: 'Maintained a 7-day activity streak', icon: Zap, color: 'text-primary-400', bg: 'bg-primary-500/10', border: 'border-primary-500/30', earned: true },
  { id: 4, name: 'Community Pillar', desc: 'Volunteered across 3 different districts', icon: Shield, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', earned: false },
  { id: 5, name: 'Top 1% Contributor', desc: 'Among the top volunteers this month', icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30', earned: false },
]

export default function Badges() {
  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8 animate-in">
          <div>
            <h1 className="text-2xl font-bold text-white">Your Achievements</h1>
            <p className="text-gray-400 text-sm mt-1">Collect badges as you grow your community impact</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {badges.map((badge) => (
              <div key={badge.id} className={`card p-6 border transition-all duration-300 ${badge.earned ? badge.border : 'border-gray-800 opacity-60 grayscale'}`}>
                <div className={`w-16 h-16 ${badge.bg} rounded-2xl flex items-center justify-center mb-6`}>
                  <badge.icon className={`w-8 h-8 ${badge.earned ? badge.color : 'text-gray-600'}`} />
                </div>
                <h3 className={`text-xl font-bold mb-2 ${badge.earned ? 'text-white' : 'text-gray-500'}`}>{badge.name}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-6">{badge.desc}</p>
                {badge.earned ? (
                  <div className={`inline-flex items-center gap-2 text-xs font-bold px-3 py-1 rounded-full ${badge.bg} ${badge.color}`}>
                    EARNED
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 text-xs font-bold px-3 py-1 rounded-full bg-gray-800 text-gray-500">
                    LOCKED
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="card p-10 bg-gradient-to-br from-primary-600/10 to-secondary-600/10 border border-primary-500/20 text-center">
            <Award className="w-12 h-12 text-primary-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Keep Impacting, Keep Earning</h2>
            <p className="text-gray-400 max-w-xl mx-auto">Badges are verified by NGO partners and admins. Each badge increases your Tier standing and unlocks exclusive volunteer opportunities.</p>
          </div>
        </div>
      </main>
    </div>
  )
}
