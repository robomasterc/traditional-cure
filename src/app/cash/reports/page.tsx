'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Typography } from '@/components/ui/typography';
import { DatePicker } from '@/components/ui/date-picker';
import { Button } from '@/components/ui/button';
import { Calendar, CalendarDays, CalendarRange, PieChart } from 'lucide-react';

export default function ReportsPage() {
  const [startDate, setStartDate] = React.useState<Date | null>(null);
  const [endDate, setEndDate] = React.useState<Date | null>(null);

  return (
    <div className="space-y-8">
      <div className="bg-white shadow rounded-lg p-6">
        <Typography variant="h2" className="mb-4">
          Financial Reports
        </Typography>
        <Typography variant="small" color="muted">
          Generate and view detailed financial reports for your practice.
        </Typography>
      </div>

      <Card className="p-6">
        <div className="flex items-center space-x-4 mb-8">
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

        <div className="space-y-8">
          {/* Daily Report Section */}
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Calendar className="w-5 h-5 text-blue-600" />
              <Typography variant="h4">Daily Summary</Typography>
            </div>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Select date range and generate report
            </div>
          </div>

          {/* Weekly Report Section */}
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center space-x-2 mb-4">
              <CalendarDays className="w-5 h-5 text-green-600" />
              <Typography variant="h4">Weekly Report</Typography>
            </div>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Select date range and generate report
            </div>
          </div>

          {/* Monthly Report Section */}
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center space-x-2 mb-4">
              <CalendarRange className="w-5 h-5 text-purple-600" />
              <Typography variant="h4">Monthly Report</Typography>
            </div>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Select date range and generate report
            </div>
          </div>

          {/* Payment Analysis Section */}
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center space-x-2 mb-4">
              <PieChart className="w-5 h-5 text-amber-600" />
              <Typography variant="h4">Payment Analysis</Typography>
            </div>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Select date range and generate report
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
} 
