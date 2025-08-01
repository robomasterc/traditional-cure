export const SHEET_NAMES = {
  PATIENTS: 'Patients',
  CONSULTATIONS: 'Consultations',
  PRESCRIPTIONS: 'Prescriptions',
  INVENTORY: 'Inventory',
  STAFF: 'Staff',
  TRANSACTIONS: 'Transactions',
  SUPPLIERS: 'Suppliers',
  ORDERS: 'Orders'
} as const;

export const SHEET_COLUMNS = {
  [SHEET_NAMES.PATIENTS]: [
    'ID',
    'Name',
    'Age',
    'Gender',
    'Phone',
    'Email',
    'District',
    'State',
    'Occupation',
    'Allergies',
    'EmergencyContact',
    'Created At',
    'Updated At'
  ],
  [SHEET_NAMES.CONSULTATIONS]: [
    'ID',
    'Patient ID',
    'Doctor ID',
    'Date',
    'Symptoms',
    'Diagnosis',
    'Pulse Reading',
    'Treatment',
    'Follow Up Date',
    'Fees',
    'Status',
    'Created At'
  ],
  [SHEET_NAMES.PRESCRIPTIONS]: [
    'ID',
    'Consultation ID',
    'Medicines',
    'Total Cost',
    'Status',
    'Created At'
  ],
  [SHEET_NAMES.INVENTORY]: [
    'ID',
    'Name',
    'Category',
    'Stock',
    'Unit',
    'Cost Price',
    'Selling Price',
    'Supplier ID',
    'Expiry Date',
    'Reorder Level',
    'Batch Number',
    'Created At',
    'Updated At'
  ],
  [SHEET_NAMES.STAFF]: [
    'ID',
    'Name',
    'Role',
    'Email',
    'Phone',
    'Salary',
    'Join Date',
    'Status',
    'Permissions',
    'Created At'
  ],
  [SHEET_NAMES.TRANSACTIONS]: [
    'ID',
    'Type',
    'Category',
    'Cash',
    'UPI',
    'Description',
    'Patient ID',
    'Staff ID',
    'Date',
    'Created By',
    'Created At'
  ],
  [SHEET_NAMES.SUPPLIERS]: [
    'ID',
    'Name',
    'Contact',
    'Phone',
    'Email',
    'Address',
    'Speciality'
  ],
  [SHEET_NAMES.ORDERS]: [
    'ID',
    'PONumber',
    'SupplierID', 
    'OrderDate',
    'ItemID',
    'ItemName',
    'Quantity',
    'UnitPrice',
    'Total',
    'Notes',
    'CreatedBy',
    'CreatedAt'
  ],
  
} as const;

export const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID || ''; 