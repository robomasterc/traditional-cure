'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Typography } from '@/components/ui/typography';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Banknote, Smartphone, CreditCard, Calculator } from 'lucide-react';

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <Typography variant="h2" className="mb-4">
          Payment Methods
        </Typography>
        <Typography variant="small" color="muted">
          Manage different payment methods and handle daily payment reconciliation.
        </Typography>
      </div>

      <Card className="p-6">
        <Tabs defaultValue="cash" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="cash" className="flex items-center space-x-2">
              <Banknote className="w-4 h-4" />
              <span>Cash Payments</span>
            </TabsTrigger>
            <TabsTrigger value="upi" className="flex items-center space-x-2">
              <Smartphone className="w-4 h-4" />
              <span>UPI Payments</span>
            </TabsTrigger>
            <TabsTrigger value="card" className="flex items-center space-x-2">
              <CreditCard className="w-4 h-4" />
              <span>Card Payments</span>
            </TabsTrigger>
            <TabsTrigger value="reconciliation" className="flex items-center space-x-2">
              <Calculator className="w-4 h-4" />
              <span>Reconciliation</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cash" className="mt-6">
            <Card className="p-6">
              <Typography variant="h4" className="mb-4">Cash Payments</Typography>
              {/* Add cash payment form */}
            </Card>
          </TabsContent>

          <TabsContent value="upi" className="mt-6">
            <Card className="p-6">
              <Typography variant="h4" className="mb-4">UPI Payments</Typography>
              {/* Add UPI payment form */}
            </Card>
          </TabsContent>

          <TabsContent value="card" className="mt-6">
            <Card className="p-6">
              <Typography variant="h4" className="mb-4">Card Payments</Typography>
              {/* Add card payment form */}
            </Card>
          </TabsContent>

          <TabsContent value="reconciliation" className="mt-6">
            <Card className="p-6">
              <Typography variant="h4" className="mb-4">Payment Reconciliation</Typography>
              {/* Add reconciliation form */}
            </Card>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
} 