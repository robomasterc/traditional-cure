import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import sheetsService from '@/lib/google-sheets';

// Validation schemas
const transactionSchema = z.object({
  type: z.enum(['Income', 'Expense']),
  category: z.string(),
  cash: z.string().transform(val => Number(val)),
  upi: z.string().transform(val => Number(val)),
  description: z.string(),
  patientId: z.string().optional(),
  staffId: z.string(),
  date: z.string(),
  createdBy: z.string(),
  createdAt: z.string()
});

type Transaction = z.infer<typeof transactionSchema>;

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const transactions = await sheetsService.getTransactions();

    let filteredTransactions = transactions;

    if (type) {
      filteredTransactions = filteredTransactions.filter(t => t.type === type);
    }

    if (category) {
      filteredTransactions = filteredTransactions.filter(t => t.category === category);
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      filteredTransactions = filteredTransactions.filter(t => {
        const transactionDate = t.date;
        return transactionDate >= start && transactionDate <= end;
      });
    }

    return NextResponse.json(filteredTransactions);
  } catch (error) {
    console.error('Error in GET /api/cash/transactions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = transactionSchema.parse(body);

    const values = [
      new Date().toISOString().replace(/[-:]/g, '').slice(0, 15),
      validatedData.type,
      validatedData.category,
      validatedData.cash.toString(),
      validatedData.upi.toString(),
      validatedData.description,
      validatedData.patientId || '',
      validatedData.staffId,
      validatedData.date,
      validatedData.createdBy,
      validatedData.createdAt
    ];

    await sheetsService.appendRow('Transactions!A:J', values);
    return NextResponse.json(validatedData, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Error in POST /api/cash/transactions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = transactionSchema.parse(body);

    const transactions = await sheetsService.getTransactions();
    const rowIndex = transactions.findIndex(t => 
      t.type === validatedData.type && 
      t.category === validatedData.category && 
      t.cash === validatedData.cash && 
      t.upi === validatedData.upi && 
      t.description === validatedData.description && 
      t.patientId === validatedData.patientId && 
      t.staffId === validatedData.staffId && 
      t.date.getTime() === new Date(validatedData.date).getTime() && 
      t.createdBy === validatedData.createdBy && 
      t.createdAt.getTime() === new Date(validatedData.createdAt).getTime()
    );

    if (rowIndex === -1) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    const values = [
      validatedData.type,
      validatedData.category,
      validatedData.cash.toString(),
      validatedData.upi.toString(),
      validatedData.description,
      validatedData.patientId || '',
      validatedData.staffId,
      validatedData.date,
      validatedData.createdBy,
      validatedData.createdAt
    ];

    await sheetsService.updateRow(`Transactions!A${rowIndex + 2}:J${rowIndex + 2}`, values);
    return NextResponse.json(validatedData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Error in PUT /api/cash/transactions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const date = searchParams.get('date');
    const staffId = searchParams.get('staffId');

    if (!type || !category || !date || !staffId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const transactions = await sheetsService.getTransactions();
    const rowIndex = transactions.findIndex(t => 
      t.type === type && 
      t.category === category && 
      t.date.getTime() === new Date(date).getTime() && 
      t.staffId === staffId
    );

    if (rowIndex === -1) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Clear the row by updating it with empty values
    const emptyValues = Array(10).fill('');
    await sheetsService.updateRow(`Transactions!A${rowIndex + 2}:J${rowIndex + 2}`, emptyValues);
    return NextResponse.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/cash/transactions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 