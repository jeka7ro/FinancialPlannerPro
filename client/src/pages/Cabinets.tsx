import { useState } from "react";
import { ImportExportDialog } from "@/components/ui/import-export-dialog";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCabinetSchema, type InsertCabinet, type Cabinet } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Upload, Edit, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { BulkOperations } from "@/components/ui/bulk-operations";
import { AttachmentButton } from "@/components/ui/attachment-button";

export default function Cabinets() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCabinet, setEditingCabinet] = useState<any>(null);
  const [selectedCabinets, setSelectedCabinets] = useState<number[]>([]);
  const { toast } = useToast();
  const limit = 10;

  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/cabinets', currentPage, limit, searchTerm],
    queryFn: async () => {
      const response = await fetch(`/api/cabinets?page=${currentPage}&limit=${limit}&search=${searchTerm}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch cabinets');
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

  const form = useForm<InsertCabinet>({
    resolver: zodResolver(insertCabinetSchema),
    defaultValues: {
      model: "",
      status: "inactive",
      providerId: undefined,
      installationDate: null,
    },
  });

  const editForm = useForm<InsertCabinet>({
    resolver: zodResolver(insertCabinetSchema),
    defaultValues: {
      model: "",
      status: "inactive",
      providerId: undefined,
      installationDate: null,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertCabinet) => {
      return apiRequest("POST", "/api/cabinets", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cabinets'] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Cabinet created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: InsertCabinet) => {
      return apiRequest("PUT", `/api/cabinets/${editingCabinet.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cabinets'] });
      setIsEditDialogOpen(false);
      setEditingCabinet(null);
      editForm.reset();
      toast({
        title: "Success",
        description: "Cabinet updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/cabinets/${id}`),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Cabinet deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/cabinets"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete cabinet",
        variant: "destructive",
      });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      return apiRequest("POST", "/api/cabinets/bulk-delete", { ids });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cabinets'] });
      setSelectedCabinets([]);
      toast({
        title: "Success",
        description: "Selected cabinets deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertCabinet) => {
    createMutation.mutate(data);
  };

  const onEditSubmit = (data: InsertCabinet) => {
    updateMutation.mutate(data);
  };

  const openEditDialog = (cabinet: Cabinet) => {
    setEditingCabinet(cabinet);
    editForm.reset({
      model: cabinet.model || "",
      status: cabinet.status || "inactive",
      providerId: cabinet.providerId || undefined,
      installationDate: cabinet.installationDate ? new Date(cabinet.installationDate) : null,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this cabinet?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-8">
        Error loading cabinets: {error.message}
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'maintenance': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'inactive': return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const toggleCabinetSelection = (cabinetId: number) => {
    setSelectedCabinets(prev => 
      prev.includes(cabinetId) 
        ? prev.filter(id => id !== cabinetId)
        : [...prev, cabinetId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedCabinets.length === data?.cabinets?.length) {
      setSelectedCabinets([]);
    } else {
      setSelectedCabinets(data?.cabinets.map((c: Cabinet) => c.id) || []);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Cabinets</h1>
          <p className="text-slate-400 mt-2">Gaming cabinet inventory and management</p>
        </div>
        <div className="flex gap-3">
          <ImportExportDialog 
            module="cabinets"
            moduleName="Cabinets"
          >
            Import/Export
          </ImportExportDialog>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-gaming">
                <Upload className="h-4 w-4 mr-2" />
                Add Cabinet
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-white/10 max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-white">Add New Cabinet</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="model"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Model</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ""} className="form-input" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="providerId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Provider</FormLabel>
                          <Select value={field.value?.toString() || ""} onValueChange={(value) => field.onChange(value ? Number(value) : null)}>
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
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Status</FormLabel>
                          <Select value={field.value || ""} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="form-input">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="glass-card border-white/10">
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="maintenance">Maintenance</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="installationDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Installation Date</FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              value={field.value ? (field.value instanceof Date ? field.value.toISOString().split('T')[0] : field.value) : ""} 
                              onChange={(e) => field.onChange(e.target.value)}
                              className="form-input" 
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
                      {createMutation.isPending ? "Creating..." : "Create Cabinet"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="glass-card border-white/10 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Cabinet</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Model</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} className="form-input" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="providerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Provider</FormLabel>
                      <Select value={field.value?.toString() || ""} onValueChange={(value) => field.onChange(value ? Number(value) : null)}>
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Status</FormLabel>
                      <Select value={field.value || ""} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="form-input">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="glass-card border-white/10">
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="installationDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Installation Date</FormLabel>
                      <FormControl>
                        <Input 
                          type="date"
                          value={field.value ? (field.value instanceof Date ? field.value.toISOString().split('T')[0] : field.value) : ""} 
                          onChange={(e) => field.onChange(e.target.value)}
                          className="form-input" 
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
                  className="btn-gaming"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? "Updating..." : "Update Cabinet"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Card className="glass-card border-white/10">
        <CardHeader className="border-b border-white/10">
          <div className="flex justify-between items-center">
            <div className="flex gap-4 w-full justify-end">
              <Input
                placeholder="Search cabinets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 form-input"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {selectedCabinets.length > 0 && (
            <div className="p-4 border-b border-white/10">
              <BulkOperations
                selectedCount={selectedCabinets.length}
                onBulkEdit={() => {}} // Not implemented for cabinets
                onBulkDelete={() => bulkDeleteMutation.mutate(selectedCabinets)}
              />
            </div>
          )}
          
          {data?.cabinets?.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400 text-lg">No cabinets found</p>
              <p className="text-slate-500 mt-2">Add your first cabinet to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-4 px-4 text-slate-300 font-medium">
                      <Checkbox
                        checked={selectedCabinets.length === data?.cabinets?.length && data?.cabinets?.length > 0}
                        onCheckedChange={toggleSelectAll}
                        className="border-white/20"
                      />
                    </th>
                    <th className="text-left py-4 px-4 text-slate-300 font-medium">Model</th>
                    <th className="text-left py-4 px-4 text-slate-300 font-medium">Provider</th>
                    <th className="text-left py-4 px-4 text-slate-300 font-medium">Status</th>
                    <th className="text-left py-4 px-4 text-slate-300 font-medium">Installation Date</th>
                    <th className="text-left py-4 px-4 text-slate-300 font-medium">Attachments</th>
                    <th className="text-left py-4 px-4 text-slate-300 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.cabinets?.map((cabinet: Cabinet) => (
                    <tr key={cabinet.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-4 px-4">
                        <Checkbox
                          checked={selectedCabinets.includes(cabinet.id)}
                          onCheckedChange={() => toggleCabinetSelection(cabinet.id)}
                          className="border-white/20"
                        />
                      </td>
                      <td className="py-4 px-4 text-sm text-slate-300">
                        {cabinet.model}
                      </td>
                      <td className="py-4 px-4 text-sm text-slate-300">
                        {providers?.providers?.find((p: any) => p.id === cabinet.providerId)?.name || 'No provider'}
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={`${getStatusColor(cabinet.status)} border`}>
                          {cabinet.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-sm text-slate-400">
                        {cabinet.installationDate ? 
                          new Date(cabinet.installationDate).toLocaleDateString() : 
                          'Not set'
                        }
                      </td>
                      <td className="py-4 px-4">
                        <AttachmentButton 
                          entityType="cabinet" 
                          entityId={cabinet.id}
                        />
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openEditDialog(cabinet)}
                            className="text-slate-400 hover:text-white hover:bg-white/10"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteMutation.mutate(cabinet.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {data?.cabinets?.length > 0 && (
            <div className="flex justify-between items-center p-4 border-t border-white/10">
              <div className="text-sm text-slate-400">
                Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, data.total)} of {data.total} entries
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="border-white/20 text-slate-400 hover:text-white"
                >
                  Previous
                </Button>
                <span className="flex items-center px-3 py-1 text-sm text-slate-400 bg-white/5 rounded border border-white/10">
                  {currentPage}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={currentPage * limit >= data.total}
                  className="border-white/20 text-slate-400 hover:text-white"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}