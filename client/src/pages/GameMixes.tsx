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
import { Upload, Edit, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { BulkOperations } from "@/components/ui/bulk-operations";
import { AttachmentButton } from "@/components/ui/attachment-button";

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
    
    toast({
      title: "Bulk Delete",
      description: `Deleting ${selectedGameMixes.length} game mixes`,
      variant: "destructive",
    });
  };

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex items-center justify-between">
        <BulkOperations 
          selectedCount={selectedGameMixes.length}
          onBulkEdit={handleBulkEdit}
          onBulkDelete={handleBulkDelete}
        />
        <div className="flex items-center gap-2">
          <ImportExportDialog module="game-mixes" moduleName="Game Mixes">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
              <Upload className="h-4 w-4 mr-2" />
              Import/Export
            </Button>
          </ImportExportDialog>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="floating-action text-white">
                <span className="mr-2">➕</span>
                Add Game Mix
              </Button>
            </DialogTrigger>
          <DialogContent className="glass-card border-white/10 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">Create New Game Mix</DialogTitle>
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
                        <Textarea {...field} className="form-input" placeholder="Describe the game mix" />
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
                    className="btn-gaming"
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

      {/* Search */}
      <Card className="glass-card border-white/10">
        <CardContent className="p-6">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search game mixes..."
              value={searchTerm}
              onChange={handleSearch}
              className="form-input pl-10"
            />
            <span className="absolute left-3 top-3 text-slate-400">🔍</span>
          </div>
        </CardContent>
      </Card>

      {/* Game Mixes List */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Game Mixes</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="loading-shimmer h-20 rounded-xl"></div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8 text-slate-400">
              <span className="text-2xl mb-2 block">⚠️</span>
              Failed to load game mixes
            </div>
          ) : !data?.gameMixes?.length ? (
            <div className="text-center py-8 text-slate-400">
              <span className="text-2xl mb-2 block">🍒</span>
              No game mixes found
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 w-12">
                        <Checkbox
                          checked={selectedGameMixes.length === data?.gameMixes.length && data?.gameMixes.length > 0}
                          onCheckedChange={handleSelectAll}
                          className="border-white/20"
                        />
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Mix Name</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Provider</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Game Count</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Description</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Status</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.gameMixes.map((gameMix: any) => (
                      <tr key={gameMix.id} className="table-row border-b border-white/5 hover:bg-blue-500/10">
                        <td className="py-4 px-4">
                          <Checkbox
                            checked={selectedGameMixes.includes(gameMix.id)}
                            onCheckedChange={() => handleSelectGameMix(gameMix.id)}
                            className="border-white/20"
                          />
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                              <span className="text-red-500 text-sm">🍒</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">{gameMix.name}</p>
                              <p className="text-xs text-slate-400">Mix #{gameMix.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-300">
                          {gameMix.providerId ? `Provider ${gameMix.providerId}` : 'No provider'}
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-300">
                          {gameMix.gameCount} games
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-300 max-w-xs truncate">
                          {gameMix.description || 'No description'}
                        </td>
                        <td className="py-4 px-4">
                          <Badge className={gameMix.isActive ? 'status-active' : 'status-inactive'}>
                            {gameMix.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-400">
                              👁️
                            </Button>
                            <Button variant="ghost" size="sm" className="text-amber-500 hover:text-amber-400">
                              ✏️
                            </Button>
                            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                              ⋯
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
                <div className="text-sm text-slate-400">
                  Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, data.total)} of {data.total} entries
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="ghost"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="text-slate-400 hover:text-white hover:bg-white/10"
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
                        className={currentPage === page 
                          ? "bg-blue-500 text-white" 
                          : "text-slate-400 hover:text-white hover:bg-white/10"
                        }
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
                    className="text-slate-400 hover:text-white hover:bg-white/10"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
