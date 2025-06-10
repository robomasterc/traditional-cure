import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { GoogleSheetsService } from '@/lib/google-sheets';
import { SHEET_NAMES } from '@/types/sheets';

// Validation schemas
const inventorySchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  category: z.string(),
  quantity: z.number().min(0),
  unit: z.string(),
  price: z.number().min(0),
  supplier: z.string(),
  lastRestocked: z.string().optional(),
  expiryDate: z.string().optional(),
  minimumStock: z.number().min(0).optional(),
});

const sheetsService = new GoogleSheetsService(process.env.GOOGLE_SHEETS_ID!);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const category = searchParams.get('category');

    const items = await sheetsService.getInventory();

    if (id) {
      const item = items.find(i => i.id === id);
      if (!item) {
        return NextResponse.json({ error: 'Item not found' }, { status: 404 });
      }
      return NextResponse.json(item);
    }

    if (category) {
      const filteredItems = items.filter(i => i.category === category);
      return NextResponse.json(filteredItems);
    }

    return NextResponse.json(items);
  } catch (error) {
    console.error('Error in GET /api/inventory:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = inventorySchema.parse(body);

    const newItem = {
      ...validatedData,
      id: validatedData.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await sheetsService.appendRow(SHEET_NAMES.INVENTORY, Object.values(newItem));
    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Error in POST /api/inventory:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = inventorySchema.parse(body);

    const updatedItem = await sheetsService.updateInventory(validatedData.id, validatedData);
    return NextResponse.json(updatedItem);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Error in PUT /api/inventory:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    const items = await sheetsService.getInventory();
    const item = items.find(i => i.id === id);

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const sheetId = await sheetsService.getSheetId(SHEET_NAMES.INVENTORY);
    await sheetsService.batchUpdate([{
      deleteDimension: {
        range: {
          sheetId,
          dimension: 'ROWS',
          startIndex: items.findIndex(i => i.id === id),
          endIndex: items.findIndex(i => i.id === id) + 1,
        },
      },
    }]);

    return NextResponse.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/inventory:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 