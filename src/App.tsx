import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { AdBanner } from './components/BannerAd';
import { Toaster } from 'sonner';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from './lib/firebase';
import { useEffect, useState } from 'react';
import Dashboard from './pages/Dashboard';
import PTC from './pages/PTC';
import Referrals from './pages/Referrals';
import Leaderboard from './pages/Leaderboard';
import Admin from './pages/Admin';
import Shortlinks from './pages/Shortlinks';
import Challenges from './pages/Challenges';
import Surveys from './pages/Surveys';
import History from './pages/History';
import ShortlinkVerify from './pages/ShortlinkVerify';

function AppContent() {
  const { user, profile, loading, signIn } = useAuth();
  const [adScript, setAdScript] = useState('');

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'config'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setAdScript(data.adScript || '');
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (adScript) {
      const script = document.createElement('script');
      script.innerHTML = adScript;
      document.body.appendChild(script);
      return () => {
        const scripts = document.body.getElementsByTagName('script');
        for (let i = 0; i < scripts.length; i++) {
          if (scripts[i].innerHTML === adScript) {
            document.body.removeChild(scripts[i]);
          }
        }
      };
    }
  }, [adScript]);

  if (loading) {
    return (
      <div className="h-screen w-full bg-[#0A0C0F] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen w-full bg-[#0A0C0F] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-indigo-500 rounded-2xl flex items-center justify-center mb-8 rotate-12 transition-transform hover:rotate-0">
          <span className="text-4xl font-black text-white italic">N</span>
        </div>
        <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">Welcome to NexusRewards</h1>
        <p className="text-white/50 max-w-md mb-8 leading-relaxed">
          The most premium way to earn crypto rewards through PTC, surveys, and shortlinks. Join our elite community of earners today.
        </p>
        <button 
          onClick={() => signIn()}
          className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-4 px-12 rounded-xl transition-all hover:scale-105"
        >
          Get Started with Google
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0C0F] text-white">
      <Navbar />
      <Sidebar isAdmin={profile?.isAdmin} />
      <main className="pl-64 pt-16 h-screen overflow-y-auto">
        <div className="max-w-6xl mx-auto py-8 px-6 space-y-8">
          <AdBanner position="header" className="w-full aspect-[8/1] mb-8" />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/ptc" element={<PTC />} />
            <Route path="/shortlinks" element={<Shortlinks />} />
            <Route path="/surveys" element={<Surveys />} />
            <Route path="/challenges" element={<Challenges />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/referrals" element={<Referrals />} />
            <Route path="/history" element={<History />} />
            <Route path="/shortlink/verify" element={<ShortlinkVerify />} />
            <Route path="/admin.portal" element={profile?.isAdmin ? <Admin /> : <Navigate to="/" />} />
          </Routes>
          <AdBanner position="bottom" className="w-full aspect-[8/1] mt-12" />
        </div>
      </main>
      <Toaster position="top-right" theme="dark" />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}
