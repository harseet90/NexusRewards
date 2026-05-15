import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Coins, Target, Users2, ArrowUpRight, CheckCircle2, TrendingUp, Zap, Copy, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { collection, query, orderBy, limit, onSnapshot, getDocs, where } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { AdBanner } from '../components/BannerAd';

interface Claim {
  id: string;
  taskId: string;
  reward: number;
  claimedAt: any;
  taskTitle?: string;
}

const stats = [
  { label: 'Total Balance', value: '0', icon: Coins, color: 'text-yellow-400', glow: 'shadow-yellow-500/20', sub: 'Nexus Coins' },
  { label: 'Tasks Completed', value: '0', icon: Target, color: 'text-indigo-400', glow: 'shadow-indigo-500/20', sub: 'Last 30 days' },
  { label: 'Active Referrals', value: '0', icon: Users2, color: 'text-emerald-400', glow: 'shadow-emerald-500/20', sub: 'Earning 10% each' },
];

export default function Dashboard() {
  const { profile, loading: authLoading } = useAuth();
  const [recentClaims, setRecentClaims] = useState<Claim[]>([]);
  const [claimsLoading, setClaimsLoading] = useState(true);
  
  useEffect(() => {
    if (!profile?.uid) return;

    const q = query(
      collection(db, 'users', profile.uid, 'claims'),
      orderBy('claimedAt', 'desc'),
      limit(5)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const claims = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Claim[];
      setRecentClaims(claims);
      setClaimsLoading(false);
    }, (error) => {
      process.env.NODE_ENV === 'development' && console.error("Error fetching claims:", error);
      setClaimsLoading(false);
    });

    return () => unsubscribe();
  }, [profile?.uid]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const displayStats = [
    { label: 'Total Balance', value: profile?.points?.toLocaleString() || '0', icon: Coins, color: 'text-yellow-400', glow: 'shadow-yellow-500/20', sub: 'Nexus Coins' },
    { label: 'Tasks Completed', value: profile?.tasksCompleted?.toLocaleString() || '0', icon: Target, color: 'text-indigo-400', glow: 'shadow-indigo-500/20', sub: 'Total Lifetime' },
    { label: 'Active Referrals', value: profile?.referralsCount?.toLocaleString() || '0', icon: Users2, color: 'text-emerald-400', glow: 'shadow-emerald-500/20', sub: 'Earning 10% each' },
  ];

  const copyReferralLink = () => {
    const link = `${window.location.origin}/register?ref=${profile?.uid || 'nexus'}`;
    navigator.clipboard.writeText(link);
    toast.success('Referral link copied to clipboard!');
  };

  return (
    <div className="space-y-8">
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative">
          <h1 className="text-4xl font-black tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
            Welcome back, {profile?.displayName?.split(' ')[0]}!
          </h1>
          <p className="text-white/40 font-medium">Here is what is happening with your earnings today.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {displayStats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className={cn(
              "bg-[#1C1F26] border-white/5 overflow-hidden group transition-all hover:border-white/10 shadow-2xl",
              stat.glow
            )}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={cn("p-3 rounded-xl bg-white/5", stat.color)}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div className="bg-white/5 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight className="w-4 h-4 text-white/40" />
                  </div>
                </div>
                <div>
                  <p className="text-4xl font-mono font-bold text-white mb-1">{stat.value}</p>
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">{stat.label}</p>
                </div>
              </CardContent>
              <div className="h-1 w-full bg-white/5">
                <motion.div 
                  className={cn("h-full", stat.color.replace('text', 'bg'))}
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="bg-[#1C1F26] border-white/5 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                Recent Activity
              </CardTitle>
              <CardDescription className="text-white/40 text-[10px] uppercase font-black tracking-[0.2em]">Latest earnings & claims</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {claimsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-4 animate-pulse">
                        <div className="w-10 h-10 rounded-xl bg-white/5" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-white/5 rounded w-1/3" />
                          <div className="h-3 bg-white/5 rounded w-1/4" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentClaims.length > 0 ? (
                  <AnimatePresence mode="popLayout">
                    {recentClaims.map((claim, i) => (
                      <motion.div 
                        key={claim.id} 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-4 group cursor-default"
                      >
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-emerald-500/10 transition-colors">
                          <CheckCircle2 className="w-5 h-5 text-emerald-400/50 group-hover:text-emerald-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-white/90">
                            {claim.taskTitle || 'Task Reward'}
                          </p>
                          <p className="text-[10px] text-white/30 uppercase font-black tracking-wider">
                            {claim.claimedAt?.toDate ? formatDistanceToNow(claim.claimedAt.toDate(), { addSuffix: true }) : 'Just now'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-mono font-bold text-emerald-400">+{claim.reward.toFixed(2)}</p>
                          <p className="text-[10px] text-white/20 uppercase font-bold tracking-tighter">NXS</p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4 border border-white/5 border-dashed">
                      <History className="w-8 h-8 text-white/10" />
                    </div>
                    <p className="text-sm font-bold text-white/40">No activity yet</p>
                    <p className="text-[10px] text-white/20 uppercase font-bold tracking-wider mt-1">Start completing tasks to earn rewards</p>
                  </div>
                )}
                <Link to="/history">
                  <Button variant="ghost" className="w-full text-white/40 hover:text-white hover:bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] py-8 border border-white/5 border-dashed mt-4">
                    View Full History
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <AdBanner position="right" className="w-full aspect-[3/4]" />
          <Card className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 border-none relative overflow-hidden group shadow-[0_0_50px_rgba(79,70,229,0.2)]">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform rotate-12">
              <Zap className="w-40 h-40 text-white" />
            </div>
            <CardContent className="p-10 relative z-10">
              <h3 className="text-3xl font-black text-white mb-3">Ready for more?</h3>
              <p className="text-white/80 text-sm mb-8 max-w-[240px] leading-relaxed">
                Complete 5 <span className="text-white font-bold underline decoration-white/30 underline-offset-4">PTC ads</span> today to unlock a bonus reward of 500 Coins!
              </p>
              <Link to="/ptc">
                <Button className="bg-white text-indigo-900 font-black hover:bg-white/90 shadow-2xl px-10 h-14 rounded-xl transition-all hover:scale-105 active:scale-95">
                  Go to PTC Ads
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-[#1C1F26] border-white/5 border-dashed shadow-2xl hover:bg-[#232730] transition-colors cursor-pointer" onClick={copyReferralLink}>
            <CardContent className="p-10 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/5">
                <Copy className="w-8 h-8 text-white/40" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Referral Program</h4>
              <p className="text-sm text-white/40 mb-6 max-w-[200px]">Invite friends and earn <span className="text-emerald-400 font-bold">10% lifetime</span> commissions.</p>
              <Button variant="outline" className="border-white/10 hover:bg-white/5 text-white text-[10px] font-black uppercase tracking-[0.2em] px-8 h-12 rounded-xl">
                Copy Link
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
