import { useState } from "react";
import { ImportExportDialog } from "@/components/ui/import-export-dialog";
import { useQuery, useMutation } from "@tanstack/react-query";
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
import { insertLegalDocumentSchema, type InsertLegalDocument } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Upload, Edit, Trash2, Plus, Search } from "lucide-react";
import { AttachmentButton } from "@/components/ui/attachment-button";
import { BulkOperations } from "@/components/ui/bulk-operations";
import { Checkbox } from "@/components/ui/checkbox";

const getDocumentTypeColor = (documentType: string) => {
  switch (documentType?.toLowerCase()) {
    case 'contract':
      return 'status-active';
    case 'license':
      return 'status-maintenance';
    case 'permit':
      return 'bg-blue-500/20 text-blue-400';
    case 'agreement':
      return 'bg-purple-500/20 text-purple-400';
    case 'other':
      return 'bg-gray-500/20 text-gray-400';
    default:
      return 'bg-gray-500/20 text-gray-400';
  }
};

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'active':
      return 'status-active';
    case 'pending':
      return 'status-maintenance';
    case 'expired':
      return 'status-inactive';
    case 'cancelled':
      return 'bg-gray-500/20 text-gray-400';
    default:
      return 'bg-gray-500/20 text-gray-400';
  }
};

export default function Legal() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<any>(null);
  const [selectedDocuments, setSelectedDocuments] = useState<number[]>([]);
  const { toast } = useToast();
  const limit = 10;

  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/legal-documents', currentPage, limit, searchTerm],
    queryFn: async () => {
      const searchParam = searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : '';
      const response = await apiRequest('GET', `/api/legal-documents?page=${currentPage}&limit=${limit}${searchParam}`);
      return response.json();
    },
  });

  const { data: companies } = useQuery({
    queryKey: ['/api/companies', 1, 100],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/companies?page=1&limit=100');
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertLegalDocument) => {
      return await apiRequest("POST", "/api/legal-documents", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/legal-documents'] });
      setIsCreateDialogOpen(false);
      form.reset();
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

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: InsertLegalDocument }) =>
      apiRequest("PUT", `/api/legal-documents/${id}`, data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Legal document updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/legal-documents"] });
      setIsEditDialogOpen(false);
      setEditingDocument(null);
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
    mutationFn: (id: number) => apiRequest("DELETE", `/api/legal-documents/${id}`),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Legal document deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/legal-documents"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete legal document",
        variant: "destructive",
      });
    },
  });

  const form = useForm<InsertLegalDocument>({
    resolver: zodResolver(insertLegalDocumentSchema),
    defaultValues: {
      title: "",
      documentType: "contract",
      status: "active",
    },
  });

  const editForm = useForm<InsertLegalDocument>({
    resolver: zodResolver(insertLegalDocumentSchema),
    defaultValues: {
      title: "",
      documentType: "contract",
      status: "active",
    },
  });

  const onSubmit = (data: InsertLegalDocument) => {
    createMutation.mutate(data);
  };

  const onEditSubmit = (data: InsertLegalDocument) => {
    if (editingDocument) {
      updateMutation.mutate({ id: editingDocument.id, data });
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this legal document?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (document: any) => {
    setEditingDocument(document);
    editForm.reset({
      title: document.title || "",
      documentType: document.documentType || "contract",
      companyId: document.companyId,
      issueDate: document.issueDate ? (typeof document.issueDate === "string" ? document.issueDate : document.issueDate.toISOString().split('T')[0]) : "",
      expiryDate: document.expiryDate ? (typeof document.expiryDate === "string" ? document.expiryDate : document.expiryDate.toISOString().split('T')[0]) : "",
      status: document.status || "active",
      // description: document.description || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSelectAll = () => {
    if (selectedDocuments.length === data?.legalDocuments?.length) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(data?.legalDocuments?.map((item: any) => item.id) || []);
    }
  };

  const handleSelectDocument = (id: number) => {
    setSelectedDocuments(prev => 
      prev.includes(id) 
        ? prev.filter(docId => docId !== id)
        : [...prev, id]
    );
  };

  const handleBulkEdit = () => {
    toast({
      title: "Bulk Edit",
      description: `Editing ${selectedDocuments.length} legal documents`,
    });
  };

  const handleBulkDelete = () => {
    if (selectedDocuments.length === 0) return;
    
    toast({
      title: "Bulk Delete",
      description: `Deleting ${selectedDocuments.length} legal documents`,
      variant: "destructive",
    });
  };

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BulkOperations 
            selectedCount={selectedDocuments.length}
            onBulkEdit={handleBulkEdit}
            onBulkDelete={handleBulkDelete}
          />
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500 text-white font-medium px-4 py-2 rounded-lg">
                <Plus className="h-4 w-4 mr-2" />
                Add new
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-dialog dialog-lg">
              <DialogHeader>
                <DialogTitle className="text-white">Create New Legal Document</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Add a new legal document for compliance and regulatory purposes.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Document Title</FormLabel>
                        <FormControl>
                          <Input {...field} className="form-input" placeholder="Enter document title" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="documentType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Document Type</FormLabel>
                          <FormControl>
                            <Input {...field} className="form-input" placeholder="License, Certificate, etc." />
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
                          <FormLabel className="text-white">Status</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value ?? ""}>
                            <FormControl>
                              <SelectTrigger className="form-input">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
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
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="border-white/20 text-white hover:bg-white/10">
                      Cancel
                    </Button>
                    <Button type="submit" className="floating-action text-white" disabled={createMutation.isPending}>
                      {createMutation.isPending ? "Creating..." : "Create Document"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          {/* Edit Document Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="glass-dialog dialog-lg">
              <DialogHeader>
                <DialogTitle className="text-white">Edit Legal Document</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Update legal document information and details.
                </DialogDescription>
              </DialogHeader>
              <Form {...editForm}>
                <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                  <FormField
                    control={editForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Document Title</FormLabel>
                        <FormControl>
                          <Input {...field} value={typeof field.value === "string" ? field.value : ""} className="form-input" placeholder="Enter document title" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="documentType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Document Type</FormLabel>
                          <FormControl>
                            <Input {...field} value={typeof field.value === "string" ? field.value : ""} className="form-input" placeholder="License, Certificate, etc." />
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
                          <FormLabel className="text-white">Status</FormLabel>
                          <Select onValueChange={field.onChange} value={typeof field.value === "string" ? field.value : ""}>
                            <FormControl>
                              <SelectTrigger className="form-input">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
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
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)} className="border-white/20 text-white hover:bg-white/10">
                      Cancel
                    </Button>
                    <Button type="submit" className="floating-action text-white" disabled={updateMutation.isPending}>
                      {updateMutation.isPending ? "Updating..." : "Update Document"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Enhanced Search */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <div className="search-card">
          <div className="flex items-center gap-4">
            <div className="relative" style={{ flex: '3', minWidth: '500px' }}>
              <Input
                type="text"
                placeholder="Search documents by title, type, or status..."
                value={searchTerm}
                onChange={handleSearch}
                className="enhanced-input pl-12 pr-4 py-4 text-base text-right"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400 h-5 w-5" />
            </div>

            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500 text-white font-medium px-4 py-2 rounded-lg">
                <Plus className="h-4 w-4 mr-2" />
                Add new
              </Button>
            </DialogTrigger>

            <ImportExportDialog module="legal-documents" moduleName="Legal Documents">
              <Button className="bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500 text-white font-medium px-4 py-2 rounded-lg">
                <Upload className="h-4 w-4 mr-2" />
                Import/Export
              </Button>
            </ImportExportDialog>
          </div>
        </div>
      </Dialog>

      {/* Enhanced Legal Documents Table */}
      <div className="search-card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold heading-gradient">Legal Documents</h2>
            <p className="text-slate-400 mt-1">Legal compliance and documentation management</p>
          </div>
          <div className="text-sm text-slate-400">
            {data?.total || 0} total documents
          </div>
        </div>

        {isLoading ? (
          <div className="loading-container">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="loading-shimmer h-20"></div>
            ))}
          </div>
        ) : error ? (
          <div className="error-state-container">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-white mb-2">Failed to load legal documents</h3>
            <p>Please try refreshing the page or check your connection.</p>
          </div>
        ) : !data?.legalDocuments?.length ? (
          <div className="empty-state-container">
            <div className="text-6xl mb-4">⚖️</div>
            <h3 className="text-xl font-semibold text-white mb-2">No legal documents found</h3>
            <p>Get started by creating your first legal document.</p>
          </div>
        ) : (
          <>
            <div className="enhanced-table-wrapper">
              <table className="enhanced-table">
                <thead>
                  <tr>
                    <th className="w-12">
                      <Checkbox
                        checked={selectedDocuments.length === data?.legalDocuments.length && data?.legalDocuments.length > 0}
                        onCheckedChange={handleSelectAll}
                        className="border-white/30"
                      />
                    </th>
                    <th className="w-16">#</th>
                    <th>Document</th>
                    <th>Company</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Issue Date</th>
                    <th>Attachments</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.legalDocuments.map((document: any, index: number) => (
                    <tr key={document.id}>
                      <td>
                        <Checkbox
                          checked={selectedDocuments.includes(document.id)}
                          onCheckedChange={() => handleSelectDocument(document.id)}
                          className="border-white/30"
                        />
                      </td>
                      <td>
                        <div className="table-cell-primary font-medium">
                          {(currentPage - 1) * limit + index + 1}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                            <span className="text-purple-400 text-lg">⚖️</span>
                          </div>
                          <div>
                            <div className="table-cell-primary">{document.title}</div>
                            <div className="table-cell-secondary">Doc #{document.id}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="table-cell-primary">
                          {companies?.companies?.find((c: any) => c.id === document.companyId)?.name || 'No company'}
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${getDocumentTypeColor(document.documentType)}`}>
                          {document.documentType}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${getStatusColor(document.status)}`}>
                          {document.status}
                        </span>
                      </td>
                      <td>
                        <div className="table-cell-primary">
                          {document.issueDate ? new Date(document.issueDate).toLocaleDateString() : 'No date'}
                        </div>
                      </td>
                      <td>
                        <AttachmentButton 
                          entityType="legal-documents" 
                          entityId={document.id}
                        />
                      </td>
                      <td>
                        <div className="action-button-group justify-end">
                          <button 
                            className="action-button text-amber-500 hover:text-amber-400"
                            onClick={() => handleEdit(document)}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            className="action-button text-red-500 hover:text-red-400"
                            onClick={() => handleDelete(document.id)}
                            disabled={deleteMutation.isPending}
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
      {data?.legalDocuments?.length > 0 && (
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
    </div>
  );
}
