import { useAuth } from '../hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Target, Zap, Gift, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

const challenges = [
  { id: 'ch1', title: 'Early Bird', desc: 'Complete 10 PTC ads today', reward: 500, progress: 40, icon: Target },
  { id: 'ch2', title: 'Referral Master', desc: 'Invite 5 active users', reward: 2500, progress: 10, icon: Gift },
  { id: 'ch3', title: 'Speed Run', desc: 'Claim 5 shortlinks in 1h', reward: 1000, progress: 60, icon: Zap },
  { id: 'ch4', title: 'Consistency', desc: 'Claim daily reward for 7 days', reward: 5000, progress: 100, icon: Trophy, claimed: true },
];

export default function Challenges() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Daily Challenges</h1>
        <p className="text-white/40">Complete special milestones to unlock massive coin bonuses.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {challenges.map((ch, i) => (
          <motion.div
            key={ch.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className={cn(
              "bg-[#1C1F26] border-white/5 transition-all group overflow-hidden",
              ch.claimed ? "border-indigo-500/40 bg-indigo-500/[0.02]" : "hover:border-white/10"
            )}>
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                      ch.claimed ? "bg-indigo-500/20 text-indigo-400" : "bg-white/5 text-white/40"
                    )}>
                      <ch.icon className="w-6 h-6" />
                    </div>
                    <div>
                       <h3 className="font-bold text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{ch.title}</h3>
                       <p className="text-xs text-white/40 font-medium">{ch.desc}</p>
                    </div>
                  </div>
                  {ch.claimed && (
                    <Badge className="bg-indigo-500 text-white border-none font-bold text-[10px] uppercase tracking-widest px-3">
                      Completed
                    </Badge>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Progress: {ch.progress}%</span>
                    <div className="flex flex-col items-end">
                       <span className="text-[10px] font-bold text-indigo-400/50 uppercase tracking-widest mb-0.5">Reward</span>
                       <span className="text-lg font-mono font-bold text-indigo-400">+{ch.reward} NXS</span>
                    </div>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-indigo-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${ch.progress}%` }}
                      transition={{ duration: 1, delay: i * 0.2 }}
                    />
                  </div>
                </div>

                <div className="mt-8">
                   <Button 
                    disabled={ch.progress < 100 || ch.claimed}
                    className={cn(
                      "w-full font-bold h-12 rounded-xl transition-all",
                      ch.claimed ? "bg-indigo-500/10 text-indigo-500 border border-indigo-500/20" : 
                      ch.progress === 100 ? "bg-indigo-500 hover:bg-indigo-600 text-white" : "bg-white/5 text-white/20 border border-white/5"
                    )}
                   >
                     {ch.claimed ? (
                       <><CheckCircle2 className="w-4 h-4 mr-2" /> Claimed</>
                     ) : ch.progress === 100 ? (
                       "Claim Reward"
                     ) : (
                       "Not Finished"
                     )}
                   </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
