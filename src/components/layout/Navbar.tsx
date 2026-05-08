import { useAuth } from '../../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Coins, User, LogOut, Menu } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Navbar() {
  const { user, profile, signIn, logout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-[#0A0C0F]/80 backdrop-blur-md border-bottom border-white/5 z-50 px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-black text-white italic">N</div>
        <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">NexusRewards</span>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full">
              <Coins className="w-4 h-4 text-yellow-400" />
              <span className="font-mono text-sm font-bold text-white">
                {profile?.points?.toLocaleString() || 0}
              </span>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 hover:opacity-80 transition-opacity outline-none">
                <Avatar className="w-8 h-8 border border-indigo-500/30">
                  <AvatarImage src={user.photoURL || undefined} />
                  <AvatarFallback className="bg-indigo-500/10 text-indigo-400 text-xs">
                    {user.displayName?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-[#1C1F26] border-white/10 text-white">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.displayName}</p>
                    <p className="text-xs leading-none text-white/50">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/5" />
                <DropdownMenuItem className="focus:bg-white/5 focus:text-white cursor-pointer gap-2">
                  <User className="w-4 h-4" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => logout()} className="focus:bg-red-500/10 focus:text-red-400 cursor-pointer gap-2 text-red-400">
                  <LogOut className="w-4 h-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <Button onClick={signIn} className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold px-6">
            Sign In
          </Button>
        )}
      </div>
    </nav>
  );
}
