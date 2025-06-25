import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Paperclip, Download, Eye, Trash2, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AttachmentButtonProps {
  entityType: string;
  entityId: number;
  entityName?: string;
}

export function AttachmentButton({ entityType, entityId, entityName }: AttachmentButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: attachments, isLoading } = useQuery({
    queryKey: [`/api/${entityType}/${entityId}/attachments`],
    queryFn: async () => {
      const response = await fetch(`/api/${entityType}/${entityId}/attachments`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch attachments');
      return response.json();
    },
    enabled: isOpen,
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`/api/${entityType}/${entityId}/attachments`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to upload file');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/${entityType}/${entityId}/attachments`] });
      setSelectedFile(null);
      toast({
        title: "Success",
        description: "File uploaded successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (attachmentId: number) => {
      return await apiRequest("DELETE", `/api/attachments/${attachmentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/${entityType}/${entityId}/attachments`] });
      toast({
        title: "Success",
        description: "File deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete file. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  };

  const handleDownload = async (attachment: any) => {
    try {
      const response = await fetch(`/api/attachments/${attachment.id}/download`, {
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to download file');
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download file.",
        variant: "destructive",
      });
    }
  };

  const handlePreview = (attachment: any) => {
    if (attachment.fileType?.startsWith('image/')) {
      window.open(`/api/attachments/${attachment.id}/download`, '_blank');
    } else {
      handleDownload(attachment);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType?.startsWith('image/')) return '🖼️';
    if (fileType?.includes('pdf')) return '📄';
    if (fileType?.includes('word') || fileType?.includes('document')) return '📝';
    if (fileType?.includes('excel') || fileType?.includes('spreadsheet')) return '📊';
    return '📎';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/20"
        >
          <Paperclip className="h-4 w-4" />
          <Badge variant="secondary" className="ml-1 bg-purple-500/20 text-purple-300 border-purple-500/30">
            {attachments?.length || 0}
          </Badge>
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-card border-white/10 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white">
            Attachments - {entityName || `${entityType} #${entityId}`}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Upload Section */}
          <div className="space-y-4">
            <Label className="text-white">Upload New File</Label>
            <div className="flex flex-col gap-3">
              <Input
                type="file"
                onChange={handleFileSelect}
                className="form-input"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.txt,.csv"
              />
              
              {selectedFile && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                    <span className="text-2xl">{getFileIcon(selectedFile.type)}</span>
                    <div>
                      <p className="text-sm font-medium text-white">{selectedFile.name}</p>
                      <p className="text-xs text-slate-400">{formatFileSize(selectedFile.size)}</p>
                    </div>
                  </div>
                  
                  {previewUrl && (
                    <div className="border border-white/10 rounded-lg p-2">
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="max-w-full max-h-48 object-contain mx-auto"
                      />
                    </div>
                  )}
                  
                  <Button
                    onClick={handleUpload}
                    disabled={uploadMutation.isPending}
                    className="floating-action text-white"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploadMutation.isPending ? "Uploading..." : "Upload File"}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Existing Files */}
          <div className="space-y-4">
            <Label className="text-white">Attached Files</Label>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="loading-shimmer h-16 rounded-lg"></div>
                ))}
              </div>
            ) : !attachments?.length ? (
              <div className="text-center py-8 text-slate-400">
                <Paperclip className="h-8 w-8 mx-auto mb-2 opacity-50" />
                No files attached
              </div>
            ) : (
              <div className="space-y-2">
                {attachments.map((attachment: any) => (
                  <div
                    key={attachment.id}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{getFileIcon(attachment.fileType)}</span>
                      <div>
                        <p className="text-sm font-medium text-white">{attachment.filename}</p>
                        <p className="text-xs text-slate-400">
                          {attachment.fileSize ? formatFileSize(attachment.fileSize) : 'Unknown size'}
                          {attachment.createdAt && (
                            <> • {new Date(attachment.createdAt).toLocaleDateString()}</>
                          )}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePreview(attachment)}
                        className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/20"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(attachment)}
                        className="text-green-400 hover:text-green-300 hover:bg-green-500/20"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMutation.mutate(attachment.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}