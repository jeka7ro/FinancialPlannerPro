import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Calendar, MapPin, Clock, CheckCircle, AlertTriangle, CreditCard } from "lucide-react";

const markPaidSchema = z.object({
  paidAmount: z.string().min(1, "Paid amount is required"),
  paidDate: z.string().min(1, "Payment date is required"),
  paymentMethod: z.string().min(1, "Payment method is required"),
  paymentReference: z.string().optional(),
});

type MarkPaidFormData = z.infer<typeof markPaidSchema>;

export default function AutomatedBills() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isMarkPaidDialogOpen, setIsMarkPaidDialogOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<any>(null);
  const { toast } = useToast();
  const limit = 10;

  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/automated-bills', currentPage, limit, searchTerm],
    queryFn: async () => {
      const response = await fetch(`/api/automated-bills?page=${currentPage}&limit=${limit}&search=${searchTerm}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch automated bills');
      return response.json();
    },
  });

  const { data: locations } = useQuery({
    queryKey: ['/api/locations'],
    queryFn: async () => {
      const response = await fetch('/api/locations?limit=100', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch locations');
      return response.json();
    },
  });

  const markPaidMutation = useMutation({
    mutationFn: async ({ billId, data }: { billId: number; data: MarkPaidFormData }) => {
      return await apiRequest(`/api/automated-bills/${billId}/mark-paid`, "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/automated-bills'] });
      setIsMarkPaidDialogOpen(false);
      setSelectedBill(null);
      form.reset();
      toast({
        title: "Success",
        description: "Bill marked as paid successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to mark bill as paid. Please try again.",
        variant: "destructive",
      });
    },
  });

  const form = useForm<MarkPaidFormData>({
    resolver: zodResolver(markPaidSchema),
    defaultValues: {
      paidAmount: "",
      paidDate: new Date().toISOString().split('T')[0],
      paymentMethod: "",
      paymentReference: "",
    },
  });

  const onMarkPaidSubmit = (data: MarkPaidFormData) => {
    if (selectedBill) {
      markPaidMutation.mutate({ billId: selectedBill.id, data });
    }
  };

  const handleMarkPaid = (bill: any) => {
    setSelectedBill(bill);
    form.reset({
      paidAmount: bill.totalAmount,
      paidDate: new Date().toISOString().split('T')[0],
      paymentMethod: "",
      paymentReference: "",
    });
    setIsMarkPaidDialogOpen(true);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const getLocationName = (locationId: number) => {
    return locations?.locations?.find((l: any) => l.id === locationId)?.name || 'Unknown Location';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'status-active';
      case 'pending': return 'status-pending';
      case 'overdue': return 'status-inactive';
      case 'cancelled': return 'bg-slate-600';
      default: return 'bg-slate-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'overdue': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  const isOverdue = (dueDate: string, status: string) => {
    return status === 'pending' && new Date(dueDate) < new Date();
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">Error loading automated bills: {error.message}</div>;
  }

  const totalPages = Math.ceil(data.total / limit);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Automated Bills</h1>
        <div className="flex space-x-2">
          <Button variant="outline" className="border-green-500 text-green-500 hover:bg-green-500/10">
            <DollarSign className="w-4 h-4 mr-2" />
            Generate Bills
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="flex space-x-4">
        <Input
          placeholder="🔍 Search bills..."
          value={searchTerm}
          onChange={handleSearch}
          className="max-w-md bg-slate-800 border-slate-700 text-white"
        />
      </div>

      {/* Bills Table */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Generated Bills</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Bill Number</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Location</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Period</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Due Date</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Amount</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Status</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.automatedBills?.map((bill: any) => (
                  <tr key={bill.id} className={`border-b border-slate-700/50 hover:bg-slate-700/20 ${
                    isOverdue(bill.dueDate, bill.status) ? 'bg-red-900/10' : ''
                  }`}>
                    <td className="py-4 px-4">
                      <span className="text-sm font-medium text-white">
                        {bill.billNumber}
                      </span>
                      {bill.isAutomated && (
                        <Badge className="ml-2 bg-blue-600 text-white text-xs">
                          Auto
                        </Badge>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-300">
                          {getLocationName(bill.locationId)}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-300">
                      {new Date(bill.billingPeriodStart).toLocaleDateString()} - {new Date(bill.billingPeriodEnd).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className={`text-sm ${
                          isOverdue(bill.dueDate, bill.status) ? 'text-red-400' : 'text-slate-300'
                        }`}>
                          {new Date(bill.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium text-white">
                          ${parseFloat(bill.totalAmount).toLocaleString()}
                        </span>
                      </div>
                      {bill.paidAmount && parseFloat(bill.paidAmount) > 0 && (
                        <div className="text-xs text-slate-400">
                          Paid: ${parseFloat(bill.paidAmount).toLocaleString()}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(isOverdue(bill.dueDate, bill.status) ? 'overdue' : bill.status)}
                        <Badge className={getStatusColor(isOverdue(bill.dueDate, bill.status) ? 'overdue' : bill.status)}>
                          {isOverdue(bill.dueDate, bill.status) ? 'Overdue' : bill.status}
                        </Badge>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex justify-end space-x-2">
                        {bill.status === 'pending' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-500 hover:text-green-400"
                            onClick={() => handleMarkPaid(bill)}
                          >
                            <CreditCard className="w-4 h-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-400">
                          👁️
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

      {/* Mark as Paid Dialog */}
      <Dialog open={isMarkPaidDialogOpen} onOpenChange={setIsMarkPaidDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Mark Bill as Paid</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onMarkPaidSubmit)} className="space-y-4">
              <div className="bg-slate-700/30 p-4 rounded-lg">
                <div className="text-sm text-slate-400">Bill Number</div>
                <div className="text-lg font-medium text-white">{selectedBill?.billNumber}</div>
                <div className="text-sm text-slate-400 mt-1">
                  Total Amount: <span className="text-white">${parseFloat(selectedBill?.totalAmount || 0).toLocaleString()}</span>
                </div>
              </div>

              <FormField
                control={form.control}
                name="paidAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Paid Amount ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paidDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Bank Transfer, Cash, Card" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentReference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Reference (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Transaction ID, Check Number, etc." {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsMarkPaidDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={markPaidMutation.isPending} className="bg-green-600 hover:bg-green-700">
                  {markPaidMutation.isPending ? "Processing..." : "Mark as Paid"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Pagination */}
      {totalPages > 1 && (
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
      )}
    </div>
  );
}