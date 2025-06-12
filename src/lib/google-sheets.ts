import { google } from 'googleapis';
import { sheets_v4 } from 'googleapis';
import type { Patient, Consultation, Prescription, InventoryItem, Staff, Transaction, Supplier } from '../types/sheets';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID;

export class GoogleSheetsService {
  private auth: any;
  private sheets: sheets_v4.Sheets;
  private spreadsheetId: string;

  constructor(spreadsheetId: string) {
    this.spreadsheetId = spreadsheetId;
    this.auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: SCOPES,
    });
    this.sheets = google.sheets({ version: 'v4', auth: this.auth });
  }

  /**
   * Authenticate with Google Sheets API
   */
  async authenticate(): Promise<void> {
    try {
      await this.auth.authorize();
    } catch (error) {
      console.error('Authentication failed:', error);
      throw new Error('Failed to authenticate with Google Sheets API');
    }
  }

  /**
   * Get values from a specific range in the spreadsheet
   */
  async getRange(range: string): Promise<any[][]> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range,
      });
      return response.data.values || [];
    } catch (error) {
      console.error('Error getting range:', error);
      throw new Error('Failed to get range from Google Sheets');
    }
  }

  /**
   * Append a row to the specified range
   */
  async appendRow(range: string, values: any[]): Promise<void> {
    try {
      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [values],
        },
      });
    } catch (error) {
      console.error('Error appending row:', error);
      throw new Error('Failed to append row to Google Sheets');
    }
  }

  /**
   * Update a specific row in the spreadsheet
   */
  async updateRow(range: string, values: any[]): Promise<void> {
    try {
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [values],
        },
      });
    } catch (error) {
      console.error('Error updating row:', error);
      throw new Error('Failed to update row in Google Sheets');
    }
  }

  /**
   * Perform batch updates on the spreadsheet
   */
  async batchUpdate(requests: sheets_v4.Schema$Request[]): Promise<void> {
    try {
      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.spreadsheetId,
        requestBody: {
          requests,
        },
      });
    } catch (error) {
      console.error('Error performing batch update:', error);
      throw new Error('Failed to perform batch update on Google Sheets');
    }
  }

  // Type-specific methods
  async getPatients(): Promise<Patient[]> {
    const rows = await this.getRange('Patients!A2:L');
    return rows.map(row => ({
      id: row[0],
      name: row[1],
      age: Number(row[2]),
      gender: row[3] as 'Male' | 'Female' | 'Other',
      phone: row[4],
      email: row[5],
      address: row[6],
      medicalHistory: row[7],
      allergies: row[8],
      emergencyContact: row[9],
      createdAt: new Date(row[10]),
      updatedAt: new Date(row[11])
    }));
  }

  async getConsultations(): Promise<Consultation[]> {
    const rows = await this.getRange('Consultations!A2:L');
    return rows.map(row => ({
      id: row[0],
      patientId: row[1],
      doctorId: row[2],
      date: new Date(row[3]),
      symptoms: row[4],
      diagnosis: row[5],
      pulseReading: row[6],
      treatment: row[7],
      followUpDate: row[8] ? new Date(row[8]) : undefined,
      fees: Number(row[9]),
      status: row[10] as 'Completed' | 'Pending' | 'Follow-up',
      createdAt: new Date(row[11])
    }));
  }

  async getPrescriptions(): Promise<Prescription[]> {
    const rows = await this.getRange('Prescriptions!A2:F');
    return rows.map(row => ({
      id: row[0],
      consultationId: row[1],
      medicines: JSON.parse(row[2]),
      totalCost: Number(row[3]),
      status: row[4] as 'Prescribed' | 'Dispensed' | 'Partial',
      createdAt: new Date(row[5])
    }));
  }

  async getInventoryItems(): Promise<InventoryItem[]> {
    const rows = await this.getRange('Inventory!A2:M');
    return rows.map(row => ({
      id: row[0],
      name: row[1],
      category: row[2] as 'Herb' | 'Oil' | 'Powder' | 'Tablet' | 'Liquid',
      stock: Number(row[3]),
      unit: row[4],
      costPrice: Number(row[5]),
      sellingPrice: Number(row[6]),
      supplierId: row[7],
      expiryDate: new Date(row[8]),
      reorderLevel: Number(row[9]),
      batchNumber: row[10],
      createdAt: new Date(row[11]),
      updatedAt: new Date(row[12])
    }));
  }

  async getStaff(): Promise<Staff[]> {
    const rows = await this.getRange('Staff!A2:J');
    return rows.map(row => ({
      id: row[0],
      name: row[1],
      role: row[2] as 'admin' | 'doctor' | 'pharmacist' | 'cash_manager' | 'stock_manager',
      email: row[3],
      phone: row[4],
      salary: Number(row[5]),
      joinDate: new Date(row[6]),
      status: row[7] as 'Active' | 'Inactive',
      permissions: JSON.parse(row[8]),
      createdAt: new Date(row[9])
    }));
  }

  async getTransactions(): Promise<Transaction[]> {
    const rows = await this.getRange('Transactions!A2:K');
    return rows.map(row => ({
      id: row[0],
      type: row[1] as 'Income' | 'Expense',
      category: row[2],
      amount: Number(row[3]),
      description: row[4],
      paymentMethod: row[5] as 'Cash' | 'UPI' | 'Card' | 'Bank Transfer',
      patientId: row[6] || undefined,
      staffId: row[7] || undefined,
      date: new Date(row[8]),
      createdBy: row[9],
      createdAt: new Date(row[10])
    }));
  }

  async getSuppliers(): Promise<Supplier[]> {
    const rows = await this.getRange('Suppliers!A2:G');
    return rows.map(row => ({
      id: row[0],
      name: row[1],
      contact: row[2],
      phone: row[3],
      email: row[4],
      address: row[5],
      speciality: row[6]
    }));
  }
}

const sheetsService = new GoogleSheetsService(process.env.GOOGLE_SHEETS_ID!);

export default sheetsService;