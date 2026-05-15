import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/firebase';
import { collection, query, getDocs, doc, setDoc, updateDoc, increment, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Clock, MousePointer2, CheckCircle2, ShieldCheck, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

interface PTCAd {
  id: string;
  title: string;
  description: string;
  reward: number;
  duration: number;
  url: string;
}

export default function PTC() {
  const { profile } = useAuth();
  const [ads, setAds] = useState<PTCAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeAd, setActiveAd] = useState<PTCAd | null>(null);
  const [timer, setTimer] = useState(0);
  const [completedAds, setCompletedAds] = useState<string[]>([]);
  const [showCaptcha, setShowCaptcha] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'tasks'), (snap) => {
      const data = snap.docs
        .filter(d => d.data().type === 'PTC')
        .map(d => ({ id: d.id, ...d.data() } as PTCAd));
      setAds(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeAd && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (activeAd && timer === 0 && !showCaptcha) {
      setShowCaptcha(true);
    }
    return () => clearInterval(interval);
  }, [activeAd, timer, showCaptcha]);

  const handleStartAd = (ad: PTCAd) => {
    if (completedAds.includes(ad.id)) return;
    setActiveAd(ad);
    setTimer(ad.duration);
    window.open(ad.url, '_blank');
    toast.info(`Stay on this page for ${ad.duration} seconds to claim reward...`, { duration: 5000 });
  };

  const handleCompleteAd = async () => {
    if (!activeAd || !profile) return;
    
    try {
      const userRef = doc(db, 'users', profile.uid);
      const claimRef = doc(collection(db, 'users', profile.uid, 'claims'));
      
      await setDoc(claimRef, {
        userId: profile.uid,
        taskId: activeAd.id,
        reward: activeAd.reward,
        claimedAt: new Date().toISOString()
      });

      await updateDoc(userRef, {
        points: increment(activeAd.reward),
        lastActiveAt: new Date().toISOString()
      });

      setCompletedAds((prev) => [...prev, activeAd.id]);
      toast.success(`Succesfully claimed ${activeAd.reward} Coins!`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to claim reward. Please try again.");
    } finally {
      setActiveAd(null);
      setShowCaptcha(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">PTC Advertisements</h1>
          <p className="text-white/40">Watch short ads to earn instant coins.</p>
        </div>
        <div className="bg-[#1C1F26] border border-white/5 rounded-xl px-4 py-2 flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Available</p>
            <p className="text-sm font-black text-white">{ads.length - completedAds.length} Ads</p>
          </div>
          <div className="w-px h-8 bg-white/5" />
          <div className="text-right">
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Total Reward</p>
            <p className="text-sm font-black text-indigo-400">
              {ads.reduce((acc, ad) => acc + ad.reward, 0).toFixed(2)} NXS
            </p>
          </div>
        </div>
      </div>

      <Dialog open={showCaptcha} onOpenChange={(open) => !open && setShowCaptcha(false)}>
        <DialogContent className="bg-[#1C1F26] border-white/10 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-indigo-400" />
              Claim Reward
            </DialogTitle>
            <DialogDescription className="text-white/40">
              Reward: {activeAd?.reward} NXS. Click the button below to confirm.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              onClick={handleCompleteAd}
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold h-12"
            >
              Claim Reward
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AnimatePresence>
        {activeAd && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="bg-indigo-600 border-none shadow-[0_0_50px_rgba(79,70,229,0.3)]">
              <CardContent className="p-6 flex items-center justify-between text-white">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Clock className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Viewing: {activeAd.title}</h3>
                    <p className="text-white/70 text-sm">Don't close this tab! Rewarding in {timer}s</p>
                  </div>
                </div>
                <div className="text-4xl font-black opacity-30 select-none">
                  {Math.floor((timer / activeAd.duration) * 100)}%
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ads.map((ad, i) => {
          const isCompleted = completedAds.includes(ad.id);
          return (
            <motion.div
              key={ad.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className={cn(
                "bg-[#1C1F26] border-white/5 transition-all group overflow-hidden",
                isCompleted ? "opacity-50 grayscale" : "hover:border-indigo-500/30 hover:translate-y-[-4px]"
              )}>
                <CardContent className="p-0">
                  <div className="p-6 pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-[10px] font-bold uppercase py-0.5">
                        {ad.duration} Seconds
                      </Badge>
                      <div className="flex items-center gap-1 text-yellow-400">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Verified</span>
                      </div>
                    </div>
                    <h3 className="font-bold text-white mb-2 line-clamp-1">{ad.title}</h3>
                    <p className="text-xs text-white/40 line-clamp-2 h-8 leading-relaxed">
                      {ad.description}
                    </p>
                  </div>
                  
                  <div className="px-6 py-4 bg-black/20 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-0.5">Reward</p>
                      <p className="font-mono font-bold text-indigo-400">{ad.reward.toFixed(2)} NXS</p>
                    </div>
                    <Button 
                      disabled={isCompleted || !!activeAd}
                      onClick={() => handleStartAd(ad)}
                      className={cn(
                        "font-bold py-5 px-6 rounded-xl transition-all",
                        isCompleted 
                          ? "bg-green-500/20 text-green-500 hover:bg-green-500/20 border border-green-500/20" 
                          : "bg-indigo-500 hover:bg-indigo-600 text-white"
                      )}
                    >
                      {isCompleted ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Done
                        </>
                      ) : (
                        <>
                          <MousePointer2 className="w-4 h-4 mr-2" />
                          Watch
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
