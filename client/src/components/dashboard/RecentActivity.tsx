import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

const getActivityIcon = (action: string) => {
  if (action.includes('payout') || action.includes('revenue')) return { icon: "💰", color: "bg-emerald-500/20 text-emerald-500" };
  if (action.includes('maintenance')) return { icon: "🔧", color: "bg-amber-500/20 text-amber-500" };
  if (action.includes('user') || action.includes('login')) return { icon: "👤", color: "bg-blue-500/20 text-blue-500" };
  if (action.includes('create') || action.includes('add')) return { icon: "➕", color: "bg-green-500/20 text-green-500" };
  if (action.includes('update') || action.includes('edit')) return { icon: "✏️", color: "bg-yellow-500/20 text-yellow-500" };
  if (action.includes('delete') || action.includes('remove')) return { icon: "🗑️", color: "bg-red-500/20 text-red-500" };
  return { icon: "📝", color: "bg-slate-500/20 text-slate-400" };
};

const formatTimeAgo = (date: string) => {
  const now = new Date();
  const activityDate = new Date(date);
  const diffInMinutes = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
};

// Mock activity data for demonstration
const mockActivities = [
  {
    id: 1,
    action: "Large payout processed",
    details: "CB-2024-001 • €12,500",
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    entityType: "cabinet",
    entityId: 1
  },
  {
    id: 2,
    action: "Maintenance completed", 
    details: "SL-2024-045 • Royal Gaming Cluj",
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    entityType: "slot",
    entityId: 45
  },
  {
    id: 3,
    action: "New user registered",
    details: "Maria Popescu • Location Manager",
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    entityType: "user", 
    entityId: 123
  }
];

export default function RecentActivity() {
  const { data: activities, isLoading, error } = useQuery({
    queryKey: ['/api/activity-logs', 1, 5],
    queryFn: async () => {
      const response = await fetch('/api/activity-logs?page=1&limit=5', {
        credentials: 'include'
      });
      if (!response.ok) {
        // Return mock data if API fails
        return { activityLogs: mockActivities, total: mockActivities.length };
      }
      return response.json();
    },
  });

  const displayActivities = activities?.activityLogs?.length ? activities.activityLogs : mockActivities;

  return (
    <Card className="glass-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
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
      ) : (
        <div className="space-y-4">
          {displayActivities.slice(0, 3).map((activity: any) => {
            const activityInfo = getActivityIcon(activity.action);
            
            return (
              <div
                key={activity.id}
                className="flex items-center space-x-4 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
              >
                <div className={`w-8 h-8 ${activityInfo.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                  <span className="text-sm">{activityInfo.icon}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white">{activity.action}</p>
                  <p className="text-xs text-slate-400">
                    {activity.details} • {formatTimeAgo(activity.timestamp)}
                  </p>
                </div>
              </div>
            );
          })}
          
          {displayActivities.length === 0 && (
            <div className="text-center py-8 text-slate-400">
              <span className="text-2xl mb-2 block">📝</span>
              No recent activity
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
