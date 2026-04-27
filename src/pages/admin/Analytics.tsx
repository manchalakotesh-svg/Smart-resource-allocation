import { useState } from 'react'
import Sidebar from '../../components/Sidebar'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { Users, Building2, CheckCircle2, Activity, ShieldCheck, Clock } from 'lucide-react'

const monthlyData = [
  { month: 'Nov', volunteers: 180, ngo: 12, activities: 340 },
  { month: 'Dec', volunteers: 210, ngo: 14, activities: 420 },
  { month: 'Jan', volunteers: 280, ngo: 18, activities: 590 },
  { month: 'Feb', volunteers: 320, ngo: 22, activities: 680 },
  { month: 'Mar', volunteers: 410, ngo: 29, activities: 820 },
  { month: 'Apr', volunteers: 490, ngo: 35, activities: 1020 },
]

const tierData = [
  { name: '🟡 Newbie', value: 60, color: '#f59e0b' },
  { name: '🟢 Reliable', value: 30, color: '#10b981' },
  { name: '🔵 Elite', value: 10, color: '#3b82f6' },
]

const districtData = [
  { district: 'Krishna', volunteers: 142 },
  { district: 'Guntur', volunteers: 98 },
  { district: 'Tirupati', volunteers: 87 },
  { district: 'Visakha', volunteers: 76 },
  { district: 'Nellore', volunteers: 54 },
]

export default function Analytics() {
  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-6 animate-in">
          <div>
            <h1 className="text-2xl font-bold text-white">Platform Analytics</h1>
            <p className="text-gray-400 text-sm mt-1">Real-time insights across Andhra Pradesh</p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: 'Total Volunteers', value: '2,441', icon: Users, color: 'text-primary-400' },
              { label: 'Partner NGOs', value: '181', icon: Building2, color: 'text-secondary-400' },
              { label: 'Pending Approvals', value: '23', icon: Clock, color: 'text-amber-400' },
              { label: 'Activities (Apr)', value: '1,020', icon: Activity, color: 'text-purple-400' },
              { label: 'Verified Users', value: '2,280', icon: CheckCircle2, color: 'text-green-400' },
              { label: 'Elite Members', value: '244', icon: ShieldCheck, color: 'text-blue-400' },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <s.icon className={`w-4 h-4 ${s.color} mb-2`} />
                <div className="text-xl font-bold text-white">{s.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Growth Chart */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Platform Growth (6 Months)</h2>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#f9fafb' }} />
                <Line type="monotone" dataKey="volunteers" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981', r: 4 }} name="Volunteers" />
                <Line type="monotone" dataKey="activities" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6', r: 4 }} name="Activities" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Tier Distribution */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Volunteer Tier Distribution</h2>
              <div className="flex items-center gap-6">
                <PieChart width={180} height={180}>
                  <Pie data={tierData} dataKey="value" cx={85} cy={85} innerRadius={50} outerRadius={80}>
                    {tierData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
                <div className="space-y-3">
                  {tierData.map(t => (
                    <div key={t.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: t.color }} />
                      <span className="text-sm text-gray-300">{t.name}</span>
                      <span className="text-sm font-bold text-white ml-auto">{t.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* District Heatmap */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Top Districts by Volunteer Activity</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={districtData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                  <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <YAxis type="category" dataKey="district" tick={{ fill: '#9ca3af', fontSize: 12 }} width={70} />
                  <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#f9fafb' }} />
                  <Bar dataKey="volunteers" fill="#10B981" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
