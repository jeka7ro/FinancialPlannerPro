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
import { insertLocationSchema, type InsertLocation } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Upload, Edit, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { BulkOperations } from "@/components/ui/bulk-operations";
import { AttachmentButton } from "@/components/ui/attachment-button";

export default function Locations() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<any>(null);
  const [selectedLocations, setSelectedLocations] = useState<number[]>([]);
  const { toast } = useToast();
  const limit = 10;

  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/locations', currentPage, limit, searchTerm],
    queryFn: async () => {
      const response = await fetch(`/api/locations?page=${currentPage}&limit=${limit}&search=${searchTerm}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch locations');
      return response.json();
    },
  });

  const { data: companies } = useQuery({
    queryKey: ['/api/companies', 1, 100],
    queryFn: async () => {
      const response = await fetch('/api/companies?page=1&limit=100', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch companies');
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertLocation) => {
      return await apiRequest("POST", "/api/locations", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/locations'] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Location created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error", 
        description: "Failed to create location. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertLocation> }) => {
      return await apiRequest("PUT", `/api/locations/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/locations'] });
      setIsEditDialogOpen(false);
      setEditingLocation(null);
      editForm.reset();
      toast({
        title: "Success",
        description: "Location updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update location. Please try again.",
        variant: "destructive",
      });
    },
  });

  const form = useForm<InsertLocation>({
    resolver: zodResolver(insertLocationSchema),
    defaultValues: {
      name: "",
      address: "",
      city: "",
      country: "",
      phone: "",
      email: "",
      companyId: undefined,
      managerId: undefined,
      isActive: true,
    },
  });

  const editForm = useForm<InsertLocation>({
    resolver: zodResolver(insertLocationSchema),
    defaultValues: {
      name: "",
      address: "",
      city: "",
      country: "",
      phone: "",
      email: "",
      companyId: undefined,
      managerId: undefined,
      isActive: true,
    },
  });

  const onSubmit = (data: InsertLocation) => {
    createMutation.mutate(data);
  };

  const onEditSubmit = (data: InsertLocation) => {
    if (editingLocation) {
      updateMutation.mutate({ id: editingLocation.id, data });
    }
  };

  const handleEdit = (location: any) => {
    setEditingLocation(location);
    editForm.reset({
      companyId: location.companyId,
      name: location.name || "",
      address: location.address || "",
      city: location.city || "",
      country: location.country || "",
      phone: location.phone || "",
      email: location.email || "",
      managerId: location.managerId,
      isActive: location.isActive ?? true,
    });
    setIsEditDialogOpen(true);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSelectAll = () => {
    if (selectedLocations.length === data?.locations.length) {
      setSelectedLocations([]);
    } else {
      setSelectedLocations(data?.locations.map((l: any) => l.id) || []);
    }
  };

  const handleSelectLocation = (locationId: number) => {
    setSelectedLocations(prev => 
      prev.includes(locationId) 
        ? prev.filter(id => id !== locationId)
        : [...prev, locationId]
    );
  };

  const handleBulkEdit = () => {
    toast({
      title: "Bulk Edit",
      description: `Editing ${selectedLocations.length} locations`,
    });
  };

  const handleBulkDelete = () => {
    if (selectedLocations.length === 0) return;
    
    toast({
      title: "Bulk Delete",
      description: `Deleting ${selectedLocations.length} locations`,
      variant: "destructive",
    });
  };

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex items-center justify-between">
        <BulkOperations 
          selectedCount={selectedLocations.length}
          onBulkEdit={handleBulkEdit}
          onBulkDelete={handleBulkDelete}
        />
        <div className="flex items-center gap-2">
          <ImportExportDialog module="locations" moduleName="Locations">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
              <Upload className="h-4 w-4 mr-2" />
              Import/Export
            </Button>
          </ImportExportDialog>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="floating-action text-white">
                <span className="mr-2">➕</span>
                Add Location
              </Button>
            </DialogTrigger>
          <DialogContent className="glass-card border-white/10 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">Create New Location</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Location Name</FormLabel>
                      <FormControl>
                        <Input {...field} className="form-input" placeholder="Enter location name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="companyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Company</FormLabel>
                      <Select value={field.value?.toString()} onValueChange={(value) => field.onChange(parseInt(value))}>
                        <FormControl>
                          <SelectTrigger className="form-input">
                            <SelectValue placeholder="Select company" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="glass-card border-white/10">
                          {companies?.companies?.map((company: any) => (
                            <SelectItem key={company.id} value={company.id.toString()}>
                              {company.name}
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
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Address</FormLabel>
                      <FormControl>
                        <Textarea {...field} className="form-input" placeholder="Location address" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
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
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Phone</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} className="form-input" placeholder="Phone number" />
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
                          <Input {...field} value={field.value || ""} type="email" className="form-input" placeholder="location@email.com" />
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
                    {createMutation.isPending ? "Creating..." : "Create Location"}
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
              placeholder="Search locations..."
              value={searchTerm}
              onChange={handleSearch}
              className="form-input pl-10"
            />
            <span className="absolute left-3 top-3 text-slate-400">🔍</span>
          </div>
        </CardContent>
      </Card>

      {/* Locations List */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Locations</CardTitle>
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
              Failed to load locations
            </div>
          ) : !data?.locations?.length ? (
            <div className="text-center py-8 text-slate-400">
              <span className="text-2xl mb-2 block">📍</span>
              No locations found
            </div>
          ) : (
            <>
              <div className="overflow-x-auto -mx-6">
                <table className="w-full min-w-max">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 w-12">
                        <Checkbox
                          checked={selectedLocations.length === data?.locations.length && data?.locations.length > 0}
                          onCheckedChange={handleSelectAll}
                          className="border-white/20"
                        />
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Location</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Address</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Company</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Contact</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Status</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.locations.map((location: any) => (
                      <tr key={location.id} className="table-row border-b border-white/5 hover:bg-blue-500/10">
                        <td className="py-4 px-4">
                          <Checkbox
                            checked={selectedLocations.includes(location.id)}
                            onCheckedChange={() => handleSelectLocation(location.id)}
                            className="border-white/20"
                          />
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <p className="text-sm font-medium text-white">{location.name}</p>
                            <p className="text-xs text-slate-400">{location.city}, {location.country}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-300">
                          {location.address}
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-300">
                          {location.companyId ? `Company ${location.companyId}` : 'No company'}
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm text-slate-300">
                            {location.email && (
                              <p>{location.email}</p>
                            )}
                            {location.phone && (
                              <p className="text-xs text-slate-400">{location.phone}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge className={location.isActive ? 'status-active' : 'status-inactive'}>
                            {location.isActive ? 'Active' : 'Inactive'}
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
                              onClick={() => handleEdit(location)}
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
