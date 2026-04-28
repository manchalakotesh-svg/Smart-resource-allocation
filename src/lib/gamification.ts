// Gamification constants and utility functions for Bridge India

export function computeTier(points: number, badgeCount: number): 'newbie' | 'reliable' | 'elite' {
  if (points >= 500 && badgeCount >= 5) return 'elite'
  if (points >= 100 && badgeCount >= 2) return 'reliable'
  return 'newbie'
}

export function getTierLabel(tier: string) {
  switch (tier) {
    case 'elite': return '🔵 Elite'
    case 'reliable': return '🟢 Reliable'
    default: return '🟡 Newbie'
  }
}

export function getTierClass(tier: string) {
  switch (tier) {
    case 'elite': return 'badge-elite'
    case 'reliable': return 'badge-reliable'
    default: return 'badge-newbie'
  }
}

export const POINTS_TABLE = {
  dailyLogin: 5,
  activityHour: 10,
  badgeEarned: 50,
  profileCompleted: 20,
  videoUploaded: 15,
  shadowSession: 25,
}

export const BADGES_CATALOG = [
  { id: 'first-step', name: 'First Step', icon: '👣', description: 'Complete your first volunteer activity' },
  { id: 'week-warrior', name: 'Week Warrior', icon: '⚡', description: '7-day activity streak' },
  { id: 'skill-master', name: 'Skill Master', icon: '🎯', description: 'Add 5+ skills to your profile' },
  { id: 'storyteller', name: 'Storyteller', icon: '📖', description: 'Generate your AI story' },
  { id: 'shadow', name: 'Shadow Pro', icon: '👁️', description: 'Complete a shadow volunteering session' },
  { id: 'community', name: 'Community Builder', icon: '🤝', description: 'Join 3 different NGO teams' },
  { id: 'centurion', name: 'Centurion', icon: '💯', description: 'Reach 100 points' },
  { id: 'elite-member', name: 'Elite Member', icon: '🏆', description: 'Reach Elite tier' },
]
