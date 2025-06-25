import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Upload, Download, FileSpreadsheet, FileText } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ImportExportDialogProps {
  module: string;
  moduleName: string;
  children: React.ReactNode;
}

export function ImportExportDialog({ module, moduleName, children }: ImportExportDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`/api/${module}/import`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Import failed: ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Import Successful",
        description: `${data.message}. ${data.imported} records imported.`,
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/${module}`] });
      setOpen(false);
      setSelectedFile(null);
    },
    onError: (error: any) => {
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import data",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv'
      ];
      
      if (allowedTypes.includes(file.type)) {
        setSelectedFile(file);
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please select an Excel file (.xlsx, .xls) or CSV file",
          variant: "destructive",
        });
      }
    }
  };

  const handleImport = () => {
    if (selectedFile) {
      importMutation.mutate(selectedFile);
    }
  };

  const handleExportExcel = () => {
    const link = document.createElement('a');
    link.href = `/api/${module}/export/excel`;
    link.download = `${module}-export.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export Started",
      description: `Excel export for ${moduleName} is downloading...`,
    });
  };

  const handleExportPDF = () => {
    const link = document.createElement('a');
    link.href = `/api/${module}/export/pdf`;
    link.download = `${module}-report.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export Started",
      description: `PDF report for ${moduleName} is downloading...`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Import/Export {moduleName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Import Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              <Label className="text-base font-semibold">Import Data</Label>
            </div>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="file-upload">Select Excel or CSV File</Label>
                <Input
                  id="file-upload"
                  type="file"
                  ref={fileInputRef}
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileSelect}
                  className="mt-1"
                />
              </div>
              
              {selectedFile && (
                <div className="text-sm text-muted-foreground">
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                </div>
              )}
              
              <Button 
                onClick={handleImport}
                disabled={!selectedFile || importMutation.isPending}
                className="w-full"
              >
                {importMutation.isPending ? "Importing..." : "Import Data"}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Export Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              <Label className="text-base font-semibold">Export Data</Label>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                onClick={handleExportExcel}
                className="flex items-center gap-2"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Excel
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleExportPDF}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                PDF
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}