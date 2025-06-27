import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertLegalDocumentSchema, type InsertLegalDocument } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Calendar, FileText, MapPin, Building, Edit, Trash2, ChevronDown } from "lucide-react";
import { AttachmentButton } from "@/components/ui/attachment-button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { safeFormValue } from "@/utils/formUtils";

// Locations Display Component
const LocationsDisplay = ({ locationIds, locations }: { locationIds: string | null; locations: any[] }) => {
  if (!locationIds) {
    return <span className="text-slate-500">No locations</span>;
  }

  const locationIdList = locationIds.split(',').filter(id => id.trim());
  
  if (locationIdList.length === 0) {
    return <span className="text-slate-500">No locations</span>;
  }

  if (locationIdList.length === 1) {
    const location = locations.find(loc => loc.id.toString() === locationIdList[0]);
    return (
      <Badge variant="outline" className="text-xs bg-green-500/20 text-green-300 border-green-500/50">
        {location?.name || `Location ${locationIdList[0]}`}
      </Badge>
    );
  }

  const locationNames = locationIdList.map(id => {
    const location = locations.find(loc => loc.id.toString() === id);
    return location?.name || `Location ${id}`;
  });

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-auto p-1 text-xs bg-green-500/20 text-green-300 border border-green-500/50 hover:bg-green-500/30"
        >
          Multiple Locations ({locationIdList.length}) <ChevronDown className="ml-1 h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 glass-card border-white/10">
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-slate-300">Selected Locations:</h4>
          <div className="flex flex-wrap gap-1">
            {locationNames.map((name, index) => (
              <Badge 
                key={index}
                variant="outline" 
                className="text-xs bg-green-500/20 text-green-300 border-green-500/50"
              >
                {name}
              </Badge>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

// Multi Location Select Component
const MultiLocationSelect = ({ 
  locations, 
  selectedLocationIds, 
  onSelectionChange,
  disabled = false 
}: { 
  locations: any[]; 
  selectedLocationIds: string[]; 
  onSelectionChange: (locationIds: string[]) => void;
  disabled?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleLocationToggle = (locationId: string) => {
    const isSelected = selectedLocationIds.includes(locationId);
    let newSelection;
    
    if (isSelected) {
      newSelection = selectedLocationIds.filter(id => id !== locationId);
    } else {
      newSelection = [...selectedLocationIds, locationId];
    }
    
    onSelectionChange(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedLocationIds.length === locations.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(locations.map(loc => loc.id.toString()));
    }
  };

  const selectedLocations = locations.filter(loc => 
    selectedLocationIds.includes(loc.id.toString())
  );

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full justify-between glass-card border-white/20 text-slate-300"
          disabled={disabled}
        >
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {selectedLocationIds.length === 0 
              ? "Select locations..." 
              : selectedLocationIds.length === 1
                ? selectedLocations[0]?.name || "1 location"
                : `${selectedLocationIds.length} locations selected`
            }
          </div>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 glass-card border-white/10">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm text-slate-300">Select Locations</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelectAll}
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              {selectedLocationIds.length === locations.length ? "Deselect All" : "Select All"}
            </Button>
          </div>
          
          <div className="max-h-48 overflow-y-auto space-y-2">
            {locations.map((location) => (
              <div key={location.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`location-${location.id}`}
                  checked={selectedLocationIds.includes(location.id.toString())}
                  onCheckedChange={() => handleLocationToggle(location.id.toString())}
                />
                <label
                  htmlFor={`location-${location.id}`}
                  className="text-sm text-slate-300 cursor-pointer flex-1"
                >
                  {location.name}
                </label>
              </div>
            ))}
          </div>

          {selectedLocationIds.length > 0 && (
            <div className="pt-2 border-t border-white/10">
              <p className="text-xs text-slate-400 mb-2">Selected:</p>
              <div className="flex flex-wrap gap-1">
                {selectedLocations.map((location) => (
                  <Badge 
                    key={location.id}
                    variant="outline" 
                    className="text-xs bg-green-500/20 text-green-300 border-green-500/50"
                  >
                    {location.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'active':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'expired':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case 'cancelled':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
};

export default function LegalEnhanced() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<any>(null);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const limit = 10;

  // Fetch legal documents
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/legal-documents', currentPage, limit, searchTerm],
    queryFn: async () => {
      const response = await fetch(`/api/legal-documents?page=${currentPage}&limit=${limit}&search=${encodeURIComponent(searchTerm)}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch legal documents');
      return response.json();
    },
  });

  // Fetch locations for multi-select
  const { data: locationsData } = useQuery({
    queryKey: ['/api/locations'],
    queryFn: async () => {
      const response = await fetch('/api/locations?limit=1000', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch locations');
      return response.json();
    },
  });

  // Fetch companies
  const { data: companiesData } = useQuery({
    queryKey: ['/api/companies'],
    queryFn: async () => {
      const response = await fetch('/api/companies?limit=1000', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch companies');
      return response.json();
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: InsertLegalDocument) => {
      return await apiRequest("POST", "/api/legal-documents", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/legal-documents'] });
      setIsCreateDialogOpen(false);
      form.reset();
      setSelectedLocations([]);
      toast({
        title: "Success",
        description: "Legal document created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create legal document. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertLegalDocument> }) => {
      return await apiRequest("PUT", `/api/legal-documents/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/legal-documents'] });
      setIsEditDialogOpen(false);
      setEditingDocument(null);
      editForm.reset();
      toast({
        title: "Success",
        description: "Legal document updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update legal document. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/legal-documents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/legal-documents'] });
      toast({
        title: "Success",
        description: "Legal document deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete legal document. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Create Form
  const form = useForm<InsertLegalDocument>({
    resolver: zodResolver(insertLegalDocumentSchema),
    defaultValues: {
      title: "",
      documentType: "",
      status: "active",
      documentNumber: "",
      issuingAuthority: "",
    },
  });

  // Edit Form
  const editForm = useForm<InsertLegalDocument>({
    resolver: zodResolver(insertLegalDocumentSchema),
    defaultValues: {
      title: "",
      documentType: "",
      status: "active",
      documentNumber: "",
      issuingAuthority: "",
    },
  });

  const onSubmit = (data: InsertLegalDocument) => {
    const documentData = {
      ...data,
      locationIds: selectedLocations.join(','),
    };
    createMutation.mutate(documentData);
  };

  const onEditSubmit = (data: InsertLegalDocument) => {
    if (!editingDocument) return;
    updateMutation.mutate({
      id: editingDocument.id,
      data: data,
    });
  };

  const handleEdit = (document: any) => {
    setEditingDocument(document);
    editForm.reset({
      title: safeFormValue(document.title),
      documentType: safeFormValue(document.documentType),
      companyId: document.companyId || undefined,
      issueDate: document.issueDate ? document.issueDate.split('T')[0] : "",
      expiryDate: document.expiryDate ? document.expiryDate.split('T')[0] : "",
      issuingAuthority: safeFormValue(document.issuingAuthority),
      documentNumber: safeFormValue(document.documentNumber),
      status: safeFormValue(document.status),
      locationIds: safeFormValue(document.locationIds),
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this legal document?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-100">Legal Documents</h1>
        </div>
        <div className="flex justify-center py-8">
          <div className="text-slate-400">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-100">Legal Documents</h1>
        </div>
        <div className="flex justify-center py-8">
          <div className="text-red-400">Error loading legal documents</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-100">Legal Documents</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              New Legal Document
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-white/20 max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-slate-100">Create Legal Document</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Document Title</FormLabel>
                      <FormControl>
                        <Input 
                          className="glass-card border-white/20 text-slate-300"
                          placeholder="Enter document title"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="documentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Document Type</FormLabel>
                      <Select value={field.value || ""} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="glass-card border-white/20 text-slate-300">
                            <SelectValue placeholder="Select document type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="glass-card border-white/20">
                          <SelectItem value="license">License</SelectItem>
                          <SelectItem value="permit">Permit</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                          <SelectItem value="agreement">Agreement</SelectItem>
                          <SelectItem value="certificate">Certificate</SelectItem>
                          <SelectItem value="registration">Registration</SelectItem>
                          <SelectItem value="authorization">Authorization</SelectItem>
                          <SelectItem value="compliance">Compliance Document</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="companyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Company</FormLabel>
                      <Select value={field.value?.toString() || ""} onValueChange={(value) => field.onChange(parseInt(value))}>
                        <FormControl>
                          <SelectTrigger className="glass-card border-white/20 text-slate-300">
                            <SelectValue placeholder="Select company" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="glass-card border-white/20">
                          {companiesData?.companies?.map((company: any) => (
                            <SelectItem key={company.id} value={company.id.toString()}>{company.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <label className="text-sm font-medium text-slate-300">Locations</label>
                  <MultiLocationSelect
                    locations={locationsData?.locations || []}
                    selectedLocationIds={selectedLocations}
                    onSelectionChange={setSelectedLocations}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="documentNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Document Number</FormLabel>
                      <FormControl>
                        <Input 
                          className="glass-card border-white/20 text-slate-300"
                          placeholder="Enter document number"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="issuingAuthority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Issuing Authority</FormLabel>
                      <FormControl>
                        <Input 
                          className="glass-card border-white/20 text-slate-300"
                          placeholder="Enter issuing authority"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="issueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Issue Date</FormLabel>
                      <FormControl>
                        <Input 
                          type="date"
                          className="glass-card border-white/20 text-slate-300"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Expiry Date</FormLabel>
                      <FormControl>
                        <Input 
                          type="date"
                          className="glass-card border-white/20 text-slate-300"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Status</FormLabel>
                      <Select value={field.value || ""} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="glass-card border-white/20 text-slate-300">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="glass-card border-white/20">
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="expired">Expired</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                    className="border-white/20 text-slate-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {createMutation.isPending ? "Creating..." : "Create Document"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Table */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search legal documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 glass-card border-white/20 text-slate-300"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-6">
            <table className="w-full min-w-max">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Document</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Type</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Company</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Locations</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Issue Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Expiry Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Created</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Created By</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Attachments</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.legalDocuments?.map((document: any, index: number) => (
                  <tr key={document.id} className="table-row border-b border-white/5 hover:bg-blue-500/10">
                    <td className="py-4 px-4 text-sm font-medium text-white">
                      {index + 1}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-400" />
                        <div>
                          <span className="text-sm text-slate-300 font-medium">{document.title}</span>
                          {document.documentNumber && (
                            <div className="text-xs text-slate-500">#{document.documentNumber}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant="outline" className="text-xs bg-purple-500/20 text-purple-300 border-purple-500/50">
                        {document.documentType}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-orange-400" />
                        <span className="text-sm text-slate-300">
                          {companiesData?.companies?.find((c: any) => c.id === document.companyId)?.name || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <LocationsDisplay 
                        locationIds={document.locationIds} 
                        locations={locationsData?.locations || []} 
                      />
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-400" />
                        <span className="text-sm text-slate-300">
                          {document.issueDate ? new Date(document.issueDate).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-red-400" />
                        <span className="text-sm text-slate-300">
                          {document.expiryDate ? new Date(document.expiryDate).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={getStatusColor(document.status)}>
                        {document.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-300">
                      {document.createdAt ? new Date(document.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-300">
                      {document.userId ? `User ${document.userId}` : 'N/A'}
                    </td>
                    <td className="py-4 px-4">
                      <AttachmentButton
                        entityType="legal_document"
                        entityId={document.id}
                      />
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(document)}
                          className="text-slate-400 hover:text-slate-300"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(document.id)}
                          className="text-red-400 hover:text-red-300"
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
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="glass-card border-white/20 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-slate-100">Edit Legal Document</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">Document Title</FormLabel>
                    <FormControl>
                      <Input 
                        className="glass-card border-white/20 text-slate-300"
                        placeholder="Enter document title"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="documentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">Document Type</FormLabel>
                    <Select value={field.value || ""} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="glass-card border-white/20 text-slate-300">
                          <SelectValue placeholder="Select document type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="glass-card border-white/20">
                        <SelectItem value="license">License</SelectItem>
                        <SelectItem value="permit">Permit</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="agreement">Agreement</SelectItem>
                        <SelectItem value="certificate">Certificate</SelectItem>
                        <SelectItem value="registration">Registration</SelectItem>
                        <SelectItem value="authorization">Authorization</SelectItem>
                        <SelectItem value="compliance">Compliance Document</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="companyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">Company</FormLabel>
                    <Select value={field.value?.toString() || ""} onValueChange={(value) => field.onChange(parseInt(value))}>
                      <FormControl>
                        <SelectTrigger className="glass-card border-white/20 text-slate-300">
                          <SelectValue placeholder="Select company" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="glass-card border-white/20">
                        {companiesData?.companies?.map((company: any) => (
                          <SelectItem key={company.id} value={company.id.toString()}>{company.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="documentNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">Document Number</FormLabel>
                    <FormControl>
                      <Input 
                        className="glass-card border-white/20 text-slate-300"
                        placeholder="Enter document number"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="issuingAuthority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">Issuing Authority</FormLabel>
                    <FormControl>
                      <Input 
                        className="glass-card border-white/20 text-slate-300"
                        placeholder="Enter issuing authority"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="issueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">Issue Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date"
                        className="glass-card border-white/20 text-slate-300"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="expiryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">Expiry Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date"
                        className="glass-card border-white/20 text-slate-300"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">Status</FormLabel>
                    <Select value={field.value || ""} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="glass-card border-white/20 text-slate-300">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="glass-card border-white/20">
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="border-white/20 text-slate-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {updateMutation.isPending ? "Updating..." : "Update Document"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}