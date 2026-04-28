import React, { useEffect, useState } from 'react';
import { collection, query, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { MessageSquare, Send, Bell } from 'lucide-react';

interface Announcement {
  id: string;
  text: string;
  timestamp: any;
}

export default function FirebaseDemo() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [newAnnouncement, setNewAnnouncement] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if Firebase is configured
    if (!import.meta.env.VITE_FIREBASE_API_KEY || import.meta.env.VITE_FIREBASE_API_KEY === 'your_api_key') {
      setError('Firebase keys not configured in .env');
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'announcements'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const docs: Announcement[] = [];
      querySnapshot.forEach((doc) => {
        docs.push({ id: doc.id, ...doc.data() } as Announcement);
      });
      setAnnouncements(docs);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setError('Failed to fetch announcements. Make sure Firestore is enabled.');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnouncement.trim()) return;

    try {
      await addDoc(collection(db, 'announcements'), {
        text: newAnnouncement,
        timestamp: serverTimestamp()
      });
      setNewAnnouncement('');
    } catch (err) {
      console.error(err);
      alert('Error adding announcement');
    }
  };

  return (
    <div className="card p-6 bg-gray-900 border border-gray-800 rounded-2xl shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary-500/20 rounded-lg">
          <Bell className="w-5 h-5 text-primary-400" />
        </div>
        <h2 className="text-xl font-bold text-white">Live Firebase Announcements</h2>
      </div>

      {error ? (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 text-sm mb-4">
          {error}
        </div>
      ) : loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
          {announcements.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No announcements yet.</p>
          ) : (
            announcements.map((msg) => (
              <div key={msg.id} className="p-3 bg-gray-800/50 rounded-xl border border-gray-700/50">
                <p className="text-gray-300 text-sm">{msg.text}</p>
                <span className="text-[10px] text-gray-500 mt-1 block">
                  {msg.timestamp?.toDate().toLocaleString() || 'Just now'}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={newAnnouncement}
          onChange={(e) => setNewAnnouncement(e.target.value)}
          placeholder="Broadcast a message..."
          className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
        />
        <button
          type="submit"
          disabled={!!error}
          className="p-2 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:hover:bg-primary-600 text-white rounded-xl transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
