import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { GoogleSheetsService } from '@/lib/google-sheets';
import { SHEET_NAMES } from '@/types/sheets';

// Validation schemas
const patientSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  age: z.number().min(0).max(120),
  gender: z.enum(['male', 'female', 'other']),
  contact: z.string().min(10),
  address: z.string(),
  medicalHistory: z.string().optional(),
  lastVisit: z.string().optional(),
});

const sheetsService = new GoogleSheetsService(process.env.GOOGLE_SHEETS_ID!);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    const patients = await sheetsService.getPatients();

    if (id) {
      const patient = patients.find(p => p.id === id);
      if (!patient) {
        return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
      }
      return NextResponse.json(patient);
    }

    return NextResponse.json(patients);
  } catch (error) {
    console.error('Error in GET /api/patients:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = patientSchema.parse(body);

    const newPatient = {
      ...validatedData,
      id: validatedData.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await sheetsService.appendRow(SHEET_NAMES.PATIENTS, Object.values(newPatient));
    return NextResponse.json(newPatient, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Error in POST /api/patients:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = patientSchema.parse(body);

    const updatedPatient = await sheetsService.updatePatient(validatedData.id, validatedData);
    return NextResponse.json(updatedPatient);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Error in PUT /api/patients:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 });
    }

    const patients = await sheetsService.getPatients();
    const patient = patients.find(p => p.id === id);

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    const sheetId = await sheetsService.getSheetId(SHEET_NAMES.PATIENTS);
    await sheetsService.batchUpdate([{
      deleteDimension: {
        range: {
          sheetId,
          dimension: 'ROWS',
          startIndex: patients.findIndex(p => p.id === id),
          endIndex: patients.findIndex(p => p.id === id) + 1,
        },
      },
    }]);

    return NextResponse.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/patients:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 