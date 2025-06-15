import { NextResponse } from 'next/server';
import { GoogleSheetsService } from '@/lib/google-sheets';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const sheetsService = new GoogleSheetsService(process.env.GOOGLE_SHEETS_ID!);

interface TransactionRequest {
  type: 'Income' | 'Expense';
  category: string;
  amount: number;
  description: string;
  date: string;
  paymentMethod: 'cash' | 'upi';
  createdBy: string;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const transactions = await sheetsService.getTransactions();
    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json() as TransactionRequest;
    const {
      type,
      category,
      amount,
      description,
      date,
      paymentMethod,
      createdBy
    } = body;

    // Validate required fields
    if (!type || !category || !amount || !description || !date || !paymentMethod) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // Prepare transaction data
    const transaction = {
      id: Date.now().toString(),
      type,
      category,
      cash: paymentMethod === 'cash' ? amount : 0,
      upi: paymentMethod === 'upi' ? amount : 0,
      description,
      date: new Date(date).toISOString(),
      createdBy
    };

    // Append to Google Sheets
    await sheetsService.appendRow('Transactions!A:K', [
      transaction.id,
      transaction.type,
      transaction.category,
      transaction.cash,
      transaction.upi,
      transaction.description,
      '', // patientId (optional)
      '', // staffId (optional)
      transaction.date,
      transaction.createdBy,
      new Date().toISOString() // createdAt
    ]);

    return NextResponse.json(transaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 