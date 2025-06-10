import { NextResponse } from 'next/server';
import { SHEET_NAMES, Transaction, transactionSchema } from '@/types/sheets';
import { GoogleSheetsService } from '@/lib/google-sheets';
import { nanoid } from 'nanoid';

interface CashReceipt {
  id: string;
  patientName: string;
  paymentMethods: Array<{
    method: string;
    amount: number;
  }>;
  date: string;
  notes?: string;
}

const sheetsService = new GoogleSheetsService(process.env.GOOGLE_SHEET_ID || '');

export async function GET() {
  try {
    const transactions = await sheetsService.getTransactions();
    
    const receipts = transactions.map(transaction => ({
      id: transaction.id,
      patientName: transaction.description,
      paymentMethods: [{
        method: transaction.paymentMethod,
        amount: transaction.amount
      }],
      date: transaction.createdAt,
      notes: transaction.description
    }));

    return NextResponse.json(receipts);
  } catch (error) {
    console.error('Error fetching receipts:', error);
    return NextResponse.json(
      { message: 'Failed to fetch receipts' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Create a transaction for each payment method
    const transactions = body.paymentMethods.map((pm: { method: string; amount: number }) => {
        console.log(pm);
      const transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'> = {
        type: 'consultation',
        amount: pm.amount,
        paymentMethod: pm.method.toLowerCase() as 'cash' | 'card' | 'upi' | 'bank_transfer',
        status: 'completed',
        referenceId: nanoid(),
        description: body.notes || `Payment from ${body.patientName}`,
        patientId: '', // TODO: Add patient ID if available
        staffId: '', // TODO: Add staff ID if available
      };
      return transaction;
    });

    // Add all transactions to the sheet
    for (const transaction of transactions) {
      await sheetsService.addTransaction(transaction);
    }

    return NextResponse.json({ message: 'Receipt created successfully' });
  } catch (error) {
    console.error('Error creating receipt:', error);
    return NextResponse.json(
      { message: 'Failed to create receipt' },
      { status: 500 }
    );
  }
} 