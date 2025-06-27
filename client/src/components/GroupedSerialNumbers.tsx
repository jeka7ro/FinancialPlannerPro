import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight } from "lucide-react";

interface GroupedSerialNumbersProps {
  serialNumbers: string;
  maxLength?: number;
}

interface SerialGroup {
  year: string;
  ranges: string[];
}

function parseSerialNumbers(serialNumbers: string): SerialGroup[] {
  if (!serialNumbers) return [];

  // Split by various delimiters and clean up
  const numbers = serialNumbers
    .split(/[,;\s-]+/)
    .map(n => n.trim())
    .filter(n => n && /^\d+$/.test(n))
    .map(n => parseInt(n))
    .sort((a, b) => a - b);

  if (numbers.length === 0) return [];

  // Group by year prefix (first 4 digits)
  const yearGroups: { [key: string]: number[] } = {};
  
  numbers.forEach(num => {
    const numStr = num.toString();
    if (numStr.length >= 4) {
      const year = numStr.substring(0, 4);
      if (!yearGroups[year]) yearGroups[year] = [];
      yearGroups[year].push(num);
    } else {
      // Handle short numbers by grouping them together
      if (!yearGroups['other']) yearGroups['other'] = [];
      yearGroups['other'].push(num);
    }
  });

  // Convert to ranges for each year
  const groups: SerialGroup[] = [];
  
  Object.keys(yearGroups).sort().forEach(year => {
    const nums = yearGroups[year].sort((a, b) => a - b);
    const ranges: string[] = [];
    
    let start = nums[0];
    let end = nums[0];
    
    for (let i = 1; i < nums.length; i++) {
      if (nums[i] === end + 1) {
        end = nums[i];
      } else {
        // Add the current range
        if (start === end) {
          ranges.push(start.toString());
        } else {
          ranges.push(`${start}-${end}`);
        }
        start = nums[i];
        end = nums[i];
      }
    }
    
    // Add the final range
    if (start === end) {
      ranges.push(start.toString());
    } else {
      ranges.push(`${start}-${end}`);
    }
    
    groups.push({
      year: year === 'other' ? 'Other' : year,
      ranges
    });
  });

  return groups;
}

function formatGroupedDisplay(groups: SerialGroup[]): string {
  return groups.map(group => {
    const rangeStr = group.ranges.join(', ');
    return group.year === 'Other' ? rangeStr : `${group.year}: ${rangeStr}`;
  }).join(' | ');
}

export function GroupedSerialNumbers({ serialNumbers, maxLength = 80 }: GroupedSerialNumbersProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  if (!serialNumbers || serialNumbers.trim() === '') {
    return <span className="text-gray-500">No serial numbers</span>;
  }

  const groups = parseSerialNumbers(serialNumbers);
  const groupedDisplay = formatGroupedDisplay(groups);
  const originalCount = serialNumbers.split(/[,;\s-]+/).filter(n => n.trim() && /^\d+$/.test(n.trim())).length;

  // If the grouped display is short enough, show it directly
  if (groupedDisplay.length <= maxLength) {
    return (
      <div className="flex items-center gap-2">
        <span className="font-mono text-sm">{groupedDisplay}</span>
        <Badge variant="secondary" className="text-xs">
          {originalCount} serials
        </Badge>
      </div>
    );
  }

  // Otherwise show a compact version with expand option
  const compactDisplay = groupedDisplay.substring(0, maxLength) + "...";

  return (
    <div className="flex items-center gap-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-auto p-1 font-mono text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {isOpen ? <ChevronDown className="h-3 w-3 mr-1" /> : <ChevronRight className="h-3 w-3 mr-1" />}
            {compactDisplay}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 p-4" align="start">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Grouped Serial Numbers</h4>
              <Badge variant="secondary">{originalCount} total</Badge>
            </div>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {groups.map((group, index) => (
                <div key={index} className="border-l-2 border-blue-200 pl-3">
                  <div className="font-medium text-blue-700 dark:text-blue-400">
                    {group.year}
                  </div>
                  <div className="font-mono text-sm text-gray-600 dark:text-gray-300">
                    {group.ranges.join(', ')}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="pt-2 border-t text-xs text-gray-500">
              <strong>Original:</strong> {serialNumbers.length > 100 ? 
                serialNumbers.substring(0, 100) + "..." : 
                serialNumbers
              }
            </div>
          </div>
        </PopoverContent>
      </Popover>
      
      <Badge variant="secondary" className="text-xs">
        {originalCount} serials
      </Badge>
    </div>
  );
}