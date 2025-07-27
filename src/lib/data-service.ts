import type { Patient, Consultation, Prescription, InventoryItem, Staff, Transaction, Supplier } from '../types/sheets';
import { UserRole } from '@/types/auth';
import { getDatabaseConfig } from '@/config/database';
import { GoogleSheetsService } from './google-sheets';
import { SQLiteService } from './sqlite';

export interface DataService {
  // Authentication methods
  authenticate?(): Promise<void>;
  getUserRoles(email: string): Promise<UserRole[]>;
  authenticateUser?(email: string, password: string): Promise<{ id: string; name: string; roles: UserRole[] } | null>;
  createUser?(email: string, password: string, name: string, roles: UserRole[]): Promise<void>;

  // Read methods
  getPatients(): Promise<Patient[]>;
  getConsultations(): Promise<Consultation[]>;
  getPrescriptions(): Promise<Prescription[]>;
  getInventoryItems(): Promise<InventoryItem[]>;
  getInventory(): Promise<InventoryItem[]>;
  getStaff(): Promise<Staff[]>;
  getTransactions(): Promise<Transaction[]>;
  getSuppliers(): Promise<Supplier[]>;
  getStockAdjustments(startDate?: string, endDate?: string): Promise<unknown[]>;

  // Write methods (for abstraction)
  appendRow?(range: string, values: (string | number | boolean)[]): Promise<void>;
  updateRow?(range: string, values: (string | number | boolean)[]): Promise<void>;
  batchUpdate?(requests: unknown[]): Promise<void>;
}

class DataServiceFactory {
  private static instance: DataService;

  static getInstance(): DataService {
    if (!DataServiceFactory.instance) {
      const config = getDatabaseConfig();
      
      if (config.provider === 'sqlite') {
        DataServiceFactory.instance = new SQLiteDataServiceAdapter();
      } else {
        DataServiceFactory.instance = new GoogleSheetsDataServiceAdapter();
      }
    }
    
    return DataServiceFactory.instance;
  }

  static resetInstance(): void {
    DataServiceFactory.instance = null as unknown as DataService;
  }
}

class GoogleSheetsDataServiceAdapter implements DataService {
  private service: GoogleSheetsService;

  constructor() {
    const config = getDatabaseConfig();
    this.service = new GoogleSheetsService(config.googleSheets!.spreadsheetId);
  }

  async authenticate(): Promise<void> {
    return this.service.authenticate();
  }

  async getUserRoles(email: string): Promise<UserRole[]> {
    return this.service.getUserRoles(email);
  }

  async getPatients(): Promise<Patient[]> {
    return this.service.getPatients();
  }

  async getConsultations(): Promise<Consultation[]> {
    return this.service.getConsultations();
  }

  async getPrescriptions(): Promise<Prescription[]> {
    return this.service.getPrescriptions();
  }

  async getInventoryItems(): Promise<InventoryItem[]> {
    return this.service.getInventoryItems();
  }

  async getInventory(): Promise<InventoryItem[]> {
    return this.service.getInventory();
  }

  async getStaff(): Promise<Staff[]> {
    return this.service.getStaff();
  }

  async getTransactions(): Promise<Transaction[]> {
    return this.service.getTransactions();
  }

  async getSuppliers(): Promise<Supplier[]> {
    return this.service.getSuppliers();
  }

  async getStockAdjustments(startDate?: string, endDate?: string): Promise<unknown[]> {
    return this.service.getStockAdjustments(startDate, endDate);
  }

  async appendRow(range: string, values: (string | number | boolean)[]): Promise<void> {
    return this.service.appendRow(range, values);
  }

  async updateRow(range: string, values: (string | number | boolean)[]): Promise<void> {
    return this.service.updateRow(range, values);
  }

  async batchUpdate(requests: unknown[]): Promise<void> {
    return this.service.batchUpdate(requests as never);
  }
}

class SQLiteDataServiceAdapter implements DataService {
  private service: SQLiteService;

  constructor() {
    this.service = new SQLiteService();
  }

  async getUserRoles(email: string): Promise<UserRole[]> {
    return this.service.getUserRoles(email);
  }

  async authenticateUser(email: string, password: string): Promise<{ id: string; name: string; roles: UserRole[] } | null> {
    return this.service.authenticateUser(email, password);
  }

  async createUser(email: string, password: string, name: string, roles: UserRole[]): Promise<void> {
    return this.service.createUser(email, password, name, roles);
  }

  async getPatients(): Promise<Patient[]> {
    return this.service.getPatients();
  }

  async getConsultations(): Promise<Consultation[]> {
    return this.service.getConsultations();
  }

  async getPrescriptions(): Promise<Prescription[]> {
    return this.service.getPrescriptions();
  }

  async getInventoryItems(): Promise<InventoryItem[]> {
    return this.service.getInventoryItems();
  }

  async getInventory(): Promise<InventoryItem[]> {
    return this.service.getInventory();
  }

  async getStaff(): Promise<Staff[]> {
    return this.service.getStaff();
  }

  async getTransactions(): Promise<Transaction[]> {
    return this.service.getTransactions();
  }

  async getSuppliers(): Promise<Supplier[]> {
    return this.service.getSuppliers();
  }

  async getStockAdjustments(startDate?: string, endDate?: string): Promise<unknown[]> {
    return this.service.getStockAdjustments(startDate, endDate);
  }
}

// Convenience function to get the current data service
export const getDataService = (): DataService => {
  return DataServiceFactory.getInstance();
};

// Convenience function to get user roles
export const getUserRoles = (email: string): Promise<UserRole[]> => {
  return getDataService().getUserRoles(email);
};

export default getDataService;