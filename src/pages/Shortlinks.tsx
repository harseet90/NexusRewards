import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/firebase';
import { doc, updateDoc, setDoc, collection, increment } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, ShieldCheck, Flame, MousePointer2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';

const links = [
  { id: 'sl1', name: 'ShrinkEarn', views: '0/5', reward: 120.00, difficulty: 'Easy' },
  { id: 'sl2', name: 'Ouo.io', views: '0/3', reward: 95.50, difficulty: 'Medium' },
  { id: 'sl3', name: 'Shortfly', views: '1/3', reward: 150.00, difficulty: 'Hard' },
  { id: 'sl4', name: 'Adfly Pro', views: '0/10', reward: 200.00, difficulty: 'Medium' },
];

export default function Shortlinks() {
  const { profile } = useAuth();
  
  const handleClaim = (link: any) => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: 'Redirecting to secure link...',
        success: () => {
          // In a real app, you'd redirect to the link provider
          // and receive a callback. For now simulation:
          return `Returning from ${link.name}...`;
        },
        error: 'Failed to connect to provider.',
      }
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Shortlink Walls</h1>
        <p className="text-white/40">Complete shortlinks to earn high rewards. These reward more than PTC but take a bit longer.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {links.map((link, i) => (
          <motion.div
            key={link.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="bg-[#1C1F26] border-white/5 group hover:border-indigo-500/30 transition-all overflow-hidden">
               <CardContent className="p-0">
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center transition-colors group-hover:bg-indigo-500/10">
                          <ExternalLink className="w-6 h-6 text-indigo-400" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{link.name}</h3>
                          <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest">Views available: {link.views}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={cn(
                        "text-[10px] font-bold uppercase py-1 border-none bg-white/5",
                        link.difficulty === 'Easy' ? 'text-emerald-400' : 
                        link.difficulty === 'Medium' ? 'text-yellow-400' : 'text-red-400'
                      )}>
                        {link.difficulty}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
                       <div className="flex items-center gap-3">
                          <Flame className="w-4 h-4 text-orange-500" />
                          <div>
                            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest leading-none mb-0.5">Reward per visit</p>
                            <p className="text-lg font-mono font-bold text-white tracking-tighter">{link.reward.toFixed(2)} <span className="text-sm font-bold text-indigo-400">NXS</span></p>
                          </div>
                       </div>
                       <Button onClick={() => handleClaim(link)} className="bg-white text-black hover:bg-white/90 font-bold px-8 h-12 rounded-xl">
                         Visit Link
                       </Button>
                    </div>
                  </div>

                  <div className="px-8 py-3 bg-white/[0.02] flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-white/20" />
                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Safe & Secured by Nexus Guard</span>
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
