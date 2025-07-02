'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Typography } from '@/components/ui/typography';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Printer, Layout, Archive } from 'lucide-react';

export default function ReceiptsPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <Typography variant="h2" className="mb-4">
          Receipt Management
        </Typography>
        <Typography variant="small" color="muted">
          Generate and manage receipts for all financial transactions.
        </Typography>
      </div>

      <Card className="p-6">
        <Tabs defaultValue="generate" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="generate" className="flex items-center space-x-2">
              <Printer className="w-4 h-4" />
              <span>Generate Receipt</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center space-x-2">
              <Layout className="w-4 h-4" />
              <span>Receipt Templates</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center space-x-2">
              <Archive className="w-4 h-4" />
              <span>Receipt History</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="mt-6">
            <Card className="p-6">
              <Typography variant="h4" className="mb-4">Generate Receipt</Typography>
              {/* Add receipt generation form */}
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="mt-6">
            <Card className="p-6">
              <Typography variant="h4" className="mb-4">Receipt Templates</Typography>
              {/* Add template management interface */}
            </Card>
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <Card className="p-6">
              <Typography variant="h4" className="mb-4">Receipt History</Typography>
              {/* Add receipt history table */}
            </Card>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
} 