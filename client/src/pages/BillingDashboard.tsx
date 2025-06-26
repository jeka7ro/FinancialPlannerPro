import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, DollarSign, FileText, AlertTriangle, CheckCircle } from "lucide-react";
import { Link } from "wouter";

export default function BillingDashboard() {
  const { data: dashboardStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/billing/dashboard'],
    queryFn: async () => {
      const response = await fetch('/api/billing/dashboard', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch billing dashboard stats');
      return response.json();
    },
  });

  const { data: pendingBills, isLoading: pendingLoading } = useQuery({
    queryKey: ['/api/billing/pending-bills'],
    queryFn: async () => {
      const response = await fetch('/api/billing/pending-bills', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch pending bills');
      return response.json();
    },
  });

  const { data: overdueBills, isLoading: overdueLoading } = useQuery({
    queryKey: ['/api/billing/overdue-bills'],
    queryFn: async () => {
      const response = await fetch('/api/billing/overdue-bills', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch overdue bills');
      return response.json();
    },
  });

  if (statsLoading || pendingLoading || overdueLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Billing & Rent Management</h1>
        <div className="flex space-x-2">
          <Link href="/revenue-reports">
            <Button variant="outline" className="border-blue-500 text-blue-500 hover:bg-blue-500/10">
              <FileText className="w-4 h-4 mr-2" />
              Revenue Reports
            </Button>
          </Link>
          <Link href="/billing-plans">
            <Button className="bg-blue-500 hover:bg-blue-600">
              <DollarSign className="w-4 h-4 mr-2" />
              Billing Plans
            </Button>
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Pending Bills</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{dashboardStats?.pendingBills || 0}</div>
            <p className="text-xs text-slate-400">
              Awaiting payment
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Overdue Bills</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{dashboardStats?.overdueBills || 0}</div>
            <p className="text-xs text-slate-400">
              Past due date
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              ${dashboardStats?.totalRevenue?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-slate-400">
              This month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Active Plans</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{dashboardStats?.activeBillingPlans || 0}</div>
            <p className="text-xs text-slate-400">
              Billing plans active
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/automated-bills">
              <Button variant="outline" className="w-full justify-start border-slate-600 text-slate-300 hover:bg-slate-700">
                <FileText className="w-4 h-4 mr-2" />
                View All Bills
              </Button>
            </Link>
            <Link href="/location-billing">
              <Button variant="outline" className="w-full justify-start border-slate-600 text-slate-300 hover:bg-slate-700">
                <Calendar className="w-4 h-4 mr-2" />
                Location Billing Setup
              </Button>
            </Link>
            <Link href="/payment-history">
              <Button variant="outline" className="w-full justify-start border-slate-600 text-slate-300 hover:bg-slate-700">
                <DollarSign className="w-4 h-4 mr-2" />
                Payment History
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Pending Bills */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Recent Pending Bills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingBills?.length === 0 ? (
                <p className="text-slate-400 text-sm">No pending bills</p>
              ) : (
                pendingBills?.slice(0, 5).map((bill: any) => (
                  <div key={bill.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-white">{bill.billNumber}</p>
                      <p className="text-xs text-slate-400">
                        Due: {new Date(bill.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-white">
                        ${parseFloat(bill.totalAmount).toLocaleString()}
                      </p>
                      <Badge className="status-pending">
                        {bill.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Overdue Bills Alert */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2 text-red-500" />
              Overdue Bills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {overdueBills?.length === 0 ? (
                <p className="text-slate-400 text-sm">No overdue bills</p>
              ) : (
                overdueBills?.slice(0, 5).map((bill: any) => (
                  <div key={bill.id} className="flex items-center justify-between p-3 bg-red-900/20 rounded-lg border border-red-800/30">
                    <div>
                      <p className="text-sm font-medium text-white">{bill.billNumber}</p>
                      <p className="text-xs text-red-400">
                        Overdue: {new Date(bill.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-white">
                        ${parseFloat(bill.totalAmount).toLocaleString()}
                      </p>
                      <Badge className="bg-red-600 text-white">
                        Overdue
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}