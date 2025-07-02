import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Gamepad2, Dice1, Trophy, TrendingUp } from "lucide-react";

export default function GamingStats() {
  const { data: slots, isLoading: slotsLoading } = useQuery({
    queryKey: ['/api/slots'],
    queryFn: async () => {
      const response = await fetch('/api/slots', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch slots');
      return response.json();
    },
  });

  const { data: gameMixes, isLoading: gameMixesLoading } = useQuery({
    queryKey: ['/api/game-mixes'],
    queryFn: async () => {
      const response = await fetch('/api/game-mixes', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch game mixes');
      return response.json();
    },
  });

  const { data: providers, isLoading: providersLoading } = useQuery({
    queryKey: ['/api/providers'],
    queryFn: async () => {
      const response = await fetch('/api/providers', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch providers');
      return response.json();
    },
  });

  const isLoading = slotsLoading || gameMixesLoading || providersLoading;

  // Calculate gaming statistics
  const totalSlots = slots?.slots?.length || 0;
  const activeSlots = slots?.slots?.filter((slot: any) => slot.isActive).length || 0;
  const totalGameMixes = gameMixes?.gameMixes?.length || 0;
  const activeProviders = providers?.providers?.filter((provider: any) => provider.isActive).length || 0;

  // Calculate total revenue from slots
  const totalRevenue = slots?.slots?.reduce((sum: number, slot: any) => 
    sum + (slot.dailyRevenue || 0), 0
  ) || 0;

  // Get top performing game mix
  const topGameMix = gameMixes?.gameMixes?.length > 0 ? gameMixes.gameMixes.reduce((top: any, current: any) => {
    const currentSlots = slots?.slots?.filter((slot: any) => slot.gameMixId === current.id).length || 0;
    const topSlots = slots?.slots?.filter((slot: any) => slot.gameMixId === top.id).length || 0;
    return currentSlots > topSlots ? current : top;
  }, gameMixes.gameMixes[0]) : null;

  return (
    <Card className="glass-card rounded-2xl p-6" style={{ background: '#E8F4FD' }}>
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
        <Button variant="ghost" size="sm" className="text-purple-500 hover:text-purple-400">
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
            <div className="text-center p-4 bg-slate-800/50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Dice1 className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-blue-400">{totalSlots}</div>
              <div className="text-xs text-slate-400">Total Slots</div>
            </div>
            
            <div className="text-center p-4 bg-slate-800/50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-emerald-400">{activeSlots}</div>
              <div className="text-xs text-slate-400">Active Slots</div>
            </div>
            
            <div className="text-center p-4 bg-slate-800/50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Gamepad2 className="w-6 h-6 text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-purple-400">{totalGameMixes}</div>
              <div className="text-xs text-slate-400">Game Mixes</div>
            </div>
            
            <div className="text-center p-4 bg-slate-800/50 rounded-lg">
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
              <span className="text-xs text-emerald-400">€{totalRevenue.toLocaleString()}</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-emerald-400 to-blue-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((totalRevenue / 10000) * 100, 100)}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
              <span>€0</span>
              <span>€10,000</span>
            </div>
          </div>

          {/* Top Game Mix */}
          {topGameMix && (
            <div className="bg-slate-800/50 rounded-xl p-4">
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
                    {slots?.slots?.filter((slot: any) => slot.gameMixId === topGameMix.id).length || 0} slots active
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
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <Dice1 className="w-4 h-4 mr-2" />
              Add Slot
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
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