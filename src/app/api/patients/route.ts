import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getDataService } from '@/lib/data-service';
import { SHEET_NAMES } from '@/config/sheets';
import { isGoogleSheetsProvider, isSQLiteProvider } from '@/config/database';

// Validation schemas
const patientSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  age: z.number().min(0).max(150),
  gender: z.enum(['Male', 'Female', 'Other']),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  email: z.string().optional(),
  district: z.string().min(1, "District is required"),
  state: z.string().min(1, "State is required"),
  occupation: z.string().min(1, "Occupation is required"),
  allergies: z.string().optional(),
  emergencyContact: z.string().optional(),
});

const updatePatientSchema = patientSchema.partial().omit({ id: true });

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const search = searchParams.get('search');
    const gender = searchParams.get('gender');

    const dataService = getDataService();
    const patients = await dataService.getPatients();

    if (id) {
      const patient = patients.find(p => p.id === id);
      if (!patient) {
        return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
      }
      return NextResponse.json(patient);
    }

    let filteredPatients = patients;

    // Search by name, phone, or email
    if (search) {
      const searchLower = search.toLowerCase();
      filteredPatients = filteredPatients.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.phone.includes(search) ||
        (p.email && p.email.toLowerCase().includes(searchLower))
      );
    }

    // Filter by gender
    if (gender && ['Male', 'Female', 'Other'].includes(gender)) {
      filteredPatients = filteredPatients.filter(p => p.gender === gender);
    }

    // Sort by name
    filteredPatients.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json(filteredPatients);
  } catch (error) {
    console.error('Error in GET /api/patients:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received POST body:', JSON.stringify(body, null, 2));
    const validatedData = patientSchema.parse(body);
    console.log('Validated patient data:', JSON.stringify(validatedData, null, 2));

    // Generate ID if not provided
    if (!validatedData.id) {
      validatedData.id = `PAT${Date.now()}`;
    }

    const newPatient = {
      ...validatedData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const dataService = getDataService();

    if (isGoogleSheetsProvider() && 'appendRow' in dataService && dataService.appendRow) {
      // Prepare row data in the correct order as per SHEET_COLUMNS
      const rowData = [
        newPatient.id,
        newPatient.name,
        newPatient.age,
        newPatient.gender,
        newPatient.phone,
        newPatient.email || '',
        newPatient.district,
        newPatient.state,
        newPatient.occupation,
        newPatient.allergies || '',
        newPatient.emergencyContact || '',
        newPatient.createdAt,
        newPatient.updatedAt
      ];
      console.log('Appending new patient to Google Sheets:', rowData);
      await dataService.appendRow(`${SHEET_NAMES.PATIENTS}!A:M`, rowData);
    } else if (isSQLiteProvider()) {
      // For SQLite, use the direct service since the interface doesn't match
      const { SQLiteService } = await import('@/lib/sqlite');
      const sqliteService = new SQLiteService();
      
      const patientData = {
        id: newPatient.id,
        name: newPatient.name,
        age: newPatient.age,
        gender: newPatient.gender,
        phone: newPatient.phone,
        email: newPatient.email || null,
        district: newPatient.district,
        state: newPatient.state,
        occupation: newPatient.occupation,
        allergies: newPatient.allergies || null,
        emergency_contact: newPatient.emergencyContact || null,
        created_at: newPatient.createdAt,
        updated_at: newPatient.updatedAt
      };
      console.log('Adding new patient to SQLite:', patientData);
      await sqliteService.appendRow('patients', patientData);
    }
    
    return NextResponse.json(newPatient, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Zod validation error:', JSON.stringify(error.errors, null, 2));
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Error in POST /api/patients:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = updatePatientSchema.parse(body);

    const dataService = getDataService();
    
    // Get current patients to find the record
    const patients = await dataService.getPatients();
    const patientIndex = patients.findIndex(p => p.id === id);
    
    if (patientIndex === -1) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    const currentPatient = patients[patientIndex];
    const updatedPatient = {
      ...currentPatient,
      ...validatedData,
      updatedAt: new Date().toISOString(),
    };

    if (isGoogleSheetsProvider() && 'updateRow' in dataService && dataService.updateRow) {
      // Prepare row data for update (row index + 2 because of header and 0-based index)
      const rowNumber = patientIndex + 2;
      const rowData = [
        updatedPatient.id,
        updatedPatient.name,
        updatedPatient.age,
        updatedPatient.gender,
        updatedPatient.phone,
        updatedPatient.email || '',
        updatedPatient.district,
        updatedPatient.state,
        updatedPatient.occupation,
        updatedPatient.allergies || '',
        updatedPatient.emergencyContact || '',
        String(updatedPatient.createdAt),
        String(updatedPatient.updatedAt)
      ];

      await dataService.updateRow(`${SHEET_NAMES.PATIENTS}!A${rowNumber}:M${rowNumber}`, rowData);
    } else if (isSQLiteProvider()) {
      // For SQLite, use the direct service since the interface doesn't match
      const { SQLiteService } = await import('@/lib/sqlite');
      const sqliteService = new SQLiteService();
      
      const patientData = {
        name: updatedPatient.name,
        age: updatedPatient.age,
        gender: updatedPatient.gender,
        phone: updatedPatient.phone,
        email: updatedPatient.email || null,
        district: updatedPatient.district,
        state: updatedPatient.state,
        occupation: updatedPatient.occupation,
        allergies: updatedPatient.allergies || null,
        emergency_contact: updatedPatient.emergencyContact || null,
        updated_at: updatedPatient.updatedAt
      };
      
      await sqliteService.updateRow('patients', id, patientData);
    }

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

    const dataService = getDataService();
    
    // Get current patients to find the record
    const patients = await dataService.getPatients();
    const patientIndex = patients.findIndex(p => p.id === id);
    
    if (patientIndex === -1) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    if (isGoogleSheetsProvider() && 'updateRow' in dataService && dataService.updateRow) {
      // Note: Google Sheets API doesn't have a direct delete row method
      // We'll mark the patient as inactive by clearing the row data
      const rowNumber = patientIndex + 2;
      const emptyRowData = new Array(13).fill(''); // 13 columns for patients
      
      await dataService.updateRow(`${SHEET_NAMES.PATIENTS}!A${rowNumber}:M${rowNumber}`, emptyRowData);
    } else if (isSQLiteProvider()) {
      // For SQLite, we can perform actual deletion
      // Note: We need to implement a delete method in the SQLite service
      // For now, we'll mark as deleted by setting a status field or similar approach
      // This would require adding a 'deleted' flag to the schema
      return NextResponse.json({ error: 'Delete operation not fully implemented for SQLite yet' }, { status: 501 });
    }
    
    return NextResponse.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/patients:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}