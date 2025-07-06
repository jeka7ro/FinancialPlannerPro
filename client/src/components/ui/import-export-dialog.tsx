import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Separator } from "../../components/ui/separator";
import { useToast } from "../../hooks/use-toast";
import { Upload, Download, FileSpreadsheet, FileText, BookOpen, HelpCircle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../lib/queryClient";

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
      
      const response = await apiRequest('POST', `/api/${module}/import`, formData);
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

  const handleExportExcel = async () => {
    try {
      const response = await apiRequest('GET', `/api/${module}/export/excel`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${module}-export.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Export Started",
        description: `Excel export for ${moduleName} is downloading...`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    }
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

  const handleDownloadTemplate = () => {
    const link = document.createElement('a');
    link.href = `/api/${module}/template`;
    link.download = `${module}-template.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Template Downloaded",
      description: `Import template for ${moduleName} is downloading...`,
    });
  };

  const handleDownloadTutorial = () => {
    const link = document.createElement('a');
    link.href = `/api/import-tutorial`;
    link.download = 'import-tutorial.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Tutorial Downloaded",
      description: "Complete import tutorial is downloading...",
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
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleDownloadTemplate}
                  className="flex items-center gap-2 border-blue-400/20 text-blue-400 hover:bg-blue-400/10"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  Download Template
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleDownloadTutorial}
                  className="flex items-center gap-2 border-green-400/20 text-green-400 hover:bg-green-400/10"
                >
                  <BookOpen className="h-4 w-4" />
                  Tutorial PDF
                </Button>
              </div>
              
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
                <p className="text-xs text-blue-400 mt-1">
                  💡 Download the template first to see the correct format
                </p>
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