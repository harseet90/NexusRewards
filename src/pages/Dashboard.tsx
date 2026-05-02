import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Coins, Target, Users2, ArrowUpRight, CheckCircle2, TrendingUp, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';

const stats = [
  { label: 'Total Balance', value: '0', icon: Coins, color: 'text-yellow-400', sub: 'Nexus Coins' },
  { label: 'Tasks Completed', value: '0', icon: Target, color: 'text-indigo-400', sub: 'Last 30 days' },
  { label: 'Active Referrals', value: '0', icon: Users2, color: 'text-emerald-400', sub: 'Earning 10% each' },
];

export default function Dashboard() {
  const { profile } = useAuth();
  
  const displayStats = [
    { label: 'Total Balance', value: profile?.points?.toLocaleString() || '0', icon: Coins, color: 'text-yellow-400', sub: 'Nexus Coins' },
    { label: 'Tasks Completed', value: '0', icon: Target, color: 'text-indigo-400', sub: 'Last 30 days' },
    { label: 'Active Referrals', value: '0', icon: Users2, color: 'text-emerald-400', sub: 'Earning 10% each' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome back, {profile?.displayName?.split(' ')[0]}!</h1>
        <p className="text-white/40">Here is what is happening with your earnings today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {displayStats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="bg-[#1C1F26] border-white/5 overflow-hidden group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={stat.color}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div className="bg-white/5 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight className="w-4 h-4 text-white/40" />
                  </div>
                </div>
                <div>
                  <p className="text-4xl font-mono font-bold text-white mb-1">{stat.value}</p>
                  <p className="text-xs font-bold text-white/40 uppercase tracking-wider">{stat.label}</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-[#1C1F26] border-white/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              Recent Activity
            </CardTitle>
            <CardDescription className="text-white/40 text-xs uppercase font-bold tracking-widest">Your latest earnings & claims</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="flex items-center gap-4 group cursor-default">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-indigo-500/10 transition-colors">
                    <CheckCircle2 className="w-5 h-5 text-indigo-400/50 group-hover:text-indigo-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white/90">Daily Reward Claimed</p>
                    <p className="text-xs text-white/30">2 hours ago • Routine</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono font-bold text-indigo-400">+50.00</p>
                    <p className="text-[10px] text-white/20 uppercase font-bold tracking-tighter">NXS</p>
                  </div>
                </div>
              ))}
              <Button variant="ghost" className="w-full text-white/40 hover:text-white hover:bg-white/5 text-xs font-bold uppercase tracking-widest py-6">
                View Full History
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-indigo-600 to-violet-800 border-indigo-500/50 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
              <Zap className="w-32 h-32 text-white" />
            </div>
            <CardContent className="p-8 relative z-10">
              <h3 className="text-2xl font-bold text-white mb-2">Ready for more?</h3>
              <p className="text-white/80 text-sm mb-6 max-w-[200px]">Complete 5 PTC ads today to unlock a bonus reward of 500 Coins!</p>
              <Button className="bg-white text-indigo-900 font-bold hover:bg-white/90 shadow-xl">
                Go to PTC Ads
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-[#1C1F26] border-white/5 border-dashed">
            <CardContent className="p-8 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-4">
                <Users2 className="w-6 h-6 text-white/20" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1">Referral Program</h4>
              <p className="text-xs text-white/40 mb-4 max-w-[150px]">Invite your friends and earn lifetime commissions.</p>
              <Button variant="outline" className="border-white/10 hover:bg-white/5 text-white text-xs font-bold uppercase tracking-widest">
                Copy Link
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
