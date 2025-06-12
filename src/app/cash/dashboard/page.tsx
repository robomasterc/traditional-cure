'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Typography } from '@/components/ui/typography';
import { DollarSign, TrendingUp, Users, CreditCard } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function CashDashboardPage() {
  const { data: session } = useSession();

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
              <Typography variant="h4">₹25,000</Typography>
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
              <Typography variant="h4">₹4,50,000</Typography>
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
              <Typography variant="h4">1,250</Typography>
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
              <Typography variant="h4">₹15,000</Typography>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <Typography variant="h4" className="mb-4">Recent Transactions</Typography>
          {/* Add transaction list component here */}
        </Card>

        <Card className="p-6">
          <Typography variant="h4" className="mb-4">Payment Methods</Typography>
          {/* Add payment methods chart here */}
        </Card>
      </div>
    </div>
  );
} 