import { Link, useLocation } from 'react-router-dom';
import { Home, Zap, ExternalLink, ClipboardList, BarChart3, Users, ShieldAlert, Award, Clock, LogOut, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import { useAuth } from '../../hooks/useAuth';

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
  const { logout } = useAuth();

  return (
    <div className="w-64 bg-[#0A0C0F] border-r border-white/5 flex flex-col h-screen fixed left-0 top-0 pt-20 shadow-[10px_0_30px_rgba(0,0,0,0.5)] z-40">
      <div className="flex-1 px-4 space-y-1 py-4 overflow-y-auto custom-scrollbar">
        <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] px-3 mb-4">Main Menu</div>
        {navItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 group relative overflow-hidden",
              location.pathname === item.href 
                ? "bg-gradient-to-r from-indigo-500/20 to-purple-500/10 text-indigo-400 shadow-[inset_0_0_20px_rgba(99,102,241,0.1)] border border-indigo-500/30" 
                : "text-white/40 hover:text-white hover:bg-white/5"
            )}
          >
            {location.pathname === item.href && (
              <motion.div 
                layoutId="active-pill" 
                className="absolute left-0 w-1 h-6 bg-indigo-500 rounded-r-full"
              />
            )}
            <item.icon className={cn(
              "w-4 h-4 transition-transform group-hover:scale-110",
              location.pathname === item.href ? "text-indigo-400" : "text-white/20 group-hover:text-white/60"
            )} />
            {item.label}
          </Link>
        ))}

        {isAdmin && (
          <>
            <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] px-3 mt-8 mb-4">Management</div>
            <Link
              to="/admin.portal"
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 group",
                location.pathname === "/admin.portal" 
                  ? "bg-red-500/10 text-red-400 border border-red-500/20" 
                  : "text-white/40 hover:text-red-400 hover:bg-red-500/5"
              )}
            >
              <ShieldAlert className="w-4 h-4" />
              Admin Portal
            </Link>
          </>
        )}
      </div>
      
      <div className="p-6 border-t border-white/5 space-y-4">
        <button
          onClick={() => logout()}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-bold text-red-400/60 hover:text-red-400 hover:bg-red-500/5 transition-all duration-300 group"
        >
          <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Sign Out
        </button>

        <div className="bg-gradient-to-br from-indigo-500/10 to-purple-600/10 border border-indigo-500/20 rounded-2xl p-5 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Zap className="w-20 h-20 text-white" />
          </div>
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-4 h-4 text-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
            <span className="text-xs font-black text-white uppercase tracking-wider">Earn Booster</span>
          </div>
          <p className="text-[11px] text-white/40 leading-relaxed font-medium">
            Invite friends to earn <span className="text-emerald-400 font-bold">10% commission</span> lifetime!
          </p>
        </div>
      </div>
    </div>
  );
}
