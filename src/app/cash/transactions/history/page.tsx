'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Typography } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface Transaction {
  type: string;
  category: string;
  cash: number;
  upi: number;
  description: string;
  patientId: string;
  staffId: string;
  date: string;
  createdBy: string;
  createdAt: string;
}

export default function TransactionHistoryPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch('/api/cash/transactions');        
        if (!response.ok) {
          throw new Error('Failed to fetch transactions');
        }
        const data = await response.json() as Transaction[];
        setTransactions(data);
      } catch (error) {
        toast.error('Failed to fetch transactions');
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const totalIncome = transactions
    .filter(t => t.type === 'Income')
    .reduce((sum, t) => sum + (t.cash + t.upi), 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'Expense')
    .reduce((sum, t) => sum + (t.cash + t.upi), 0);

  const totalTransactions = transactions.length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <Typography variant="small" color="muted">Total Income</Typography>
              <Typography variant="h4">₹{totalIncome.toLocaleString()}</Typography>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-lg bg-rose-50 text-rose-600">
              <TrendingDown className="w-6 h-6" />
            </div>
            <div>
              <Typography variant="small" color="muted">Total Expenses</Typography>
              <Typography variant="h4">₹{totalExpenses.toLocaleString()}</Typography>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <Typography variant="small" color="muted">Total Transactions</Typography>
              <Typography variant="h4">{totalTransactions}</Typography>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <Typography variant="h3">Transaction History</Typography>
          <div className="flex space-x-4">
            <Button 
              onClick={() => router.push('/cash/transactions/income')}
              className="flex items-center space-x-2"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>New Income</span>
            </Button>
            <Button 
              onClick={() => router.push('/cash/transactions/expense')}
              className="flex items-center space-x-2"
            >
              <ArrowDownRight className="w-4 h-4" />
              <span>New Expense</span>
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <Typography>Loading transactions...</Typography>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8">
            <Typography>No transactions found</Typography>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-left py-3 px-4">Type</th>
                  <th className="text-left py-3 px-4">Category</th>
                  <th className="text-left py-3 px-4">Description</th>
                  <th className="text-right py-3 px-4">Cash</th>
                  <th className="text-right py-3 px-4">UPI</th>
                  <th className="text-right py-3 px-4">Total</th>
                  <th className="text-left py-3 px-4">Patient ID</th>
                  <th className="text-left py-3 px-4">Staff ID</th>
                  <th className="text-left py-3 px-4">Created By</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{new Date(transaction.date).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        transaction.type === 'Income' 
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className="py-3 px-4">{transaction.category}</td>
                    <td className="py-3 px-4">{transaction.description}</td>
                    <td className="py-3 px-4 text-right">₹{transaction.cash.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">₹{transaction.upi.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-medium">
                      ₹{(transaction.cash + transaction.upi).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">{transaction.patientId || '-'}</td>
                    <td className="py-3 px-4">{transaction.staffId || '-'}</td>
                    <td className="py-3 px-4">{transaction.createdBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
} 