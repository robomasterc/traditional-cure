import { z } from 'zod';

// Base schemas
export const baseSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Patient schemas
export const patientSchema = baseSchema.extend({
  name: z.string().min(1),
  age: z.number().min(0).max(120),
  gender: z.enum(['male', 'female', 'other']),
  phone: z.string().regex(/^\+?[\d\s-]{10,}$/),
  address: z.string().optional(),
  medicalHistory: z.string().optional(),
  allergies: z.string().optional(),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
});

export type Patient = z.infer<typeof patientSchema>;

// Consultation schemas
export const consultationSchema = baseSchema.extend({
  patientId: z.string(),
  doctorId: z.string(),
  date: z.string(),
  symptoms: z.string(),
  diagnosis: z.string(),
  notes: z.string().optional(),
  followUpDate: z.string().optional(),
  status: z.enum(['scheduled', 'completed', 'cancelled']),
});

export type Consultation = z.infer<typeof consultationSchema>;

// Prescription schemas
export const prescriptionSchema = baseSchema.extend({
  consultationId: z.string(),
  patientId: z.string(),
  doctorId: z.string(),
  medications: z.array(z.object({
    name: z.string(),
    dosage: z.string(),
    frequency: z.string(),
    duration: z.string(),
    notes: z.string().optional(),
  })),
  status: z.enum(['active', 'completed', 'cancelled']),
  validUntil: z.string(),
});

export type Prescription = z.infer<typeof prescriptionSchema>;

// Inventory schemas
export const inventorySchema = baseSchema.extend({
  name: z.string(),
  category: z.string(),
  quantity: z.number().min(0),
  unit: z.string(),
  price: z.number().min(0),
  supplier: z.string(),
  expiryDate: z.string().optional(),
  minimumStock: z.number().min(0),
  location: z.string().optional(),
  batchNumber: z.string().optional(),
});

export type Inventory = z.infer<typeof inventorySchema>;

// Staff schemas
export const staffSchema = baseSchema.extend({
  name: z.string(),
  role: z.enum(['admin', 'doctor', 'pharmacist', 'cash_manager', 'stock_manager']),
  email: z.string().email(),
  phone: z.string().regex(/^\+?[\d\s-]{10,}$/),
  specialization: z.string().optional(),
  licenseNumber: z.string().optional(),
  status: z.enum(['active', 'inactive']),
  joiningDate: z.string(),
});

export type Staff = z.infer<typeof staffSchema>;

// Transaction schemas
export const transactionSchema = baseSchema.extend({
  type: z.enum(['consultation', 'prescription', 'inventory']),
  amount: z.number(),
  paymentMethod: z.enum(['cash', 'card', 'upi']),
  status: z.enum(['pending', 'completed', 'failed', 'refunded']),
  referenceId: z.string(),
  description: z.string(),
  patientId: z.string().optional(),
  staffId: z.string(),
});

export type Transaction = z.infer<typeof transactionSchema>;

// Sheet names
export const SHEET_NAMES = {
  PATIENTS: 'Patients',
  CONSULTATIONS: 'Consultations',
  PRESCRIPTIONS: 'Prescriptions',
  INVENTORY: 'Inventory',
  STAFF: 'Staff',
  TRANSACTIONS: 'Transactions',
} as const; 