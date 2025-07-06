import { Button } from "../../components/ui/button";
import { Edit, Trash2 } from "lucide-react";

interface BulkOperationsProps {
  selectedCount: number;
  onBulkEdit: () => void;
  onBulkDelete: () => void;
}

export function BulkOperations({ selectedCount, onBulkEdit, onBulkDelete }: BulkOperationsProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={onBulkEdit}
        variant="outline"
        className="border-blue-500/20 text-blue-400 hover:bg-blue-500/10"
      >
        <Edit className="h-4 w-4 mr-2" />
        Edit Selected ({selectedCount})
      </Button>
      <Button
        onClick={onBulkDelete}
        variant="outline"
        className="border-red-500/20 text-red-400 hover:bg-red-500/10"
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Delete Selected ({selectedCount})
      </Button>
    </div>
  );
}