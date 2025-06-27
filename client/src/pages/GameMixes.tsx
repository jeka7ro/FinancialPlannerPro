import { useState } from "react";
import { ImportExportDialog } from "@/components/ui/import-export-dialog";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertGameMixSchema, type InsertGameMix, type GameMix } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Upload, Edit, Trash2, Plus, Search } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { BulkOperations } from "@/components/ui/bulk-operations";
import { AttachmentButton } from "@/components/ui/attachment-button";
import { ProviderLogo } from "@/components/ui/provider-logo";

export default function GameMixes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingGameMix, setEditingGameMix] = useState<any>(null);
  const [selectedGameMixes, setSelectedGameMixes] = useState<number[]>([]);
  const { toast } = useToast();
  const limit = 10;

  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/game-mixes', currentPage, limit, searchTerm],
    queryFn: async () => {
      const response = await fetch(`/api/game-mixes?page=${currentPage}&limit=${limit}&search=${searchTerm}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch game mixes');
      return response.json();
    },
  });

  const { data: providers } = useQuery({
    queryKey: ['/api/providers', 1, 100],
    queryFn: async () => {
      const response = await fetch('/api/providers?page=1&limit=100', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch providers');
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertGameMix) => {
      return await apiRequest("POST", "/api/game-mixes", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/game-mixes'] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Game mix created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create game mix. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertGameMix> }) => {
      return await apiRequest("PUT", `/api/game-mixes/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/game-mixes'] });
      setIsEditDialogOpen(false);
      setEditingGameMix(null);
      editForm.reset();
      toast({
        title: "Success",
        description: "Game mix updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update game mix. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/game-mixes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/game-mixes'] });
      toast({
        title: "Success",
        description: "Game mix deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete game mix. Please try again.",
        variant: "destructive",
      });
    },
  });

  const form = useForm<InsertGameMix>({
    resolver: zodResolver(insertGameMixSchema),
    defaultValues: {
      name: "",
      description: "",
      gameCount: 0,
      isActive: true,
    },
  });

  const editForm = useForm<InsertGameMix>({
    resolver: zodResolver(insertGameMixSchema),
    defaultValues: {
      name: "",
      description: "",
      gameCount: 0,
      isActive: true,
    },
  });

  const onSubmit = (data: InsertGameMix) => {
    createMutation.mutate(data);
  };

  const onEditSubmit = (data: InsertGameMix) => {
    if (editingGameMix) {
      updateMutation.mutate({ id: editingGameMix.id, data });
    }
  };

  const handleEdit = (gameMix: any) => {
    setEditingGameMix(gameMix);
    editForm.reset({
      name: gameMix.name || "",
      description: gameMix.description || "",
      providerId: gameMix.providerId,
      gameCount: gameMix.gameCount || 0,
      isActive: gameMix.isActive ?? true,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (gameMix: any) => {
    if (window.confirm(`Are you sure you want to delete the game mix "${gameMix.name}"?`)) {
      deleteMutation.mutate(gameMix.id);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSelectAll = () => {
    if (selectedGameMixes.length === data?.gameMixes.length) {
      setSelectedGameMixes([]);
    } else {
      setSelectedGameMixes(data?.gameMixes.map((g: GameMix) => g.id) || []);
    }
  };

  const handleSelectGameMix = (gameMixId: number) => {
    setSelectedGameMixes(prev => 
      prev.includes(gameMixId) 
        ? prev.filter(id => id !== gameMixId)
        : [...prev, gameMixId]
    );
  };

  const handleBulkEdit = () => {
    toast({
      title: "Bulk Edit",
      description: `Editing ${selectedGameMixes.length} game mixes`,
    });
  };

  const handleBulkDelete = () => {
    if (selectedGameMixes.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedGameMixes.length} game mixes?`)) {
      selectedGameMixes.forEach(id => deleteMutation.mutate(id));
      setSelectedGameMixes([]);
    }
  };

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  return (
    <div className="space-y-6">
      {/* Enhanced Search Interface */}
      <Card className="search-card">
        <CardContent className="p-6">
          <div className="search-header">
            <div className="search-icon-section">
              <div className="search-icon-wrapper">
                <span className="search-icon">🍒</span>
              </div>
              <div>
                <h3 className="search-title">Game Mixes</h3>
                <p className="search-subtitle">Gaming content and mix configuration</p>
              </div>
            </div>
          </div>
          <div className="search-input-wrapper">
            <Search className="search-input-icon" />
            <Input
              type="text"
              placeholder="Search game mixes by name, provider, or game count..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions and Bulk Operations */}
      <div className="flex items-center justify-between">
        {selectedGameMixes.length > 0 ? (
          <BulkOperations 
            selectedCount={selectedGameMixes.length}
            onBulkEdit={handleBulkEdit}
            onBulkDelete={handleBulkDelete}
          />
        ) : (
          <div></div>
        )}
        <div className="flex items-center gap-2">
          <ImportExportDialog module="game-mixes" moduleName="Game Mixes">
            <Button className="btn-secondary">
              <Upload className="h-4 w-4 mr-2" />
              Import/Export
            </Button>
          </ImportExportDialog>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                Add Game Mix
              </Button>
            </DialogTrigger>
          <DialogContent className="glass-dialog dialog-lg">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <span className="text-xl">🍒</span>
                Create New Game Mix
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Mix Name</FormLabel>
                      <FormControl>
                        <Input {...field} className="form-input" placeholder="Enter game mix name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} value={field.value || ""} className="form-input" placeholder="Describe the game mix" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="providerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Provider</FormLabel>
                        <Select value={field.value?.toString()} onValueChange={(value) => field.onChange(parseInt(value))}>
                          <FormControl>
                            <SelectTrigger className="form-input">
                              <SelectValue placeholder="Select provider" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="glass-card border-white/10">
                            {providers?.providers?.map((provider: any) => (
                              <SelectItem key={provider.id} value={provider.id.toString()}>
                                {provider.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gameCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Game Count</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            className="form-input" 
                            placeholder="Number of games"
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => setIsCreateDialogOpen(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="btn-primary"
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? "Creating..." : "Create Game Mix"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="glass-dialog dialog-lg">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <span className="text-xl">🍒</span>
              Edit Game Mix
            </DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Mix Name</FormLabel>
                    <FormControl>
                      <Input {...field} className="form-input" placeholder="Enter game mix name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value || ""} className="form-input" placeholder="Describe the game mix" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="providerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Provider</FormLabel>
                      <Select value={field.value?.toString()} onValueChange={(value) => field.onChange(parseInt(value))}>
                        <FormControl>
                          <SelectTrigger className="form-input">
                            <SelectValue placeholder="Select provider" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="glass-card border-white/10">
                          {providers?.providers?.map((provider: any) => (
                            <SelectItem key={provider.id} value={provider.id.toString()}>
                              {provider.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="gameCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Game Count</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          className="form-input" 
                          placeholder="Number of games"
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setIsEditDialogOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="btn-primary"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? "Updating..." : "Update Game Mix"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Enhanced Table */}
      <Card className="data-table">
        <CardHeader className="data-table-header">
          <CardTitle className="text-white flex items-center gap-2">
            <span>🍒</span>
            Game Mixes
            {data?.total && <span className="count-badge">{data.total}</span>}
          </CardTitle>
        </CardHeader>
        <CardContent className="data-table-content">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="loading-shimmer h-16 rounded-lg"></div>
              ))}
            </div>
          ) : error ? (
            <div className="empty-state">
              <span className="empty-state-icon">⚠️</span>
              <p className="empty-state-title">Failed to load game mixes</p>
              <p className="empty-state-description">There was an error loading the game mixes</p>
            </div>
          ) : !data?.gameMixes?.length ? (
            <div className="empty-state">
              <span className="empty-state-icon">🍒</span>
              <p className="empty-state-title">No game mixes found</p>
              <p className="empty-state-description">Add your first game mix to get started</p>
            </div>
          ) : (
            <>
              <div className="table-container">
                <table className="enhanced-table">
                  <thead>
                    <tr>
                      <th className="w-12">
                        <Checkbox
                          checked={selectedGameMixes.length === data?.gameMixes.length && data?.gameMixes.length > 0}
                          onCheckedChange={handleSelectAll}
                          className="checkbox-custom"
                        />
                      </th>
                      <th>Mix Name</th>
                      <th>Provider</th>
                      <th>Game Count</th>
                      <th>Description</th>
                      <th>Status</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.gameMixes.map((gameMix: any) => (
                      <tr key={gameMix.id} className="table-row">
                        <td>
                          <Checkbox
                            checked={selectedGameMixes.includes(gameMix.id)}
                            onCheckedChange={() => handleSelectGameMix(gameMix.id)}
                            className="checkbox-custom"
                          />
                        </td>
                        <td>
                          <div className="flex items-center space-x-3">
                            <div className="entity-avatar bg-red-500/20">
                              <span className="text-red-400">🍒</span>
                            </div>
                            <div>
                              <p className="entity-title">{gameMix.name}</p>
                              <p className="entity-subtitle">Mix #{gameMix.id}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            {gameMix.providerId && <ProviderLogo providerId={gameMix.providerId} size="sm" />}
                            <span className="text-slate-300 text-sm">
                              {providers?.providers?.find((p: any) => p.id === gameMix.providerId)?.name || 'No provider'}
                            </span>
                          </div>
                        </td>
                        <td className="text-slate-300 text-sm">
                          {gameMix.gameCount} games
                        </td>
                        <td className="text-slate-300 text-sm max-w-xs truncate">
                          {gameMix.description || 'No description'}
                        </td>
                        <td>
                          <Badge className={gameMix.isActive ? 'status-active' : 'status-inactive'}>
                            {gameMix.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleEdit(gameMix)}
                              className="action-button action-button-edit"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDelete(gameMix)}
                              className="action-button action-button-delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                            <AttachmentButton
                              entityType="game-mixes"
                              entityId={gameMix.id}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Enhanced Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <div className="pagination-info">
                    Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, data.total)} of {data.total} game mixes
                  </div>
                  <div className="pagination-controls">
                    <Button 
                      variant="ghost"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                      className="pagination-button"
                    >
                      Previous
                    </Button>
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      const page = i + 1;
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className={currentPage === page ? "pagination-button-active" : "pagination-button"}
                        >
                          {page}
                        </Button>
                      );
                    })}
                    <Button 
                      variant="ghost"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                      className="pagination-button"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
