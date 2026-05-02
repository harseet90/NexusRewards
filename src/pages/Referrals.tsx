import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users2, Link2, Gift, Target, Share2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Referrals() {
  const { profile } = useAuth();
  const [stats] = useState({
    total: 0,
    active: 0,
    earned: 0
  });

  const referralLink = `${window.location.origin}/?ref=${profile?.referralCode}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success("Referral link copied to clipboard!");
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Referral Program</h1>
        <p className="text-white/40">Earn passive income by inviting your friends to NexusRewards.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="bg-[#1C1F26] border-white/5 p-8 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12 group-hover:scale-110 transition-transform">
               <Link2 className="w-48 h-48 text-indigo-500" />
             </div>
             
             <div className="relative z-10">
               <h3 className="text-xl font-bold mb-4">Your Referral Link</h3>
               <p className="text-sm text-white/40 mb-6 max-w-md">
                 Share this link with your friends and earn <span className="text-indigo-400 font-bold">10% commission</span> on every single coin they earn, forever.
               </p>
               
               <div className="flex gap-2 p-2 bg-black/40 rounded-2xl border border-white/5">
                 <Input 
                   readOnly 
                   value={referralLink}
                   className="bg-transparent border-none focus-visible:ring-0 text-white font-mono text-sm"
                 />
                 <Button onClick={copyToClipboard} className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold h-12 px-8 rounded-xl shrink-0">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                 </Button>
               </div>
             </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Total Referrals', value: stats.total, icon: Users2 },
              { label: 'Active Today', value: stats.active, icon: Target },
              { label: 'Earned from Ref', value: `${stats.earned.toFixed(2)} NXS`, icon: Gift },
            ].map((stat, i) => (
              <Card key={i} className="bg-[#1C1F26] border-white/5 border-dashed">
                <CardContent className="p-6 text-center">
                  <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <stat.icon className="w-5 h-5 text-indigo-400/50" />
                  </div>
                  <p className="text-2xl font-black text-white leading-none mb-1">{stat.value}</p>
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <Card className="bg-[#1C1F26] border-white/5">
            <CardHeader>
              <CardTitle className="text-base">Rules & Ethics</CardTitle>
              <CardDescription className="text-xs">Follow these to keep your account safe</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                "Only one account per IP address",
                "Don't spam your link on Discord/Twitter",
                "Referrals must be active to earn bonus",
                "Bonuses are credited instantly"
              ].map((rule, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <p className="text-xs text-white/50 leading-relaxed font-medium">{rule}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="p-8 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-center">
             <Gift className="w-8 h-8 text-indigo-400 mx-auto mb-4" />
             <h4 className="font-bold text-white mb-2">Milestone Rewards</h4>
             <p className="text-xs text-white/40 mb-4">Refer 50 friends to unlock the "Master Recruiter" badge and 5,000 NXS.</p>
             <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 w-[10%]" />
             </div>
             <p className="text-[10px] font-bold text-white/20 mt-2">5 / 50 FRIENDS</p>
          </div>
        </div>
      </div>
    </div>
  );
}
