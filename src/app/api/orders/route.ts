import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import sheetsService from '@/lib/google-sheets';
import { SHEET_NAMES } from '@/config/sheets';
import type { PurchaseOrder } from '@/hooks/useOrders';

// Validation schemas
const orderItemSchema = z.object({
  itemId: z.string(),
  itemName: z.string(),
  quantity: z.number().min(1),
  unit: z.string(),
  unitPrice: z.number().min(0),
  totalPrice: z.number().min(0),
});

const purchaseOrderSchema = z.object({
  id: z.string(),
  poNumber: z.string(),
  supplierId: z.string(),
  supplierName: z.string(),
  orderDate: z.string(),
  expectedDelivery: z.string(),
  status: z.enum(['Draft', 'Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled']),
  totalAmount: z.number().min(0),
  items: z.array(orderItemSchema),
  notes: z.string().optional(),
  createdBy: z.string(),
  createdAt: z.string(),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const status = searchParams.get('status');
    const supplierId = searchParams.get('supplierId');

    // TODO: Implement getOrders method in sheetsService
    // const orders = await sheetsService.getOrders();

    // For now, return empty array until getOrders is implemented
    const orders: PurchaseOrder[] = [];

    if (id) {
      const order = orders.find(o => o.id === id);
      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }
      return NextResponse.json(order);
    }

    if (status) {
      const filteredOrders = orders.filter(o => o.status === status);
      return NextResponse.json(filteredOrders);
    }

    if (supplierId) {
      const filteredOrders = orders.filter(o => o.supplierId === supplierId);
      return NextResponse.json(filteredOrders);
    }

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error in GET /api/orders:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = purchaseOrderSchema.parse(body);

    // Convert order data to array format for Google Sheets
    const orderData = [
      validatedData.id,
      validatedData.poNumber,
      validatedData.supplierId,
      validatedData.supplierName,
      validatedData.orderDate,
      validatedData.expectedDelivery,
      validatedData.status,
      validatedData.totalAmount,
      JSON.stringify(validatedData.items), // Store items as JSON string
      validatedData.notes || '',
      validatedData.createdBy,
      validatedData.createdAt,
    ];

    //for every item in validatedData.items, append to the items sheet
    //ID	PONumber	SupplierID	OrderDate	ItemID	ItemName	Quantity	UnitPrice	Total	Notes	CreatedBy	CreatedAt
    for (const item of validatedData.items) {
      const itemData = [
        validatedData.id,
        validatedData.poNumber,
        validatedData.supplierId,
        validatedData.orderDate,
        item.itemId,
        item.itemName,
        item.quantity,
        item.unitPrice,
        item.totalPrice,
        validatedData.notes || '',
        validatedData.createdBy,
        validatedData.createdAt,
      ];
      await sheetsService.appendRow(SHEET_NAMES.ORDERS, itemData);
    }

    return NextResponse.json(validatedData, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Error in POST /api/orders:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 