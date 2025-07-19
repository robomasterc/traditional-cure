import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import sheetsService from '@/lib/google-sheets';

interface StockMovement {
  id: string;
  itemId: string;
  itemName: string;
  type: 'IN' | 'OUT';
  quantity: number;
  reason: string;
  date: string;
  reference: string;
  notes?: string;
}

interface NetStockMovement {
  itemId: string;
  itemName: string;
  totalStockIn: number;
  totalStockOut: number;
  netMovement: number;
  movementCount: number;
  lastMovementDate: string;
  averageMonthlyMovement: number;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const groupBy = searchParams.get('groupBy'); // 'date' or 'medicine'

    const movements: StockMovement[] = [];

    // Get stock-out movements from Invoices (Medicine sales)
    try {
      const invoiceRows = await sheetsService.getRange('Invoices!A2:L');
      
      invoiceRows.forEach((row: string[]) => {
        const [
          invoiceId,
          patientId,
          , // doctorId unused
          type,
          category,
          description,
          quantity,
          , // amount unused
          , // total unused
          status,
          , // createdBy unused
          createdAt
        ] = row;


        // Only create stock movements for Medicine items with status 'Complete'
        if (type === 'Medicine' && status === 'Complete' && category) {
          const movement = {
            id: `INV-${invoiceId}-${category}`,
            itemId: category, // Medicine ID is stored in category field
            itemName: description,
            type: 'OUT' as const, // Medicine sales are stock out
            quantity: Number(quantity) || 0,
            reason: 'Sale',
            date: createdAt ? new Date(createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            reference: `INV-${invoiceId}`,
            notes: `Sold to patient ${patientId}`
          };
          movements.push(movement);
        }
      });
    } catch {
    }

    // Get stock-in movements from Orders (Purchases)
    try {
      const orderRows = await sheetsService.getRange('Orders!A2:L');
      
      orderRows.forEach((row: string[]) => {
        const [
          orderId,
          poNumber,
          supplierId,
          , // orderDate unused
          itemId,
          itemName,
          quantity,
          , // unitPrice unused
          , // total unused
          , // notes unused
          , // createdBy unused
          createdAt
        ] = row;


        // Create stock movements for delivered orders
        // Note: We'll assume orders are delivered when created, but in a real system
        // you'd check the order status from a separate orders sheet
        const movement = {
          id: `ORD-${orderId}-${itemId}`,
          itemId: itemId,
          itemName: itemName,
          type: 'IN' as const, // Order receipts are stock in
          quantity: Number(quantity) || 0,
          reason: 'Purchase',
          date: createdAt ? new Date(createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          reference: `PO-${poNumber}`,
          notes: `Received from supplier ${supplierId}`
        };
        movements.push(movement);
      });
    } catch {
    }
    // Filter by date range
    let filteredMovements = movements;
    
    if (date) {
      // Single date filter
      filteredMovements = movements.filter(movement => movement.date === date);
    } else if (startDate && endDate) {
      // Date range filter
      filteredMovements = movements.filter(movement => 
        movement.date >= startDate && movement.date <= endDate
      );
    } else {
      // Default: last 30 months
      const thirtyMonthsAgo = new Date();
      thirtyMonthsAgo.setMonth(thirtyMonthsAgo.getMonth() - 30);
      const defaultStartDate = thirtyMonthsAgo.toISOString().split('T')[0];
      const today = new Date().toISOString().split('T')[0];
      
      filteredMovements = movements.filter(movement => 
        movement.date >= defaultStartDate && movement.date <= today
      );
    }

    // Group by medicine if requested
    if (groupBy === 'medicine') {
      // const netMovements: NetStockMovement[] = [];
      const medicineMap = new Map<string, NetStockMovement>();

      filteredMovements.forEach(movement => {
        if (!medicineMap.has(movement.itemId)) {
          medicineMap.set(movement.itemId, {
            itemId: movement.itemId,
            itemName: movement.itemName,
            totalStockIn: 0,
            totalStockOut: 0,
            netMovement: 0,
            movementCount: 0,
            lastMovementDate: movement.date,
            averageMonthlyMovement: 0
          });
        }

        const netMovement = medicineMap.get(movement.itemId)!;
        
        if (movement.type === 'IN') {
          netMovement.totalStockIn += movement.quantity;
        } else {
          netMovement.totalStockOut += movement.quantity;
        }
        
        netMovement.netMovement = netMovement.totalStockIn - netMovement.totalStockOut;
        netMovement.movementCount += 1;
        
        if (movement.date > netMovement.lastMovementDate) {
          netMovement.lastMovementDate = movement.date;
        }
      });

      // Calculate average monthly movement
      const startDate = new Date(Math.min(...filteredMovements.map(m => new Date(m.date).getTime())));
      const endDate = new Date(Math.max(...filteredMovements.map(m => new Date(m.date).getTime())));
      const monthsDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                        (endDate.getMonth() - startDate.getMonth()) + 1;

      medicineMap.forEach(netMovement => {
        netMovement.averageMonthlyMovement = netMovement.movementCount / Math.max(monthsDiff, 1);
      });

      const result = Array.from(medicineMap.values()).sort((a, b) => 
        Math.abs(b.netMovement) - Math.abs(a.netMovement)
      );

      return NextResponse.json(result);
    }

    // Sort by date (newest first) for regular movements
    filteredMovements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json(filteredMovements);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch stock movements' }, { status: 500 });
  }
} 