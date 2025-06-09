import { GoogleSheetsService } from '../lib/google-sheets';
import { SHEET_NAMES } from '../types/sheets';

async function initializeSheets() {
  const sheetsService = new GoogleSheetsService(process.env.GOOGLE_DATA_SHEETS_ID!);

  // Define headers for each sheet
  const headers = {
    [SHEET_NAMES.PATIENTS]: [
      'id', 'name', 'age', 'gender', 'phone', 'address', 'medicalHistory', 
      'allergies', 'bloodGroup', 'createdAt', 'updatedAt'
    ],
    [SHEET_NAMES.CONSULTATIONS]: [
      'id', 'patientId', 'doctorId', 'date', 'symptoms', 'diagnosis', 
      'notes', 'followUpDate', 'status', 'createdAt', 'updatedAt'
    ],
    [SHEET_NAMES.PRESCRIPTIONS]: [
      'id', 'consultationId', 'patientId', 'doctorId', 'medications', 
      'status', 'validUntil', 'createdAt', 'updatedAt'
    ],
    [SHEET_NAMES.INVENTORY]: [
      'id', 'name', 'category', 'quantity', 'unit', 'price', 'supplier', 
      'expiryDate', 'minimumStock', 'location', 'batchNumber', 'createdAt', 'updatedAt'
    ],
    [SHEET_NAMES.STAFF]: [
      'id', 'name', 'role', 'email', 'phone', 'specialization', 
      'licenseNumber', 'status', 'joiningDate', 'createdAt', 'updatedAt'
    ],
    [SHEET_NAMES.TRANSACTIONS]: [
      'id', 'type', 'amount', 'paymentMethod', 'status', 'referenceId', 
      'description', 'patientId', 'staffId', 'createdAt', 'updatedAt'
    ],
  };

  // Create sheets and set headers
  for (const [sheetName, sheetHeaders] of Object.entries(headers)) {
    try {
      await sheetsService.initializeSheet(sheetName, sheetHeaders);
      console.log(`✅ Initialized ${sheetName} sheet`);
    } catch (error) {
      console.error(`❌ Error initializing ${sheetName} sheet:`, error);
    }
  }
}

// Run the initialization
initializeSheets().catch(console.error); 