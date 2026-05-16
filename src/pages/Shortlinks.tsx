import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, ShieldCheck, Flame, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import axios from 'axios';
import { cn } from '@/lib/utils';

export default function Shortlinks() {
  const { profile } = useAuth();
  const [links, setLinks] = useState<any[]>([]);
  const [loadingLinks, setLoadingLinks] = useState(true);
  const [redirectingId, setRedirectingId] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'tasks'),
      where('type', '==', 'SHORTLINK')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLinks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoadingLinks(false);
    });

    return () => unsubscribe();
  }, []);
  
  const handleClaim = async (link: any) => {
    if (!profile?.uid) return toast.error("Please login first");
    
    setRedirectingId(link.id);
    try {
      const response = await axios.post('/api/shorten', {
        linkId: link.id,
        userId: profile.uid
      });

      if (response.data.shortenedUrl) {
        toast.success("Link generated! Redirecting...");
        window.open(response.data.shortenedUrl, '_blank');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to generate link");
      console.error(err);
    } finally {
      setRedirectingId(null);
    }
  };

  if (loadingLinks) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Shortlink Walls</h1>
        <p className="text-white/40">Complete shortlinks to earn high rewards. These reward more than PTC but take a bit longer.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {links.length > 0 ? links.map((link, i) => (
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
                          {redirectingId === link.id ? (
                            <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
                          ) : (
                            <ExternalLink className="w-6 h-6 text-indigo-400" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{link.title}</h3>
                          <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest italic">{link.description || 'Verified Link'}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={cn(
                        "text-[10px] font-bold uppercase py-1 border-none bg-white/5",
                        link.reward > 150 ? 'text-red-400' : 
                        link.reward > 100 ? 'text-yellow-400' : 'text-emerald-400'
                      )}>
                        {link.reward > 150 ? 'Hard' : link.reward > 100 ? 'Medium' : 'Easy'}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
                       <div className="flex items-center gap-3">
                          <Flame className="w-4 h-4 text-orange-500" />
                          <div>
                            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest leading-none mb-0.5">Reward per visit</p>
                            <p className="text-lg font-mono font-bold text-white tracking-tighter">{link.reward} <span className="text-sm font-bold text-indigo-400">NXS</span></p>
                          </div>
                       </div>
                       <Button 
                        onClick={() => handleClaim(link)} 
                        disabled={redirectingId !== null}
                        className="bg-white text-black hover:bg-white/90 font-bold px-8 h-12 rounded-xl"
                       >
                         {redirectingId === link.id ? 'Loading...' : 'Visit Link'}
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
        )) : (
          <div className="col-span-full py-20 text-center bg-[#1C1F26] rounded-3xl border border-white/5 border-dashed">
            <p className="text-white/40 italic">No shortlinks currently available. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
}

