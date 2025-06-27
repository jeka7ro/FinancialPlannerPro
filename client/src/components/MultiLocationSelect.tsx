import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, MapPin } from "lucide-react";

interface MultiLocationSelectProps {
  locations: any[];
  selectedLocationIds: string[];
  onSelectionChange: (locationIds: string[]) => void;
  disabled?: boolean;
}

export const MultiLocationSelect = ({ 
  locations, 
  selectedLocationIds, 
  onSelectionChange,
  disabled = false 
}: MultiLocationSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleLocationToggle = (locationId: string) => {
    const isSelected = selectedLocationIds.includes(locationId);
    let newSelection;
    
    if (isSelected) {
      newSelection = selectedLocationIds.filter(id => id !== locationId);
    } else {
      newSelection = [...selectedLocationIds, locationId];
    }
    
    onSelectionChange(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedLocationIds.length === locations.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(locations.map(loc => loc.id.toString()));
    }
  };

  const selectedLocations = locations.filter(loc => 
    selectedLocationIds.includes(loc.id.toString())
  );

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full justify-between glass-card border-white/20 text-slate-300"
          disabled={disabled}
        >
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {selectedLocationIds.length === 0 
              ? "Select locations..." 
              : selectedLocationIds.length === 1
                ? selectedLocations[0]?.name || "1 location"
                : `${selectedLocationIds.length} locations selected`
            }
          </div>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 glass-card border-white/10">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm text-slate-300">Select Locations</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelectAll}
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              {selectedLocationIds.length === locations.length ? "Deselect All" : "Select All"}
            </Button>
          </div>
          
          <div className="max-h-48 overflow-y-auto space-y-2">
            {locations.map((location) => (
              <div key={location.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`location-${location.id}`}
                  checked={selectedLocationIds.includes(location.id.toString())}
                  onCheckedChange={() => handleLocationToggle(location.id.toString())}
                />
                <label
                  htmlFor={`location-${location.id}`}
                  className="text-sm text-slate-300 cursor-pointer flex-1"
                >
                  {location.name}
                </label>
              </div>
            ))}
          </div>

          {selectedLocationIds.length > 0 && (
            <div className="pt-2 border-t border-white/10">
              <p className="text-xs text-slate-400 mb-2">Selected:</p>
              <div className="flex flex-wrap gap-1">
                {selectedLocations.map((location) => (
                  <Badge 
                    key={location.id}
                    variant="outline" 
                    className="text-xs bg-green-500/20 text-green-300 border-green-500/50"
                  >
                    {location.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};