import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { FileText, Receipt, Shield, AlertTriangle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function FinancialOverview() {
  const { data: invoices, isLoading: invoicesLoading } = useQuery({
    queryKey: ['/api/invoices'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/invoices');
      return response.json();
    },
  });

  const { data: legalDocuments, isLoading: legalLoading } = useQuery({
    queryKey: ['/api/legal-documents'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/legal-documents');
      return response.json();
    },
  });

  const { data: rentAgreements, isLoading: rentLoading } = useQuery({
    queryKey: ['/api/rent-agreements'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/rent-agreements');
      return response.json();
    },
  });

  const isLoading = invoicesLoading || legalLoading || rentLoading;

  // Calculate financial statistics
  const totalInvoices = invoices?.invoices?.length || 0;
  const paidInvoices = invoices?.invoices?.filter((invoice: any) => invoice.status === 'paid').length || 0;
  const pendingInvoices = invoices?.invoices?.filter((invoice: any) => invoice.status === 'pending').length || 0;
  const totalLegalDocs = legalDocuments?.legalDocuments?.length || 0;
  const activeRentAgreements = rentAgreements?.rentAgreements?.filter((agreement: any) => agreement.status === 'active').length || 0;

  // Calculate total amounts
  const totalPaidAmount = invoices?.invoices
    ?.filter((invoice: any) => invoice.status === 'paid')
    ?.reduce((sum: number, invoice: any) => sum + Number(invoice.totalAmount || 0), 0) || 0;

  const totalPendingAmount = invoices?.invoices
    ?.filter((invoice: any) => invoice.status === 'pending')
    ?.reduce((sum: number, invoice: any) => sum + Number(invoice.totalAmount || 0), 0) || 0;

  // Get recent invoices
  const recentInvoices = invoices?.invoices?.slice(0, 3) || [];

  return (
    <Card className="glass-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-500/20 rounded-lg">
            <Receipt className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Financial Overview</h3>
            <p className="text-sm text-slate-400">Invoices & Legal Documents</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="text-emerald-500 hover:text-emerald-400">
          View All
        </Button>
      </div>
      
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="loading-shimmer h-16 rounded-xl"></div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Financial Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-slate-800/50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Receipt className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-emerald-400">{totalInvoices}</div>
              <div className="text-xs text-slate-400">Total Invoices</div>
            </div>
            
            <div className="text-center p-4 bg-slate-800/50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <FileText className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-blue-400">{paidInvoices}</div>
              <div className="text-xs text-slate-400">Paid</div>
            </div>
            
            <div className="text-center p-4 bg-slate-800/50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <AlertTriangle className="w-6 h-6 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-amber-400">{pendingInvoices}</div>
              <div className="text-xs text-slate-400">Pending</div>
            </div>
            
            <div className="text-center p-4 bg-slate-800/50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Shield className="w-6 h-6 text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-purple-400">{totalLegalDocs}</div>
              <div className="text-xs text-slate-400">Legal Docs</div>
            </div>
          </div>

          {/* Amount Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 rounded-xl p-4 border border-emerald-500/20">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-white">Paid Amount</h4>
                <Receipt className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-emerald-400">
                €{totalPaidAmount.toLocaleString()}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                {paidInvoices} invoices processed
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl p-4 border border-amber-500/20">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-white">Pending Amount</h4>
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-amber-400">
                €{totalPendingAmount.toLocaleString()}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                {pendingInvoices} invoices pending
              </div>
            </div>
          </div>

          {/* Recent Invoices */}
          <div className="bg-slate-800/50 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-white mb-3">Recent Invoices</h4>
            <div className="space-y-3">
              {recentInvoices.length > 0 ? (
                recentInvoices.map((invoice: any) => (
                  <div key={invoice.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        invoice.status === 'paid' ? 'bg-emerald-400' : 'bg-amber-400'
                      }`} />
                      <div>
                        <p className="text-sm font-medium text-white">{invoice.invoiceNumber}</p>
                        <p className="text-xs text-slate-400">
                          {new Date(invoice.invoiceDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-white">
                        €{Number(invoice.totalAmount || 0).toLocaleString()}
                      </p>
                      <p className={`text-xs ${
                        invoice.status === 'paid' ? 'text-emerald-400' : 'text-amber-400'
                      }`}>
                        {invoice.status}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-slate-400">
                  <span className="text-2xl mb-2 block">📄</span>
                  No invoices found
                </div>
              )}
            </div>
          </div>

          {/* Rent Agreements Summary */}
          <div className="bg-slate-800/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-white">Rent Agreements</h4>
              <Shield className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{activeRentAgreements}</div>
              <div className="text-xs text-slate-400">Active agreements</div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
} 