import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReCAPTCHA from "react-google-recaptcha";
import { toast } from 'sonner';
import axios from 'axios';

export default function ShortlinkVerify() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [captchaValue, setCaptchaValue] = useState<string | null>(null);
  const [siteKey, setSiteKey] = useState<string>('');

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    // Load session data
    const unsubSession = onSnapshot(doc(db, 'link_sessions', token), (snap) => {
      if (snap.exists()) {
        setSession(snap.data());
        if (snap.data().completed) setCompleted(true);
      }
      setLoading(false);
    });

    // Load site key
    const unsubSettings = onSnapshot(doc(db, 'settings', 'config'), (snap) => {
      if (snap.exists()) setSiteKey(snap.data().captchaSiteKey || '');
    });

    return () => {
      unsubSession();
      unsubSettings();
    };
  }, [token]);

  const handleVerify = async () => {
    if (!token || !captchaValue) return;

    setVerifying(true);
    try {
      const res = await axios.post('/api/verify-link', {
        token,
        captchaResponse: captchaValue
      });

      if (res.data.success) {
        setCompleted(true);
        toast.success(`Success! Reward claimed: ${res.data.reward} NXS`);
        setTimeout(() => navigate('/'), 3000);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Verification failed");
      console.error(err);
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-white/40 text-sm animate-pulse">Initializing Nexus Verification...</p>
      </div>
    );
  }

  if (!token || !session) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6 opacity-20" />
        <h2 className="text-2xl font-bold text-white mb-2">Invalid Session</h2>
        <p className="text-white/40 mb-8">This verification link is invalid or has expired.</p>
        <Link to="/shortlinks">
          <Button variant="ghost" className="text-indigo-400 hover:text-indigo-300">Return to Shortlinks</Button>
        </Link>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="max-w-md mx-auto text-center py-20 animate-in fade-in zoom-in">
        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.1)]">
          <CheckCircle2 className="w-10 h-10 text-emerald-400" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">Verification Successful!</h2>
        <p className="text-white/40 mb-8 leading-relaxed">
          Your reward has been added to your balance. You are now being redirected to the dashboard.
        </p>
        <Button onClick={() => navigate('/')} className="bg-white text-black hover:bg-white/90 px-12 h-12 font-bold rounded-xl">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-12 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-[#1C1F26] border-white/5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-violet-600" />
          
          <CardHeader className="text-center pb-8 border-b border-white/5">
            <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-500/20">
              <ShieldCheck className="w-8 h-8 text-indigo-400" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">Final Verification</CardTitle>
            <CardDescription className="text-indigo-400/60 font-black uppercase text-[10px] tracking-[0.2em] mt-2">Step 2 of 2: Security Check</CardDescription>
          </CardHeader>
          
          <CardContent className="p-8 space-y-8">
            <div className="bg-black/20 rounded-2xl p-6 border border-white/5 text-center">
              <p className="text-sm text-white/60 leading-relaxed mb-1">
                You have successfully completed the shortlink!
              </p>
              <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest italic">
                Solve the captcha below to release your reward funds.
              </p>
            </div>

            <div className="flex justify-center p-4 bg-white/5 rounded-2xl border border-white/5 overflow-hidden">
              {siteKey ? (
                <ReCAPTCHA
                  sitekey={siteKey}
                  theme="dark"
                  onChange={setCaptchaValue}
                />
              ) : (
                <div className="text-center py-4 text-red-400 text-xs font-bold uppercase tracking-widest">
                  Error: Captcha Site Key not configured in admin panel.
                </div>
              )}
            </div>

            <Button 
              onClick={handleVerify}
              disabled={!captchaValue || verifying}
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold h-14 rounded-2xl transition-all shadow-[0_4px_20px_rgba(79,70,229,0.3)] disabled:opacity-50 disabled:shadow-none"
            >
              {verifying ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <ShieldCheck className="w-5 h-5 mr-2" />
              )}
              {verifying ? 'Verifying Results...' : 'Release Reward Coins'}
            </Button>

            <p className="text-center text-[10px] text-white/20 font-bold uppercase tracking-[0.2em]">
              Secured by NexusRewards Verification Engine
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
