import { NextResponse } from 'next/server';
import { GoogleSheetsService } from '@/lib/google-sheets';
import { Transaction } from '@/types/sheets';

const sheetsService = new GoogleSheetsService(process.env.GOOGLE_SHEETS_ID!);

interface ReportDataPoint {
  income: number;
  expense: number;
  transactions: Transaction[];
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const reportType = searchParams.get('type') || 'daily';

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Start date and end date are required' },
        { status: 400 }
      );
    }

    const transactions = await sheetsService.getTransactions();
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Filter transactions within date range
    const filteredTransactions = transactions.filter(t => {      
      const date = new Date(t.date);
      return date >= start && date <= end;
    });

    let reportData;        
    switch (reportType) {
      case 'daily':
        reportData = generateDailyReport(filteredTransactions);
        break;
      case 'weekly':
        reportData = generateWeeklyReport(filteredTransactions);
        break;
      case 'monthly':
        reportData = generateMonthlyReport(filteredTransactions);
        break;
      case 'analysis':
        reportData = generatePaymentAnalysis(filteredTransactions);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid report type' },
          { status: 400 }
        );
    }

    return NextResponse.json(reportData);
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}

function generateDailyReport(transactions: Transaction[]) {
  const dailyData = transactions.reduce((acc, t) => {
    const date = new Date(t.date).toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = {
        income: 0,
        expense: 0,
        transactions: []
      };
    }
    if (t.type === 'Income') {
      acc[date].income += t.cash + t.upi;
    } else {
      acc[date].expense += t.cash + t.upi;
    }
    acc[date].transactions.push(t);
    return acc;
  }, {} as Record<string, ReportDataPoint>);

  return Object.entries(dailyData).map(([date, data]) => ({
    date,
    income: data.income,
    expense: data.expense,
    net: data.income - data.expense
  }));
}

function generateWeeklyReport(transactions: Transaction[]) {
  const weeklyData = transactions.reduce((acc, t) => {
    const date = new Date(t.date);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const weekKey = weekStart.toISOString().split('T')[0];

    if (!acc[weekKey]) {
      acc[weekKey] = {
        income: 0,
        expense: 0,
        transactions: []
      };
    }
    if (t.type === 'Income') {
      acc[weekKey].income += t.cash + t.upi;
    } else {
      acc[weekKey].expense += t.cash + t.upi;
    }
    acc[weekKey].transactions.push(t);
    return acc;
  }, {} as Record<string, ReportDataPoint>);

  return Object.entries(weeklyData).map(([weekStart, data]) => ({
    weekStart,
    income: data.income,
    expense: data.expense,
    net: data.income - data.expense
  }));
}

function generateMonthlyReport(transactions: Transaction[]) {
  const monthlyData = transactions.reduce((acc, t) => {
    const date = new Date(t.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!acc[monthKey]) {
      acc[monthKey] = {
        income: 0,
        expense: 0,
        transactions: []
      };
    }
    if (t.type === 'Income') {
      acc[monthKey].income += t.cash + t.upi;
    } else {
      acc[monthKey].expense += t.cash + t.upi;
    }
    acc[monthKey].transactions.push(t);
    return acc;
  }, {} as Record<string, ReportDataPoint>);

  return Object.entries(monthlyData).map(([month, data]) => ({
    month,
    income: data.income,
    expense: data.expense,
    net: data.income - data.expense
  }));
}

function generatePaymentAnalysis(transactions: Transaction[]) {
  const categories = transactions.filter(t => t.type === 'Expense').reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.cash + t.upi;
    return acc;
  }, {} as Record<string, number>);

  return { categories };
} 