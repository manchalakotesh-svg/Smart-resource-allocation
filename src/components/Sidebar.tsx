import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LayoutDashboard, User, Search, Award, LogOut, Heart, History, Video, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'

const volunteerLinks = [
  { to: '/volunteer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/volunteer/profile', label: 'My Profile', icon: User },
  { to: '/volunteer/browse', label: 'Browse NGOs', icon: Search },
  { to: '/volunteer/history', label: 'History', icon: History },
  { to: '/volunteer/badges', label: 'Badges', icon: Award },
  { to: '/volunteer/video', label: 'Video', icon: Video },
]

const ngoLinks = [
  { to: '/ngo/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/ngo/profile', label: 'NGO Profile', icon: User },
  { to: '/ngo/post', label: 'Post Opportunity', icon: Heart },
  { to: '/ngo/applicants', label: 'Applicants', icon: Search },
]

const adminLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/approve', label: 'Approve Users', icon: LayoutDashboard },
  { to: '/admin/badges', label: 'Manage Badges', icon: Award },
  { to: '/admin/analytics', label: 'Analytics', icon: LayoutDashboard },
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

  const roleTitle = role === 'volunteer' ? 'VolunteerBridge' : role === 'ngo' ? 'NGOBridge' : 'AdminBridge'
  const roleSubtitle = role === 'volunteer' ? 'Volunteer Dashboard' : role === 'ngo' ? 'NGO Dashboard' : 'Admin Portal'
  const roleInitial = role === 'volunteer' ? 'VB' : role === 'ngo' ? 'NB' : 'AB'
  const roleColor = role === 'volunteer' ? 'bg-primary-500' : role === 'ngo' ? 'bg-secondary-500' : 'bg-gray-700'

  return (
    <aside className="w-72 min-h-screen bg-[#111827] border-r border-gray-800 flex flex-col">
      {/* User Branding - Matches Screenshot */}
      <div className="p-6 mb-4">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 ${roleColor} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
            {roleInitial}
          </div>
          <div>
            <h2 className="text-white font-bold text-base leading-tight">{roleTitle}</h2>
            <p className="text-gray-500 text-xs mt-0.5">{roleSubtitle}</p>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-4 space-y-1">
        {links.map((link) => {
          const isActive = location.pathname === link.to
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`group flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-gray-800 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <link.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-primary-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
                {link.label}
              </div>
              {isActive && <ChevronRight className="w-4 h-4 text-gray-500" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer / Sign Out */}
      <div className="p-4 mt-auto">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-4 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-gray-800/50 w-full transition-all group"
        >
          <LogOut className="w-5 h-5 text-gray-500 group-hover:text-red-400 transition-colors" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
