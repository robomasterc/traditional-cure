'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Typography } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Stethoscope, Pill, Heart, Clock } from 'lucide-react';

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <Typography variant="h2" className="mb-4">
          Patient Billing
        </Typography>
        <Typography variant="small" color="muted">
          Process payments and manage patient billing for consultations, medicines, and treatments.
        </Typography>
      </div>

      <Card className="p-6">
        <Tabs defaultValue="consultation" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="consultation" className="flex items-center space-x-2">
              <Stethoscope className="w-4 h-4" />
              <span>Consultation</span>
            </TabsTrigger>
            <TabsTrigger value="medicine" className="flex items-center space-x-2">
              <Pill className="w-4 h-4" />
              <span>Medicine</span>
            </TabsTrigger>
            <TabsTrigger value="treatment" className="flex items-center space-x-2">
              <Heart className="w-4 h-4" />
              <span>Treatment</span>
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Pending</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="consultation" className="mt-6">
            <Card className="p-6">
              <Typography variant="h4" className="mb-4">Consultation Billing</Typography>
              {/* Add consultation billing form */}
            </Card>
          </TabsContent>

          <TabsContent value="medicine" className="mt-6">
            <Card className="p-6">
              <Typography variant="h4" className="mb-4">Medicine Billing</Typography>
              {/* Add medicine billing form */}
            </Card>
          </TabsContent>

          <TabsContent value="treatment" className="mt-6">
            <Card className="p-6">
              <Typography variant="h4" className="mb-4">Treatment Billing</Typography>
              {/* Add treatment billing form */}
            </Card>
          </TabsContent>

          <TabsContent value="pending" className="mt-6">
            <Card className="p-6">
              <Typography variant="h4" className="mb-4">Pending Payments</Typography>
              {/* Add pending payments list */}
            </Card>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
} 