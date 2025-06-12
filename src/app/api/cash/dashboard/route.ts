import { NextResponse } from 'next/server';
import { GoogleSheetsService } from '@/lib/google-sheets';
import { Transaction } from '@/types/sheets';

const sheetsService = new GoogleSheetsService(process.env.GOOGLE_SHEETS_ID || '');

export async function GET() {
  try {
    // Get today's transactions
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const transactions = await sheetsService.getTransactions();
    const todayTransactions = transactions.filter((t: Transaction) => {
      const transDate = new Date(t.date);
      return transDate >= today;
    });

    // Calculate summaries
    const todayRevenue = todayTransactions
      .filter((t: Transaction) => t.type === 'Income')
      .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

    const pendingPayments = transactions
      .filter((t: Transaction) => t.type === 'Income' && t.paymentMethod === 'Cash')
      .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

    // Get monthly revenue
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthlyTransactions = transactions.filter((t: Transaction) => {
      const transDate = new Date(t.date);
      return transDate >= firstDayOfMonth;
    });
    const monthlyRevenue = monthlyTransactions
      .filter((t: Transaction) => t.type === 'Income')
      .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

    // Get total patients
    const patients = await sheetsService.getPatients();
    const totalPatients = patients.length;

    return NextResponse.json({
      todayRevenue,
      monthlyRevenue,
      totalPatients,
      pendingPayments,
      recentTransactions: todayTransactions.slice(0, 5),
      paymentMethods: {
        cash: todayTransactions.filter((t: Transaction) => t.paymentMethod === 'Cash').length,
        upi: todayTransactions.filter((t: Transaction) => t.paymentMethod === 'UPI').length,
        card: todayTransactions.filter((t: Transaction) => t.paymentMethod === 'Card').length,
        bank: todayTransactions.filter((t: Transaction) => t.paymentMethod === 'Bank Transfer').length,
      }
    });
  } catch (error) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
} 