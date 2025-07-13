import { NextRequest, NextResponse } from 'next/server';
import sheetsService from '@/lib/google-sheets';
import { SHEET_NAMES } from '@/config/sheets';

interface OrderTracking {
  id: string;
  poNumber: string;
  supplierName: string;
  supplierId: string;
  orderDate: string;
  expectedDelivery: string;
  status: 'Sent' | 'Confirmed' | 'In Transit' | 'Out for Delivery' | 'Delivered' | 'Delayed';
  currentLocation?: string;
  trackingNumber?: string;
  carrier?: string;
  lastUpdate: string;
  totalAmount: number;
  items: TrackingItem[];
  notes?: string;
  contactPerson: string;
  contactPhone: string;
}

interface TrackingItem {
  itemId: string;
  itemName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const status = searchParams.get('status');
    const supplierId = searchParams.get('supplierId');

    // Get orders from Google Sheets
    const orderRows = await sheetsService.getRange(`${SHEET_NAMES.ORDERS}!A2:L`);
    
    // Get suppliers for contact information
    const suppliers = await sheetsService.getSuppliers();
    const suppliersMap = new Map(suppliers.map(s => [s.id, s]));

    // Group orders by PO number and transform to tracking format
    const ordersMap = new Map<string, OrderTracking>();

    for (const row of orderRows) {
      if (row.length < 12) continue; // Skip incomplete rows

      const [
        orderId,
        poNumber,
        supplierId,
        orderDate,
        itemId,
        itemName,
        quantity,
        unitPrice,
        total,
        notes,
        createdBy,
        createdAt
      ] = row;

      if (!poNumber || !supplierId) continue;

      const supplier = suppliersMap.get(supplierId);
      if (!supplier) continue;

      // Create or update order tracking entry
      if (!ordersMap.has(poNumber)) {
        // Generate tracking data based on order status
        const statusMap: Record<string, 'Sent' | 'Confirmed' | 'In Transit' | 'Out for Delivery' | 'Delivered' | 'Delayed'> = {
          'Draft': 'Sent',
          'Pending': 'Sent',
          'Confirmed': 'Confirmed',
          'Shipped': 'In Transit',
          'Delivered': 'Delivered',
          'Cancelled': 'Delayed'
        };

        // Calculate expected delivery (7 days from order date)
        const orderDateObj = new Date(orderDate);
        const expectedDelivery = new Date(orderDateObj.getTime() + 7 * 24 * 60 * 60 * 1000);

        // Generate tracking number if not exists
        const trackingNumber = `TRK${Date.now().toString().slice(-8)}`;

        // Generate current location based on status
        const locationMap: Record<string, string> = {
          'Sent': 'Supplier Warehouse',
          'Confirmed': 'Supplier Warehouse',
          'In Transit': 'Mumbai Distribution Center',
          'Out for Delivery': 'Local Hub',
          'Delivered': 'Delivered',
          'Delayed': 'Delhi Hub'
        };

        const status = statusMap[createdBy] || 'Sent'; // Using createdBy as status for demo
        const currentLocation = locationMap[status];

        ordersMap.set(poNumber, {
          id: orderId || `TR${Date.now()}`,
          poNumber,
          supplierName: supplier.name,
          supplierId,
          orderDate,
          expectedDelivery: expectedDelivery.toISOString().split('T')[0],
          status,
          currentLocation: status !== 'Delivered' ? currentLocation : undefined,
          trackingNumber: status !== 'Sent' ? trackingNumber : undefined,
          carrier: status !== 'Sent' ? 'Express Logistics' : undefined,
          lastUpdate: createdAt || new Date().toISOString(),
          totalAmount: 0, // Will be calculated
          items: [],
          notes: notes || '',
          contactPerson: supplier.contact,
          contactPhone: supplier.phone
        });
      }

      // Add item to the order
      const order = ordersMap.get(poNumber)!;
      order.items.push({
        itemId: itemId || `INV${Date.now()}`,
        itemName,
        quantity: Number(quantity) || 0,
        unit: 'kg', // Default unit
        unitPrice: Number(unitPrice) || 0,
        totalPrice: Number(total) || 0
      });

      // Update total amount
      order.totalAmount += Number(total) || 0;
    }

    let orders = Array.from(ordersMap.values());

    // Apply filters
    if (id) {
      orders = orders.filter(order => order.id === id);
    }

    if (status && status !== 'all') {
      orders = orders.filter(order => order.status === status);
    }

    if (supplierId && supplierId !== 'all') {
      orders = orders.filter(order => order.supplierId === supplierId);
    }

    // Sort by last update
    orders.sort((a, b) => new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime());

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error in GET /api/orders/tracking:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { poNumber, status, currentLocation, trackingNumber, carrier, notes } = body;

    if (!poNumber) {
      return NextResponse.json({ error: 'PO Number is required' }, { status: 400 });
    }

    // Get current orders
    const orderRows = await sheetsService.getRange(`${SHEET_NAMES.ORDERS}!A2:L`);
    
    // Find rows to update (all rows with matching PO number)
    const rowsToUpdate: number[] = [];
    for (let i = 0; i < orderRows.length; i++) {
      if (orderRows[i][1] === poNumber) { // PO Number is in column B (index 1)
        rowsToUpdate.push(i + 2); // +2 because Google Sheets is 1-indexed and we have header
      }
    }

    if (rowsToUpdate.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Update each row with new tracking information
    for (const rowIndex of rowsToUpdate) {
      const currentRow = orderRows[rowIndex - 2]; // Convert back to 0-indexed
      
      // Update the row with new information
      const updatedRow = [
        currentRow[0], // ID
        currentRow[1], // PO Number
        currentRow[2], // Supplier ID
        currentRow[3], // Order Date
        currentRow[4], // Item ID
        currentRow[5], // Item Name
        currentRow[6], // Quantity
        currentRow[7], // Unit Price
        currentRow[8], // Total
        notes || currentRow[9], // Notes
        status || currentRow[10], // Status (using createdBy field for status)
        new Date().toISOString() // Updated timestamp
      ];

      await sheetsService.updateRow(`${SHEET_NAMES.ORDERS}!A${rowIndex}:L${rowIndex}`, updatedRow);
    }

    return NextResponse.json({ message: 'Order tracking updated successfully' });
  } catch (error) {
    console.error('Error in PUT /api/orders/tracking:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 