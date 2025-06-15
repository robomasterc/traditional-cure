import { NextResponse } from 'next/server';
import { GoogleSheetsService } from '@/lib/google-sheets';

const sheetsService = new GoogleSheetsService(process.env.GOOGLE_SHEETS_ID!);

export async function GET() {
  try {
    // Fetch transactions and patients for the dashboard
    const [transactions, patients] = await Promise.all([
      sheetsService.getTransactions(),
      sheetsService.getPatients()
    ]);
    
    // Calculate summary data
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayRevenue = transactions
      .filter(t => 
        t.type === 'Income' && 
        new Date(t.date).getDate() === today.getDate()
      )
      .reduce((sum, t) => sum + t.cash + t.upi, 0);

    const monthlyRevenue = transactions
      .filter(t => 
        t.type === 'Income' && 
        new Date(t.date).getMonth() === today.getMonth() &&
        new Date(t.date).getFullYear() === today.getFullYear()
      )
      .reduce((sum, t) => sum + t.cash + t.upi, 0);

    const pendingPayments = transactions
      .filter(t => t.type === 'Income')
      .reduce((sum, t) => sum + t.cash + t.upi, 0);

    // Get recent transactions (last 5)
    const recentTransactions = transactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    // Calculate payment method distribution
    const paymentMethods = transactions
      .reduce((acc, t) => {        
        if (t.type === 'Income') {
          acc['Cash'].income += t.cash;
          acc['UPI'].income += t.upi;
        } else {
          acc['Cash'].expenses += t.cash;
          acc['UPI'].expenses += t.upi;
        }
        return acc;
      }, { 
        'Cash': { income: 0, expenses: 0 },
        'UPI': { income: 0, expenses: 0 }
      });

    return NextResponse.json({
      summary: {
        todayRevenue,
        monthlyRevenue,
        pendingPayments,
        totalPatients: patients.length,
      },
      recentTransactions,
      paymentMethods,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
} 