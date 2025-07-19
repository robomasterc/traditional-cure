import { NextRequest, NextResponse } from 'next/server';
import sheetsService from '@/lib/google-sheets';
import { SHEET_NAMES } from '@/config/sheets';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Get adjustments from Orders sheet with date filtering
    const adjustments = await sheetsService.getStockAdjustments(startDate || undefined, endDate || undefined);
    
    return NextResponse.json(adjustments);
  } catch (error) {
    console.error('Error in GET /api/stock/adjustments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { itemId, itemName, adjustment, reason, date, adjustedBy, notes } = body;

    // Get current user session
    const session = await getServerSession(authOptions);
    const currentUser = session?.user?.name || session?.user?.email || 'Unknown User';

    // Generate unique ID and timestamp
    const id = `ADJ-${Date.now()}`;
    const createdAt = new Date().toISOString();

    // Get current inventory to calculate new stock and get unit price
    const inventoryRows = await sheetsService.getRange(`${SHEET_NAMES.INVENTORY}!A2:M`);
    const inventoryRowIndex = inventoryRows.findIndex((row: string[]) => row[0] === itemId);
    
    let currentStock = 0;
    let unitPrice = 0;
    if (inventoryRowIndex !== -1) {
      currentStock = Number(inventoryRows[inventoryRowIndex][3]); // Stock column
      unitPrice = Number(inventoryRows[inventoryRowIndex][5]); // Unit Price column
    }

    // Calculate new stock based on adjustment
    const newStock = currentStock + adjustment;
    const total = Math.abs(adjustment) * unitPrice;

    // Convert to array format for Orders sheet (using Orders structure)
    const orderData = [
      id, // Order ID (using adjustment ID)
      id, // PO Number (prefixed with ADJ)
      'ADJUSTMENT', // Supplier ID (special identifier for adjustments)
      date, // Order Date
      itemId, // Item ID
      itemName, // Item Name
      Math.abs(adjustment).toString(), // Quantity (absolute value)
      unitPrice.toString(), // Unit Price
      total.toString(), // Total
      `${reason}: ${notes || ''}`, // Notes
      currentUser, // Created By
      createdAt // Created At
    ];

    // Append to Orders sheet
    await sheetsService.appendRow(`${SHEET_NAMES.ORDERS}!A:L`, orderData);

    // Update inventory stock
    if (inventoryRowIndex !== -1) {
      const stockUpdateRange = `${SHEET_NAMES.INVENTORY}!D${inventoryRowIndex + 2}`;
      await sheetsService.updateRow(stockUpdateRange, [newStock.toString()]);
      
      const updatedAtRange = `${SHEET_NAMES.INVENTORY}!M${inventoryRowIndex + 2}`;
      await sheetsService.updateRow(updatedAtRange, [createdAt]);
    }

    const newAdjustment = { 
      id, 
      itemId, 
      itemName, 
      quantity: Math.abs(adjustment), 
      unitPrice,
      total,
      adjustment, 
      reason, 
      date, 
      adjustedBy: currentUser, 
      notes, 
      createdAt 
    };
    return NextResponse.json(newAdjustment, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/stock/adjustments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 