export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  email?: string;
  address: string;
  medicalHistory: string;
  allergies: string;
  emergencyContact: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Consultation {
  id: string;
  patientId: string;
  doctorId: string;
  date: Date;
  symptoms: string;
  diagnosis: string;
  pulseReading: string;
  treatment: string;
  followUpDate?: Date;
  fees: number;
  status: 'Completed' | 'Pending' | 'Follow-up';
  createdAt: Date;
}

export interface Prescription {
  id: string;
  consultationId: string;
  medicines: Array<{
    medicineId: string;
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }>;
  totalCost: number;
  status: 'Prescribed' | 'Dispensed' | 'Partial';
  createdAt: Date;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Herb' | 'Oil' | 'Powder' | 'Tablet' | 'Liquid';
  stock: number;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  supplierId: string;
  expiryDate: Date;
  reorderLevel: number;
  batchNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Staff {
  id: string;
  name: string;
  role: 'admin' | 'doctor' | 'pharmacist' | 'cash_manager' | 'stock_manager';
  email: string;
  phone: string;
  salary: number;
  joinDate: Date;
  status: 'Active' | 'Inactive';
  permissions: string[];
  createdAt: Date;
}

export interface Transaction {
  id: string;
  type: 'Income' | 'Expense';
  category: string;
  amount: number;
  description: string;
  paymentMethod: 'Cash' | 'UPI' | 'Card' | 'Bank Transfer';
  patientId?: string;
  staffId?: string;
  date: Date;
  createdBy: string;
  createdAt: Date;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
  address: string;
  speciality: string;
}

export const suppliersData: Supplier[] = [
  {
    id: "SUP001",
    name: "Himalaya Herbal Suppliers",
    contact: "Rajesh Gupta",
    phone: "+91-9876501234",
    email: "rajesh@himalayaherbs.com",
    address: "Industrial Area, Haridwar, Uttarakhand",
    speciality: "Churnas and Powders"  
  }
]; 