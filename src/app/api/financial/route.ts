import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

// Validation schemas
const transactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  amount: z.number().positive(),
  description: z.string(),
  paymentMethod: z.enum(['CASH', 'CARD', 'UPI', 'BANK_TRANSFER']),
  referenceNumber: z.string().optional(),
  patientId: z.string().optional(),
  category: z.string(),
});

const invoiceSchema = z.object({
  patientId: z.string(),
  amount: z.number().positive(),
  items: z.array(z.object({
    description: z.string(),
    amount: z.number().positive(),
    quantity: z.number().positive(),
  })),
  dueDate: z.string(),
  notes: z.string().optional(),
});

// GET /api/financial/dashboard
export async function GET() {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    // Get daily summary
    const dailyTransactions = await db.transaction.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    const totalIncome = dailyTransactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = dailyTransactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);

    // Get pending invoices
    const pendingInvoices = await db.invoice.findMany({
      where: {
        status: 'ISSUED',
      },
      include: {
        patient: true,
      },
    });

    return NextResponse.json({
      dailySummary: {
        totalIncome,
        totalExpenses,
        netAmount: totalIncome - totalExpenses,
      },
      pendingInvoices,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch financial dashboard data' },
      { status: 500 }
    );
  }
}

// POST /api/financial/transaction
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = transactionSchema.parse(body);

    const transaction = await db.transaction.create({
      data: {
        ...validatedData,
        status: 'COMPLETED',
        date: new Date(),
      },
    });

    return NextResponse.json(transaction);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid transaction data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}

// POST /api/financial/invoice
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = invoiceSchema.parse(body);

    const invoice = await db.invoice.create({
      data: {
        ...validatedData,
        status: 'ISSUED',
        dueDate: new Date(validatedData.dueDate),
      },
    });

    return NextResponse.json(invoice);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid invoice data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
} 