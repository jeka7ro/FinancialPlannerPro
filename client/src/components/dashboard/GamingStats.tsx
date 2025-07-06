import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Gamepad2, Dice1, Trophy, TrendingUp, Activity } from "lucide-react";
import { apiRequest } from "../../lib/queryClient";

export default function GamingStats() {
  const { data: slotsData, isLoading: slotsLoading } = useQuery({
    queryKey: ['/api/slots'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/slots');
      return response.json();
    },
  });

  const { data: gameMixesData, isLoading: gameMixesLoading } = useQuery({
    queryKey: ['/api/game-mixes'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/game-mixes');
      return response.json();
    },
  });

  const { data: providersData, isLoading: providersLoading } = useQuery({
    queryKey: ['/api/providers'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/providers');
      return response.json();
    },
  });

  // Extract data from new structure
  const slots = slotsData?.slots || [];
  const gameMixes = gameMixesData?.gameMixes || [];
  const providers = providersData?.providers || [];

  const isLoading = slotsLoading || gameMixesLoading || providersLoading;

  // Calculate gaming statistics
  const totalSlots = slots.length;
  const activeSlots = slots.filter((slot: any) => slot.isActive).length;
  const totalGameMixes = gameMixes.length;
  const activeProviders = providers.filter((provider: any) => provider.isActive).length;

  // Calculate total revenue from slots
  const totalRevenue = slots.reduce((sum: number, slot: any) => 
    sum + (parseFloat(slot.dailyRevenue) || 0), 0
  );

  // Get top performing game mix
  const topGameMix = gameMixes.length > 0 ? gameMixes.reduce((top: any, current: any) => {
    const currentSlots = slots.filter((slot: any) => slot.gameMixId === current.id).length;
    const topSlots = slots.filter((slot: any) => slot.gameMixId === top.id).length;
    return currentSlots > topSlots ? current : top;
  }, gameMixes[0]) : null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Card className="glass-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Gamepad2 className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Gaming Statistics</h3>
            <p className="text-sm text-slate-400">Slots & Game Mixes Overview</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="text-purple-500 hover:text-purple-400 action-button">
          View Details
        </Button>
      </div>
      
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="loading-shimmer h-16 rounded-xl"></div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
              <div className="flex items-center justify-center mb-2">
                <Dice1 className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-blue-400">{totalSlots}</div>
              <div className="text-xs text-slate-400">Total Slots</div>
            </div>
            
            <div className="text-center p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
              <div className="flex items-center justify-center mb-2">
                <Activity className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-emerald-400">{activeSlots}</div>
              <div className="text-xs text-slate-400">Active Slots</div>
            </div>
            
            <div className="text-center p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
              <div className="flex items-center justify-center mb-2">
                <Gamepad2 className="w-6 h-6 text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-purple-400">{totalGameMixes}</div>
              <div className="text-xs text-slate-400">Game Mixes</div>
            </div>
            
            <div className="text-center p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
              <div className="flex items-center justify-center mb-2">
                <Trophy className="w-6 h-6 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-amber-400">{activeProviders}</div>
              <div className="text-xs text-slate-400">Providers</div>
            </div>
          </div>

          {/* Revenue Overview */}
          <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-xl p-4 border border-emerald-500/20">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-white">Daily Revenue</h4>
              <span className="text-xs text-emerald-400">{formatCurrency(totalRevenue)}</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-emerald-400 to-blue-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((totalRevenue / 1000) * 100, 100)}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
              <span>€0</span>
              <span>€1,000</span>
            </div>
          </div>

          {/* Top Game Mix */}
          {topGameMix && (
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-white">Top Game Mix</h4>
                <Trophy className="w-4 h-4 text-amber-400" />
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Gamepad2 className="w-5 h-5 text-purple-400" />
                </div>
                <div className="flex-1">
                  <h5 className="text-sm font-medium text-white truncate">{topGameMix.name}</h5>
                  <p className="text-xs text-slate-400">
                    {slots.filter((slot: any) => slot.gameMixId === topGameMix.id).length} slots active
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-purple-400">
                    {topGameMix.gameCount || 0}
                  </div>
                  <div className="text-xs text-slate-400">games</div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="action-button"
            >
              <Dice1 className="w-4 h-4 mr-2" />
              Add Slot
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="action-button"
            >
              <Gamepad2 className="w-4 h-4 mr-2" />
              New Mix
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
} 