import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { GoogleSheetsService } from '@/lib/google-sheets';
import { SHEET_NAMES, staffSchema } from '@/types/sheets';

const sheetsService = new GoogleSheetsService(process.env.GOOGLE_SHEETS_ID!);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const role = searchParams.get('role');
    const department = searchParams.get('department');

    const staff = await sheetsService.getStaff();

    if (id) {
      const member = staff.find(s => s.id === id);
      if (!member) {
        return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
      }
      return NextResponse.json(member);
    }

    if (role) {
      const filteredStaff = staff.filter(s => s.role === role);
      return NextResponse.json(filteredStaff);
    }

    if (department) {
      const filteredStaff = staff.filter(s => s.specialization === department);
      return NextResponse.json(filteredStaff);
    }

    return NextResponse.json(staff);
  } catch (error) {
    console.error('Error in GET /api/staff:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = staffSchema.parse(body);

    const newStaff = {
      ...validatedData,
      id: validatedData.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await sheetsService.appendRow(SHEET_NAMES.STAFF, Object.values(newStaff));
    return NextResponse.json(newStaff, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Error in POST /api/staff:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = staffSchema.parse(body);

    const updatedStaff = await sheetsService.updateStaff(validatedData.id, validatedData);
    return NextResponse.json(updatedStaff);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Error in PUT /api/staff:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Staff ID is required' }, { status: 400 });
    }

    const staff = await sheetsService.getStaff();
    const member = staff.find(s => s.id === id);

    if (!member) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
    }

    const sheetId = await sheetsService.getSheetId(SHEET_NAMES.STAFF);
    await sheetsService.batchUpdate([{
      deleteDimension: {
        range: {
          sheetId,
          dimension: 'ROWS',
          startIndex: staff.findIndex(s => s.id === id),
          endIndex: staff.findIndex(s => s.id === id) + 1,
        },
      },
    }]);

    return NextResponse.json({ message: 'Staff member deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/staff:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 