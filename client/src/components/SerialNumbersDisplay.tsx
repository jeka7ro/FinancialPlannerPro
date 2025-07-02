import React from 'react';

interface SerialNumbersDisplayProps {
  serialNumbers: string | null;
}

export const SerialNumbersDisplay: React.FC<SerialNumbersDisplayProps> = ({ serialNumbers }) => {
  if (!serialNumbers) {
    return <span className="text-muted-foreground">N/A</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {serialNumbers.split(',').map((serial, index) => (
        <span
          key={index}
          className="inline-block px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded"
        >
          {serial.trim()}
        </span>
      ))}
    </div>
  );
}; 