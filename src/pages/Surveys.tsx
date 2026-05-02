import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClipboardList, ExternalLink, Star, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

const offerwalls = [
  { id: 'ow1', name: 'CPALead', type: 'Surveys', rewardRange: '100 - 50,000', rating: 4.8 },
  { id: 'ow2', name: 'AdGem', type: 'Mobile Apps', rewardRange: '500 - 100,000', rating: 4.5 },
  { id: 'ow3', name: 'BitLabs', type: 'High Paying Surveys', rewardRange: '200 - 25,000', rating: 4.9 },
  { id: 'ow4', name: 'TheoremReach', type: 'Easy Profile Surveys', rewardRange: '50 - 10,000', rating: 4.2 },
];

export default function Surveys() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Offerwalls & Surveys</h1>
        <p className="text-white/40">Complete high-paying surveys and download apps to earn massive rewards.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {offerwalls.map((wall, i) => (
          <motion.div
            key={wall.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="bg-[#1C1F26] border-white/5 hover:border-indigo-500/30 transition-all group overflow-hidden">
               <CardContent className="p-0">
                  <div className="p-8">
                     <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                           <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-indigo-500/10 transition-colors">
                              <ClipboardList className="w-7 h-7 text-indigo-400" />
                           </div>
                           <div>
                              <h3 className="font-bold text-xl text-white tracking-tight">{wall.name}</h3>
                              <div className="flex items-center gap-1">
                                 <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                 <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{wall.rating} Rating</span>
                              </div>
                           </div>
                        </div>
                        <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-[10px] font-bold py-1">
                           {wall.type}
                        </Badge>
                     </div>

                     <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between px-4 py-3 bg-black/20 rounded-xl border border-white/5">
                           <div>
                              <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-0.5">Potential Reward</p>
                              <p className="text-sm font-mono font-bold text-white italic">{wall.rewardRange} <span className="text-indigo-400">NXS</span></p>
                           </div>
                           <Button className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold h-10 px-6 rounded-lg">
                              Open Wall
                              <ExternalLink className="w-3 h-3 ml-2" />
                           </Button>
                        </div>
                     </div>
                  </div>
                  <div className="px-8 py-3 bg-white/[0.02] flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-white/20" />
                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest leading-none">External Provider Security Active</span>
                  </div>
               </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="p-8 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center gap-6">
         <div className="hidden sm:flex w-16 h-16 bg-white/5 rounded-full items-center justify-center shrink-0">
            <Star className="w-8 h-8 text-indigo-400 fill-indigo-400" />
         </div>
         <div>
            <h4 className="font-bold text-white mb-1">Boost your earnings!</h4>
            <p className="text-xs text-white/50 leading-relaxed">
               Users who complete at least one survey per week earn an average of <span className="text-white font-bold">5x more</span> than PTC-only users.
            </p>
         </div>
      </div>
    </div>
  );
}
