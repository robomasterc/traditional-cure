import { google } from 'googleapis';
import { sheets_v4 } from 'googleapis';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { UserRole } from '../types/auth';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID;
const ROLES_SHEET_NAME = process.env.GOOGLE_SHEETS_ROLES_SHEET_NAME;

interface UserRoleData {
  email: string;
  roles: UserRole[];
}

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

  async getUserRoles(email: string): Promise<UserRole[]> {
    console.log('=== Google Sheets Integration ===');
    console.log('Environment:', {
      hasServiceAccountEmail: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      hasPrivateKey: !!process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
      hasSheetsId: !!SPREADSHEET_ID,
    });

    try {
      console.log('🔍 Fetching roles for email:', email);
      console.log('ROLES_SHEET_NAME', ROLES_SHEET_NAME);
      console.log('SPREADSHEET_ID', SPREADSHEET_ID);
      
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${ROLES_SHEET_NAME}!A:B`,
      });

      console.log('📊 Sheet response:', {
        hasValues: !!response.data.values,
        rowCount: response.data.values?.length || 0,
      });

      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        console.error('❌ No data found in Google Sheet');
        return [];
      }
      // Find the row matching the email
      const userRow = rows.slice(1).find((row: any[]) => row[0]?.toLowerCase() === email.toLowerCase());
      
      if (!userRow) {
        console.error('❌ No roles found for email:', email);
        return [];
      }

      // Get roles from the second column
      const roles = userRow[1]?.split(',').map((role: string) => role.trim()) || [];

      // Validate roles
      const validRoles = roles.filter((role: string): role is UserRole => 
        VALID_ROLES.includes(role as UserRole)
      );

      console.log('✅ Valid roles:', validRoles);

      if (validRoles.length === 0) {
        console.error('❌ No valid roles found for email:', email);
        return [];
      }

      return validRoles;
    } catch (error) {
      console.error('❌ Error fetching roles from Google Sheets:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack,
        });
      }
      return [];
    }
  }
}

const VALID_ROLES: UserRole[] = ['admin', 'doctor', 'pharmacist', 'cash_manager', 'stock_manager'];

const sheetsService = new GoogleSheetsService(process.env.GOOGLE_SHEETS_ID!);

export const getUserRoles = (email: string) => sheetsService.getUserRoles(email);