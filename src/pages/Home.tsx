import { Link, useNavigate } from 'react-router-dom'
import { Users, Building2, ShieldCheck, MapPin, Star, Zap, Brain, Award, ArrowRight, Heart, Globe, TrendingUp } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import FirebaseDemo from '../components/FirebaseDemo'
import toast from 'react-hot-toast'

const stats = [
  { label: 'Active Volunteers', value: '2,400+', icon: Users, color: 'text-primary-400' },
  { label: 'Partner NGOs', value: '180+', icon: Building2, color: 'text-secondary-400' },
  { label: 'Lives Impacted', value: '50,000+', icon: Heart, color: 'text-rose-400' },
  { label: 'Districts Covered', value: '13', icon: MapPin, color: 'text-amber-400' },
]

const features = [
  { icon: Brain, title: 'AI-Powered Matching', desc: 'Smart algorithms match volunteers to opportunities based on skills, location, and experience tiers.', color: 'from-purple-500/20 to-primary-500/20' },
  { icon: Award, title: 'Gamified Journeys', desc: 'Earn points, badges, and climb tiers from Newbie to Elite through consistent volunteering.', color: 'from-amber-500/20 to-orange-500/20' },
  { icon: MapPin, title: 'Andhra Pradesh Focus', desc: 'Hyperlocal matching across all 13 districts with real-time proximity notifications.', color: 'from-secondary-500/20 to-cyan-500/20' },
  { icon: Zap, title: 'Real-Time Updates', desc: 'Live activity tracking, instant notifications, and live shadow volunteering sessions.', color: 'from-primary-500/20 to-teal-500/20' },
  { icon: Star, title: 'Impact Certificates', desc: 'Auto-generated PDF certificates for every activity, shareable and verifiable.', color: 'from-rose-500/20 to-pink-500/20' },
  { icon: Globe, title: 'Transparent NGOs', desc: 'Browse verified NGO profiles with photos, videos, and real volunteer reviews.', color: 'from-indigo-500/20 to-secondary-500/20' },
]

const testimonials = [
  { name: 'Priya Reddy', role: 'Elite Volunteer, Vijayawada', quote: 'Bridge India connected me with 5 NGOs in my area. The AI matched me perfectly with education-focused opportunities!' },
  { name: 'Srikanth NGO Trust', role: 'NGO Partner, Guntur', quote: 'We found verified, skilled volunteers within 2 days of posting. The tier system ensures quality contributions.' },
  { name: 'Anand Kumar', role: 'Reliable Volunteer, Tirupati', quote: 'Earning badges and seeing my streak grow motivates me to volunteer more. Reached 500 points last month!' },
]

