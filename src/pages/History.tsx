import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle2, History as HistoryIcon, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';

interface Claim {
  id: string;
  taskId: string;
  reward: number;
  claimedAt: any;
  taskTitle?: string;
  type?: string;
}

export default function History() {
  const { profile, loading: authLoading } = useAuth();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.uid) return;

    const q = query(
      collection(db, 'users', profile.uid, 'claims'),
      orderBy('claimedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Claim[];
      setClaims(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [profile?.uid]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon" className="text-white/40 hover:text-white">
              <ArrowLeft className="w-6 h-6" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Claim History</h1>
            <p className="text-white/40 font-medium">Your lifetime earnings activity.</p>
          </div>
        </div>
      </div>

      <Card className="bg-[#1C1F26] border-white/5 shadow-2xl overflow-hidden">
        <CardContent className="p-0">
          {claims.length > 0 ? (
            <div className="divide-y divide-white/5">
              {claims.map((claim, i) => (
                <motion.div 
                  key={claim.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="flex items-center gap-4 p-6 group hover:bg-white/[0.02] transition-colors"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-emerald-500/10 transition-colors shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 opacity-50 group-hover:opacity-100" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-bold text-white truncate">
                        {claim.taskTitle || 'Task Reward'}
                      </p>
                      {claim.type && (
                        <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-white/5 text-white/40">
                          {claim.type}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/30 font-medium">
                      {claim.claimedAt?.toDate ? formatDistanceToNow(claim.claimedAt.toDate(), { addSuffix: true }) : 'Just now'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-mono font-bold text-emerald-400">+{claim.reward.toFixed(2)}</p>
                    <p className="text-[10px] text-white/20 uppercase font-black tracking-tighter">NXS Coins</p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-6 border border-white/5 border-dashed">
                <HistoryIcon className="w-10 h-10 text-white/10" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No activity recorded</h3>
              <p className="text-sm text-white/30 max-w-xs mx-auto leading-relaxed">
                Complete tasks and ads to start building your history of earnings.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
