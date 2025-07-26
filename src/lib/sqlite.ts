import Database from 'better-sqlite3';
import * as bcrypt from 'bcrypt';
import type { Patient, Consultation, Prescription, InventoryItem, Staff, Transaction, Supplier } from '../types/sheets';
import { UserRole } from '@/types/auth';

const DB_PATH = process.env.SQLITE_DB_PATH || './atc.db';

export class SQLiteService {
  private db: Database.Database;

  constructor() {
    this.db = new Database(DB_PATH);
    this.db.pragma('journal_mode = WAL');
    this.init();
  }

  private init() {
    this.createTables();
    this.createIndexes();
  }

  private createTables() {
    // Users table for authentication
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        roles TEXT NOT NULL, -- JSON array of roles
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Patients table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS patients (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        age INTEGER NOT NULL,
        gender TEXT CHECK(gender IN ('Male', 'Female', 'Other')) NOT NULL,
        phone TEXT NOT NULL,
        email TEXT,
        district TEXT NOT NULL,
        state TEXT NOT NULL,
        occupation TEXT NOT NULL,
        allergies TEXT,
        emergency_contact TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Consultations table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS consultations (
        id TEXT PRIMARY KEY,
        patient_id TEXT NOT NULL,
        doctor_id TEXT NOT NULL,
        date DATETIME NOT NULL,
        symptoms TEXT NOT NULL,
        diagnosis TEXT NOT NULL,
        pulse_reading TEXT NOT NULL,
        treatment TEXT NOT NULL,
        follow_up_date DATETIME,
        fees REAL NOT NULL,
        status TEXT CHECK(status IN ('Completed', 'Pending', 'Follow-up')) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id)
      );
    `);

    // Prescriptions table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS prescriptions (
        id TEXT PRIMARY KEY,
        consultation_id TEXT NOT NULL,
        medicines TEXT NOT NULL, -- JSON array
        total_cost REAL NOT NULL,
        status TEXT CHECK(status IN ('Prescribed', 'Dispensed', 'Partial')) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (consultation_id) REFERENCES consultations(id)
      );
    `);

