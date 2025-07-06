import React, { useState, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { useToast } from "../../hooks/use-toast";
import { Upload, Download, Globe, Image, Trash2, Lightbulb } from "lucide-react";
import { apiRequest } from "../../lib/queryClient";

interface ProviderLogoManagerProps {
  providerId: number;
  providerName: string;
  currentLogoUrl?: string | null;
}

interface LogoSuggestions {
  suggested?: string | null;
  common?: Record<string, string>;
}

export function ProviderLogoManager({ providerId, providerName, currentLogoUrl }: ProviderLogoManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [logoUrl, setLogoUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get logo suggestions
  const { data: suggestions } = useQuery<LogoSuggestions>({
    queryKey: [`/api/providers/${providerId}/logo/suggestions`],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/providers/${providerId}/logo/suggestions`);
      return response.json();
    },
    enabled: isDialogOpen,
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('logo', file);
      
      const response = await apiRequest('POST', `/api/providers/${providerId}/logo/upload`, formData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Logo Uploaded",
        description: "Provider logo has been uploaded successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/providers`] });
      setIsDialogOpen(false);
      setSelectedFile(null);
    },
    onError: (error: any) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload logo",
        variant: "destructive",
      });
    },
  });

  const fetchMutation = useMutation({
    mutationFn: async (url: string) => {
      const response = await apiRequest('POST', `/api/providers/${providerId}/logo/fetch`, JSON.stringify({ url }));
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Logo Fetched",
        description: "Provider logo has been fetched and saved.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/providers`] });
      setIsDialogOpen(false);
      setLogoUrl('');
    },
    onError: (error: any) => {
      toast({
        title: "Fetch Failed",
        description: error.message || "Failed to fetch logo",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('DELETE', `/api/providers/${providerId}/logo`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Logo Removed",
        description: "Provider logo has been removed.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/providers`] });
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to remove logo",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Logo file must be less than 5MB",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  };

  const handleFetchFromUrl = () => {
    if (logoUrl.trim()) {
      fetchMutation.mutate(logoUrl.trim());
    }
  };

  const handleUseSuggestion = (url: string) => {
    setLogoUrl(url);
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to remove the logo for ${providerName}?`)) {
      deleteMutation.mutate();
    }
  };

  return (
    <div className="flex items-center gap-2">
      {currentLogoUrl && (
        <div className="flex items-center gap-2">
          <img 
            src={currentLogoUrl} 
            alt={`${providerName} logo`}
            className="h-8 w-8 object-contain rounded border border-white/10"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="text-red-400 hover:text-red-300 hover:bg-red-400/10 h-6 w-6 p-0"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )}
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            className="border-blue-400/20 text-blue-400 hover:bg-blue-400/10"
          >
            <Image className="h-3 w-3 mr-1" />
            {currentLogoUrl ? 'Change Logo' : 'Add Logo'}
          </Button>
        </DialogTrigger>
        <DialogContent className="glass-card border-white/10 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Manage Logo for {providerName}</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="suggestions" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-white/5">
              <TabsTrigger value="suggestions" className="text-white data-[state=active]:bg-blue-500/20">
                <Lightbulb className="h-4 w-4 mr-2" />
                Suggestions
              </TabsTrigger>
              <TabsTrigger value="url" className="text-white data-[state=active]:bg-blue-500/20">
                <Globe className="h-4 w-4 mr-2" />
                From URL
              </TabsTrigger>
              <TabsTrigger value="upload" className="text-white data-[state=active]:bg-blue-500/20">
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="suggestions" className="space-y-4">
              <div className="space-y-3">
                <Label className="text-white">Auto-detected suggestions for "{providerName}"</Label>
                
                {suggestions?.suggested && (
                  <div className="p-3 rounded bg-blue-500/10 border border-blue-400/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img 
                          src={suggestions.suggested || ''} 
                          alt="Suggested logo"
                          className="h-12 w-12 object-contain rounded border border-white/10"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        <div>
                          <p className="text-sm font-medium text-white">Recommended Logo</p>
                          <p className="text-xs text-slate-400 truncate max-w-xs">{suggestions.suggested || ''}</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUseSuggestion(suggestions.suggested || '')}
                        className="border-blue-400/20 text-blue-400 hover:bg-blue-400/10"
                      >
                        Use This
                      </Button>
                    </div>
                  </div>
                )}
                
                <div>
                  <Label className="text-white text-sm">Common Gaming Providers</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2 max-h-48 overflow-y-auto">
                    {suggestions?.common && Object.entries(suggestions.common).map(([name, url]) => (
                      <div key={name} className="p-2 rounded bg-white/5 border border-white/10">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <img 
                              src={url} 
                              alt={name}
                              className="h-6 w-6 object-contain rounded"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                            <span className="text-xs text-white capitalize">{name}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUseSuggestion(url)}
                            className="text-blue-400 hover:bg-blue-400/10 h-6 text-xs px-2"
                          >
                            Use
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="url" className="space-y-4">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="logo-url" className="text-white">Logo URL</Label>
                  <Input
                    id="logo-url"
                    type="url"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://example.com/logo.png"
                    className="mt-1 form-input"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Enter a direct URL to the provider's logo image
                  </p>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="ghost" 
                    onClick={() => setIsDialogOpen(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleFetchFromUrl}
                    disabled={!logoUrl.trim() || fetchMutation.isPending}
                    className="btn-gaming"
                  >
                    {fetchMutation.isPending ? "Fetching..." : "Fetch Logo"}
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="upload" className="space-y-4">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="logo-upload" className="text-white">Upload Logo File</Label>
                  <Input
                    id="logo-upload"
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="mt-1 form-input"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Supported formats: JPG, PNG, SVG, GIF. Max size: 5MB
                  </p>
                </div>
                
                {selectedFile && (
                  <div className="text-sm text-slate-300">
                    Selected: {selectedFile.name} ({Math.round(selectedFile.size / 1024)}KB)
                  </div>
                )}
                
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="ghost" 
                    onClick={() => setIsDialogOpen(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleUpload}
                    disabled={!selectedFile || uploadMutation.isPending}
                    className="btn-gaming"
                  >
                    {uploadMutation.isPending ? "Uploading..." : "Upload Logo"}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}