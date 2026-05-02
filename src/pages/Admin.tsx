import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/firebase';
import { doc, updateDoc, setDoc, collection, query, getDocs, addDoc, deleteDoc, onSnapshot, increment } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ShieldCheck, LayoutDashboard, Database, Key, Save, AlertCircle, Plus, Trash2, Edit2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function Admin() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('config');
  const [settings, setSettings] = useState({
    shrinkearn: '',
    ouo: '',
    minWithdrawal: 1000,
    maintenanceMode: false,
    captchaSiteKey: '',
    adScript: '',
    faucetPayKey: '',
    faucetPayCurrency: 'BTC',
  });

  const [ptcAds, setPtcAds] = useState<any[]>([]);
  const [newAd, setNewAd] = useState({ title: '', description: '', reward: 0, duration: 10, url: '' });

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

    return () => {
      unsubSettings();
      unsubAds();
    };
  }, [profile?.isAdmin]);

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
          <TabsTrigger value="ptc" className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white uppercase text-[10px] font-bold tracking-widest px-8">PTC Management</TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white uppercase text-[10px] font-bold tracking-widest px-8">Users & Data</TabsTrigger>
          <TabsTrigger value="payouts" className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white uppercase text-[10px] font-bold tracking-widest px-8">Withdrawals</TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-[#1C1F26] border-white/5">
              <CardHeader>
                <CardTitle className="text-lg">API Integrations</CardTitle>
                <CardDescription>Manage your link shortener providers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">ShrinkEarn API Key</label>
                  <Input 
                    value={settings.shrinkearn} 
                    onChange={e => setSettings({...settings, shrinkearn: e.target.value})} 
                    className="bg-black/20 border-white/10 font-mono"
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Ouo.io API Key</label>
                  <Input 
                    value={settings.ouo} 
                    onChange={e => setSettings({...settings, ouo: e.target.value})} 
                    className="bg-black/20 border-white/10 font-mono"
                  />
                </div>
                <Button onClick={handleSaveSettings} className="w-full bg-indigo-500 hover:bg-indigo-600 font-bold h-12">
                  <Save className="w-4 h-4 mr-2" /> Save API Keys
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
                   {ptcAds.map(ad => (
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
        
        <TabsContent value="payouts" className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
           <Card className="bg-[#1C1F26] border-white/5">
              <CardContent className="p-12 text-center text-white/20">
                 <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-10" />
                 <p className="text-sm font-medium italic">Withdrawal request history will appear here once users start claiming.</p>
              </CardContent>
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
