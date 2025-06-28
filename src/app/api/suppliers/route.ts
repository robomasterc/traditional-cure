import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import sheetsService from '@/lib/google-sheets';
import { SHEET_NAMES } from '@/config/sheets';

// Validation schemas
const supplierSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  contact: z.string(),
  phone: z.string(),
  email: z.string().email(),
  address: z.string(),
  speciality: z.string(),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const speciality = searchParams.get('speciality');

    const suppliers = await sheetsService.getSuppliers();

    if (id) {
      const supplier = suppliers.find(s => s.id === id);
      if (!supplier) {
        return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
      }
      return NextResponse.json(supplier);
    }

    if (speciality) {
      const filteredSuppliers = suppliers.filter(s => s.speciality === speciality);
      return NextResponse.json(filteredSuppliers);
    }

    return NextResponse.json(suppliers);
  } catch (error) {
    console.error('Error in GET /api/suppliers:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = supplierSchema.parse(body);

    const newSupplier = {
      ...validatedData,
      id: validatedData.id,
    };

    await sheetsService.appendRow(SHEET_NAMES.SUPPLIERS, Object.values(newSupplier));
    return NextResponse.json(newSupplier, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Error in POST /api/suppliers:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 