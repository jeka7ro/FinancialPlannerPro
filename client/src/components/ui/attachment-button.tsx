import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Paperclip, Download, Eye, Trash2, Upload, File, Image, FileText, Archive } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { mockAttachments } from "../../lib/mockAttachments";

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

  const { data: attachments = [], isLoading } = useQuery({
    queryKey: [`/api/${entityType}/${entityId}/attachments`],
    queryFn: async () => {
      // Return mock attachments for this entity
      const entityAttachments = mockAttachments[entityType as keyof typeof mockAttachments];
      return entityAttachments?.[entityId as keyof typeof entityAttachments] || [];
    },
    enabled: !!entityType && !!entityId,
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create mock attachment object with real data URL for images
      let url: string;
      if (file.type.startsWith('image/')) {
        // For images, create a data URL that can be displayed
        const reader = new FileReader();
        const dataUrl = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        url = dataUrl;
      } else {
        // For non-images, use mock download URL
        url = `/api/attachments/${Date.now()}/download`;
      }
      
      const newAttachment = {
        id: Date.now(),
        filename: file.name,
        mimeType: file.type,
        fileSize: file.size,
        createdAt: new Date().toISOString(),
        url: url
      };
      
      return newAttachment;
    },
    onSuccess: (newAttachment) => {
      // Add to shared mock data
      const entityAttachments = mockAttachments[entityType as keyof typeof mockAttachments];
      if (entityAttachments) {
        if (!entityAttachments[entityId as keyof typeof entityAttachments]) {
          entityAttachments[entityId as keyof typeof entityAttachments] = [];
        }
        entityAttachments[entityId as keyof typeof entityAttachments].push(newAttachment);
      }
      
      queryClient.invalidateQueries({ queryKey: [`/api/${entityType}/${entityId}/attachments`] });
      setSelectedFile(null);
      setPreviewUrl(null);
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
      // Simulate delete delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true };
    },
    onSuccess: (_, attachmentId) => {
      // Remove from mock data
      const entityAttachments = mockAttachments[entityType as keyof typeof mockAttachments];
      const entityData = entityAttachments?.[entityId as keyof typeof entityAttachments];
      if (entityData) {
        const index = entityData.findIndex((att: any) => att.id === attachmentId);
        if (index > -1) {
          entityData.splice(index, 1);
        }
      }
      
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
      // For mock data, create a dummy blob and download it
      const dummyContent = `This is a mock file: ${attachment.filename}\n\nFile Type: ${attachment.mimeType}\nFile Size: ${attachment.fileSize} bytes\nCreated: ${attachment.createdAt}`;
      const blob = new Blob([dummyContent], { type: attachment.mimeType || 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: "File downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download file.",
        variant: "destructive",
      });
    }
  };

  const handlePreview = (attachment: any) => {
    if (attachment.mimeType?.startsWith('image/')) {
      // For images, show a placeholder since we don't have real images
      toast({
        title: "Preview",
        description: `Preview for ${attachment.filename} (mock image)`,
      });
    } else if (attachment.mimeType === 'application/pdf') {
      // For PDFs, show a placeholder
      toast({
        title: "Preview",
        description: `Preview for ${attachment.filename} (mock PDF)`,
      });
    } else {
      // For other files, download them
      handleDownload(attachment);
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType?.startsWith('image/')) return '🖼️';
    if (mimeType?.includes('pdf')) return '📄';
    if (mimeType?.includes('word') || mimeType?.includes('document')) return '📝';
    if (mimeType?.includes('excel') || mimeType?.includes('spreadsheet')) return '📊';
    if (mimeType?.includes('video/')) return '🎬';
    if (mimeType?.includes('audio/')) return '🎵';
    if (mimeType?.includes('zip') || mimeType?.includes('rar') || mimeType?.includes('compressed')) return '📦';
    return '📎';
  };

  const getEntityLogo = () => {
    switch (entityType) {
      case 'company':
      case 'companies':
        return '🏢';
      case 'location':
      case 'locations':
        return '📍';
      case 'provider':
      case 'providers':
        return '🎮';
      case 'cabinet':
      case 'cabinets':
        return '🎰';
      case 'game-mix':
      case 'game-mixes':
        return '🎯';
      case 'slot':
      case 'slots':
        return '🎲';
      case 'user':
      case 'users':
        return '👤';
      case 'invoice':
      case 'invoices':
        return '📋';
      case 'rent-agreement':
      case 'rent-agreements':
        return '📝';
      case 'legal-document':
      case 'legal-documents':
        return '⚖️';
      case 'onjn-report':
      case 'onjn-reports':
        return '📊';
      default:
        return '📎';
    }
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
      <DialogContent className="glass-dialog dialog-lg">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-3">
            <span className="text-2xl">{getEntityLogo()}</span>
            Attachments - {entityName || `${entityType} #${entityId}`}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Manage files and documents for {entityName || `${entityType} #${entityId}`}. Upload new files, preview existing ones, or download attachments.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Upload Section */}
          <div className="space-y-4">
            <Label className="text-white flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload New File
            </Label>
            <div className="flex flex-col gap-3">
              <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center hover:border-white/40 transition-colors">
                <Input
                  type="file"
                  onChange={handleFileSelect}
                  className="form-input"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.txt,.csv,.zip,.rar"
                />
                <p className="text-sm text-slate-400 mt-2">
                  Drag and drop or click to select files
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Supported: PDF, DOC, XLS, Images, Archives
                </p>
              </div>
              
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
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {attachment.mimeType?.startsWith('image/') ? (
                          <Image className="h-5 w-5 text-blue-400" />
                        ) : attachment.mimeType?.includes('pdf') ? (
                          <FileText className="h-5 w-5 text-red-400" />
                        ) : attachment.mimeType?.includes('zip') || attachment.mimeType?.includes('rar') ? (
                          <Archive className="h-5 w-5 text-yellow-400" />
                        ) : (
                          <File className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white truncate">
                          {attachment.filename}
                        </p>
                        <p className="text-xs text-slate-400">
                          {(attachment.fileSize / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {attachment.mimeType?.startsWith('image/') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(attachment.url, '_blank')}
                          className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-white/10"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // Simulate download
                          const link = document.createElement('a');
                          link.href = attachment.url;
                          link.download = attachment.filename;
                          link.click();
                        }}
                        className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-white/10"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // Simulate delete
                          const entityAttachments = mockAttachments[entityType as keyof typeof mockAttachments];
                          if (entityAttachments) {
                            const entityData = entityAttachments[entityId as keyof typeof entityAttachments];
                            if (entityData) {
                              const index = entityData.findIndex((att: any) => att.id === attachment.id);
                              if (index > -1) {
                                entityData.splice(index, 1);
                                queryClient.invalidateQueries({ queryKey: [`/api/${entityType}/${entityId}/attachments`] });
                                toast({
                                  title: "Success",
                                  description: "File deleted successfully.",
                                });
                              }
                            }
                          }
                        }}
                        className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
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