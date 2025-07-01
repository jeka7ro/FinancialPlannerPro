import React, { useState } from "react";
import { ImportExportDialog } from "@/components/ui/import-export-dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertGameMixSchema, type InsertGameMix, type GameMix } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Upload, Edit, Trash2, Plus, Search, ExternalLink, Download, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { BulkOperations } from "@/components/ui/bulk-operations";
import { AttachmentButton } from "@/components/ui/attachment-button";
import { ProviderLogo } from "@/components/ui/provider-logo";
import { GameMixLogo } from "@/components/ui/game-mix-logo";


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
      const searchParam = searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : '';
      const response = await fetch(`/api/game-mixes?page=${currentPage}&limit=${limit}${searchParam}`, {
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

  // Calculate total pages
  const totalPages = data ? Math.ceil(data.total / limit) : 0;

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
    mutationFn: ({ id, data }: { id: number; data: InsertGameMix }) =>
      apiRequest("PUT", `/api/game-mixes/${id}`, data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Game mix updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/game-mixes"] });
      setIsEditDialogOpen(false);
      setEditingGameMix(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/game-mixes/${id}`),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Game mix deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/game-mixes"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete game mix",
        variant: "destructive",
      });
    },
  });

  const form = useForm<InsertGameMix>({
    resolver: zodResolver(insertGameMixSchema),
    defaultValues: {
      name: "",
      description: "",
      games: "",
      gameCount: 0,
      isActive: true,
    },
  });

  const editForm = useForm<InsertGameMix>({
    resolver: zodResolver(insertGameMixSchema),
    defaultValues: {
      name: "",
      description: "",
      games: "",
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
      games: gameMix.games || "",
      webLink: gameMix.webLink || "",
      gameCount: gameMix.gameCount || 0,
      isActive: gameMix.isActive ?? true,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this game mix?")) {
      deleteMutation.mutate(id);
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
      setSelectedGameMixes(data?.gameMixes.map((g: any) => g.id) || []);
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
    
    toast({
      title: "Bulk Delete",
      description: `Deleting ${selectedGameMixes.length} game mixes`,
      variant: "destructive",
    });
  };

  const handleExportGames = (gameMix: any) => {
    if (!gameMix.games) {
      toast({
        title: "No Games",
        description: "This game mix has no games to export.",
        variant: "destructive",
      });
      return;
    }

    const gamesList = getGamesList(gameMix.games);
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Game Name\n" 
      + gamesList.map(game => game.replace(/_/g, ' ')).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${gameMix.name}_games.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Successful",
      description: `Exported ${gamesList.length} games from ${gameMix.name}`,
    });
  };

  // Helper function to count games from string
  const getGamesList = (gamesString: string) => {
    if (!gamesString) return [];
    return gamesString.split(' ').filter(game => game.trim().length > 0);
  };

  const getGamesCount = (gamesString: string) => {
    return getGamesList(gamesString).length;
  };

  return (
    <div className="space-y-6 p-6 -mt-12">
      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BulkOperations 
            selectedCount={selectedGameMixes.length}
            onBulkEdit={handleBulkEdit}
            onBulkDelete={handleBulkDelete}
          />
        </div>
        <div className="text-sm text-slate-400">
          {selectedGameMixes.length > 0 && (
            <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full">
              {selectedGameMixes.length} selected
            </span>
          )}
        </div>
      </div>



      {/* Search Bar and Actions - SUS */}
      <div className="search-card">
        <div className="flex items-center justify-between w-full">
          <div className="relative" style={{ width: '10cm' }}>
            <Input
              type="text"
              placeholder="Search game mixes by name, provider, or description..."
              value={searchTerm}
              onChange={handleSearch}
              className="enhanced-input pl-12 pr-4 py-2 text-base text-right"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400 h-5 w-5" />
          </div>
          <div className="flex items-center gap-4">
            <Button
              className="px-4 py-2 rounded-lg h-10 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Game Mix
            </Button>
            <ImportExportDialog module="game-mixes" moduleName="Game Mixes">
              <Button className="px-4 py-2 rounded-lg h-10 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0">
                Import/Export
              </Button>
            </ImportExportDialog>
          </div>
        </div>
      </div>

      {/* Enhanced Game Mixes Table */}
      <div className="search-card">
        {isLoading ? (
          <div className="loading-container">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="loading-shimmer h-20"></div>
            ))}
          </div>
        ) : error ? (
          <div className="error-state-container">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-white mb-2">Failed to load game mixes</h3>
            <p>Please try refreshing the page or check your connection.</p>
          </div>
        ) : !data?.gameMixes?.length ? (
          <div className="empty-state-container">
            <div className="text-6xl mb-4">🍒</div>
            <h3 className="text-xl font-semibold text-white mb-2">No game mixes found</h3>
            <p>Get started by adding your first game mix.</p>
          </div>
        ) : (
          <>
            <div className="enhanced-table-wrapper">
              <table className="enhanced-table w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="w-12 px-4 py-3 text-left">
                      <Checkbox
                        checked={selectedGameMixes.length === data?.gameMixes.length && data?.gameMixes.length > 0}
                        onCheckedChange={handleSelectAll}
                        className="border-white/30"
                      />
                    </th>
                    <th className="w-16 px-4 py-3 text-left font-semibold text-white">#</th>
                    <th className="px-4 py-3 text-left font-semibold text-white">Game Mix</th>
                    <th className="px-4 py-3 text-left font-semibold text-white">Provider</th>
                    <th className="px-4 py-3 text-left font-semibold text-white">Games</th>
                    <th className="px-4 py-3 text-left font-semibold text-white">Web Link</th>
                    <th className="px-4 py-3 text-left font-semibold text-white">Status</th>
                    <th className="px-4 py-3 text-left font-semibold text-white">Attachments</th>
                    <th className="px-4 py-3 text-right font-semibold text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.gameMixes.map((gameMix: any, index: number) => (
                    <tr key={gameMix.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-4">
                        <Checkbox
                          checked={selectedGameMixes.includes(gameMix.id)}
                          onCheckedChange={() => handleSelectGameMix(gameMix.id)}
                          className="border-white/30"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="table-cell-primary font-medium">
                          {(currentPage - 1) * limit + index + 1}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <Dialog>
                            <DialogTrigger asChild>
                              <button className="cursor-pointer hover:scale-105 transition-transform duration-200">
                                <GameMixLogo gameMixId={gameMix.id} size="xl" />
                              </button>
                            </DialogTrigger>
                            <DialogContent className="glass-dialog max-w-md">
                              <DialogHeader>
                                <DialogTitle className="text-white flex items-center justify-between">
                                  <span>{gameMix.name} Logo</span>
                                  <X className="h-4 w-4 cursor-pointer hover:text-slate-400 transition-colors" />
                                </DialogTitle>
                              </DialogHeader>
                              <div className="flex justify-center p-6">
                                <div className="transform scale-150 transition-transform duration-300">
                                  <GameMixLogo gameMixId={gameMix.id} size="xl" />
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <div className="min-w-0 flex-1">
                            <div className="table-cell-primary font-medium truncate">{gameMix.name}</div>
                            <div className="table-cell-secondary text-sm truncate">{gameMix.description || 'No description'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {gameMix.providerId && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <button className="cursor-pointer hover:scale-105 transition-transform duration-200">
                                  <ProviderLogo providerId={gameMix.providerId} size="xl" />
                                </button>
                              </DialogTrigger>
                              <DialogContent className="glass-dialog max-w-md">
                                <DialogHeader>
                                  <DialogTitle className="text-white flex items-center justify-between">
                                    <span>{providers?.providers?.find((p: any) => p.id === gameMix.providerId)?.name || 'Provider'} Logo</span>
                                    <X className="h-4 w-4 cursor-pointer hover:text-slate-400 transition-colors" />
                                  </DialogTitle>
                                </DialogHeader>
                                <div className="flex justify-center p-6">
                                  <div className="transform scale-150 transition-transform duration-300">
                                    <ProviderLogo providerId={gameMix.providerId} size="xl" />
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="table-cell-primary font-medium truncate">
                              {providers?.providers?.find((p: any) => p.id === gameMix.providerId)?.name || 'No provider'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <Dialog>
                          <DialogTrigger asChild>
                            <button className="table-cell-primary cursor-pointer inline-flex items-center gap-2 hover:text-orange-300 transition-colors">
                              <span className="text-orange-400">🍒</span>
                              <span className="font-medium">{getGamesCount(gameMix.games) || 0} games</span>
                            </button>
                          </DialogTrigger>
                          <DialogContent className="glass-dialog">
                            <DialogHeader>
                              <DialogTitle className="text-white flex items-center gap-2">
                                <span className="text-orange-400">🍒</span>
                                Games in {gameMix.name}
                              </DialogTitle>
                            </DialogHeader>
                            <div className="max-h-96 overflow-y-auto">
                              {gameMix.games ? (
                                <div>
                                  <p className="text-slate-400 mb-4">
                                    {getGamesCount(gameMix.games)} games in this mix:
                                  </p>
                                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                                    {getGamesList(gameMix.games).map((game, idx) => (
                                      <div key={idx} className="bg-white/5 rounded-lg p-2 flex items-center gap-2 border border-white/10 hover:bg-white/10 transition-colors">
                                        <span className="text-orange-400 text-sm">🍒</span>
                                        <span className="text-white text-sm font-medium truncate">
                                          {game.replace(/_/g, ' ')}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-center py-8">
                                  <div className="text-4xl mb-4">🍒</div>
                                  <div className="text-slate-400">No games configured in this mix</div>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </td>
                      <td className="px-4 py-4">
                        {gameMix.webLink ? (
                          <a 
                            href={gameMix.webLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 underline decoration-dotted underline-offset-2 transition-colors inline-flex items-center gap-1"
                          >
                            <span className="truncate">Visit Site</span>
                            <ExternalLink className="h-3 w-3 flex-shrink-0" />
                          </a>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`status-badge ${gameMix.isActive ? 'status-active' : 'status-inactive'}`}>
                          {gameMix.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <AttachmentButton 
                          entityType="game-mixes" 
                          entityId={gameMix.id}
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="action-button-group justify-end gap-2">
                          <button 
                            className="action-button text-green-500 hover:text-green-400 p-2 rounded-lg hover:bg-white/10 transition-all"
                            onClick={() => handleExportGames(gameMix)}
                            title="Export Games"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <button 
                            className="action-button text-amber-500 hover:text-amber-400 p-2 rounded-lg hover:bg-white/10 transition-all"
                            onClick={() => handleEdit(gameMix)}
                            title="Edit Game Mix"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            className="action-button text-red-500 hover:text-red-400 p-2 rounded-lg hover:bg-white/10 transition-all"
                            onClick={() => handleDelete(gameMix.id)}
                            disabled={deleteMutation.isPending}
                            title="Delete Game Mix"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Pagination and entries info - SUB tabel */}
      {data?.gameMixes?.length > 0 && (
        <div className="flex items-center justify-between mt-2 px-2 text-sm text-slate-400">
          <span>
            Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, data.total)} of {data.total} entries
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="h-8 min-w-[40px] px-3"
            >
              Previous
            </Button>
            <button
              className="h-8 min-w-[40px] px-3 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center"
              disabled
            >
              {currentPage}
            </button>
            <Button
              variant="ghost"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="h-8 min-w-[40px] px-3"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="glass-dialog dialog-lg">
          <DialogHeader>
            <DialogTitle className="text-white">Create New Game Mix</DialogTitle>
            <DialogDescription className="text-slate-400">
              Add a new game mix configuration with provider assignment and details.
            </DialogDescription>
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

              <FormField
                control={form.control}
                name="games"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Games</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        value={field.value || ""} 
                        className="form-input" 
                        placeholder="Enter games separated by spaces (e.g. Book_of_Ra Cleopatra Lucky_Lady)"
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                    <div className="text-xs text-slate-400 mt-1">
                      {field.value ? `${getGamesCount(field.value)} games` : "No games added"}
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="webLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Web Link</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        value={field.value || ""} 
                        className="form-input" 
                        placeholder="https://example.com/game-mix"
                        type="url"
                      />
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

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="border-white/20 text-white hover:bg-white/10">
                  Cancel
                </Button>
                <Button type="submit" className="floating-action text-white" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create Game Mix"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="glass-dialog dialog-lg">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Game Mix</DialogTitle>
            <DialogDescription className="text-slate-400">
              Update the game mix information and details.
            </DialogDescription>
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

              <FormField
                control={editForm.control}
                name="games"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Games</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        value={field.value || ""} 
                        className="form-input" 
                        placeholder="Enter games separated by spaces (e.g. Book_of_Ra Cleopatra Lucky_Lady)"
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                    <div className="text-xs text-slate-400 mt-1">
                      {field.value ? `${getGamesCount(field.value)} games` : "No games added"}
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="webLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Web Link</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        value={field.value || ""} 
                        className="form-input" 
                        placeholder="https://example.com/game-mix"
                        type="url"
                      />
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

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)} className="border-white/20 text-white hover:bg-white/10">
                  Cancel
                </Button>
                <Button type="submit" className="floating-action text-white" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Updating..." : "Update Game Mix"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
