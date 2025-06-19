import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import sheetsService from '@/lib/google-sheets';
import { z } from 'zod';

const invoiceItemSchema = z.object({
  patientId: z.string(),
  doctorId: z.string(),
  type: z.enum(['Consultation', 'Medicine', 'Procedure', 'Discount']),
  category: z.string(),
  description: z.string(),
  quantity: z.number().min(0),
  amount: z.number(),
  total: z.number(),
});

const invoiceSchema = z.object({
  items: z.array(invoiceItemSchema),
  status: z.enum(['Ready', 'Complete']).default('Ready'),
  invoiceId: z.string().optional(), // Optional invoice ID for carrying forward during edit
});

type InvoiceItem = z.infer<typeof invoiceItemSchema>;
type Invoice = z.infer<typeof invoiceSchema>;

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    // Get all invoices from Google Sheets
    const rows = await sheetsService.getRange('Invoices!A2:L');
    
    let invoices = rows.map((row: any[]) => ({
      id: row[0],
      patientId: row[1],
      doctorId: row[2],
      type: row[3],
      category: row[4],
      description: row[5],
      quantity: Number(row[6]),
      amount: Number(row[7]),
      total: Number(row[8]),
      status: row[9],
      createdBy: row[10],
      createdAt: row[11] ? new Date(row[11]).toISOString() : new Date().toISOString()
    }));

    // Filter by date if provided
    if (date) {
      const targetDate = new Date(date);
      invoices = invoices.filter(invoice => {
        try {
          const invoiceDate = new Date(invoice.createdAt);
        return invoiceDate.toISOString().split('T')[0] === targetDate.toISOString().split('T')[0];
        } catch (error) {
          console.error('Error parsing date:', invoice.createdAt, error);
          return false;
        }
      });
    }

    // group invoice by invoiceId and sum the total amount of the invoice
    const groupedInvoices = invoices.reduce((acc: any, invoice: any) => {
      const invoiceId = invoice.id;
      
      if (!acc[invoiceId]) {
        // Initialize with basic invoice details
        acc[invoiceId] = {
          id: invoiceId,
          patientId: invoice.patientId,
          doctorId: '',
          category: '',
          description: '',
          quantity: '',
          amount: '',
          total: 0,
          status: invoice.status,
          createdBy: invoice.createdBy,
          createdAt: invoice.createdAt,
          items: []
        };
      }
      
      // Add this item to the items array
      acc[invoiceId].items.push({
        doctorId: invoice.doctorId,
        type: invoice.type,
        category: invoice.category,
        description: invoice.description,
        quantity: invoice.quantity,
        amount: invoice.amount,
        total: invoice.total
      });
      
      // If this is a consultation item, update the main invoice details
      if (invoice.type === 'Consultation') {
        acc[invoiceId].doctorId = invoice.doctorId;
        acc[invoiceId].category = invoice.category;
        acc[invoiceId].description = invoice.description;
        acc[invoiceId].quantity = invoice.quantity;
        acc[invoiceId].amount = invoice.amount;
      }
      
      // Add to total
      acc[invoiceId].total += invoice.total;
      
      return acc;
    }, {});
        
    // Convert to array and sort by creation date
    const result = Object.values(groupedInvoices).sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    try {
      const validatedData = invoiceSchema.parse(body);
    } catch (validationError) {
      console.error("Validation error details:", validationError);
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: validationError instanceof Error ? validationError.message : 'Unknown validation error'
      }, { status: 400 });
    }

    const validatedData = invoiceSchema.parse(body);
    const createdBy = session.user.name || session.user.email || '';
    const createdAt = new Date().toISOString();

    // Append each item as a separate row
    for (const item of validatedData.items) {
      const values = [
        validatedData.invoiceId || Date.now().toString(), // Use provided invoiceId or generate new one
        item.patientId,
        item.doctorId,
        item.type,
        item.category,
        item.description,
        item.quantity,
        item.amount,
        item.total,
        validatedData.status,
        createdBy,
        createdAt
      ];

      await sheetsService.appendRow('Invoices!A:L', values);
    }

    return NextResponse.json({ message: 'Invoice created successfully' });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json() as { id: string; status: string };
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Find the row with the given ID and update its status
    const rows = await sheetsService.getRange('Invoices!A:L');
    const rowIndex = rows.findIndex((row: any[]) => row[0] === id);

    if (rowIndex === -1) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Update the status column (column J, index 9)
    const updateRange = `Invoices!J${rowIndex + 1}`;
    await sheetsService.updateRow(updateRange, [status]);

    return NextResponse.json({ message: 'Invoice updated successfully' });
  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 });
  }
} 