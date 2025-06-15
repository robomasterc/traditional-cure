'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Typography } from '@/components/ui/typography';
import { DollarSign, TrendingUp, Users, CreditCard } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs-new';
import { Transaction } from '@/types/sheets';
import { FinancialReports } from '@/components/reports/financial-reports';

interface DashboardData {
  summary: {
    todayRevenue: number;
    monthlyRevenue: number;
    pendingPayments: number;
    totalPatients: number;
  };
  recentTransactions: Transaction[];
  paymentMethods: Record<string, { income: number; expenses: number }>;
}

export default function CashDashboardPage() {
  const { data: session } = useSession();
  const [dashboardData, setDashboardData] = React.useState<DashboardData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/cash/dashboard');      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      const data = await response.json() as DashboardData;
      console.log("data===========================",data);
      setDashboardData(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Typography>Loading dashboard data...</Typography>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Typography color="destructive">Error: {error}</Typography>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <Typography variant="h2" className="mb-4">
          Welcome, {session?.user?.name}!
        </Typography>
        <Typography variant="small" color="muted">
          This is your financial dashboard. Here you can manage transactions, billing, and view financial reports.
        </Typography>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-lg bg-green-50 text-green-600">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <Typography variant="small" color="muted">Today's Revenue</Typography>
              <Typography variant="h4">{formatCurrency(dashboardData?.summary.todayRevenue || 0)}</Typography>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <Typography variant="small" color="muted">Monthly Revenue</Typography>
              <Typography variant="h4">{formatCurrency(dashboardData?.summary.monthlyRevenue || 0)}</Typography>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-lg bg-purple-50 text-purple-600">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <Typography variant="small" color="muted">Total Patients</Typography>
              <Typography variant="h4">{dashboardData?.summary.totalPatients || 0}</Typography>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-lg bg-amber-50 text-amber-600">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <Typography variant="small" color="muted">Pending Payments</Typography>
              <Typography variant="h4">{formatCurrency(dashboardData?.summary.pendingPayments || 0)}</Typography>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <Tabs defaultValue="transactions" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
            <TabsTrigger value="payments">Payment Methods</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="mt-6">
            <Typography variant="h4" className="mb-4">Recent Transactions</Typography>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {dashboardData?.recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 bg-white rounded-lg border">
                  <div className="flex items-center justify-between w-full">
                    <Typography variant="small" className="font-medium">
                      {new Date(transaction.date).toLocaleDateString()} | {transaction.description}
                    </Typography>
                    <Typography
                      variant="small"
                      className={transaction.type === 'Income' ? 'text-green-600' : 'text-red-600'}
                    >
                      {transaction.type === 'Income' ? '+' : '-'}
                      {formatCurrency(transaction.cash + transaction.upi)}
                    </Typography>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="payments" className="mt-6">
            <Typography variant="h4" className="mb-4">Payment Methods</Typography>
            <div className="space-y-4">
              {Object.entries(dashboardData?.paymentMethods || {}).map(([method, data]) => (
                <div key={method} className="p-4 bg-white rounded-lg border">
                  <Typography variant="small" className="font-medium mb-2">
                    {method}
                  </Typography>
                  <div className="flex items-center justify-between">
                    <div>
                      <Typography variant="small" color="muted">Income</Typography>
                      <Typography variant="small" className="text-green-600">
                        {formatCurrency(data.income)}
                      </Typography>
                    </div>
                    <div>
                      <Typography variant="small" color="muted">Expenses</Typography>
                      <Typography variant="small" className="text-red-600">
                        {formatCurrency(data.expenses)}
                      </Typography>
                    </div>
                    <div>
                      <Typography variant="small" color="muted">Net</Typography>
                      <Typography 
                        variant="small" 
                        className={data.income - data.expenses >= 0 ? 'text-green-600' : 'text-red-600'}
                      >
                        {formatCurrency(data.income - data.expenses)}
                      </Typography>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      <FinancialReports />
    </div>
  );
} 