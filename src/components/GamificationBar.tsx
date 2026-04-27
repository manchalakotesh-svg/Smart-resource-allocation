import { getTierClass, getTierLabel } from '../lib/gamification'
import { Flame, Star, Zap } from 'lucide-react'

interface Props {
  points: number
  streak: number
  tier: string
  badges?: number
}

export default function GamificationBar({ points, streak, tier, badges = 0 }: Props) {
  const nextTierPoints = tier === 'newbie' ? 100 : tier === 'reliable' ? 500 : null

  return (
    <div className="bg-gradient-to-r from-gray-800/80 to-gray-900/80 border border-gray-700/50 rounded-2xl p-4">
      <div className="flex flex-wrap items-center gap-4">
        {/* Tier Badge */}
        <span className={getTierClass(tier)}>
          {getTierLabel(tier)}
        </span>

        {/* Points */}
        <div className="flex items-center gap-1.5 text-sm">
          <Star className="w-4 h-4 text-amber-400" />
          <span className="font-bold text-white">{points.toLocaleString()}</span>
          <span className="text-gray-500">pts</span>
        </div>

        {/* Streak */}
        <div className="flex items-center gap-1.5 text-sm">
          <Flame className="w-4 h-4 text-orange-400 streak-fire" />
          <span className="font-bold text-white">{streak}</span>
          <span className="text-gray-500">day streak</span>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-1.5 text-sm">
          <Zap className="w-4 h-4 text-primary-400" />
          <span className="font-bold text-white">{badges}</span>
          <span className="text-gray-500">badges</span>
        </div>

        {/* Progress to next tier */}
        {nextTierPoints && (
          <div className="flex-1 min-w-[120px]">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progress to {tier === 'newbie' ? '🟢 Reliable' : '🔵 Elite'}</span>
              <span>{Math.min(points, nextTierPoints)}/{nextTierPoints}</span>
            </div>
            <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full transition-all duration-700"
                style={{ width: `${Math.min((points / nextTierPoints) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
