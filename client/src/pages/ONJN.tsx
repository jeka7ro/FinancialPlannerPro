import { useState } from "react";
import { ImportExportDialog } from "@/components/ui/import-export-dialog";
import { AttachmentButton } from "@/components/ui/attachment-button";
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
import { insertOnjnReportSchema, type InsertOnjnReport } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Upload, Calendar, FileText, Edit, Trash2 } from "lucide-react";
import { safeFormValue } from "@/utils/formUtils";

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case 'approved':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'rejected':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    case 'draft':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
};

export default function ONJN() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<any>(null);
  const { toast } = useToast();
  const limit = 10;

  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/onjn-reports', currentPage, limit, searchTerm],
    queryFn: async () => {
      const response = await fetch(`/api/onjn-reports?page=${currentPage}&limit=${limit}&search=${searchTerm}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch ONJN reports');
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

  const { data: locations } = useQuery({
    queryKey: ['/api/locations', 1, 100],
    queryFn: async () => {
      const response = await fetch('/api/locations?page=1&limit=100', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch locations');
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertOnjnReport) => {
      return await apiRequest("POST", "/api/onjn-reports", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/onjn-reports'] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "License commission created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create license commission. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertOnjnReport> }) => {
      return await apiRequest("PUT", `/api/onjn-reports/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/onjn-reports'] });
      setIsEditDialogOpen(false);
      setEditingReport(null);
      editForm.reset();
      toast({
        title: "Success",
        description: "License commission updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update license commission. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/onjn-reports/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/onjn-reports'] });
      toast({
        title: "Success",
        description: "License commission deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete license commission. Please try again.",
        variant: "destructive",
      });
    },
  });

  const form = useForm<InsertOnjnReport>({
    resolver: zodResolver(insertOnjnReportSchema),
    defaultValues: {
      commissionType: "license_commission",
      serialNumbers: "",
      status: "draft",
      notes: "",
    },
  });

  const editForm = useForm<InsertOnjnReport>({
    resolver: zodResolver(insertOnjnReportSchema),
    defaultValues: {
      commissionType: "license_commission",
      serialNumbers: "",
      status: "draft",
      notes: "",
    },
  });

  const onSubmit = (data: InsertOnjnReport) => {
    createMutation.mutate(data);
  };

  const onEditSubmit = (data: InsertOnjnReport) => {
    if (editingReport) {
      updateMutation.mutate({ id: editingReport.id, data });
    }
  };

  const handleEdit = (report: any) => {
    setEditingReport(report);
    editForm.reset({
      commissionType: report.commissionType || "license_commission",
      commissionDate: report.commissionDate ? new Date(report.commissionDate) : new Date(),
      serialNumbers: report.serialNumbers || "",
      companyId: report.companyId || undefined,
      locationId: report.locationId || undefined,
      submissionDate: report.submissionDate ? new Date(report.submissionDate) : undefined,
      status: report.status || "draft",
      notes: report.notes || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (reportId: number) => {
    if (confirm("Are you sure you want to delete this license commission?")) {
      deleteMutation.mutate(reportId);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  // Function to find commission date by matching slot serial number with ONJN serial numbers
  const findCommissionDateBySerialNumber = (slotSerialNumber: string) => {
    if (!data?.onjnReports || !slotSerialNumber) return null;
    
    const matchingReport = data.onjnReports.find((report: any) => {
      if (!report.serialNumbers) return false;
      const serialNumbers = report.serialNumbers.split(' ').filter((sn: string) => sn.trim());
      return serialNumbers.includes(slotSerialNumber);
    });
    
    return matchingReport?.commissionDate ? new Date(matchingReport.commissionDate).toLocaleDateString() : null;
  };

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ImportExportDialog module="onjn-reports" moduleName="License Commissions">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
              <Upload className="h-4 w-4 mr-2" />
              Import/Export
            </Button>
          </ImportExportDialog>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="floating-action text-white">
              <span className="mr-2">➕</span>
              Create License Commission
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-white/10 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">Create License Commission</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="commissionDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Commission Date</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            value={field.value ? (field.value instanceof Date ? field.value.toISOString().split('T')[0] : new Date(field.value).toISOString().split('T')[0]) : ""}
                            onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                            className="form-input"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="serialNumbers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Serial Numbers</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} className="form-input" placeholder="Enter serial numbers (space separated)" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                    name="locationId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Location</FormLabel>
                        <Select value={field.value?.toString()} onValueChange={(value) => field.onChange(parseInt(value))}>
                          <FormControl>
                            <SelectTrigger className="form-input">
                              <SelectValue placeholder="Select location" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="glass-card border-white/10">
                            {locations?.locations?.map((location: any) => (
                              <SelectItem key={location.id} value={location.id.toString()}>
                                {location.name}
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
                    name="submissionDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Submission Date</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            value={field.value ? new Date(field.value).toISOString().split('T')[0] : ""}
                            onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                            className="form-input"
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
                        <FormLabel className="text-white">Status</FormLabel>
                        <Select value={field.value || ""} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="form-input">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="glass-card border-white/10">
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Notes</FormLabel>
                      <FormControl>
                        <Textarea {...field} value={field.value || ""} className="form-input" placeholder="Enter any additional notes" />
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
                    {createMutation.isPending ? "Creating..." : "Create Commission"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card className="glass-card border-white/10">
        <CardContent className="p-6">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search license commissions by serial numbers..."
              value={searchTerm}
              onChange={handleSearch}
              className="form-input pl-10"
            />
            <span className="absolute left-3 top-3 text-slate-400">🔍</span>
          </div>
        </CardContent>
      </Card>

      {/* License Commissions List */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white">License Commissions</CardTitle>
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
              Failed to load license commissions
            </div>
          ) : !data?.onjnReports?.length ? (
            <div className="text-center py-8 text-slate-400">
              <span className="text-2xl mb-2 block">📄</span>
              No license commissions found
            </div>
          ) : (
            <>
              <div className="overflow-x-auto -mx-6">
                <table className="w-full min-w-max">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Commission Date</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Serial Numbers</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Company</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Location</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Submission Date</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Attachments</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.onjnReports.map((report: any) => (
                      <tr key={report.id} className="table-row border-b border-white/5 hover:bg-blue-500/10">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-blue-400" />
                            <span className="text-sm text-slate-300">
                              {report.commissionDate ? new Date(report.commissionDate).toLocaleDateString() : 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-wrap gap-1">
                            {report.serialNumbers ? report.serialNumbers.split(' ').filter((sn: string) => sn.trim()).map((serial: string, index: number) => (
                              <Badge key={index} className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border text-xs">
                                {serial}
                              </Badge>
                            )) : (
                              <span className="text-sm text-slate-400">No serial numbers</span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-300">
                          {companies?.companies?.find((c: any) => c.id === report.companyId)?.name || 'N/A'}
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-300">
                          {locations?.locations?.find((l: any) => l.id === report.locationId)?.name || 'N/A'}
                        </td>
                        <td className="py-4 px-4">
                          <Badge className={`${getStatusColor(report.status)} border`}>
                            {report.status}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-300">
                          {report.submissionDate ? new Date(report.submissionDate).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-4 px-4">
                          <AttachmentButton 
                            entityType="onjn-report" 
                            entityId={report.id}
                          />
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(report)}
                              className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/20"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(report.id)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-slate-400">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="glass-card border-white/10 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Edit License Commission</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="commissionDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Commission Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          value={field.value ? new Date(field.value).toISOString().split('T')[0] : ""}
                          onChange={(e) => field.onChange(new Date(e.target.value))}
                          className="form-input"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="serialNumbers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Serial Numbers</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} className="form-input" placeholder="Enter serial numbers (space separated)" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
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
                  control={editForm.control}
                  name="locationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Location</FormLabel>
                      <Select value={field.value?.toString()} onValueChange={(value) => field.onChange(parseInt(value))}>
                        <FormControl>
                          <SelectTrigger className="form-input">
                            <SelectValue placeholder="Select location" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="glass-card border-white/10">
                          {locations?.locations?.map((location: any) => (
                            <SelectItem key={location.id} value={location.id.toString()}>
                              {location.name}
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
                  name="submissionDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Submission Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          value={field.value ? new Date(field.value).toISOString().split('T')[0] : ""}
                          onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                          className="form-input"
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
                      <FormLabel className="text-white">Status</FormLabel>
                      <Select value={field.value || ""} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="form-input">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="glass-card border-white/10">
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Notes</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value || ""} className="form-input" placeholder="Enter any additional notes" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                  {updateMutation.isPending ? "Updating..." : "Update Commission"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}