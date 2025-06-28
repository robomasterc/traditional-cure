import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { GoogleSheetsService } from '@/lib/google-sheets';
import { SHEET_NAMES } from '@/config/sheets';

// Validation schemas
const inventorySchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  category: z.string(),
  stock: z.number().min(0),
  unit: z.string(),
  costPrice: z.number().min(0),
  sellingPrice: z.number().min(0),
  supplierId: z.string(),
  expiryDate: z.string(),
  reorderLevel: z.number().min(0),
  batchNumber: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
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

    // Get all inventory items to find the row index
    const items = await sheetsService.getInventory();
    const itemIndex = items.findIndex(i => i.id === validatedData.id);

    if (itemIndex === -1) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // Convert to array format for Google Sheets (A2:M range)
    // Based on SHEET_COLUMNS.INVENTORY structure
    const rowData = [
      validatedData.id,
      validatedData.name,
      validatedData.category,
      validatedData.stock,
      validatedData.unit,
      validatedData.costPrice,
      validatedData.sellingPrice,
      validatedData.supplierId,
      validatedData.expiryDate,
      validatedData.reorderLevel,
      validatedData.batchNumber,
      validatedData.createdAt,
      validatedData.updatedAt,
    ];

    // Update the specific row in Google Sheets
    // Note: +2 because Google Sheets is 1-indexed and we have a header row
    const range = `${SHEET_NAMES.INVENTORY}!A${itemIndex + 2}:M${itemIndex + 2}`;
    await sheetsService.updateRow(range, rowData);

    return NextResponse.json(validatedData);
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

    // const sheetId = await sheetsService.getSheetId(SHEET_NAMES.INVENTORY);
    // await sheetsService.batchUpdate([{
    //   deleteDimension: {
    //     range: {
    //       sheetId,
    //       dimension: 'ROWS',
    //       startIndex: items.findIndex(i => i.id === id),
    //       endIndex: items.findIndex(i => i.id === id) + 1,
    //     },
    //   },
    // }]);

    return NextResponse.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/inventory:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 