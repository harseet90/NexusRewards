import { Link, useLocation } from 'react-router-dom';
import { Home, Zap, ExternalLink, ClipboardList, BarChart3, Users, ShieldAlert, Award, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: Home, label: 'Dashboard', href: '/' },
  { icon: Clock, label: 'PTC Ads', href: '/ptc' },
  { icon: ExternalLink, label: 'Shortlinks', href: '/shortlinks' },
  { icon: ClipboardList, label: 'Surveys & Offers', href: '/surveys' },
  { icon: Zap, label: 'Challenges', href: '/challenges' },
  { icon: BarChart3, label: 'Leaderboard', href: '/leaderboard' },
  { icon: Users, label: 'Referrals', href: '/referrals' },
];

export function Sidebar({ isAdmin }: { isAdmin?: boolean }) {
  const location = useLocation();

  return (
    <div className="w-64 bg-[#0A0C0F] border-r border-white/5 flex flex-col h-screen fixed left-0 top-0 pt-20">
      <div className="flex-1 px-4 space-y-1 py-4 overflow-y-auto">
        <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-3 mb-2">Main Menu</div>
        {navItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
              location.pathname === item.href 
                ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" 
                : "text-white/60 hover:text-white hover:bg-white/5"
            )}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </Link>
        ))}
      </div>
      
      <div className="p-4 border-t border-white/5">
        <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold text-white">Earn Booster</span>
          </div>
          <p className="text-[10px] text-white/50 leading-relaxed">
            Invite friends to earn 10% commission on every claim!
          </p>
        </div>
      </div>
    </div>
  );
}
