import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LayoutDashboard, User, Search, Award, LogOut, Heart, History, Video, ChevronRight, Brain, Menu, X } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

const volunteerLinks = [
  { to: '/volunteer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/volunteer/profile', label: 'My Profile', icon: User },
  { to: '/volunteer/browse', label: 'Browse NGOs', icon: Search },
  { to: '/volunteer/history', label: 'History', icon: History },
  { to: '/volunteer/badges', label: 'Badges', icon: Award },
  { to: '/volunteer/video', label: 'Video', icon: Video },
  { to: '/volunteer/analyse', label: 'AI Analyse', icon: Brain },
]

const ngoLinks = [
  { to: '/ngo/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/ngo/profile', label: 'NGO Profile', icon: User },
  { to: '/ngo/post', label: 'Post Opportunity', icon: Heart },
  { to: '/ngo/applicants', label: 'Applicants', icon: Search },
  { to: '/ngo/matchmaking', label: 'AI Matchmaking', icon: Brain },
]

const adminLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/approve', label: 'Approve Users', icon: User },
  { to: '/admin/badges', label: 'Manage Badges', icon: Award },
  { to: '/admin/analytics', label: 'Analytics', icon: Search },
  { to: '/admin/workflow', label: 'AI Workflow', icon: Brain },
]

export default function Sidebar() {
  const { role, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  
  // Force admin sidebar for prototype bypass on admin routes
  const isAdminRoute = location.pathname.startsWith('/admin')
  const activeRole = isAdminRoute ? 'admin' : role

  const links = activeRole === 'volunteer' ? volunteerLinks : activeRole === 'ngo' ? ngoLinks : adminLinks

  const handleSignOut = async () => {
    await signOut()
    toast.success('Signed out')
    navigate('/')
  }

  const roleTitle = activeRole === 'volunteer' ? 'VolunteerBridge' : activeRole === 'ngo' ? 'NGOBridge' : 'AdminBridge'
  const roleSubtitle = activeRole === 'volunteer' ? 'Volunteer Dashboard' : activeRole === 'ngo' ? 'NGO Dashboard' : 'Admin Portal'
  const roleInitial = activeRole === 'volunteer' ? 'VB' : activeRole === 'ngo' ? 'NB' : 'AB'
  const roleColor = activeRole === 'volunteer' ? 'bg-primary-500' : activeRole === 'ngo' ? 'bg-secondary-500' : 'bg-gray-700'

  return (
    <>
      {/* Mobile Menu Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-900 border border-gray-800 rounded-lg text-gray-400 hover:text-white"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Backdrop for Mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-[9999]
        w-72 bg-[#111827] border-r border-gray-800 flex flex-col
        transition-transform duration-300 lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Mobile Close Button */}
        <button 
          onClick={() => setIsOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-2 text-gray-500 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
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

        {/* Sign Out Button - Moved up right after links */}
        <div className="pt-2 mt-2">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800/50 w-full transition-all group"
          >
            <LogOut className="w-5 h-5 shrink-0 text-gray-500 group-hover:text-red-400 transition-colors" />
            Sign Out
          </button>
        </div>
      </nav>
    </aside>
    </>
  )
}
