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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProviderSchema, type InsertProvider } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Upload } from "lucide-react";

export default function Providers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<any>(null);
  const { toast } = useToast();
  const limit = 10;

  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/providers', currentPage, limit, searchTerm],
    queryFn: async () => {
      const response = await fetch(`/api/providers?page=${currentPage}&limit=${limit}&search=${searchTerm}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch providers');
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertProvider) => {
      return await apiRequest("/api/providers", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/providers'] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Provider created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create provider. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: InsertProvider }) =>
      apiRequest(`/api/providers/${id}`, "PATCH", data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Provider updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/providers"] });
      setIsEditDialogOpen(false);
      setEditingProvider(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const form = useForm<InsertProvider>({
    resolver: zodResolver(insertProviderSchema),
    defaultValues: {
      name: "",
      companyName: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      country: "",
      website: "",
      isActive: true,
    },
  });

  const editForm = useForm<InsertProvider>({
    resolver: zodResolver(insertProviderSchema),
    defaultValues: {
      name: "",
      companyName: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      country: "",
      website: "",
      isActive: true,
    },
  });

  const onSubmit = (data: InsertProvider) => {
    createMutation.mutate(data);
  };

  const onEditSubmit = (data: InsertProvider) => {
    if (editingProvider) {
      updateMutation.mutate({ id: editingProvider.id, data });
    }
  };

  const handleEdit = (provider: any) => {
    console.log("Edit provider:", provider);
    setEditingProvider(provider);
    editForm.reset({
      name: provider.name || "",
      companyName: provider.companyName || "",
      contactPerson: provider.contactPerson || "",
      email: provider.email || "",
      phone: provider.phone || "",
      address: provider.address || "",
      city: provider.city || "",
      country: provider.country || "",
      website: provider.website || "",
      isActive: provider.isActive ?? true,
    });
    setIsEditDialogOpen(true);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Providers</h1>
          <p className="text-slate-400">Equipment and service providers</p>
        </div>
        <div className="flex items-center gap-2">
          <ImportExportDialog module="providers" moduleName="Providers">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
              <Upload className="h-4 w-4 mr-2" />
              Import/Export
            </Button>
          </ImportExportDialog>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="floating-action text-white">
                <span className="mr-2">➕</span>
                Add Provider
              </Button>
            </DialogTrigger>
          <DialogContent className="glass-card border-white/10 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">Create New Provider</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Provider Name</FormLabel>
                        <FormControl>
                          <Input {...field} className="form-input" placeholder="Enter provider name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Company Name</FormLabel>
                        <FormControl>
                          <Input {...field} className="form-input" placeholder="Company name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contactPerson"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Contact Person</FormLabel>
                        <FormControl>
                          <Input {...field} className="form-input" placeholder="Contact person name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" className="form-input" placeholder="provider@email.com" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Address</FormLabel>
                      <FormControl>
                        <Textarea {...field} className="form-input" placeholder="Provider address" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">City</FormLabel>
                        <FormControl>
                          <Input {...field} className="form-input" placeholder="City" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Country</FormLabel>
                        <FormControl>
                          <Input {...field} className="form-input" placeholder="Country" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Phone</FormLabel>
                        <FormControl>
                          <Input {...field} className="form-input" placeholder="Phone number" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Website</FormLabel>
                      <FormControl>
                        <Input {...field} className="form-input" placeholder="https://provider-website.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                    {createMutation.isPending ? "Creating..." : "Create Provider"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Edit Provider Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="glass-card border-white/10 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">Edit Provider</DialogTitle>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Provider Name</FormLabel>
                        <FormControl>
                          <Input {...field} className="form-input" placeholder="Enter provider name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Company Name</FormLabel>
                        <FormControl>
                          <Input {...field} className="form-input" placeholder="Enter company name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="contactPerson"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Contact Person</FormLabel>
                        <FormControl>
                          <Input {...field} className="form-input" placeholder="Enter contact person" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Email</FormLabel>
                        <FormControl>
                          <Input {...field} className="form-input" placeholder="Enter email address" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Phone</FormLabel>
                        <FormControl>
                          <Input {...field} className="form-input" placeholder="Enter phone number" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Website</FormLabel>
                        <FormControl>
                          <Input {...field} className="form-input" placeholder="Enter website URL" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">City</FormLabel>
                        <FormControl>
                          <Input {...field} className="form-input" placeholder="Enter city" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Country</FormLabel>
                        <FormControl>
                          <Input {...field} className="form-input" placeholder="Country" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel className="text-white">Address</FormLabel>
                        <FormControl>
                          <Textarea {...field} className="form-input min-h-[80px]" placeholder="Enter full address" />
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
                    {updateMutation.isPending ? "Updating..." : "Update Provider"}
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
              placeholder="Search providers..."
              value={searchTerm}
              onChange={handleSearch}
              className="form-input pl-10"
            />
            <span className="absolute left-3 top-3 text-slate-400">🔍</span>
          </div>
        </CardContent>
      </Card>

      {/* Providers List */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Providers</CardTitle>
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
              Failed to load providers
            </div>
          ) : !data?.providers?.length ? (
            <div className="text-center py-8 text-slate-400">
              <span className="text-2xl mb-2 block">🚚</span>
              No providers found
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Provider</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Company</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Location</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Contact</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Status</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.providers.map((provider: any) => (
                      <tr key={provider.id} className="table-row border-b border-white/5 hover:bg-blue-500/10">
                        <td className="py-4 px-4">
                          <div>
                            <p className="text-sm font-medium text-white">{provider.name}</p>
                            <p className="text-xs text-slate-400">{provider.contactPerson || 'No contact person'}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-300">
                          {provider.companyName || 'N/A'}
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-300">
                          {provider.city && provider.country ? `${provider.city}, ${provider.country}` : 'Not specified'}
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm text-slate-300">
                            {provider.email && (
                              <p>{provider.email}</p>
                            )}
                            {provider.phone && (
                              <p className="text-xs text-slate-400">{provider.phone}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge className={provider.isActive ? 'status-active' : 'status-inactive'}>
                            {provider.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-400">
                              👁️
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-amber-500 hover:text-amber-400"
                              onClick={() => handleEdit(provider)}
                            >
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
