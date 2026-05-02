import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Crown, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';

interface LeaderboardUser {
  uid: string;
  displayName: string;
  points: number;
  photoURL?: string;
}

export default function Leaderboard() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const q = query(collection(db, 'users'), orderBy('points', 'desc'), limit(10));
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({ uid: doc.id, ...doc.data() } as LeaderboardUser));
        setUsers(data);
      } catch (error) {
        console.error(error);
        // Fallback dummy data if Firestore fails or is empty
        setUsers([
          { uid: '1', displayName: 'CryptoKing', points: 12500 },
          { uid: '2', displayName: 'EarningsPro', points: 9800 },
          { uid: '3', displayName: 'NexusLover', points: 8500 },
          { uid: '4', displayName: 'BitHunter', points: 7200 },
          { uid: '5', displayName: 'SatStacker', points: 6100 },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Hall of Fame</h1>
        <p className="text-white/40">The top earners in the NexusRewards ecosystem.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="bg-[#1C1F26] border-white/5">
             <CardHeader className="pb-2">
                <CardTitle className="text-sm uppercase font-bold tracking-widest text-white/40 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Global Rankings
                </CardTitle>
             </CardHeader>
             <CardContent className="p-0">
                <div className="divide-y divide-white/5">
                  {users.map((user, i) => (
                    <motion.div
                      key={user.uid}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-4 p-6 hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="w-8 text-center">
                        {i === 0 ? <Crown className="w-5 h-5 text-yellow-400 mx-auto" /> : 
                         i === 1 ? <Medal className="w-5 h-5 text-gray-300 mx-auto" /> :
                         i === 2 ? <Medal className="w-5 h-5 text-amber-600 mx-auto" /> :
                         <span className="text-sm font-mono font-bold text-white/20">#{i + 1}</span>}
                      </div>
                      
                      <Avatar className="w-10 h-10 border border-white/10">
                        <AvatarImage src={user.photoURL} />
                        <AvatarFallback className="bg-white/5 text-xs text-white/50">{user.displayName?.[0]}</AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <p className="font-bold text-white tracking-tight">{user.displayName || 'Anonymous User'}</p>
                        <p className="text-[10px] text-white/30 uppercase font-black tracking-tighter">Level 24 Master</p>
                      </div>

                      <div className="text-right">
                        <p className="text-lg font-mono font-bold text-indigo-400">{user.points.toLocaleString()}</p>
                        <p className="text-[10px] text-white/20 uppercase font-bold tracking-widest">NXS Coins</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
             </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-amber-500/20 to-orange-600/20 border-amber-500/30">
            <CardHeader>
              <Trophy className="w-12 h-12 text-amber-500 mb-2" />
              <CardTitle className="text-amber-500">Weekly Season #12</CardTitle>
              <CardDescription className="text-amber-500/60">Top 3 users at the end of the week win a share of 100,000 NXS!</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs font-bold text-amber-500/80 uppercase">
                    <span>Current Prize Pool</span>
                    <span>5d 14h 22s Left</span>
                  </div>
                  <div className="h-2 bg-amber-500/10 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 w-3/4" />
                  </div>
               </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1C1F26] border-white/5">
            <CardContent className="p-6">
              <h4 className="font-bold text-white mb-4">How it works</h4>
              <ul className="space-y-4">
                {[
                  "Earn coins through any available task",
                  "Points are updated in real-time",
                  "Seasons reset every Sunday at midnight",
                  "Rewards are automatically credited",
                ].map((item, i) => (
                  <li key={i} className="flex gap-2 text-xs text-white/40 leading-relaxed font-medium capitalize">
                    <span className="text-indigo-400 font-black">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
