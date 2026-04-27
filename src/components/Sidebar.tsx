import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LayoutDashboard, User, Search, Building2, Plus, Users, ShieldCheck, BarChart2, Award, LogOut, Heart } from 'lucide-react'
import toast from 'react-hot-toast'

const volunteerLinks = [
  { to: '/volunteer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/volunteer/profile', label: 'My Profile', icon: User },
  { to: '/volunteer/browse', label: 'Browse NGOs', icon: Search },
]
const ngoLinks = [
  { to: '/ngo/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/ngo/profile', label: 'NGO Profile', icon: Building2 },
  { to: '/ngo/post', label: 'Post Opportunity', icon: Plus },
  { to: '/ngo/applicants', label: 'Applicants', icon: Users },
]
const adminLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/approve', label: 'Approve Users', icon: ShieldCheck },
  { to: '/admin/badges', label: 'Manage Badges', icon: Award },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart2 },
]

export default function Sidebar() {
  const { role, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const links = role === 'volunteer' ? volunteerLinks : role === 'ngo' ? ngoLinks : adminLinks

  const handleSignOut = async () => {
    await signOut()
    toast.success('Signed out')
    navigate('/')
  }

  const roleColor = role === 'volunteer' ? 'from-primary-500 to-primary-700'
    : role === 'ngo' ? 'from-secondary-500 to-secondary-700'
    : 'from-gray-600 to-gray-800'

  return (
    <aside className="w-64 min-h-screen bg-gray-900 border-r border-gray-800 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <Link to="/" className="flex items-center gap-2">
          <div className={`w-8 h-8 bg-gradient-to-br ${roleColor} rounded-lg flex items-center justify-center`}>
            <Heart className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white">Bridge India</span>
        </Link>
        <div className="mt-2 text-xs text-gray-500 capitalize">{role} Portal</div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => {
          const isActive = location.pathname === link.to
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <link.icon className="w-4 h-4 shrink-0" />
              {link.label}
            </Link>
          )
        })}
      </nav>

      {/* Sign Out */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleSignOut}
          id="sidebar-signout"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-500 hover:text-red-400 hover:bg-red-400/10 w-full transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
