// Financial Module Schemas
export const financialSchema = {
  transactions: {
    id: 'string',
    type: 'enum', // 'INCOME' | 'EXPENSE'
    amount: 'number',
    description: 'string',
    date: 'date',
    paymentMethod: 'enum', // 'CASH' | 'CARD' | 'UPI'
    referenceNumber: 'string?',
    patientId: 'string?',
    category: 'string',
    status: 'enum', // 'PENDING' | 'COMPLETED' | 'FAILED'
    createdAt: 'date',
    updatedAt: 'date'
  },
  
  invoices: {
    id: 'string',
    patientId: 'string',
    amount: 'number',
    items: 'json', // Array of billed items
    status: 'enum', // 'DRAFT' | 'ISSUED' | 'PAID' | 'CANCELLED'
    dueDate: 'date',
    paidDate: 'date?',
    paymentMethod: 'enum?', // 'CASH' | 'CARD' | 'UPI'
    notes: 'string?',
    createdAt: 'date',
    updatedAt: 'date'
  },
  
  expenses: {
    id: 'string',
    category: 'string',
    amount: 'number',
    description: 'string',
    date: 'date',
    paymentMethod: 'enum', // 'CASH' | 'CARD' | 'UPI'
    receiptNumber: 'string?',
    status: 'enum', // 'PENDING' | 'APPROVED' | 'PAID'
    approvedBy: 'string?',
    createdAt: 'date',
    updatedAt: 'date'
  },
  
  dailyCashReceipts: {
    id: 'string',
    date: 'date',
    openingBalance: 'number',
    closingBalance: 'number',
    totalIncome: 'number',
    totalExpenses: 'number',
    cashTransactions: 'json', // Array of cash transactions
    reconciledBy: 'string?',
    notes: 'string?',
    createdAt: 'date',
    updatedAt: 'date'
  }
}; 