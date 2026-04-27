import Sidebar from '../../components/Sidebar'
import { Clock, CheckCircle2, MapPin, Calendar, Search } from 'lucide-react'

const historyData = [
  { id: 1, title: 'Beach Cleanup Drive', date: 'Oct 12, 2025', hours: 4, location: 'Vizag RK Beach', ngo: 'Ocean Care', status: 'Verified' },
  { id: 2, title: 'Food Distribution', date: 'Sep 28, 2025', hours: 3, location: 'Guntur RTC Complex', ngo: 'Serve India', status: 'Verified' },
  { id: 3, title: 'Teaching Assistant', date: 'Aug 15, 2025', hours: 6, location: 'Vijayawada ZP School', ngo: 'Education First', status: 'Verified' },
  { id: 4, title: 'Blood Donation Camp', date: 'Jul 10, 2025', hours: 2, location: 'Tirupati Govt Hospital', ngo: 'Red Cross', status: 'Verified' },
]

export default function History() {
  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-6 animate-in">
          <div>
            <h1 className="text-2xl font-bold text-white">Activity History</h1>
            <p className="text-gray-400 text-sm mt-1">Review your past contributions and verified hours</p>
          </div>

          <div className="card overflow-hidden">
            <div className="p-4 border-b border-gray-800 bg-gray-900/50 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Clock className="w-4 h-4" />
                <span>Total Verified Hours: 15h</span>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                <input type="text" placeholder="Search activities..." className="bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-primary-500" />
              </div>
            </div>
            <div className="divide-y divide-gray-800">
              {historyData.map((item) => (
                <div key={item.id} className="p-6 hover:bg-gray-900/50 transition-colors flex items-center justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center shrink-0">
                      <Calendar className="w-5 h-5 text-primary-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{item.title}</h3>
                      <div className="flex flex-wrap gap-4 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{item.location}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{item.hours} hours</span>
                        <span className="text-primary-400/80 font-medium">{item.ngo}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-xs text-gray-500 font-medium">{item.date}</span>
                    <div className="flex items-center gap-1.5 text-primary-400 bg-primary-500/10 px-3 py-1 rounded-full text-xs font-medium border border-primary-500/20">
                      <CheckCircle2 className="w-3 h-3" />
                      {item.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
