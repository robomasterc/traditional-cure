import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSheetData, updateSheetData, appendSheetData, deleteSheetRow, SHEET_IDS } from '@/lib/googleSheets';

// Validation schemas
const transactionSchema = z.object({
  id: z.string(),
  type: z.enum(['sale', 'purchase', 'refund']),
  date: z.string(),
  patientId: z.string().optional(),
  items: z.array(z.object({
    itemId: z.string(),
    quantity: z.number().min(1),
    price: z.number().min(0),
  })),
  totalAmount: z.number().min(0),
  paymentMethod: z.enum(['cash', 'card', 'insurance']),
  status: z.enum(['completed', 'pending', 'cancelled']),
  notes: z.string().optional(),
  staffId: z.string(),
});

type Transaction = z.infer<typeof transactionSchema>;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const type = searchParams.get('type');
    const patientId = searchParams.get('patientId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const data = await getSheetData(SHEET_IDS.transactions!, 'Transactions!A2:J');
    const headers = ['id', 'type', 'date', 'patientId', 'items', 'totalAmount', 'paymentMethod', 'status', 'notes', 'staffId'];
    
    const transactions = data.map(row => {
      const transaction = Object.fromEntries(headers.map((header, index) => [header, row[index]])) as Record<string, string>;
      return {
        ...transaction,
        items: JSON.parse(transaction.items),
        totalAmount: parseFloat(transaction.totalAmount),
      } as Transaction;
    });

    if (id) {
      const transaction = transactions.find(t => t.id === id);
      if (!transaction) {
        return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
      }
      return NextResponse.json(transaction);
    }

    let filteredTransactions = transactions;

    if (type) {
      filteredTransactions = filteredTransactions.filter(t => t.type === type);
    }

    if (patientId) {
      filteredTransactions = filteredTransactions.filter(t => t.patientId === patientId);
    }

    if (startDate && endDate) {
      filteredTransactions = filteredTransactions.filter(t => {
        const date = new Date(t.date);
        return date >= new Date(startDate) && date <= new Date(endDate);
      });
    }

    return NextResponse.json(filteredTransactions);
  } catch (error) {
    console.error('Error in GET /api/transactions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = transactionSchema.parse(body);

    const values = [
      [
        validatedData.id,
        validatedData.type,
        validatedData.date,
        validatedData.patientId || '',
        JSON.stringify(validatedData.items),
        validatedData.totalAmount.toString(),
        validatedData.paymentMethod,
        validatedData.status,
        validatedData.notes || '',
        validatedData.staffId,
      ],
    ];

    await appendSheetData(SHEET_IDS.transactions!, 'Transactions!A2:J', values);
    return NextResponse.json(validatedData, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Error in POST /api/transactions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = transactionSchema.parse(body);

    const data = await getSheetData(SHEET_IDS.transactions!, 'Transactions!A2:J');
    const rowIndex = data.findIndex(row => row[0] === validatedData.id);

    if (rowIndex === -1) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    const values = [
      [
        validatedData.id,
        validatedData.type,
        validatedData.date,
        validatedData.patientId || '',
        JSON.stringify(validatedData.items),
        validatedData.totalAmount.toString(),
        validatedData.paymentMethod,
        validatedData.status,
        validatedData.notes || '',
        validatedData.staffId,
      ],
    ];

    await updateSheetData(
      SHEET_IDS.transactions!,
      `Transactions!A${rowIndex + 2}:J${rowIndex + 2}`,
      values
    );

    return NextResponse.json(validatedData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Error in PUT /api/transactions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Transaction ID is required' }, { status: 400 });
    }

    const data = await getSheetData(SHEET_IDS.transactions!, 'Transactions!A2:J');
    const rowIndex = data.findIndex(row => row[0] === id);

    if (rowIndex === -1) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    await deleteSheetRow(SHEET_IDS.transactions!, 'Transactions', rowIndex + 2);
    return NextResponse.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/transactions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 