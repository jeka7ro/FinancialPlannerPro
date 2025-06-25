import React, { useState, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { Paperclip, Upload, Download, Eye, Trash2, FileText, Image, FileArchive } from "lucide-react";
import type { Attachment } from '@shared/schema';

interface AttachmentButtonProps {
  entityType: string;
  entityId: number;
  entityName: string;
}

export function AttachmentButton({ entityType, entityId, entityName }: AttachmentButtonProps) {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: attachments = [] } = useQuery({
    queryKey: [`/api/${entityType}/${entityId}/attachments`],
    queryFn: async () => {
      const response = await fetch(`/api/${entityType}/${entityId}/attachments`, {
        credentials: 'include'
      });
      if (!response.ok) return [];
      return response.json();
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async ({ file, description }: { file: File; description: string }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('description', description);
      
      const response = await fetch(`/api/${entityType}/${entityId}/attachments`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Upload Successful",
        description: "File has been uploaded successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/${entityType}/${entityId}/attachments`] });
      setIsUploadDialogOpen(false);
      setSelectedFile(null);
      setDescription('');
    },
    onError: (error: any) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload file",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (attachmentId: number) => {
      const response = await fetch(`/api/attachments/${attachmentId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Delete failed: ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "File Deleted",
        description: "File has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/${entityType}/${entityId}/attachments`] });
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete file",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "File size must be less than 50MB",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate({ file: selectedFile, description });
    }
  };

  const handleDownload = (attachment: Attachment) => {
    const link = document.createElement('a');
    link.href = `/api/attachments/${attachment.id}/download`;
    link.download = attachment.originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = (attachment: Attachment) => {
    if (confirm(`Are you sure you want to delete "${attachment.originalName}"?`)) {
      deleteMutation.mutate(attachment.id);
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="h-3 w-3 text-blue-400" />;
    if (mimeType === 'application/pdf') return <FileText className="h-3 w-3 text-red-400" />;
    if (mimeType.includes('zip') || mimeType.includes('archive')) return <FileArchive className="h-3 w-3 text-yellow-400" />;
    return <FileText className="h-3 w-3 text-gray-400" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-gray-400 hover:text-white hover:bg-white/10 relative"
        >
          <Paperclip className="h-4 w-4" />
          {attachments.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              {attachments.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 glass-card border-white/10 text-white">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Attachments</h4>
            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                  <Upload className="h-3 w-3 mr-1" />
                  Upload
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-card border-white/10 text-white">
                <DialogHeader>
                  <DialogTitle className="text-white">Upload File to {entityName}</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="file-upload">Select File</Label>
                    <Input
                      id="file-upload"
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      className="mt-1 form-input"
                    />
                    <p className="text-xs text-slate-400 mt-1">
                      Max file size: 50MB. Supported formats: Images, PDF, Documents, Archives
                    </p>
                  </div>
                  
                  {selectedFile && (
                    <div className="text-sm text-slate-300">
                      Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                    </div>
                  )}
                  
                  <div>
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Add a description for this file..."
                      className="mt-1 form-input"
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="ghost" 
                      onClick={() => setIsUploadDialogOpen(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleUpload}
                      disabled={!selectedFile || uploadMutation.isPending}
                      className="btn-gaming"
                    >
                      {uploadMutation.isPending ? "Uploading..." : "Upload File"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          {attachments.length === 0 ? (
            <div className="text-center py-4 text-slate-400">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No files attached</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {attachments.map((attachment: Attachment) => (
                <div 
                  key={attachment.id} 
                  className="flex items-center justify-between p-2 rounded bg-white/5 border border-white/10"
                >
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    {getFileIcon(attachment.mimeType)}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white truncate">{attachment.originalName}</p>
                      <p className="text-xs text-slate-400">
                        {formatFileSize(attachment.fileSize)} • {new Date(attachment.createdAt!).toLocaleDateString()}
                      </p>
                      {attachment.description && (
                        <p className="text-xs text-slate-500 truncate">{attachment.description}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(attachment)}
                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 h-6 w-6 p-0"
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(attachment)}
                      disabled={deleteMutation.isPending}
                      className="text-red-400 hover:text-red-300 hover:bg-red-400/10 h-6 w-6 p-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}