    // Inventory table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS inventory (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT CHECK(category IN ('Herb', 'Oil', 'Powder', 'Tablet', 'Liquid')) NOT NULL,
        stock INTEGER NOT NULL,
        unit TEXT NOT NULL,
        cost_price REAL NOT NULL,
        selling_price REAL NOT NULL,
        supplier_id TEXT NOT NULL,
        expiry_date DATE NOT NULL,
        reorder_level INTEGER NOT NULL,
        batch_number TEXT NOT NULL,
        description TEXT DEFAULT '',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
      );
    `);

    // Staff table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS staff (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        role TEXT CHECK(role IN ('admin', 'doctor', 'pharmacist', 'cash_manager', 'case_manager', 'stock_manager')) NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT NOT NULL,
        salary REAL NOT NULL,
        join_date DATE NOT NULL,
        status TEXT CHECK(status IN ('Active', 'Inactive')) NOT NULL,
        permissions TEXT NOT NULL, -- JSON array
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Transactions table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        type TEXT CHECK(type IN ('Income', 'Expense')) NOT NULL,
        category TEXT NOT NULL,
        cash REAL NOT NULL DEFAULT 0,
        upi REAL NOT NULL DEFAULT 0,
        description TEXT NOT NULL,
        patient_id TEXT,
        staff_id TEXT,
        date DATE NOT NULL,
        created_by TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id),
        FOREIGN KEY (staff_id) REFERENCES staff(id)
      );
    `);

    // Suppliers table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS suppliers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        contact TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT NOT NULL,
        address TEXT NOT NULL,
        speciality TEXT NOT NULL
      );
    `);

    // Orders table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        po_number TEXT NOT NULL,
        supplier_id TEXT NOT NULL,
        order_date DATE NOT NULL,
        item_id TEXT NOT NULL,
        item_name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price REAL NOT NULL,
        total REAL NOT NULL,
        notes TEXT,
        created_by TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
        FOREIGN KEY (item_id) REFERENCES inventory(id)
      );
    `);
  }

  private createIndexes() {
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(name);
      CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone);
      CREATE INDEX IF NOT EXISTS idx_consultations_patient_id ON consultations(patient_id);
      CREATE INDEX IF NOT EXISTS idx_consultations_date ON consultations(date);
      CREATE INDEX IF NOT EXISTS idx_prescriptions_consultation_id ON prescriptions(consultation_id);
      CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory(category);
      CREATE INDEX IF NOT EXISTS idx_inventory_stock ON inventory(stock);
      CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
      CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
      CREATE INDEX IF NOT EXISTS idx_orders_supplier_id ON orders(supplier_id);
      CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(order_date);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);
  }

  // Authentication methods
  async createUser(email: string, password: string, name: string, roles: UserRole[]): Promise<void> {
    const id = crypto.randomUUID();
    const passwordHash = await bcrypt.hash(password, 12);
    const rolesJson = JSON.stringify(roles);

    const stmt = this.db.prepare(`
      INSERT INTO users (id, email, password_hash, name, roles)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    stmt.run(id, email, passwordHash, name, rolesJson);
  }

  async authenticateUser(email: string, password: string): Promise<{ id: string; name: string; roles: UserRole[] } | null> {
    const stmt = this.db.prepare('SELECT * FROM users WHERE email = ?');
    const user = stmt.get(email) as any;
    
    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) return null;

    return {
      id: user.id,
      name: user.name,
      roles: JSON.parse(user.roles)
    };
  }

  async getUserRoles(email: string): Promise<UserRole[]> {
    const stmt = this.db.prepare('SELECT roles FROM users WHERE email = ?');
    const user = stmt.get(email) as { roles: string } | undefined;
    
    if (!user) return [];
    
    return JSON.parse(user.roles);
  }

  // Data access methods
  async getPatients(): Promise<Patient[]> {
    const stmt = this.db.prepare('SELECT * FROM patients ORDER BY created_at DESC');
    const rows = stmt.all() as any[];
    
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      age: row.age,
      gender: row.gender,
      phone: row.phone,
      email: row.email,
      district: row.district,
      state: row.state,
      occupation: row.occupation,
      allergies: row.allergies,
      emergencyContact: row.emergency_contact,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    }));
  }

  async getConsultations(): Promise<Consultation[]> {
    const stmt = this.db.prepare('SELECT * FROM consultations ORDER BY date DESC');
    const rows = stmt.all() as any[];
    
    return rows.map(row => ({
      id: row.id,
      patientId: row.patient_id,
      doctorId: row.doctor_id,
      date: new Date(row.date),
      symptoms: row.symptoms,
      diagnosis: row.diagnosis,
      pulseReading: row.pulse_reading,
      treatment: row.treatment,
      followUpDate: row.follow_up_date ? new Date(row.follow_up_date) : undefined,
      fees: row.fees,
      status: row.status,
      createdAt: new Date(row.created_at)
    }));
  }

  async getPrescriptions(): Promise<Prescription[]> {
    const stmt = this.db.prepare('SELECT * FROM prescriptions ORDER BY created_at DESC');
    const rows = stmt.all() as any[];
    
    return rows.map(row => ({
      id: row.id,
      consultationId: row.consultation_id,
      medicines: JSON.parse(row.medicines),
      totalCost: row.total_cost,
      status: row.status,
      createdAt: new Date(row.created_at)
    }));
  }

  async getInventoryItems(): Promise<InventoryItem[]> {
    const stmt = this.db.prepare('SELECT * FROM inventory ORDER BY name');
    const rows = stmt.all() as any[];
    
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      category: row.category,
      stock: row.stock,
      unit: row.unit,
      costPrice: row.cost_price,
      sellingPrice: row.selling_price,
      supplierId: row.supplier_id,
      expiryDate: new Date(row.expiry_date),
      reorderLevel: row.reorder_level,
      batchNumber: row.batch_number,
      description: row.description,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    }));
  }

  async getInventory(): Promise<InventoryItem[]> {
    return this.getInventoryItems();
  }

  async getStaff(): Promise<Staff[]> {
    const stmt = this.db.prepare('SELECT * FROM staff ORDER BY name');
    const rows = stmt.all() as any[];
    
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      role: row.role,
      email: row.email,
      phone: row.phone,
      salary: row.salary,
      joinDate: new Date(row.join_date),
      status: row.status,
      permissions: JSON.parse(row.permissions),
      createdAt: new Date(row.created_at)
    }));
  }

  async getTransactions(): Promise<Transaction[]> {
    const stmt = this.db.prepare('SELECT * FROM transactions ORDER BY date DESC');
    const rows = stmt.all() as any[];
    
    return rows.map(row => ({
      id: row.id,
      type: row.type,
      category: row.category,
      cash: row.cash,
      upi: row.upi,
      description: row.description,
      patientId: row.patient_id,
      staffId: row.staff_id,
      date: new Date(row.date),
      createdBy: row.created_by,
      createdAt: new Date(row.created_at)
    }));
  }

  async getSuppliers(): Promise<Supplier[]> {
    const stmt = this.db.prepare('SELECT * FROM suppliers ORDER BY name');
    const rows = stmt.all() as any[];
    
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      contact: row.contact,
      phone: row.phone,
      email: row.email,
      address: row.address,
      speciality: row.speciality
    }));
  }

  async getStockAdjustments(startDate?: string, endDate?: string): Promise<unknown[]> {
    let query = `
      SELECT * FROM orders 
      WHERE supplier_id = 'ADJUSTMENT'
    `;
    const params: any[] = [];
    
    if (startDate && endDate) {
      query += ' AND order_date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    } else if (startDate) {
      query += ' AND order_date >= ?';
      params.push(startDate);
    } else if (endDate) {
      query += ' AND order_date <= ?';
      params.push(endDate);
    }
    
    query += ' ORDER BY order_date DESC';
    
    const stmt = this.db.prepare(query);
    const rows = stmt.all(...params) as any[];
    
    return rows.map(row => ({
      id: row.id,
      itemId: row.item_id,
      itemName: row.item_name,
      quantity: row.quantity,
      unitPrice: row.unit_price,
      total: row.total,
      adjustment: row.id.startsWith('ADJ') ? -row.quantity : row.quantity,
      reason: row.notes?.split(':')[0] || 'Adjustment',
      date: row.order_date,
      adjustedBy: row.created_by,
      notes: row.notes?.split(':')[1]?.trim() || '',
      createdAt: row.created_at,
    }));
  }

  // Write methods
  async appendRow(table: string, data: Record<string, any>): Promise<void> {
    const columns = Object.keys(data);
    const placeholders = columns.map(() => '?').join(', ');
    const values = Object.values(data);

    const stmt = this.db.prepare(`
      INSERT INTO ${table} (${columns.join(', ')})
      VALUES (${placeholders})
    `);
    
    stmt.run(...values);
  }

  async updateRow(table: string, id: string, data: Record<string, any>): Promise<void> {
    const columns = Object.keys(data);
    const setClause = columns.map(col => `${col} = ?`).join(', ');
    const values = [...Object.values(data), id];

    const stmt = this.db.prepare(`
      UPDATE ${table} 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    stmt.run(...values);
  }

  close(): void {
    this.db.close();
  }
}

const sqliteService = new SQLiteService();

export default sqliteService;