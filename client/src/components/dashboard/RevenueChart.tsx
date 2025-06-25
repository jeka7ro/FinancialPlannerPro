import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface RevenueData {
  month: string;
  revenue: number;
  color: string;
}

const mockRevenueData: RevenueData[] = [
  { month: "Jan", revenue: 240000, color: "bg-blue-500/80" },
  { month: "Feb", revenue: 320000, color: "bg-blue-500/80" },
  { month: "Mar", revenue: 390000, color: "bg-emerald-500/80" },
  { month: "Apr", revenue: 370000, color: "bg-emerald-500/80" },
  { month: "May", revenue: 300000, color: "bg-blue-500/80" },
  { month: "Jun", revenue: 420000, color: "bg-amber-500/80" },
];

const timeRanges = [
  { label: "7D", value: "7d" },
  { label: "30D", value: "30d" },
  { label: "90D", value: "90d" },
];

export default function RevenueChart() {
  const [selectedRange, setSelectedRange] = useState("7d");
  
  const maxRevenue = Math.max(...mockRevenueData.map(d => d.revenue));

  return (
    <Card className="glass-card rounded-2xl p-6 lg:col-span-2">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Revenue Overview</h3>
          <p className="text-sm text-slate-400">Monthly gaming revenue trends</p>
        </div>
        <div className="flex space-x-2">
          {timeRanges.map((range) => (
            <Button
              key={range.value}
              variant={selectedRange === range.value ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedRange(range.value)}
              className={selectedRange === range.value 
                ? "bg-blue-500 text-white" 
                : "text-slate-400 hover:text-white hover:bg-white/10"
              }
            >
              {range.label}
            </Button>
          ))}
        </div>
      </div>
      
      <div className="h-64 flex items-end justify-between space-x-2">
        {mockRevenueData.map((data, index) => {
          const height = (data.revenue / maxRevenue) * 100;
          return (
            <div key={data.month} className="flex-1 flex flex-col items-center space-y-2 group">
              <div 
                className={`w-full ${data.color} rounded-t transition-all duration-300 group-hover:opacity-80 cursor-pointer relative`}
                style={{ height: `${height}%` }}
                title={`${data.month}: €${data.revenue.toLocaleString()}`}
              >
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  €{data.revenue.toLocaleString()}
                </div>
              </div>
              <span className="text-xs text-slate-400">{data.month}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