export default function Home() {
  const { user, role } = useAuth()
  const navigate = useNavigate()

  const handlePortalRedirect = () => {
    if (user && role) {
      navigate(`/${role}/dashboard`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">Bridge India</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            <a href="#features" className="hover:text-primary-400 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-primary-400 transition-colors">How It Works</a>
            <a href="#testimonials" className="hover:text-primary-400 transition-colors">Stories</a>
          </div>
          {user && role && (
            <button onClick={handlePortalRedirect} className="btn-primary text-sm py-2 px-4">
              Go to Dashboard →
            </button>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center pt-24 pb-16 px-6">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto text-center animate-in relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/30 text-primary-400 text-sm font-medium mb-8">
            <TrendingUp className="w-4 h-4" />
            Andhra Pradesh's #1 Volunteer Platform
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Bridge the Gap Between{' '}
            <span className="gradient-text">Passion</span> &{' '}
            <span className="gradient-text">Purpose</span>
          </h1>

          <p className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
            AI-powered volunteer resource allocation connecting skilled individuals with NGOs across Andhra Pradesh. 
            Earn recognition, grow your impact, and change lives.
          </p>

          {/* Three CTA Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-16">
            <button
              onClick={() => {
                if (user && !localStorage.getItem('demo_role')) {
                  navigate(`/${role || 'volunteer'}/dashboard`)
                } else {
                  navigate('/auth/volunteer')
                }
              }}
              id="cta-volunteer"
              className="group flex flex-col items-center gap-3 p-6 rounded-2xl bg-gradient-to-br from-primary-500/20 to-primary-600/10 border border-primary-500/30 hover:border-primary-400 hover:from-primary-500/30 transition-all duration-300 hover:-translate-y-1 w-full text-center"
            >
              <div className="w-14 h-14 bg-primary-500/20 rounded-2xl flex items-center justify-center group-hover:bg-primary-500/30 transition-colors mx-auto">
                <Users className="w-7 h-7 text-primary-400" />
              </div>
              <div>
                <div className="font-bold text-white text-lg">Volunteer</div>
                <div className="text-primary-400 text-sm">Login / Register</div>
              </div>
              <ArrowRight className="w-4 h-4 text-primary-400 group-hover:translate-x-1 transition-transform mx-auto" />
            </button>

            <button
              onClick={() => {
                if (user && !localStorage.getItem('demo_role')) {
                  navigate(`/${role || 'ngo'}/dashboard`)
                } else {
                  navigate('/auth/ngo')
                }
              }}
              id="cta-ngo"
              className="group flex flex-col items-center gap-3 p-6 rounded-2xl bg-gradient-to-br from-secondary-500/20 to-secondary-600/10 border border-secondary-500/30 hover:border-secondary-400 hover:from-secondary-500/30 transition-all duration-300 hover:-translate-y-1 w-full text-center"
            >
              <div className="w-14 h-14 bg-secondary-500/20 rounded-2xl flex items-center justify-center group-hover:bg-secondary-500/30 transition-colors mx-auto">
                <Building2 className="w-7 h-7 text-secondary-400" />
              </div>
              <div>
                <div className="font-bold text-white text-lg">NGO</div>
                <div className="text-secondary-400 text-sm">Login / Register</div>
              </div>
              <ArrowRight className="w-4 h-4 text-secondary-400 group-hover:translate-x-1 transition-transform mx-auto" />
            </button>

            <button
              onClick={() => {
                if (user && !localStorage.getItem('demo_role')) {
                  navigate(`/${role || 'admin'}/dashboard`)
                } else {
                  navigate('/auth/admin')
                }
              }}
              id="cta-admin"
              className="group flex flex-col items-center gap-3 p-6 rounded-2xl bg-gradient-to-br from-gray-700/50 to-gray-800/30 border border-gray-600/50 hover:border-gray-500 transition-all duration-300 hover:-translate-y-1 w-full text-center"
            >
              <div className="w-14 h-14 bg-gray-700/50 rounded-2xl flex items-center justify-center group-hover:bg-gray-700 transition-colors mx-auto">
                <ShieldCheck className="w-7 h-7 text-gray-400" />
              </div>
              <div>
                <div className="font-bold text-white text-lg">Admin</div>
                <div className="text-gray-400 text-sm">Private Access</div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform mx-auto" />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {stats.map((s) => (
              <div key={s.label} className="stat-card text-center">
                <s.icon className={`w-5 h-5 ${s.color} mx-auto mb-2`} />
                <div className="text-2xl font-bold text-white">{s.value}</div>
                <div className="text-xs text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Everything You Need to Make an Impact</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">Purpose-built features for volunteers, NGOs, and administrators to collaborate efficiently.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className={`card-hover p-6 bg-gradient-to-br ${f.color}`}>
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4">
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 bg-gray-900/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">How Bridge India Works</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Register & Verify', desc: 'Sign up with phone/email OTP, pin your location, upload occupation proof. Await quick admin approval.' },
              { step: '02', title: 'AI Match & Connect', desc: 'Our AI matches you with the best volunteer opportunities based on your skills, tier, and proximity.' },
              { step: '03', title: 'Volunteer & Grow', desc: 'Complete activities, earn points & badges, level up tiers, download your impact certificate.' },
            ].map((item) => (
              <div key={item.step} className="relative text-center p-8 card">
                <div className="text-5xl font-black text-primary-500/20 mb-4">{item.step}</div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gamification Banner */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto bg-gradient-to-r from-primary-600/20 via-secondary-600/20 to-primary-600/20 border border-primary-500/20 rounded-3xl p-10 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Level Up Your Impact</h2>
          <p className="text-gray-300 mb-8 text-lg">Progress through tiers and earn exclusive badges</p>
          <div className="flex flex-wrap justify-center gap-6">
            {[
              { tier: '🟡 Newbie', desc: 'Starting your journey', req: '0–99 pts' },
              { tier: '🟢 Reliable', desc: 'Consistent contributor', req: '100+ pts + 2 badges' },
              { tier: '🔵 Elite', desc: 'Community champion', req: '500+ pts + 5 badges' },
            ].map((t) => (
              <div key={t.tier} className="bg-gray-900 border border-gray-700 rounded-2xl px-6 py-4 min-w-[160px]">
                <div className="text-2xl mb-1">{t.tier}</div>
                <div className="text-sm text-gray-400">{t.desc}</div>
                <div className="text-xs text-primary-400 mt-1 font-medium">{t.req}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-6 bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Real Stories, Real Impact</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="card p-6">
                <div className="text-primary-400 text-3xl mb-4">"</div>
                <p className="text-gray-300 mb-6 leading-relaxed">{t.quote}</p>
                <div>
                  <div className="font-semibold text-white">{t.name}</div>
                  <div className="text-sm text-gray-500">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Firebase Demo */}
      <section className="py-24 px-6 max-w-4xl mx-auto">
        <FirebaseDemo />
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white">Bridge India</span>
          </div>
          <div className="text-gray-500 text-sm">© 2026 Bridge India. Focused on Andhra Pradesh. Built with ❤️</div>
          <div className="flex gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-primary-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary-400 transition-colors">Terms</a>
            <a href="#" className="hover:text-primary-400 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
