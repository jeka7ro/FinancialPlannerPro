import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDown } from "lucide-react";

interface LocationsDisplayProps {
  locationIds: string | null;
  locations: any[];
}

export const LocationsDisplay = ({ locationIds, locations }: LocationsDisplayProps) => {
  if (!locationIds) {
    return <span className="text-slate-500">No locations</span>;
  }

  const locationIdList = locationIds.split(',').filter(id => id.trim());
  
  if (locationIdList.length === 0) {
    return <span className="text-slate-500">No locations</span>;
  }

  if (locationIdList.length === 1) {
    const location = locations.find(loc => loc.id.toString() === locationIdList[0]);
    return (
      <Badge variant="outline" className="text-xs bg-green-500/20 text-green-300 border-green-500/50">
        {location?.name || `Location ${locationIdList[0]}`}
      </Badge>
    );
  }

  const locationNames = locationIdList.map(id => {
    const location = locations.find(loc => loc.id.toString() === id);
    return location?.name || `Location ${id}`;
  });

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-auto p-1 text-xs bg-green-500/20 text-green-300 border border-green-500/50 hover:bg-green-500/30"
        >
          Multiple Locations ({locationIdList.length}) <ChevronDown className="ml-1 h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 glass-card border-white/10">
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-slate-300">Selected Locations:</h4>
          <div className="flex flex-wrap gap-1">
            {locationNames.map((name, index) => (
              <Badge 
                key={index}
                variant="outline" 
                className="text-xs bg-green-500/20 text-green-300 border-green-500/50"
              >
                {name}
              </Badge>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};