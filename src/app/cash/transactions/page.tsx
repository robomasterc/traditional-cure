'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Typography } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, History } from 'lucide-react';

export default function TransactionsPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <Typography variant="h2" className="mb-4">
          Daily Transactions
        </Typography>
        <Typography variant="small" color="muted">
          Record and manage all financial transactions for your practice.
        </Typography>
      </div>

      <Card className="p-6">
        <Tabs defaultValue="income" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="income" className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>Income Entry</span>
            </TabsTrigger>
            <TabsTrigger value="expense" className="flex items-center space-x-2">
              <TrendingDown className="w-4 h-4" />
              <span>Expense Entry</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center space-x-2">
              <History className="w-4 h-4" />
              <span>Transaction History</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="income" className="mt-6">
            <Card className="p-6">
              <Typography variant="h4" className="mb-4">Income Entry</Typography>
              {/* Add income entry form */}
            </Card>
          </TabsContent>

          <TabsContent value="expense" className="mt-6">
            <Card className="p-6">
              <Typography variant="h4" className="mb-4">Expense Entry</Typography>
              {/* Add expense entry form */}
            </Card>
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <Card className="p-6">
              <Typography variant="h4" className="mb-4">Transaction History</Typography>
              {/* Add transaction history table */}
            </Card>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
} 