import { google } from 'googleapis';
import { sheets_v4 } from 'googleapis';
import { v4 as uuidv4 } from 'uuid';
import {
  Patient, patientSchema,
  Consultation, consultationSchema,
  Prescription, prescriptionSchema,
  Inventory, inventorySchema,
  Staff, staffSchema,
  Transaction, transactionSchema,
  SHEET_NAMES
} from '../types/sheets';

export class GoogleSheetsService {
  private auth: any;
  protected sheets: sheets_v4.Sheets;
  private spreadsheetId: string;

  constructor(spreadsheetId: string) {
    this.spreadsheetId = spreadsheetId;
    this.auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    this.sheets = google.sheets({ version: 'v4', auth: this.auth });
  }

  // Helper methods
  private async getSheetData(sheetName: string): Promise<any[][]> {
    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: `${sheetName}!A:Z`,
    });
    return response.data.values || [];
  }

  private async appendRow(sheetName: string, values: any[]): Promise<void> {
    await this.sheets.spreadsheets.values.append({
      spreadsheetId: this.spreadsheetId,
      range: `${sheetName}!A:Z`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [values] },
    });
  }

  private async updateRow(sheetName: string, rowIndex: number, values: any[]): Promise<void> {
    await this.sheets.spreadsheets.values.update({
      spreadsheetId: this.spreadsheetId,
      range: `${sheetName}!A${rowIndex + 1}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [values] },
    });
  }

  // Patient methods
  async getPatients(): Promise<Patient[]> {
    const rows = await this.getSheetData(SHEET_NAMES.PATIENTS);
    const headers = rows[0];
    return rows.slice(1).map(row => {
      const patient = Object.fromEntries(headers.map((header, i) => [header, row[i]]));
      return patientSchema.parse(patient);
    });
  }

  async addPatient(patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Patient> {
    const newPatient = {
      ...patient,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const validatedPatient = patientSchema.parse(newPatient);
    await this.appendRow(SHEET_NAMES.PATIENTS, Object.values(validatedPatient));
    return validatedPatient;
  }

  async updatePatient(id: string, patient: Partial<Patient>): Promise<Patient> {
    const rows = await this.getSheetData(SHEET_NAMES.PATIENTS);
    const rowIndex = rows.findIndex(row => row[0] === id);
    if (rowIndex === -1) throw new Error('Patient not found');

    const updatedPatient = {
      ...Object.fromEntries(rows[rowIndex].map((value, i) => [rows[0][i], value])),
      ...patient,
      updatedAt: new Date().toISOString(),
    };
    const validatedPatient = patientSchema.parse(updatedPatient);
    await this.updateRow(SHEET_NAMES.PATIENTS, rowIndex, Object.values(validatedPatient));
    return validatedPatient;
  }

  // Inventory methods
  async getInventory(): Promise<Inventory[]> {
    const rows = await this.getSheetData(SHEET_NAMES.INVENTORY);
    const headers = rows[0];
    return rows.slice(1).map(row => {
      const item = Object.fromEntries(headers.map((header, i) => [header, row[i]]));
      return inventorySchema.parse(item);
    });
  }

  async updateInventory(id: string, item: Partial<Inventory>): Promise<Inventory> {
    const rows = await this.getSheetData(SHEET_NAMES.INVENTORY);
    const rowIndex = rows.findIndex(row => row[0] === id);
    if (rowIndex === -1) throw new Error('Inventory item not found');

    const updatedItem = {
      ...Object.fromEntries(rows[rowIndex].map((value, i) => [rows[0][i], value])),
      ...item,
      updatedAt: new Date().toISOString(),
    };
    const validatedItem = inventorySchema.parse(updatedItem);
    await this.updateRow(SHEET_NAMES.INVENTORY, rowIndex, Object.values(validatedItem));
    return validatedItem;
  }

  // Consultation methods
  async getConsultations(): Promise<Consultation[]> {
    const rows = await this.getSheetData(SHEET_NAMES.CONSULTATIONS);
    const headers = rows[0];
    return rows.slice(1).map(row => {
      const consultation = Object.fromEntries(headers.map((header, i) => [header, row[i]]));
      return consultationSchema.parse(consultation);
    });
  }

  async addConsultation(consultation: Omit<Consultation, 'id' | 'createdAt' | 'updatedAt'>): Promise<Consultation> {
    const newConsultation = {
      ...consultation,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const validatedConsultation = consultationSchema.parse(newConsultation);
    await this.appendRow(SHEET_NAMES.CONSULTATIONS, Object.values(validatedConsultation));
    return validatedConsultation;
  }

  // Prescription methods
  async getPrescriptions(): Promise<Prescription[]> {
    const rows = await this.getSheetData(SHEET_NAMES.PRESCRIPTIONS);
    const headers = rows[0];
    return rows.slice(1).map(row => {
      const prescription = Object.fromEntries(headers.map((header, i) => [header, row[i]]));
      return prescriptionSchema.parse(prescription);
    });
  }

  async addPrescription(prescription: Omit<Prescription, 'id' | 'createdAt' | 'updatedAt'>): Promise<Prescription> {
    const newPrescription = {
      ...prescription,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const validatedPrescription = prescriptionSchema.parse(newPrescription);
    await this.appendRow(SHEET_NAMES.PRESCRIPTIONS, Object.values(validatedPrescription));
    return validatedPrescription;
  }

  // Staff methods
  async getStaff(): Promise<Staff[]> {
    const rows = await this.getSheetData(SHEET_NAMES.STAFF);
    const headers = rows[0];
    return rows.slice(1).map(row => {
      const staff = Object.fromEntries(headers.map((header, i) => [header, row[i]]));
      return staffSchema.parse(staff);
    });
  }

  async updateStaff(id: string, staff: Partial<Staff>): Promise<Staff> {
    const rows = await this.getSheetData(SHEET_NAMES.STAFF);
    const rowIndex = rows.findIndex(row => row[0] === id);
    if (rowIndex === -1) throw new Error('Staff member not found');

    const updatedStaff = {
      ...Object.fromEntries(rows[rowIndex].map((value, i) => [rows[0][i], value])),
      ...staff,
      updatedAt: new Date().toISOString(),
    };
    const validatedStaff = staffSchema.parse(updatedStaff);
    await this.updateRow(SHEET_NAMES.STAFF, rowIndex, Object.values(validatedStaff));
    return validatedStaff;
  }

  // Transaction methods
  async getTransactions(): Promise<Transaction[]> {
    const rows = await this.getSheetData(SHEET_NAMES.TRANSACTIONS);
    const headers = rows[0];
    return rows.slice(1).map(row => {
      const transaction = Object.fromEntries(headers.map((header, i) => [header, row[i]]));
      return transactionSchema.parse(transaction);
    });
  }

  async addTransaction(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> {
    const newTransaction = {
      ...transaction,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const validatedTransaction = transactionSchema.parse(newTransaction);
    await this.appendRow(SHEET_NAMES.TRANSACTIONS, Object.values(validatedTransaction));
    return validatedTransaction;
  }

  // Sheet initialization methods
  async initializeSheet(sheetName: string, headers: string[]): Promise<void> {
    // Create sheet
    await this.sheets.spreadsheets.batchUpdate({
      spreadsheetId: this.spreadsheetId,
      requestBody: {
        requests: [{
          addSheet: {
            properties: {
              title: sheetName,
              gridProperties: {
                rowCount: 1000,
                columnCount: 26,
              },
            },
          },
        }],
      },
    });

    // Set headers
    await this.sheets.spreadsheets.values.update({
      spreadsheetId: this.spreadsheetId,
      range: `${sheetName}!A1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [headers] },
    });

    // Format headers
    await this.sheets.spreadsheets.batchUpdate({
      spreadsheetId: this.spreadsheetId,
      requestBody: {
        requests: [{
          repeatCell: {
            range: {
              sheetId: 0,
              startRowIndex: 0,
              endRowIndex: 1,
            },
            cell: {
              userEnteredFormat: {
                backgroundColor: { red: 0.8, green: 0.8, blue: 0.8 },
                textFormat: { bold: true },
              },
            },
            fields: 'userEnteredFormat(backgroundColor,textFormat)',
          },
        }],
      },
    });
  }
}