'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Typography } from '@/components/ui/typography';
import { DollarSign, TrendingUp, Users, CreditCard, Calendar, CalendarDays, CalendarRange, PieChart } from 'lucide-react';
import { useSession } from 'next-auth/react';
// import { ReportsPage } from '../reports/page';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs-new';
import { DatePicker } from '@/components/ui/date-picker';
import { Button } from '@/components/ui/button';
import { Transaction } from '@/types/sheets';

interface DashboardData {
  summary: {
    todayRevenue: number;
    monthlyRevenue: number;
    pendingPayments: number;
    totalPatients: number;
  };
  recentTransactions: Transaction[];
  paymentMethods: Record<string, number>;
}

export default function CashDashboardPage() {
  const { data: session } = useSession();
  const [startDate, setStartDate] = React.useState<Date | null>(null);
  const [endDate, setEndDate] = React.useState<Date | null>(null);
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
            <div className="space-y-4">
              {dashboardData?.recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 bg-white rounded-lg border">
                  <div>
                    <Typography variant="small" className="font-medium">
                      {transaction.description}
                    </Typography>
                    <Typography variant="small" color="muted">
                      {new Date(transaction.date).toLocaleDateString()}
                    </Typography>
                  </div>
                  <Typography
                    variant="small"
                    className={transaction.type === 'Income' ? 'text-green-600' : 'text-red-600'}
                  >
                    {transaction.type === 'Income' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </Typography>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="payments" className="mt-6">
            <Typography variant="h4" className="mb-4">Payment Methods</Typography>
            <div className="space-y-4">
              {Object.entries(dashboardData?.paymentMethods || {}).map(([method, amount]) => (
                <div key={method} className="flex items-center justify-between p-4 bg-white rounded-lg border">
                  <Typography variant="small" className="font-medium">
                    {method}
                  </Typography>
                  <Typography variant="small" className="text-green-600">
                    {formatCurrency(amount)}
                  </Typography>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      <Card className="p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex-1">
            <Typography variant="small" className="mb-2">Start Date</Typography>
            <DatePicker
              selected={startDate}
              onChange={setStartDate}
              placeholderText="Select start date"
              className="w-full p-2 border rounded-md bg-white shadow-sm"
            />
          </div>
          <div className="flex-1">
            <Typography variant="small" className="mb-2">End Date</Typography>
            <DatePicker
              selected={endDate}
              onChange={setEndDate}
              placeholderText="Select end date"
              className="w-full p-2 border rounded-md bg-white shadow-sm"
            />
          </div>
          <div className="flex items-end">
            <Button variant="default" className="h-10">
              Generate Report
            </Button>
          </div>
        </div>

        <Tabs defaultValue="daily" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="daily" className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Daily</span>
            </TabsTrigger>
            <TabsTrigger value="weekly" className="flex items-center space-x-2">
              <CalendarDays className="w-4 h-4" />
              <span>Weekly</span>
            </TabsTrigger>
            <TabsTrigger value="monthly" className="flex items-center space-x-2">
              <CalendarRange className="w-4 h-4" />
              <span>Monthly</span>
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center space-x-2">
              <PieChart className="w-4 h-4" />
              <span>Analysis</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="mt-6">
            <div className="bg-white rounded-lg border p-6">
              <Typography variant="h4" className="mb-4">Daily Summary</Typography>
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Select date range and generate report
              </div>
            </div>
          </TabsContent>

          <TabsContent value="weekly" className="mt-6">
            <div className="bg-white rounded-lg border p-6">
              <Typography variant="h4" className="mb-4">Weekly Report</Typography>
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Select date range and generate report
              </div>
            </div>
          </TabsContent>

          <TabsContent value="monthly" className="mt-6">
            <div className="bg-white rounded-lg border p-6">
              <Typography variant="h4" className="mb-4">Monthly Report</Typography>
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Select date range and generate report
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="mt-6">
            <div className="bg-white rounded-lg border p-6">
              <Typography variant="h4" className="mb-4">Payment Analysis</Typography>
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Select date range and generate report
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
} 