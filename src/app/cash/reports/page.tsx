'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Typography } from '@/components/ui/typography';
import { useSession } from 'next-auth/react';
import { FinancialReports } from '@/components/reports/financial-reports';

export default function CashReportsPage() {
  const { data: session } = useSession();

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <Typography variant="h2" className="mb-4">
          Financial Reports
        </Typography>
        <Typography variant="small" color="muted">
          View detailed financial reports and analysis for your clinic.
        </Typography>
      </div>

      <FinancialReports />
    </div>
  );
} 