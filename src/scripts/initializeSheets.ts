import dotenv from 'dotenv';
dotenv.config();

import { google } from 'googleapis';
import { SHEET_NAMES, SHEET_COLUMNS, SPREADSHEET_ID } from '../config/sheets';
import { suppliersData } from '../types/sheets';
import type { Patient, Consultation, Prescription, InventoryItem, Staff, Transaction, Supplier } from '../types/sheets';

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

const generateId = (prefix: string) => {
  const id = `${prefix}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
  console.log(`Generated ID for ${prefix}:`, id);
  return id;
};

const randomDate = (start: Date, end: Date) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

const generatePatients = (count: number): Patient[] => {
  const patients: Patient[] = [];
  const names = ['Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Sneha Gupta', 'Vikram Singh', 'Anjali Verma', 'Rahul Mehta', 'Pooja Shah', 'Deepak Joshi', 'Meera Kapoor'];
  const addresses = ['123 Main Street, Mumbai', '456 Park Avenue, Delhi', '789 Lake View, Bangalore', '321 Garden Road, Chennai', '654 Hill Street, Kolkata'];

  for (let i = 0; i < count; i++) {
    const createdAt = randomDate(new Date('2023-01-01'), new Date());
    const patientId = generateId('PAT');
    console.log(`Creating patient with ID:`, patientId);
    patients.push({
      id: patientId,
      name: names[i % names.length],
      age: Math.floor(Math.random() * 50) + 20,
      gender: ['Male', 'Female', 'Other'][Math.floor(Math.random() * 3)] as 'Male' | 'Female' | 'Other',
      phone: `+91-${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      email: `patient${i + 1}@example.com`,
      address: addresses[i % addresses.length],
      medicalHistory: 'Hypertension, Diabetes Type 2',
      allergies: 'Penicillin, Shellfish',
      emergencyContact: `+91-${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      createdAt,
      updatedAt: createdAt
    });
  }
  return patients;
};

const generateStaff = (count: number): Staff[] => {
  const staff: Staff[] = [];
  const names = ['Dr. Ravi Sharma', 'Dr. Anita Patel', 'Dr. Sunil Verma', 'Dr. Meena Kapoor', 'Dr. Rajiv Gupta', 'Dr. Priya Singh', 'Dr. Amit Kumar', 'Dr. Neha Joshi'];
  const roles = ['doctor', 'pharmacist', 'cash_manager', 'stock_manager'] as const;

  for (let i = 0; i < count; i++) {
    const joinDate = randomDate(new Date('2022-01-01'), new Date());
    staff.push({
      id: generateId('STAFF'),
      name: names[i % names.length],
      role: roles[i % roles.length],
      email: `staff${i + 1}@agastya.com`,
      phone: `+91-${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      salary: Math.floor(Math.random() * 50000) + 50000,
      joinDate,
      status: 'Active',
      permissions: ['read', 'write'],
      createdAt: joinDate
    });
  }
  return staff;
};

const generateInventoryItems = (count: number): InventoryItem[] => {
  const items: InventoryItem[] = [];
  const categories = ['Herb', 'Oil', 'Powder', 'Tablet', 'Liquid'] as const;
  const names = ['Ashwagandha', 'Brahmi', 'Tulsi', 'Neem', 'Amla', 'Sesame Oil', 'Coconut Oil', 'Mustard Oil', 'Castor Oil', 'Triphala Powder', 'Ginger Powder', 'Turmeric Powder', 'Guduchi Tablets', 'Shilajit Tablets', 'Amalaki Tablets', 'Arjuna Ksheerpak', 'Dashamoola Kashayam', 'Bala Tailam'];

  for (let i = 0; i < count; i++) {
    const createdAt = randomDate(new Date('2023-01-01'), new Date());
    const expiryDate = new Date(createdAt);
    expiryDate.setFullYear(expiryDate.getFullYear() + 2);

    items.push({
      id: generateId('INV'),
      name: names[i % names.length],
      category: categories[i % categories.length],
      stock: Math.floor(Math.random() * 100) + 10,
      unit: ['kg', 'g', 'ml', 'pcs'][Math.floor(Math.random() * 4)],
      costPrice: Math.floor(Math.random() * 500) + 100,
      sellingPrice: Math.floor(Math.random() * 1000) + 200,
      supplierId: suppliersData[0].id,
      expiryDate,
      reorderLevel: 20,
      batchNumber: `B${Math.floor(Math.random() * 1000)}`,
      createdAt,
      updatedAt: createdAt
    });
  }
  return items;
};

const generateConsultations = (patients: Patient[], staff: Staff[], count: number): Consultation[] => {
  const consultations: Consultation[] = [];
  const statuses = ['Completed', 'Pending', 'Follow-up'] as const;

  for (let i = 0; i < count; i++) {
    const createdAt = randomDate(new Date('2023-01-01'), new Date());
    consultations.push({
      id: generateId('CONS'),
      patientId: patients[i % patients.length].id,
      doctorId: staff.find(s => s.role === 'doctor')?.id || staff[0].id,
      date: createdAt,
      symptoms: 'Fever, Cough, Headache',
      diagnosis: 'Common Cold',
      pulseReading: '72 bpm',
      treatment: 'Rest, Hydration, Ayurvedic medicines',
      followUpDate: new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000),
      fees: Math.floor(Math.random() * 1000) + 500,
      status: statuses[i % statuses.length],
      createdAt
    });
  }
  return consultations;
};

