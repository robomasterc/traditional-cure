'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Typography } from '@/components/ui/typography';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Invoice {
  id: string;
  patient: {
    name: string;
  };
  amount: number;
  dueDate: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
}

interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
}

export default function FinancialDashboard() {
  const [pendingInvoices, setPendingInvoices] = useState<Invoice[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [invoicesResponse, monthlyResponse] = await Promise.all([
        fetch('/api/financial/invoices?status=PENDING'),
        fetch('/api/financial/monthly-summary')
      ]);

      if (!invoicesResponse.ok || !monthlyResponse.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const [invoicesData, monthlyData] = await Promise.all([
        invoicesResponse.json(),
        monthlyResponse.json()
      ]);

      setPendingInvoices(invoicesData);
      setMonthlyData(monthlyData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalIncome = monthlyData.reduce((sum, data) => sum + data.income, 0);
  const totalExpenses = monthlyData.reduce((sum, data) => sum + data.expenses, 0);
  const netProfit = totalIncome - totalExpenses;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Typography variant="p" className="text-gray-500">Loading dashboard data...</Typography>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            <Typography variant="h3" className="text-green-600">
              ₹{totalIncome.toLocaleString()}
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <Typography variant="h3" className="text-red-600">
              ₹{totalExpenses.toLocaleString()}
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Net Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <Typography variant="h3" className={netProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
              ₹{netProfit.toLocaleString()}
            </Typography>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="income" stroke="#10B981" name="Income" />
                <Line type="monotone" dataKey="expenses" stroke="#EF4444" name="Expenses" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pending Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingInvoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <Typography variant="p" className="font-medium">
                    {invoice.patient.name}
                  </Typography>
                  <Typography variant="small" className="text-gray-500">
                    Due: {new Date(invoice.dueDate).toLocaleDateString()}
                  </Typography>
                </div>
                <Typography variant="p" className="font-bold">
                  ₹{invoice.amount.toLocaleString()}
                </Typography>
              </div>
            ))}
            {pendingInvoices.length === 0 && (
              <Typography variant="p" className="text-center text-gray-500">
                No pending invoices
              </Typography>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 