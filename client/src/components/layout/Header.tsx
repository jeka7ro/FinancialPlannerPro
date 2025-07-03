import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { UserAvatar, UserAvatarWithInfo } from "@/components/ui/user-avatar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useQuery } from "@tanstack/react-query";
import type { User } from "../../../shared/schema";
import { Power } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
  onMenuToggle?: () => void;
}

export default function Header({ title, subtitle, onMenuToggle }: HeaderProps) {
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
      // Instead of reloading, invalidate the auth query to trigger re-authentication
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      // Force a page reload to reset the entire app state
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
    <header className="w-full h-28 min-h-[7rem] bg-blue-800 dark:bg-slate-800 shadow-lg flex items-center justify-between px-6 border-b border-blue-700 dark:border-slate-600">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden p-2 text-slate-200 hover:text-white"
          onClick={onMenuToggle}
        >
          <span className="text-lg">☰</span>
        </Button>
        
        <div className="flex flex-col">
          <span className="text-xl font-bold text-white">{title}</span>
          {subtitle && <span className="text-sm text-blue-200">{subtitle}</span>}
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="relative p-2 text-slate-200 hover:text-white"
        >
          <span className="text-lg">🔔</span>
          <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            3
          </span>
        </Button>
        <ThemeToggle />
        <div className="flex items-center gap-2">
          <UserAvatar user={currentUser || null} size="lg" className="h-16 w-16 rounded-full object-cover ring-2 ring-blue-200" />
          {currentUser && (
            <span className="hidden sm:inline text-base font-semibold text-white truncate max-w-xs">
              {currentUser.firstName && currentUser.lastName
                ? `${currentUser.firstName} ${currentUser.lastName}`
                : currentUser.username}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-red-300 hover:text-white hover:bg-red-500/80 focus:ring-2 focus:ring-red-400 shadow-lg shadow-red-500/50"
            title="Logout"
          >
            <Power className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
