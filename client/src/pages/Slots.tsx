import { useState } from "react";
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
import { insertSlotSchema, type InsertSlot } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function Slots() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();
  const limit = 10;

  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/slots', currentPage, limit, searchTerm],
    queryFn: async () => {
      const response = await fetch(`/api/slots?page=${currentPage}&limit=${limit}&search=${searchTerm}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch slots');
      return response.json();
    },
  });

  const { data: cabinets } = useQuery({
    queryKey: ['/api/cabinets', 1, 100],
    queryFn: async () => {
      const response = await fetch('/api/cabinets?page=1&limit=100', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch cabinets');
      return response.json();
    },
  });

  const { data: gameMixes } = useQuery({
    queryKey: ['/api/game-mixes', 1, 100],
    queryFn: async () => {
      const response = await fetch('/api/game-mixes?page=1&limit=100', {
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
    mutationFn: async (data: InsertSlot) => {
      return await apiRequest("POST", "/api/slots", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/slots'] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Slot created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create slot. Please try again.",
        variant: "destructive",
      });
    },
  });

  const form = useForm<InsertSlot>({
    resolver: zodResolver(insertSlotSchema),
    defaultValues: {
      slotNumber: 1,
      gameName: "",
      gameType: "",
      propertyType: "property",
      isActive: true,
    },
  });

  const watchPropertyType = form.watch("propertyType");

  const onSubmit = (data: InsertSlot) => {
    createMutation.mutate(data);
  };

  const handleEdit = (slot: any) => {
    // TODO: Implement edit functionality
    console.log('Edit slot:', slot);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'status-active';
      case 'maintenance':
        return 'status-maintenance';
      case 'inactive':
        return 'status-inactive';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Slots</h1>
          <p className="text-slate-400">Slot machine management and tracking</p>
        </div>
        <div className="flex items-center gap-2">
          <ImportExportDialog 
            entityType="slots"
            onImportSuccess={() => queryClient.invalidateQueries({ queryKey: ['/api/slots'] })}
          />
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="floating-action text-white">
                <span className="mr-2">➕</span>
                Add Slot
              </Button>
            </DialogTrigger>
          <DialogContent className="glass-card border-white/10 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">Create New Slot</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="cabinetId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Cabinet</FormLabel>
                        <Select value={field.value?.toString()} onValueChange={(value) => field.onChange(parseInt(value))}>
                          <FormControl>
                            <SelectTrigger className="form-input">
                              <SelectValue placeholder="Select cabinet" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="glass-card border-white/10">
                            {cabinets?.cabinets?.map((cabinet: any) => (
                              <SelectItem key={cabinet.id} value={cabinet.id.toString()}>
                                {cabinet.serialNumber} - {cabinet.model}
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
                    name="gameMixId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Game Mix</FormLabel>
                        <Select value={field.value?.toString()} onValueChange={(value) => field.onChange(parseInt(value))}>
                          <FormControl>
                            <SelectTrigger className="form-input">
                              <SelectValue placeholder="Select game mix" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="glass-card border-white/10">
                            {gameMixes?.gameMixes?.map((gameMix: any) => (
                              <SelectItem key={gameMix.id} value={gameMix.id.toString()}>
                                {gameMix.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

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

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="slotNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Slot Number</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            className="form-input" 
                            placeholder="Slot number"
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gameName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Game Name</FormLabel>
                        <FormControl>
                          <Input {...field} className="form-input" placeholder="Game name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="gameType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Game Type</FormLabel>
                        <FormControl>
                          <Input {...field} className="form-input" placeholder="Game type" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="propertyType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Property</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="form-input">
                              <SelectValue placeholder="Select property type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="glass-card border-white/10">
                            <SelectItem value="property">Property</SelectItem>
                            <SelectItem value="rent">Rent</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="ownerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">
                        {watchPropertyType === "property" ? "Company" : "Provider"}
                      </FormLabel>
                      <Select value={field.value?.toString()} onValueChange={(value) => field.onChange(parseInt(value))}>
                        <FormControl>
                          <SelectTrigger className="form-input">
                            <SelectValue placeholder={`Select ${watchPropertyType === "property" ? "company" : "provider"}`} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="glass-card border-white/10">
                          {watchPropertyType === "property" 
                            ? companies?.companies?.map((company: any) => (
                                <SelectItem key={company.id} value={company.id.toString()}>
                                  {company.name}
                                </SelectItem>
                              ))
                            : providers?.providers?.map((provider: any) => (
                                <SelectItem key={provider.id} value={provider.id.toString()}>
                                  {provider.name}
                                </SelectItem>
                              ))
                          }
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="denomination"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Denomination</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            step="0.01"
                            className="form-input" 
                            placeholder="0.01"
                            onChange={(e) => field.onChange(e.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="maxBet"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Max Bet</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            step="0.01"
                            className="form-input" 
                            placeholder="100.00"
                            onChange={(e) => field.onChange(e.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="rtp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">RTP (%)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            step="0.01"
                            className="form-input" 
                            placeholder="96.50"
                            onChange={(e) => field.onChange(e.target.value)}
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
                    {createMutation.isPending ? "Creating..." : "Create Slot"}
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
              placeholder="Search slots..."
              value={searchTerm}
              onChange={handleSearch}
              className="form-input pl-10"
            />
            <span className="absolute left-3 top-3 text-slate-400">🔍</span>
          </div>
        </CardContent>
      </Card>

      {/* Slots List */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Slot Machines</CardTitle>
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
              Failed to load slots
            </div>
          ) : !data?.slots?.length ? (
            <div className="text-center py-8 text-slate-400">
              <span className="text-2xl mb-2 block">🎰</span>
              No slots found
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Slot</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Game</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Cabinet</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Type</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">RTP</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Property</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Revenue (24h)</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.slots.map((slot: any) => (
                      <tr key={slot.id} className="table-row border-b border-white/5 hover:bg-blue-500/10">
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                              <span className="text-yellow-500 text-sm">🎰</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">Slot #{slot.slotNumber}</p>
                              <p className="text-xs text-slate-400">ID: {slot.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-300">
                          {slot.gameName || 'No game'}
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-300">
                          {slot.cabinetId ? `Cabinet ${slot.cabinetId}` : 'Unassigned'}
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-300">
                          {slot.gameType || 'N/A'}
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-300">
                          {slot.rtp ? `${Number(slot.rtp)}%` : 'N/A'}
                        </td>
                        <td className="py-4 px-4">
                          <Badge className={`${getPropertyTypeColor(slot.propertyType)} border`}>
                            {slot.propertyType}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-sm font-semibold text-emerald-500">
                          €{slot.dailyRevenue ? Number(slot.dailyRevenue).toLocaleString() : '0'}
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
                              onClick={() => handleEdit(slot)}
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
