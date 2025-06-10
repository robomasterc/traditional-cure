'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function ReportsPage() {
  // This is sample data - in a real application, this would come from your API
  const monthlyData = [
    { month: 'Jan', income: 50000, expenses: 30000 },
    { month: 'Feb', income: 55000, expenses: 32000 },
    { month: 'Mar', income: 60000, expenses: 35000 },
    { month: 'Apr', income: 58000, expenses: 33000 },
    { month: 'May', income: 62000, expenses: 34000 },
    { month: 'Jun', income: 65000, expenses: 36000 },
  ];

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-700 mb-8">Financial Reports</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
                  <Line
                    type="monotone"
                    dataKey="income"
                    stroke="#22c55e"
                    name="Income"
                  />
                  <Line
                    type="monotone"
                    dataKey="expenses"
                    stroke="#ef4444"
                    name="Expenses"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Methods Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Cash</span>
                <span className="font-medium">45%</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Card</span>
                <span className="font-medium">35%</span>
              </div>
              <div className="flex justify-between items-center">
                <span>UPI</span>
                <span className="font-medium">20%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">₹3,50,000</p>
            <p className="text-sm text-gray-500">Last 6 months</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">₹2,00,000</p>
            <p className="text-sm text-gray-500">Last 6 months</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Net Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">₹1,50,000</p>
            <p className="text-sm text-gray-500">Last 6 months</p>
          </CardContent>
        </Card>
      </div>
    </>
  );
} 