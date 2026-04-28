import { useState } from 'react'
import { db } from '../../lib/firebase'
import { doc, updateDoc } from 'firebase/firestore'
import { useAuth } from '../../context/AuthContext'
import Sidebar from '../../components/Sidebar'
import { MapPin, Upload, Save } from 'lucide-react'
import toast from 'react-hot-toast'

export default function NGOProfile() {
  const { user } = useAuth()
  const [name, setName] = useState('My NGO')
  const [description, setDescription] = useState('')
  const [website, setWebsite] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    try {
      const docRef = doc(db, 'ngo_profiles', user.uid)
      await updateDoc(docRef, { name, description, website })
      toast.success('NGO profile updated!')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-6 animate-in">
          <h1 className="text-2xl font-bold text-white">NGO Profile</h1>
          <div className="card p-6 space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">NGO Name</label>
              <input id="ngo-profile-name" type="text" value={name} onChange={e => setName(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Description</label>
              <textarea id="ngo-profile-desc" value={description} onChange={e => setDescription(e.target.value)} rows={5} className="input-field resize-none" placeholder="Describe your NGO's mission and work..." />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Website</label>
              <input id="ngo-profile-website" type="url" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://yourngo.org" className="input-field" />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Workplace Photos / Video</label>
              <div className="grid grid-cols-3 gap-3">
                {[0, 1, 2].map(i => (
                  <div key={i} className="aspect-video bg-gray-800 border border-dashed border-gray-600 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-secondary-500/50 transition-colors">
                    <Upload className="w-5 h-5 text-gray-600 mb-1" />
                    <span className="text-xs text-gray-600">Upload</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-800/50 rounded-xl px-4 py-3">
              <MapPin className="w-4 h-4 text-primary-400" />
              Location pinned: Vijayawada, Andhra Pradesh (default)
            </div>
            <button onClick={handleSave} disabled={saving} id="btn-save-ngo-profile" className="btn-secondary w-full flex items-center justify-center gap-2">
              <Save className="w-4 h-4" />{saving ? 'Saving...' : 'Save NGO Profile'}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
