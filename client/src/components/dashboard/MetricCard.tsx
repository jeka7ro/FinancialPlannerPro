import { Card } from "../../components/ui/card";
import { cn } from "../../lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string;
    trend: "up" | "down";
  };
  icon: string;
  className?: string;
}

export default function MetricCard({ title, value, change, icon, className }: MetricCardProps) {
  return (
    <Card className={cn("metric-card rounded-2xl p-6", className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400">{title}</p>
          <p className="text-3xl font-bold text-white mt-2">{value}</p>
          {change && (
            <p className={cn(
              "text-sm mt-1 flex items-center",
              change.trend === "up" ? "text-emerald-500" : "text-red-400"
            )}>
              <span className="mr-1">
                {change.trend === "up" ? "↗️" : "↘️"}
              </span>
              {change.value}
            </p>
          )}
        </div>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl opacity-80">
          {icon}
        </div>
      </div>
    </Card>
  );
}
