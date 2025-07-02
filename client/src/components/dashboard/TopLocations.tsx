import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return { icon: "🥇", color: "text-emerald-500 bg-emerald-500/20" };
    case 2:
      return { icon: "🥈", color: "text-blue-500 bg-blue-500/20" };
    case 3:
      return { icon: "🥉", color: "text-amber-500 bg-amber-500/20" };
    default:
      return { icon: rank.toString(), color: "text-slate-400 bg-slate-500/20" };
  }
};

export default function TopLocations() {
  const { data: locations, isLoading, error } = useQuery({
    queryKey: ['/api/locations', 1, 3],
    queryFn: async () => {
      const response = await fetch('/api/locations?page=1&limit=3', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch locations');
      return response.json();
    },
  });

  return (
    <Card className="glass-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Top Locations</h3>
        <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-400">
          View All
        </Button>
      </div>
      
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="loading-shimmer h-16 rounded-xl"></div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-8 text-slate-400">
          <span className="text-2xl mb-2 block">⚠️</span>
          Failed to load locations
        </div>
      ) : !locations?.locations?.length ? (
        <div className="text-center py-8 text-slate-400">
          <span className="text-2xl mb-2 block">📍</span>
          No locations found
        </div>
      ) : (
        <div className="space-y-4">
          {locations.locations.slice(0, 3).map((location: any, index: number) => {
            const rank = index + 1;
            const rankInfo = getRankIcon(rank);
            // Mock revenue data since it's not in the database
            const mockRevenue = [284750, 198420, 156890][index] || 100000;
            
            return (
              <div
                key={location.id}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 ${rankInfo.color} rounded-lg flex items-center justify-center`}>
                    <span className="font-bold text-sm">{rankInfo.icon}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{location.name}</p>
                    <p className="text-xs text-slate-400">
                      {location.city}, {location.country}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${
                    rank === 1 ? 'text-emerald-500' : 
                    rank === 2 ? 'text-blue-500' : 'text-amber-500'
                  }`}>
                    €{mockRevenue.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-400">Weekly</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
