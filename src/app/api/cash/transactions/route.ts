import { NextResponse } from 'next/server';
import { GoogleSheetsService } from '@/lib/google-sheets';
import { Transaction } from '@/types/sheets';

const sheetsService = new GoogleSheetsService(process.env.GOOGLE_SHEETS_ID!);

interface TransactionInput {
  type: 'Income' | 'Expense';
  category: string;
  amount: number;
  description: string;
  paymentMethod: 'Cash' | 'UPI' | 'Card' | 'Bank Transfer';
  patientId?: string;
  staffId?: string;
  date: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const type = searchParams.get('type') as 'Income' | 'Expense' | null;
    const category = searchParams.get('category');

    const transactions = await sheetsService.getTransactions();
    let filteredTransactions = [...transactions];

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      filteredTransactions = filteredTransactions.filter(t => {
        const date = new Date(t.date);
        return date >= start && date <= end;
      });
    }

    if (type) {
      filteredTransactions = filteredTransactions.filter(t => t.type === type);
    }

    if (category) {
      filteredTransactions = filteredTransactions.filter(t => t.category === category);
    }

    // Sort by date, most recent first
    filteredTransactions.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return NextResponse.json(filteredTransactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as TransactionInput;
    const {
      type,
      category,
      amount,
      description,
      paymentMethod,
      patientId,
      staffId,
      date
    } = body;

    // Validate required fields
    if (!type || !category || !amount || !description || !paymentMethod || !date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create new transaction
    const newTransaction: Transaction = {
      id: Date.now().toString(), // Generate a unique ID
      type,
      category,
      amount: Number(amount),
      description,
      paymentMethod,
      patientId: patientId || '',
      staffId: staffId || '',
      date: new Date(date),
      createdBy: 'system', // This should come from the authenticated user
      createdAt: new Date()
    };

    // Append to Google Sheets
    await sheetsService.appendRow('Transactions!A:K', [
      newTransaction.id,
      newTransaction.type,
      newTransaction.category,
      newTransaction.amount,
      newTransaction.description,
      newTransaction.paymentMethod,
      newTransaction.patientId,
      newTransaction.staffId,
      newTransaction.date.toISOString(),
      newTransaction.createdBy,
      newTransaction.createdAt.toISOString()
    ]);

    return NextResponse.json(newTransaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json() as TransactionInput & { id: string };
    const {
      id,
      type,
      category,
      amount,
      description,
      paymentMethod,
      patientId,
      staffId,
      date
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Transaction ID is required' },
        { status: 400 }
      );
    }

    // Get existing transaction
    const transactions = await sheetsService.getTransactions();
    const transactionIndex = transactions.findIndex(t => t.id === id);

    if (transactionIndex === -1) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Update transaction
    const updatedTransaction: Transaction = {
      ...transactions[transactionIndex],
      type: type || transactions[transactionIndex].type,
      category: category || transactions[transactionIndex].category,
      amount: amount ? Number(amount) : transactions[transactionIndex].amount,
      description: description || transactions[transactionIndex].description,
      paymentMethod: paymentMethod || transactions[transactionIndex].paymentMethod,
      patientId: patientId || transactions[transactionIndex].patientId,
      staffId: staffId || transactions[transactionIndex].staffId,
      date: date ? new Date(date) : transactions[transactionIndex].date
    };

    // Update in Google Sheets
    await sheetsService.updateRow(`Transactions!A${transactionIndex + 2}:K${transactionIndex + 2}`, [
      updatedTransaction.id,
      updatedTransaction.type,
      updatedTransaction.category,
      updatedTransaction.amount,
      updatedTransaction.description,
      updatedTransaction.paymentMethod,
      updatedTransaction.patientId,
      updatedTransaction.staffId,
      updatedTransaction.date.toISOString(),
      updatedTransaction.createdBy,
      updatedTransaction.createdAt.toISOString()
    ]);

    return NextResponse.json(updatedTransaction);
  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to update transaction' },
      { status: 500 }
    );
  }
} 