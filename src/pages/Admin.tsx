import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/firebase';
import { doc, updateDoc, setDoc, collection, query, getDocs, addDoc, deleteDoc, onSnapshot, increment } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ShieldCheck, LayoutDashboard, Database, Key, Save, AlertCircle, Plus, Trash2, Edit2, CheckCircle, XCircle, Coins } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function Admin() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('config');
  const [settings, setSettings] = useState({
    shrinkearn: '',
    shortlinkApiUrl: 'https://shrinkme.io/api',
    ouo: '',
    minWithdrawal: 1000,
    maintenanceMode: false,
    captchaSiteKey: '6LeklewsAAAAAA4owo2vnYC2sWt0nd-4RjWMSaSX',
    captchaSecretKey: '6LeklewsAAAAAD6ICI587fyBwMIfCiZUsNE3onVv',
    adScript: '',
    faucetPayKey: '',
    faucetPayCurrency: 'BTC',
  });

  const [ptcAds, setPtcAds] = useState<any[]>([]);
  const [newAd, setNewAd] = useState({ title: '', description: '', reward: 0, duration: 10, url: '' });

  const [bannerAds, setBannerAds] = useState<any[]>([]);
  const [newBannerAd, setNewBannerAd] = useState({ imageUrl: '', linkUrl: '', position: 'header' as const, isActive: true });
  const [newShortlink, setNewShortlink] = useState({ title: '', reward: 120, description: '', provider: 'shrinkme', apiKey: '' });
  const [withdrawals, setWithdrawals] = useState<any[]>([]);

  useEffect(() => {
    if (!profile?.isAdmin) return;

    // Load Settings
    const unsubSettings = onSnapshot(doc(db, 'settings', 'config'), (snap) => {
      if (snap.exists()) setSettings(snap.data() as any);
    });

    // Load PTC Ads
    const unsubAds = onSnapshot(collection(db, 'tasks'), (snap) => {
      setPtcAds(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // Load Banner Ads
    const unsubBannerAds = onSnapshot(collection(db, 'ads'), (snap) => {
      setBannerAds(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // Load Withdrawals
    const unsubWithdrawals = onSnapshot(collection(db, 'withdrawals'), (snap) => {
      setWithdrawals(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubSettings();
      unsubAds();
      unsubBannerAds();
      unsubWithdrawals();
    };
  }, [profile?.isAdmin]);

  const handleUpdateWithdrawal = async (id: string, status: 'PAID' | 'REJECTED') => {
    try {
      await updateDoc(doc(db, 'withdrawals', id), { status });
      toast.success(`Withdrawal marked as ${status}`);
    } catch (err) {
      toast.error("Process failed");
    }
  };

  const handleSaveSettings = async () => {
    try {
      await setDoc(doc(db, 'settings', 'config'), settings, { merge: true });
      toast.success("System configurations saved!");
    } catch (err) {
      toast.error("Failed to save settings");
    }
  };

  const handleAddAd = async () => {
    if (!newAd.title || !newAd.url) return;
    try {
      const adData = { ...newAd, type: 'PTC', id: Math.random().toString(36).substring(7) };
      await setDoc(doc(db, 'tasks', adData.id), adData);
      setNewAd({ title: '', description: '', reward: 0, duration: 10, url: '' });
      toast.success("PTC Ad added successfully!");
    } catch (err) {
      toast.error("Failed to add ad");
    }
  };

  const handleAddBannerAd = async () => {
    if (!newBannerAd.imageUrl || !newBannerAd.linkUrl) return;
    try {
      await addDoc(collection(db, 'ads'), {
        ...newBannerAd,
        createdAt: new Date().toISOString()
      });
      setNewBannerAd({ imageUrl: '', linkUrl: '', position: 'header', isActive: true });
      toast.success("Banner Ad added successfully!");
    } catch (err) {
      toast.error("Failed to add banner ad");
    }
  };

  const handleAddShortlink = async () => {
    if (!newShortlink.title || !newShortlink.reward) return;
    try {
      const id = Math.random().toString(36).substring(7);
      await setDoc(doc(db, 'tasks', id), {
        ...newShortlink,
        id,
        type: 'SHORTLINK',
        provider: newShortlink.provider || 'shrinkme',
        isActive: true,
        createdAt: new Date().toISOString()
      });
      setNewShortlink({ title: '', reward: 120, description: '', provider: 'shrinkme', apiKey: '' });
      toast.success("Shortlink added successfully!");
    } catch (err) {
      toast.error("Failed to add shortlink");
    }
  };

  const handleDeleteBannerAd = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'ads', id));
      toast.success("Banner Ad deleted");
    } catch (err) {
      toast.error("Failed to delete banner ad");
    }
  };

  const handleDeleteAd = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'tasks', id));
      toast.success("Ad deleted");
    } catch (err) {
      toast.error("Failed to delete ad");
    }
  };

  if (!profile?.isAdmin) return null;

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Nexus Command</h1>
          <p className="text-white/40">Full system override and management panel.</p>
        </div>
        <div className="flex items-center gap-4 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-xl">
          <ShieldCheck className="w-5 h-5 text-indigo-400" />
          <span className="text-xs font-bold text-white uppercase tracking-widest">Admin Authenticated</span>
        </div>
      </div>

      <Tabs defaultValue="config" className="w-full">
        <TabsList className="bg-[#1C1F26] border-white/5 p-1 mb-8">
          <TabsTrigger value="config" className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white uppercase text-[10px] font-bold tracking-widest px-8">Configuration</TabsTrigger>
          <TabsTrigger value="ptc" className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white uppercase text-[10px] font-bold tracking-widest px-8">PTC Ads</TabsTrigger>
          <TabsTrigger value="shortlinks" className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white uppercase text-[10px] font-bold tracking-widest px-8">Shortlinks</TabsTrigger>
          <TabsTrigger value="banners" className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white uppercase text-[10px] font-bold tracking-widest px-8">Banner Ads</TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white uppercase text-[10px] font-bold tracking-widest px-8">Users & Data</TabsTrigger>
          <TabsTrigger value="payouts" className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white uppercase text-[10px] font-bold tracking-widest px-8">Withdrawals</TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-[#1C1F26] border-white/5">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-indigo-400" />
                  <div>
                    <CardTitle className="text-lg">Shortlink Configuration</CardTitle>
                    <CardDescription>Setup your API keys for ShrinkMe.io or ShrinkEarn.com</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-4 mb-4">
                  <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <ShieldCheck className="w-3 h-3" /> Setup Guide
                  </h4>
                  <ul className="text-[10px] space-y-1.5 text-white/60">
                    <li>1. Go to <a href="https://shrinkme.io" className="text-indigo-400 hover:underline" target="_blank" rel="noreferrer">ShrinkMe.io</a> or ShrinkEarn settings</li>
                    <li>2. Copy your <span className="font-bold text-white">API Token</span></li>
                    <li>3. Paste it in the <span className="font-bold text-white">API Secret Token</span> field below</li>
                    <li>4. Set the <span className="font-bold text-white">API URL</span> (e.g. <code>https://shrinkme.io/api</code>)</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Base API URL</label>
                  <Input 
                    value={settings.shortlinkApiUrl} 
                    onChange={e => setSettings({...settings, shortlinkApiUrl: e.target.value})} 
                    className="bg-black/20 border-white/10 font-mono"
                    placeholder="https://shrinkme.io/api"
                  />
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-[9px] h-6 bg-white/5 hover:bg-white/10 text-white/40"
                      onClick={() => setSettings({...settings, shortlinkApiUrl: 'https://shrinkme.io/api'})}
                    >
                      Use ShrinkMe
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-[9px] h-6 bg-white/5 hover:bg-white/10 text-white/40"
                      onClick={() => setSettings({...settings, shortlinkApiUrl: 'https://shrinkearn.com/api'})}
                    >
                      Use ShrinkEarn
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">API Secret Token</label>
                  <Input 
                    type="password"
                    value={settings.shrinkearn} 
                    onChange={e => setSettings({...settings, shrinkearn: e.target.value})} 
                    className="bg-black/20 border-white/10 font-mono"
                    placeholder="Your API Token"
                  />
                </div>

                <Button onClick={handleSaveSettings} className="w-full bg-indigo-500 hover:bg-indigo-600 font-bold h-12 shadow-[0_4px_20px_rgba(79,70,229,0.2)]">
                  <Save className="w-4 h-4 mr-2" /> Save Shortlink Settings
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-[#1C1F26] border-white/5">
              <CardHeader>
                <CardTitle className="text-lg">Security & Ads</CardTitle>
                <CardDescription>Global scripts and verification keys</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">ReCAPTCHA Site Key</label>
                  <Input 
                    value={settings.captchaSiteKey} 
                    onChange={e => setSettings({...settings, captchaSiteKey: e.target.value})} 
                    className="bg-black/20 border-white/10 font-mono"
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">ReCAPTCHA Secret Key</label>
                  <Input 
                    type="password"
                    value={settings.captchaSecretKey} 
                    onChange={e => setSettings({...settings, captchaSecretKey: e.target.value})} 
                    className="bg-black/20 border-white/10 font-mono"
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Global Ad Script (Inject before {'</body>'})</label>
                  <Input 
                    value={settings.adScript} 
                    onChange={e => setSettings({...settings, adScript: e.target.value})} 
                    placeholder="Paste ad script here..."
                    className="bg-black/20 border-white/10 h-24 font-mono"
                  />
                </div>
                <Button onClick={handleSaveSettings} variant="outline" className="w-full border-white/10 hover:bg-white/5 font-bold h-12">
                   Update External Config
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-[#1C1F26] border-white/5">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Coins className="w-5 h-5 text-yellow-400" />
                  <div>
                    <CardTitle className="text-lg">Payment Gateway (FaucetPay)</CardTitle>
                    <CardDescription>Configure automated withdrawals</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">FaucetPay API Key</label>
                  <Input 
                    type="password"
                    value={settings.faucetPayKey} 
                    onChange={e => setSettings({...settings, faucetPayKey: e.target.value})} 
                    className="bg-black/20 border-white/10 font-mono"
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Default Currency</label>
                  <Input 
                    value={settings.faucetPayCurrency} 
                    onChange={e => setSettings({...settings, faucetPayCurrency: e.target.value})} 
                    placeholder="BTC, DOGE, LTC..."
                    className="bg-black/20 border-white/10"
                  />
                </div>
                <Button onClick={handleSaveSettings} className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold h-12">
                  <Save className="w-4 h-4 mr-2" /> Save Payment Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ptc" className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
          <Card className="bg-[#1C1F26] border-white/5">
            <CardHeader>
              <CardTitle>Create New PTC Advertisement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <Input placeholder="Ad Title" value={newAd.title} onChange={e => setNewAd({...newAd, title: e.target.value})} className="bg-black/20 border-white/10" />
                <Input placeholder="Reward (NXS)" type="number" value={newAd.reward} onChange={e => setNewAd({...newAd, reward: Number(e.target.value)})} className="bg-black/20 border-white/10" />
                <Input placeholder="Duration (seconds)" type="number" value={newAd.duration} onChange={e => setNewAd({...newAd, duration: Number(e.target.value)})} className="bg-black/20 border-white/10" />
                <Input placeholder="Destination URL" value={newAd.url} onChange={e => setNewAd({...newAd, url: e.target.value})} className="bg-black/20 border-white/10" />
                <Input placeholder="Short Description" className="col-span-2 bg-black/20 border-white/10" value={newAd.description} onChange={e => setNewAd({...newAd, description: e.target.value})} />
              </div>
              <Button onClick={handleAddAd} className="w-full bg-indigo-500 font-bold h-12">
                <Plus className="w-4 h-4 mr-2" /> Publish Ad
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-[#1C1F26] border-white/5">
            <CardContent className="p-0">
               <Table>
                 <TableHeader className="bg-white/5">
                   <TableRow className="border-white/5">
                     <TableHead className="text-[10px] font-bold uppercase text-white/40">Title</TableHead>
                     <TableHead className="text-[10px] font-bold uppercase text-white/40">Reward</TableHead>
                     <TableHead className="text-[10px] font-bold uppercase text-white/40">Duration</TableHead>
                     <TableHead className="text-[10px] font-bold uppercase text-white/40 text-right">Actions</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {ptcAds.filter(ad => ad.type === 'PTC').map(ad => (
                     <TableRow key={ad.id} className="border-white/5 hover:bg-white/[0.02]">
                       <TableCell className="font-medium">{ad.title}</TableCell>
                       <TableCell className="font-mono text-indigo-400">{ad.reward} NXS</TableCell>
                       <TableCell>{ad.duration}s</TableCell>
                       <TableCell className="text-right">
                         <div className="flex justify-end gap-2">
                           <Button size="icon" variant="ghost" className="h-8 w-8 text-white/20 hover:text-white">
                             <Edit2 className="h-4 w-4" />
                           </Button>
                           <Button size="icon" variant="ghost" onClick={() => handleDeleteAd(ad.id)} className="h-8 w-8 text-red-500/50 hover:text-red-500">
                             <Trash2 className="h-4 w-4" />
                           </Button>
                         </div>
                       </TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shortlinks" className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 bg-[#1C1F26] border-white/5 order-2 lg:order-1">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <LayoutDashboard className="w-5 h-5 text-indigo-400" />
                  <div>
                    <CardTitle className="text-lg">Create New Shortlink Wall</CardTitle>
                    <CardDescription>Setup a new earning source for your users</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-1.5">
                      <LayoutDashboard className="w-3 h-3 text-indigo-400/60" /> Provider Display Title
                    </label>
                    <Input 
                      placeholder="e.g. ShrinkMe Premium" 
                      value={newShortlink.title} 
                      onChange={e => setNewShortlink({...newShortlink, title: e.target.value})} 
                      className="bg-black/20 border-white/10 h-11" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-1.5">
                      <Coins className="w-3 h-3 text-yellow-400/60" /> Reward per Visit (NXS)
                    </label>
                    <Input 
                      type="number" 
                      value={newShortlink.reward} 
                      onChange={e => setNewShortlink({...newShortlink, reward: Number(e.target.value)})} 
                      className="bg-black/20 border-white/10 h-11 font-mono text-yellow-400" 
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-1.5 mb-3">
                      <CheckCircle className="w-3 h-3 text-indigo-400/60" /> Select Provider Type
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => setNewShortlink({...newShortlink, provider: 'shrinkme'})}
                        className={cn(
                          "flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200 gap-2",
                          newShortlink.provider === 'shrinkme' 
                            ? "bg-indigo-500/10 border-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.1)]" 
                            : "bg-black/20 border-white/5 text-white/40 hover:border-white/20"
                        )}
                      >
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center font-bold text-indigo-400">Sm</div>
                        <span className="text-xs font-bold uppercase tracking-widest">ShrinkMe.io</span>
                      </button>
                      
                      <button 
                        onClick={() => setNewShortlink({...newShortlink, provider: 'shrinkearn'})}
                        className={cn(
                          "flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200 gap-2",
                          newShortlink.provider === 'shrinkearn' 
                            ? "bg-indigo-500/10 border-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.1)]" 
                            : "bg-black/20 border-white/5 text-white/40 hover:border-white/20"
                        )}
                      >
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center font-bold text-indigo-400">Se</div>
                        <span className="text-xs font-bold uppercase tracking-widest">ShrinkEarn.com</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-1.5">
                      <Key className="w-3 h-3 text-red-400/60" /> Individual API Key (Optional)
                    </label>
                    <Input 
                      type="password"
                      placeholder="Leave empty to use global setting" 
                      value={newShortlink.apiKey} 
                      onChange={e => setNewShortlink({...newShortlink, apiKey: e.target.value})} 
                      className="bg-black/20 border-white/10 font-mono h-11" 
                    />
                    <p className="text-[9px] text-white/20 italic">Override the global API token for this specific shortlink wall.</p>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-1.5">
                      <Edit2 className="w-3 h-3 text-white/40" /> Catchy Description
                    </label>
                    <Input 
                      placeholder="e.g. High payout, instant verification!" 
                      value={newShortlink.description} 
                      onChange={e => setNewShortlink({...newShortlink, description: e.target.value})} 
                      className="bg-black/20 border-white/10 h-11" 
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleAddShortlink} 
                  className="w-full bg-indigo-500 hover:bg-indigo-600 font-bold h-12 shadow-[0_4px_20px_rgba(79,70,229,0.3)] transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Shortlink Wall
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-6 order-1 lg:order-2">
              <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2 mb-2">
                <CheckCircle className="w-3 h-3 text-indigo-400" /> Active Walls ({ptcAds.filter(a => a.type === 'SHORTLINK').length})
              </h4>
              <div className="space-y-4">
                {ptcAds.filter(a => a.type === 'SHORTLINK').map((link, idx) => (
                  <div 
                    key={link.id} 
                    className="p-4 bg-[#1C1F26] border border-white/5 rounded-2xl relative overflow-hidden group hover:border-indigo-500/50 transition-all duration-300 animate-in slide-in-from-right-4"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <div className="absolute top-0 right-0 p-3 flex gap-2">
                      <Button size="icon" variant="ghost" onClick={() => handleDeleteAd(link.id)} className="h-7 w-7 text-white/20 hover:text-red-500 hover:bg-red-500/10 transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center font-bold text-indigo-400 text-lg border border-indigo-500/20">
                        {link.title[0]}
                      </div>
                      <div className="flex-1 pr-6">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-white">{link.title}</h3>
                          <Badge variant="outline" className="text-[8px] bg-indigo-500/10 text-indigo-400 border-indigo-500/20 uppercase">
                            {link.provider || 'sm'}
                          </Badge>
                        </div>
                        <p className="text-[10px] text-white/40 mb-2 line-clamp-1">{link.description || 'No description provided'}</p>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 text-[10px] font-bold text-yellow-400">
                             <Coins className="w-3 h-3" /> {link.reward} NXS
                          </span>
                          <span className="text-[10px] text-white/20">•</span>
                          <span className="text-[9px] text-white/30 font-mono">ID: {link.id}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {ptcAds.filter(a => a.type === 'SHORTLINK').length === 0 && (
                  <div className="p-8 border border-dashed border-white/10 rounded-2xl text-center">
                    <AlertCircle className="w-8 h-8 text-white/10 mx-auto mb-2" />
                    <p className="text-[10px] text-white/20 uppercase tracking-widest font-bold">No walls created yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="banners" className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
          <Card className="bg-[#1C1F26] border-white/5">
            <CardHeader>
              <CardTitle>Create New Banner Advertisement</CardTitle>
              <CardDescription>Manage display ads for various placements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Image URL</label>
                  <Input placeholder="https://..." value={newBannerAd.imageUrl} onChange={e => setNewBannerAd({...newBannerAd, imageUrl: e.target.value})} className="bg-black/20 border-white/10" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Destination URL</label>
                  <Input placeholder="https://..." value={newBannerAd.linkUrl} onChange={e => setNewBannerAd({...newBannerAd, linkUrl: e.target.value})} className="bg-black/20 border-white/10" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Position</label>
                  <select 
                    value={newBannerAd.position} 
                    onChange={e => setNewBannerAd({...newBannerAd, position: e.target.value as any})}
                    className="w-full bg-black/20 border-white/10 rounded-md h-10 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="header" className="bg-[#1C1F26]">Header</option>
                    <option value="bottom" className="bg-[#1C1F26]">Bottom</option>
                    <option value="left" className="bg-[#1C1F26]">Left Sidebar</option>
                    <option value="right" className="bg-[#1C1F26]">Right Sidebar</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <Button onClick={handleAddBannerAd} className="w-full bg-indigo-500 font-bold h-10">
                    <Plus className="w-4 h-4 mr-2" /> Add Banner
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bannerAds.map(ad => (
                  <div key={ad.id} className="bg-black/20 border border-white/5 rounded-xl p-4 relative group">
                    <div className="mb-4 aspect-[4/1] bg-black/40 rounded-lg overflow-hidden border border-white/5">
                      <img src={ad.imageUrl} alt="Ad Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{ad.position}</p>
                        <Badge variant="outline" className={cn("text-[9px] uppercase mt-1", ad.isActive ? "text-emerald-400 border-emerald-400/20" : "text-white/20 border-white/5")}>
                          {ad.isActive ? 'Active' : 'Paused'}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button size="icon" variant="ghost" onClick={() => handleDeleteBannerAd(ad.id)} className="h-8 w-8 text-red-500/50 hover:text-red-500 hover:bg-red-500/10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="payouts" className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
           <Card className="bg-[#1C1F26] border-white/5">
              <CardContent className="p-0">
                {withdrawals.length === 0 ? (
                  <div className="p-12 text-center text-white/20">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-10" />
                    <p className="text-sm font-medium italic">No withdrawal requests found.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader className="bg-white/5">
                      <TableRow className="border-white/5">
                        <TableHead className="text-[10px] font-bold uppercase text-white/40">User ID</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase text-white/40">Amount</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase text-white/40">Method</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase text-white/40">Status</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase text-white/40 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {withdrawals.map((w) => (
                        <TableRow key={w.id} className="border-white/5">
                          <TableCell className="font-mono text-[10px]">{w.userId}</TableCell>
                          <TableCell className="font-bold text-yellow-400">{w.amount} NXS</TableCell>
                          <TableCell className="text-xs">{w.method} ({w.address})</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn(
                              "text-[10px] uppercase",
                              w.status === 'PENDING' ? "text-yellow-500 border-yellow-500/20" : 
                              w.status === 'PAID' ? "text-emerald-500 border-emerald-500/20" : "text-red-500 border-red-500/20"
                            )}>
                              {w.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {w.status === 'PENDING' && (
                              <div className="flex justify-end gap-2">
                                <Button size="sm" onClick={() => handleUpdateWithdrawal(w.id, 'PAID')} className="bg-emerald-500 hover:bg-emerald-600 h-8 text-[10px]">Approve</Button>
                                <Button size="sm" onClick={() => handleUpdateWithdrawal(w.id, 'REJECTED')} variant="destructive" className="h-8 text-[10px]">Deny</Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