const generatePrescriptions = (consultations: Consultation[], inventoryItems: InventoryItem[], count: number): Prescription[] => {
  const prescriptions: Prescription[] = [];
  const statuses = ['Prescribed', 'Dispensed', 'Partial'] as const;

  for (let i = 0; i < count; i++) {
    const createdAt = randomDate(new Date('2023-01-01'), new Date());
    const item = inventoryItems[i % inventoryItems.length];

    prescriptions.push({
      id: generateId('PRES'),
      consultationId: consultations[i % consultations.length].id,
      medicines: [{
        medicineId: item.id,
        name: item.name,
        dosage: '1 tablet',
        frequency: 'Twice daily',
        duration: '7 days',
        instructions: 'Take after meals'
      }],
      totalCost: Math.floor(Math.random() * 2000) + 500,
      status: statuses[i % statuses.length],
      createdAt
    });
  }
  return prescriptions;
};

const generateTransactions = (patients: Patient[], staff: Staff[], count: number): Transaction[] => {
  const transactions: Transaction[] = [];
  const types = ['Income', 'Expense'] as const;
  const categories = ['Consultation', 'Medicine', 'Salary', 'Utilities', 'Rent'] as const;

  for (let i = 0; i < count; i++) {
    const createdAt = randomDate(new Date('2023-01-01'), new Date());
    const type = types[i % types.length];
    const totalAmount = type === 'Income' ? Math.floor(Math.random() * 5000) + 1000 : Math.floor(Math.random() * 3000) + 500;
    const cashAmount = Math.floor(totalAmount * 0.7); // 70% cash
    const upiAmount = totalAmount - cashAmount; // 30% UPI

    transactions.push({
      id: generateId('TRX'),
      type,
      category: categories[i % categories.length],
      cash: cashAmount,
      upi: upiAmount,
      description: `${type} for ${categories[i % categories.length]}`,
      patientId: type === 'Income' ? patients[i % patients.length].id : undefined,
      staffId: type === 'Expense' ? staff[i % staff.length].id : undefined,
      date: createdAt,
      createdBy: staff.find(s => s.role === 'cash_manager')?.id || staff[0].id,
      createdAt
    });
  }
  return transactions;
};

async function initializeSheets() {
  try {
    const response = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
    const existingSheets = response.data.sheets?.map(sheet => sheet.properties?.title) || [];
    const newSheets = Object.values(SHEET_NAMES).filter(name => !existingSheets.includes(name));

    if (newSheets.length > 0) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: newSheets.map(sheetName => ({
            addSheet: { properties: { title: sheetName } },
          })),
        },
      });
    }

    const patients = generatePatients(10);
    const staff = generateStaff(8);
    const inventoryItems = generateInventoryItems(20);
    const consultations = generateConsultations(patients, staff, 15);
    const prescriptions = generatePrescriptions(consultations, inventoryItems, 15);
    const transactions = generateTransactions(patients, staff, 30);

    const requests = [
      { name: SHEET_NAMES.PATIENTS, data: patients },
      { name: SHEET_NAMES.STAFF, data: staff },
      { name: SHEET_NAMES.INVENTORY, data: inventoryItems },
      { name: SHEET_NAMES.CONSULTATIONS, data: consultations },
      { name: SHEET_NAMES.PRESCRIPTIONS, data: prescriptions },
      { name: SHEET_NAMES.TRANSACTIONS, data: transactions },
      { name: SHEET_NAMES.SUPPLIERS, data: suppliersData },
    ];

    for (const { name, data } of requests) {
      const columns = SHEET_COLUMNS[name as keyof typeof SHEET_COLUMNS];
      console.log(`\nProcessing sheet: ${name}`);
      console.log('Columns:', columns);
      
      const values = [
        columns,
        ...data.map((item: Patient | Staff | InventoryItem | Consultation | Prescription | Transaction | Supplier) => {
          const row = columns.map((col: string) => {
            if (col === 'ID') {
              return item.id;
            }
            const key = col.replace(/\s+/g, '').charAt(0).toLowerCase() + col.replace(/\s+/g, '').slice(1) as keyof typeof item;
            const value = item[key];
            if (Array.isArray(value)) {
              return value.join(', ');
            }
            return value && typeof value === 'object' && 'toISOString' in value ? (value as Date).toISOString() : value;
          });
          console.log(`Row data for ${name}:`, row);
          return row;
        })
      ];

      console.log(`\nWriting to ${name}:`, values[1]);

      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${name}!A1`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: values as string[][] },
      });
    }

    console.log('Sheets initialized successfully!');
  } catch (error) {
    console.error('Error initializing sheets:', error);
    throw error;
  }
}

initializeSheets().catch(console.error);
