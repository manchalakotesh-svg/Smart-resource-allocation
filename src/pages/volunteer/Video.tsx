import { useState, useRef } from 'react'
import Sidebar from '../../components/Sidebar'
import { storage } from '../../lib/firebase'
import { ref, uploadBytes } from 'firebase/storage'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { Video as VideoIcon, Play, Upload, Star, Clock } from 'lucide-react'

const videos = [
  { id: 1, title: 'NGO Impact Highlight - Education First', date: 'Oct 20, 2025', duration: '0:30', views: 120, thumbnail: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&h=250&fit=crop' },
  { id: 2, title: 'Vijayawada Community Health Camp', date: 'Oct 15, 2025', duration: '0:45', views: 85, thumbnail: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&h=250&fit=crop' },
  { id: 3, title: 'Ocean Care Beach Cleaning Recap', date: 'Oct 12, 2025', duration: '1:00', views: 210, thumbnail: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=250&fit=crop' },
]

export default function Video() {
  const { user } = useAuth()
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    // Validate file size (e.g., max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast.error('Video size must be less than 50MB')
      return
    }

    // Validate file type
    if (!file.type.startsWith('video/')) {
      toast.error('Please upload a valid video file')
      return
    }

    setUploading(true)
    const toastId = toast.loading('Uploading impact video...')

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.uid}-${Math.random()}.${fileExt}`
      const storageRef = ref(storage, `impact-videos/${fileName}`)

      await uploadBytes(storageRef, file)

      toast.success('Video uploaded successfully! It will appear after verification.', { id: toastId })
    } catch (error: any) {
      toast.error(`Upload failed: ${error.message}`, { id: toastId })
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8 animate-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Impact Videos</h1>
              <p className="text-gray-400 text-sm mt-1">Watch and share 30-60s highlights of recent volunteer activities</p>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="video/*"
              className="hidden"
            />
            <button 
              onClick={handleUploadClick}
              disabled={uploading}
              className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50"
            >
              {uploading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              {uploading ? 'Uploading...' : 'Upload Highlight'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <div key={video.id} className="card group overflow-hidden border-gray-800 hover:border-primary-500/50 transition-all cursor-pointer">
                <div className="relative aspect-video">
                  <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center text-white">
                      <Play className="w-6 h-6 fill-current" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-bold text-white">
                    {video.duration}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-white text-sm line-clamp-2 mb-2">{video.title}</h3>
                  <div className="flex items-center justify-between text-[11px] text-gray-500">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{video.date}</span>
                    <span className="flex items-center gap-1"><Star className="w-3 h-3 text-primary-400" />{video.views} views</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="card p-6 bg-primary-500/5 border border-primary-500/20">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center shrink-0">
                <VideoIcon className="w-5 h-5 text-primary-400" />
              </div>
              <div>
                <h4 className="text-white font-semibold">Share Your Impact Story</h4>
                <p className="text-gray-500 text-sm mt-1">Short video highlights (under 60 seconds) are 3x more likely to be featured on our homepage and social media. Earn +5 points for every verified highlight video!</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
