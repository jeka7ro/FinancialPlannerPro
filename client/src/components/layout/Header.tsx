import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { UserAvatar, UserAvatarWithInfo } from "@/components/ui/user-avatar";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";

interface HeaderProps {
  title: string;
  subtitle?: string;
  onMenuToggle?: () => void;
}

export default function Header({ title, subtitle, onMenuToggle }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  
  const { data: currentUser } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout", {});
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      window.location.reload();
    } catch (error) {
      toast({
        title: "Logout Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="glass-morphism h-16 flex items-center justify-between px-6 border-b border-white/10">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden p-2 text-slate-300 hover:text-white hover:bg-white/10"
          onClick={onMenuToggle}
        >
          <span className="text-lg">☰</span>
        </Button>
        <div>
          <h1 className="text-xl font-semibold text-white">{title}</h1>
          {subtitle && (
            <p className="text-sm text-slate-400">{subtitle}</p>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input w-64 pl-10"
          />
          <span className="absolute left-3 top-3 text-slate-400 text-sm">🔍</span>
        </div>
        
        {/* Notifications */}
        <Button
          variant="ghost"
          size="sm"
          className="relative p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl"
        >
          <span className="text-lg">🔔</span>
          <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            3
          </span>
        </Button>
        
        {/* User Profile */}
        <div className="flex items-center space-x-3">
          {currentUser && (
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium text-white">
                {currentUser.firstName && currentUser.lastName 
                  ? `${currentUser.firstName} ${currentUser.lastName}` 
                  : currentUser.username}
              </div>
              <div className="text-xs text-slate-400 capitalize">{currentUser.role}</div>
            </div>
          )}
          <UserAvatarWithInfo 
            user={currentUser || null} 
            className="flex sm:hidden"
          />
          <UserAvatar 
            user={currentUser || null} 
            size="md"
            className="hidden sm:flex ring-2 ring-white/20"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-slate-300 hover:text-white hover:bg-white/10"
            title="Logout"
          >
            <span className="text-lg">🚪</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
