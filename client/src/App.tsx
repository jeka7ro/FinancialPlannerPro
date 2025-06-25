import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Companies from "@/pages/Companies";
import Locations from "@/pages/Locations";
import Providers from "@/pages/Providers";
import Cabinets from "@/pages/Cabinets";
import GameMixes from "@/pages/GameMixes";
import Slots from "@/pages/Slots";
import Invoices from "@/pages/Invoices";
import RentManagement from "@/pages/RentManagement";
import Users from "@/pages/Users";
import Legal from "@/pages/Legal";
import ONJN from "@/pages/ONJN";
import Settings from "@/pages/Settings";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Logo path for CASHPOT branding
const cashpotLogo = "/cashpot-logo.png";

function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/user", {
          credentials: "include",
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  return { isAuthenticated, isLoading, user, setIsAuthenticated, setUser };
}

function LoginPage({ onLogin }: { onLogin: (user: any) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Load saved credentials on component mount
  useEffect(() => {
    const savedCredentials = localStorage.getItem('cashpot_credentials');
    if (savedCredentials) {
      try {
        const { username: savedUsername, password: savedPassword, rememberMe: savedRememberMe } = JSON.parse(savedCredentials);
        setUsername(savedUsername || '');
        setPassword(savedPassword || '');
        setRememberMe(savedRememberMe || false);
      } catch (error) {
        console.error('Error loading saved credentials:', error);
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiRequest("POST", "/api/auth/login", {
        username,
        password,
        rememberMe,
      });

      const data = await response.json();
      
      // Save credentials if remember me is checked
      if (rememberMe) {
        localStorage.setItem('cashpot_credentials', JSON.stringify({
          username,
          password,
          rememberMe: true
        }));
      } else {
        localStorage.removeItem('cashpot_credentials');
      }
      
      toast({
        title: "Login Successful",
        description: `Welcome back, ${data.user.firstName || data.user.username}!`,
      });
      onLogin(data.user);
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="glass-card border-white/10">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <img 
                src={cashpotLogo} 
                alt="CASHPOT" 
                className="h-16 w-auto"
              />
            </div>
            <CardTitle className="text-2xl font-bold text-white">
              CASHPOT 2.0
            </CardTitle>
            <p className="text-slate-400">Gaming Management System</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-white">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-white/20 bg-white/10 text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  <Label htmlFor="rememberMe" className="text-white text-sm cursor-pointer">
                    Remember me
                  </Label>
                </div>
                <div className="text-xs text-slate-400">
                  Stay logged in for 30 days
                </div>
              </div>
              
              <Button
                type="submit"
                className="w-full btn-gaming"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AuthenticatedApp() {
  return (
    <MainLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/companies" component={Companies} />
        <Route path="/locations" component={Locations} />
        <Route path="/providers" component={Providers} />
        <Route path="/cabinets" component={Cabinets} />
        <Route path="/game-mixes" component={GameMixes} />
        <Route path="/slots" component={Slots} />
        <Route path="/invoices" component={Invoices} />
        <Route path="/rent-management" component={RentManagement} />
        <Route path="/users" component={Users} />
        <Route path="/legal" component={Legal} />
        <Route path="/onjn" component={ONJN} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </MainLayout>
  );
}

function Router() {
  const { isAuthenticated, isLoading, user, setIsAuthenticated, setUser } = useAuth();

  const handleLogin = (userData: any) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="loading-shimmer w-32 h-32 rounded-xl"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return <AuthenticatedApp />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
