import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

interface BannerAdProps {
  position: 'header' | 'bottom' | 'left' | 'right';
  className?: string;
}

export function AdBanner({ position, className }: BannerAdProps) {
  const [ads, setAds] = useState<any[]>([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  useEffect(() => {
    const q = query(
      collection(db, 'ads'),
      where('position', '==', position),
      where('isActive', '==', true)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAds(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [position]);

  useEffect(() => {
    if (ads.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % ads.length);
    }, 10000); // Rotate every 10 seconds

    return () => clearInterval(interval);
  }, [ads]);

  if (ads.length === 0) return null;

  const currentAd = ads[currentAdIndex];

  return (
    <div className={cn("relative overflow-hidden group", className)}>
      <AnimatePresence mode="wait">
        <motion.a
          key={currentAd.id}
          href={currentAd.linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="block w-full h-full"
        >
          <img 
            src={currentAd.imageUrl} 
            alt="Advertisement" 
            className="w-full h-full object-cover rounded-xl shadow-lg border border-white/5 transition-transform duration-500 group-hover:scale-[1.02]" 
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-black/50 backdrop-blur-md rounded border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[8px] font-bold text-white/50 uppercase tracking-widest">AD</span>
          </div>
        </motion.a>
      </AnimatePresence>
    </div>
  );
}
