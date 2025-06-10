import { Suspense } from 'react';
import FinancialDashboard from '@/components/financial/FinancialDashboard';
import DailyCashReceipts from '@/components/financial/DailyCashReceipts';
import InvoiceList from '@/components/financial/InvoiceList';
import ExpenseTracker from '@/components/financial/ExpenseTracker';

export default function FinancialPage() {
  return (
    <>
      <h1 className="text-3xl font-bold text-gray-700 mb-8">Financial Management</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<div>Loading dashboard...</div>}>
          <FinancialDashboard />
        </Suspense>
        
        <Suspense fallback={<div>Loading daily cash receipts...</div>}>
          <DailyCashReceipts />
        </Suspense>
      </div>
      
      <div className="mt-8">
        <Suspense fallback={<div>Loading invoices...</div>}>
          <InvoiceList />
        </Suspense>
      </div>
      
      <div className="mt-8">
        <Suspense fallback={<div>Loading expense tracker...</div>}>
          <ExpenseTracker />
        </Suspense>
      </div>
    </>
  );
} 