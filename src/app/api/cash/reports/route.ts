import { NextResponse } from 'next/server';
import { GoogleSheetsService } from '@/lib/google-sheets';

const sheetsService = new GoogleSheetsService(process.env.GOOGLE_SHEETS_ID!);

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

function generateDailyReport(transactions: any[]) {
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
      acc[date].income += t.amount;
    } else {
      acc[date].expense += t.amount;
    }
    acc[date].transactions.push(t);
    return acc;
  }, {} as Record<string, any>);

  return Object.entries(dailyData).map(([date, data]) => ({
    date,
    income: data.income,
    expense: data.expense,
    net: data.income - data.expense,
    transactions: data.transactions
  }));
}

function generateWeeklyReport(transactions: any[]) {
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
      acc[weekKey].income += t.amount;
    } else {
      acc[weekKey].expense += t.amount;
    }
    acc[weekKey].transactions.push(t);
    return acc;
  }, {} as Record<string, any>);

  return Object.entries(weeklyData).map(([weekStart, data]) => ({
    weekStart,
    income: data.income,
    expense: data.expense,
    net: data.income - data.expense,
    transactions: data.transactions
  }));
}

function generateMonthlyReport(transactions: any[]) {
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
      acc[monthKey].income += t.amount;
    } else {
      acc[monthKey].expense += t.amount;
    }
    acc[monthKey].transactions.push(t);
    return acc;
  }, {} as Record<string, any>);

  return Object.entries(monthlyData).map(([month, data]) => ({
    month,
    income: data.income,
    expense: data.expense,
    net: data.income - data.expense,
    transactions: data.transactions
  }));
}

function generatePaymentAnalysis(transactions: any[]) {
  const analysis = {
    paymentMethods: transactions
      .filter(t => t.type === 'Income')
      .reduce((acc, t) => {
        acc[t.paymentMethod] = (acc[t.paymentMethod] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>),
    
    categories: transactions.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>),
    
    dailyTrend: transactions
      .filter(t => t.type === 'Income')
      .reduce((acc, t) => {
        const date = new Date(t.date).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>)
  };

  return analysis;
} 