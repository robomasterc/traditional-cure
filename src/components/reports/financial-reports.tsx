'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Typography } from '@/components/ui/typography';
import { Calendar, CalendarDays, CalendarRange, PieChart } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs-new';
import { DatePicker } from '@/components/ui/date-picker';
import { Button } from '@/components/ui/button';

interface ReportData {
  daily: {
    date: string;
    income: number;
    expenses: number;
  }[];
  weekly: {
    week: string;
    income: number;
    expenses: number;
  }[];
  monthly: {
    month: string;
    income: number;
    expenses: number;
  }[];
  analysis: {
    category: string;
    amount: number;
  }[];
}

interface ApiReportData {
  date?: string;
  weekStart?: string;
  month?: string;
  income: number;
  expense: number;
  net: number;
  categories?: Record<string, number>;
}

interface AnalysisResponse {
  categories: Record<string, number>;
}

export function FinancialReports() {
  const [startDate, setStartDate] = React.useState<Date | null>(null);
  const [endDate, setEndDate] = React.useState<Date | null>(null);
  const [reportData, setReportData] = React.useState<ReportData | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState('daily');
  
  const fetchReportData = React.useCallback(async () => {
    if (!startDate || !endDate) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/cash/reports?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&type=${activeTab}`);
      if (!response.ok) throw new Error('Failed to fetch report data');

      const data = await response.json();
      const typedData = activeTab === 'analysis' ? data as AnalysisResponse : data as ApiReportData[];
      setReportData(prev => {
        if (!prev) return {
          daily: [], weekly: [], monthly: [], analysis: []
        };
        
        const newData = { ...prev };
        switch (activeTab) {
          case 'daily':
            newData.daily = (typedData as ApiReportData[]).map(item => ({
              date: item.date!,
              income: item.income,
              expenses: item.expense
            }));
            break;
          case 'weekly':
            newData.weekly = (typedData as ApiReportData[]).map(item => ({
              week: item.weekStart!,
              income: item.income,
              expenses: item.expense
            }));
            break;
          case 'monthly':
            newData.monthly = (typedData as ApiReportData[]).map(item => ({
              month: item.month!,
              income: item.income,
              expenses: item.expense
            }));
            break;
          case 'analysis':
            const analysisData = typedData as AnalysisResponse;
            newData.analysis = Object.entries(analysisData.categories || {}).map(([category, amount]) => ({
              category,
              amount: amount as number
            }));
            break;
        }
        return newData;
      });
      
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, activeTab]);

  React.useEffect(() => {
    if (startDate && endDate) {
      fetchReportData();
    }
  }, [activeTab, startDate, endDate, fetchReportData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Typography>Loading report data...</Typography>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Typography color="destructive">Error: {error}</Typography>
      </div>
    );
  }

  return (
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
          <Button 
            variant="default" 
            className="h-10"
            onClick={fetchReportData}
            disabled={!startDate || !endDate}
          >
            Generate Report
          </Button>
        </div>
      </div>

      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
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
            {reportData?.daily ? (
              <div className="space-y-4">
                {reportData.daily.map((day) => (
                  <div key={day.date} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <Typography variant="small" className="font-medium">
                      {new Date(day.date).toLocaleDateString()}
                    </Typography>
                    <div className="flex items-center space-x-4">
                      <Typography variant="small" className="text-green-600">
                        Income: {formatCurrency(day.income)}
                      </Typography>
                      <Typography variant="small" className="text-red-600">
                        Expenses: {formatCurrency(day.expenses)}
                      </Typography>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Select date range and generate report
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="weekly" className="mt-6">
          <div className="bg-white rounded-lg border p-6">
            <Typography variant="h4" className="mb-4">Weekly Report</Typography>
            {reportData?.weekly ? (
              <div className="space-y-4">
                {reportData.weekly.map((week) => (
                  <div key={week.week} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <Typography variant="small" className="font-medium">
                      Week {week.week}
                    </Typography>
                    <div className="flex items-center space-x-4">
                      <Typography variant="small" className="text-green-600">
                        Income: {formatCurrency(week.income)}
                      </Typography>
                      <Typography variant="small" className="text-red-600">
                        Expenses: {formatCurrency(week.expenses)}
                      </Typography>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Select date range and generate report
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="monthly" className="mt-6">
          <div className="bg-white rounded-lg border p-6">
            <Typography variant="h4" className="mb-4">Monthly Report</Typography>
            {reportData?.monthly ? (
              <div className="space-y-4">
                {reportData.monthly.map((month) => (
                  <div key={month.month} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <Typography variant="small" className="font-medium">
                      {month.month}
                    </Typography>
                    <div className="flex items-center space-x-4">
                      <Typography variant="small" className="text-green-600">
                        Income: {formatCurrency(month.income)}
                      </Typography>
                      <Typography variant="small" className="text-red-600">
                        Expenses: {formatCurrency(month.expenses)}
                      </Typography>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Select date range and generate report
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="mt-6">
          <div className="bg-white rounded-lg border p-6">
            <Typography variant="h4" className="mb-4">Payment Analysis</Typography>
            {reportData?.analysis ? (
              <div className="space-y-4">
                {reportData.analysis.map((item) => (
                  <div key={item.category} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <Typography variant="small" className="font-medium">
                      {item.category}
                    </Typography>
                    <Typography variant="small" className="text-green-600">
                      {formatCurrency(item.amount)}
                    </Typography>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Select date range and generate report
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
} 