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
  paymentMethods: z.array(z.object({
    method: z.enum(['Cash', 'UPI']),
    amount: z.number()
  })).optional(), // Optional payment methods
});

// Type definitions
type SheetRow = string[];
type InvoiceRecord = {
  id: string;
  patientId: string;
  doctorId: string;
  type: string;
  category: string;
  description: string;
  quantity: number;
  amount: number;
  total: number;
  status: string;
  createdBy: string;
  createdAt: string;
};
type GroupedInvoice = {
  id: string;
  patientId: string;
  doctorId: string;
  category: string;
  description: string;
  quantity: string | number;
  amount: string | number;
  total: number;
  status: string;
  createdBy: string;
  createdAt: string;
  items: Array<{
    doctorId: string;
    type: string;
    category: string;
    description: string;
    quantity: number;
    amount: number;
    total: number;
  }>;
};

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
    
    let invoices: InvoiceRecord[] = rows.map((row: SheetRow) => ({
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
    const groupedInvoices = invoices.reduce((acc: Record<string, GroupedInvoice>, invoice: InvoiceRecord) => {
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
    const result = Object.values(groupedInvoices).sort((a: GroupedInvoice, b: GroupedInvoice) => 
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
    
    // Validate the request body
    const validatedData = invoiceSchema.parse(body);
    const createdBy = session.user.name || session.user.email || '';
    const createdAt = new Date().toISOString();
    // Ensure we have a valid invoiceId
    const invoiceId = validatedData.invoiceId || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;    
    
    // Append each item as a separate row
    for (const item of validatedData.items) {
      const values = [
        invoiceId, // Use the consistent invoiceId
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

      // Adjust inventory for Medicine items if status is Complete
      if (validatedData.status === 'Complete' && item.type === 'Medicine' && item.category) {
        // adjustInventoryByCategoryOptimized(item.category, item.quantity, createdBy, inventory, inventoryRows);
        adjustInventoryByCategory(item.category, item.quantity, createdBy);
      }
    }

    // Create transaction for new invoice
    if (validatedData.status === 'Ready' && validatedData.paymentMethods && validatedData.paymentMethods.length > 0) {
      createTransactionFromInvoice(invoiceId, validatedData.items[0].patientId, validatedData.items[0].doctorId, validatedData.paymentMethods, createdBy);
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

    const body = await request.json() as { id: string; status: string; paymentMethods?: Array<{ method: string; amount: number }> };
    const { id, status, paymentMethods } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Find the row with the given ID and update its status
    const rows = await sheetsService.getRange('Invoices!A:L');
    const rowIndex = rows.findIndex((row: SheetRow) => row[0] === id);

    if (rowIndex === -1) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Update the status column (column J, index 9)
    const updateRange = `Invoices!J${rowIndex + 1}`;
    await sheetsService.updateRow(updateRange, [status]);

    // If status is being set to Complete, adjust inventory and update transaction
    if (status === 'Complete') {      
      // Update transaction if payment methods provided
      if (paymentMethods && paymentMethods.length > 0) {
        updateTransactionFromInvoice(id, paymentMethods, session.user.name || session.user.email || '');
      }
    }

    return NextResponse.json({ message: 'Invoice updated successfully' });
  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 });
  }
}

// Helper function to create transaction from new invoice
async function createTransactionFromInvoice(invoiceId: string, patientId: string, doctorId: string, paymentMethods: Array<{ method: string; amount: number }>, createdBy: string) {
  try {
    // Calculate total amount
    const totalAmount = paymentMethods.reduce((sum: number, pm: { amount: number }) => sum + pm.amount, 0);

    // Use provided payment methods or default to 70% cash, 30% UPI
    let totalCash = 0;
    let totalUPI = 0;
    
    if (paymentMethods && paymentMethods.length > 0) {
      // Use provided payment methods
      paymentMethods.forEach(pm => {
        if (pm.method === 'Cash') {
          totalCash += pm.amount;
        } else if (pm.method === 'UPI') {
          totalUPI += pm.amount;
        }
      });
    } else {
      // Default split: 70% cash, 30% UPI
      totalCash = Math.round(totalAmount * 0.7);
      totalUPI = totalAmount - totalCash;
    }

    // Create transaction record
    const transactionValues = [
      `Inv-${invoiceId}`, // Description
      'Income', // Type
      'Patient Billing', // Category
      totalCash.toString(), // Cash amount
      totalUPI.toString(), // UPI amount
      `Invoice ${invoiceId} - ${patientId}`, // Description
      patientId, // Patient ID
      doctorId, // Staff ID (using doctor ID)
      new Date().toISOString().split('T')[0], // Date
      createdBy, // Created by
      new Date().toISOString() // Created at
    ];

    await sheetsService.appendRow('Transactions!A:J', transactionValues);

  } catch (error) {
    console.error('Error creating transaction from invoice:', error);
  }
}

// Helper function to adjust inventory by category and quantity
async function adjustInventoryByCategory(category: string, quantity: number, createdBy: string) {
  try {
    // Get current inventory
    const inventoryRows = await sheetsService.getRange('Inventory!A2:M');
    const inventory = inventoryRows.map((row: SheetRow) => ({
      id: row[0],
      name: row[1],
      category: row[2],
      stock: Number(row[3]),
      unit: row[4],
      costPrice: Number(row[5]),
      sellingPrice: Number(row[6]),
      supplierId: row[7],
      expiryDate: row[8],
      reorderLevel: Number(row[9]),
      batchNumber: row[10],
      description: row[11] || '',
      createdAt: row[12],
      updatedAt: row[13]
    }));

    // Find the inventory item by ID (category field contains medicine ID)
    const inventoryItem = inventory.find(inv => inv.id === category);
    
    if (inventoryItem) {
      // Calculate new stock (reduce by quantity sold)
      const newStock = Math.max(0, inventoryItem.stock - quantity);
      
      // Find the row index for this inventory item
      const inventoryRowIndex = inventoryRows.findIndex((row: SheetRow) => row[0] === category);
      
      if (inventoryRowIndex !== -1) {
        // Update the stock in the inventory sheet
        const updateRange = `Inventory!D${inventoryRowIndex + 2}`; // Stock column (D)
        await sheetsService.updateRow(updateRange, [newStock.toString()]);
        
        // Update the updatedAt timestamp
        const updatedAtRange = `Inventory!M${inventoryRowIndex + 2}`; // UpdatedAt column (M)
        await sheetsService.updateRow(updatedAtRange, [new Date().toISOString()]);
        
        // Inventory updated successfully
      }
    } else {
      // Inventory item not found
    }
  } catch (error) {
    console.error('Error adjusting inventory by category:', error);
  }
}

// Helper function to update transaction from completed invoice
async function updateTransactionFromInvoice(invoiceId: string, paymentMethods: Array<{ method: string; amount: number }>, createdBy: string) {
  try {
    // Get all items for this invoice
    const rows = await sheetsService.getRange('Transactions!A:K');
    const transactionRows = rows.filter((row: SheetRow) => row[0] === `Inv-${invoiceId}`);
    
    if (transactionRows.length === 0) {
      return;
    }

    // Calculate total amount
    const totalAmount = transactionRows.reduce((sum: number, row: SheetRow) => sum + Number(row[3]) + Number(row[4]), 0);

    // Use provided payment methods or default to 70% cash, 30% UPI
    let totalCash = transactionRows.reduce((sum: number, row: SheetRow) => sum + Number(row[3]), 0);
    let totalUPI = transactionRows.reduce((sum: number, row: SheetRow) => sum + Number(row[4]), 0);
    
    if (paymentMethods && paymentMethods.length > 0) {
      // Use provided payment methods
      paymentMethods.forEach(pm => {
        if (pm.method === 'Cash') {
          totalCash += pm.amount;
        } else if (pm.method === 'UPI') {
          totalUPI += pm.amount;
        }
      });
    } else {
      // Default split: 70% cash, 30% UPI
      totalCash = Math.round(totalAmount * 0.7);
      totalUPI = totalAmount - totalCash;
    }

    // Find existing transaction for this invoice
    const transactionRowIndex = rows.findIndex((row: SheetRow) => 
      row[0] && row[0].includes(`Inv-${invoiceId}`)
    );

    if (transactionRowIndex === -1) {
      return;
    }

    // Update transaction record
    const transactionValues = [
      transactionRows[0][0], // Keep existing ID
      'Income', // Type
      'Patient Billing', // Category
      totalCash.toString(), // Cash amount
      totalUPI.toString(), // UPI amount
      `Invoice ${invoiceId} - ${transactionRows[0][6]}`, // Description
      transactionRows[0][6], // Patient ID
      transactionRows[0][7], // Staff ID (using doctor ID)
      new Date().toISOString().split('T')[0], // Date
      createdBy, // Created by
      new Date().toISOString() // Created at
    ];

    const updateRange = `Transactions!A${transactionRowIndex + 1}:K${transactionRowIndex + 1}`;
    await sheetsService.updateRow(updateRange, transactionValues);
    
  } catch (error) {
    console.error('Error updating transaction from invoice:', error);
  }
} 