'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Typography } from '@/components/ui/typography';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Search, Download, Filter } from 'lucide-react';
import { format } from 'date-fns';

interface PaymentMethod {
  method: 'CASH' | 'CARD' | 'UPI' | 'BANK_TRANSFER';
  amount: number;
}

interface CashReceipt {
  id: string;
  patientName: string;
  paymentMethods: PaymentMethod[];
  date: string;
  notes?: string;
}

export default function DailyCashReceipts() {
  const [receipts, setReceipts] = useState<CashReceipt[]>([]);
  const [filteredReceipts, setFilteredReceipts] = useState<CashReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [newReceipt, setNewReceipt] = useState<Omit<CashReceipt, 'id'>>({
    patientName: '',
    paymentMethods: [{ method: 'CASH', amount: 0 }],
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  useEffect(() => {
    fetchReceipts();
  }, []);

  useEffect(() => {
    filterReceipts();
  }, [receipts, searchTerm, dateFilter]);

  const filterReceipts = () => {
    let filtered = [...receipts];
    
    if (searchTerm) {
      filtered = filtered.filter(receipt =>
        receipt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        receipt.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (dateFilter) {
      filtered = filtered.filter(receipt => receipt.date === dateFilter);
    }

    setFilteredReceipts(filtered);
  };

  const fetchReceipts = async () => {
    try {
      const response = await fetch('/api/financial/cash-receipts');
      if (!response.ok) throw new Error('Failed to fetch receipts');
      const data = await response.json();
      setReceipts(data);
      setFilteredReceipts(data);
    } catch (error) {
      console.error('Error fetching receipts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!newReceipt.patientName.trim()) {
      alert('Please enter a patient name');
      return;
    }

    if (newReceipt.paymentMethods.length === 0) {
      alert('Please add at least one payment method');
      return;
    }

    // Validate payment methods
    const hasInvalidAmount = newReceipt.paymentMethods.some(pm => 
      !pm.amount || pm.amount <= 0 || isNaN(pm.amount)
    );
    
    if (hasInvalidAmount) {
      alert('Please enter valid amounts for all payment methods');
      return;
    }

    try {
      console.log(newReceipt.paymentMethods);
      const response = await fetch('/api/financial/cash-receipts', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          ...newReceipt,
          paymentMethods: newReceipt.paymentMethods.map(pm => ({
            ...pm,
            amount: Number(pm.amount)
          }))
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Failed to create receipt: ${response.status}`);
      }
      
      await fetchReceipts();
      resetForm();
    } catch (error) {
      console.error('Error creating receipt:', error);
      alert(error instanceof Error ? error.message : 'Failed to create receipt. Please try again.');
    }
  };

  const resetForm = () => {
    setNewReceipt({
      patientName: '',
      paymentMethods: [{ method: 'CASH', amount: 0 }],
      date: new Date().toISOString().split('T')[0],
      notes: '',
    });
  };

  const addPaymentMethod = () => {
    setNewReceipt({
      ...newReceipt,
      paymentMethods: [...newReceipt.paymentMethods, { method: 'CASH', amount: 0 }],
    });
  };

  const removePaymentMethod = (index: number) => {
    setNewReceipt({
      ...newReceipt,
      paymentMethods: newReceipt.paymentMethods.filter((_, i) => i !== index),
    });
  };

  const updatePaymentMethod = (index: number, field: keyof PaymentMethod, value: string | number) => {
    const updatedMethods = [...newReceipt.paymentMethods];
    updatedMethods[index] = {
      ...updatedMethods[index],
      [field]: field === 'amount' ? (value ? parseFloat(value as string) : 0) : value,
    };
    setNewReceipt({
      ...newReceipt,
      paymentMethods: updatedMethods,
    });
  };

  const getTotalAmount = (paymentMethods: PaymentMethod[]) => {
    return paymentMethods.reduce((sum, pm) => sum + pm.amount, 0);
  };

  const exportToCSV = () => {
    const headers = ['Patient Name', 'Date', 'Payment Methods', 'Total Amount', 'Notes'];
    const csvData = filteredReceipts.map(receipt => [
      receipt.patientName,
      format(new Date(receipt.date), 'dd/MM/yyyy'),
      receipt.paymentMethods.map(pm => `${pm.method}: ₹${pm.amount}`).join(', '),
      `₹${getTotalAmount(receipt.paymentMethods)}`,
      receipt.notes || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `cash-receipts-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Typography variant="p" className="text-gray-500">Loading receipts...</Typography>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-gray-700">Add New Receipt</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patientName" className="text-gray-700 font-medium">Patient Name</Label>
                <Input
                  id="patientName"
                  value={newReceipt.patientName}
                  onChange={(e) => setNewReceipt({ ...newReceipt, patientName: e.target.value })}
                  required
                  placeholder="Enter patient name"
                  className="bg-white text-gray-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date" className="text-gray-700 font-medium">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={newReceipt.date}
                  onChange={(e) => setNewReceipt({ ...newReceipt, date: e.target.value })}
                  required
                  className="bg-white text-gray-500"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-gray-700 font-medium">Payment Methods</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addPaymentMethod}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Payment Method
                </Button>
              </div>

              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow className='text-gray-700'>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {newReceipt.paymentMethods.map((paymentMethod, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Select
                            value={paymentMethod.method}
                            onValueChange={(value) => updatePaymentMethod(index, 'method', value)}
                          >
                            <SelectTrigger className="bg-white text-gray-500">
                              <SelectValue placeholder="Select payment method" />
                            </SelectTrigger>
                            <SelectContent className="bg-white text-gray-700">
                              <SelectItem value="CASH">Cash</SelectItem>
                              <SelectItem value="CARD">Card</SelectItem>
                              <SelectItem value="UPI">UPI</SelectItem>
                              <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={paymentMethod.amount}
                            onChange={(e) => updatePaymentMethod(index, 'amount', Number(e.target.value))}
                            className="bg-white text-gray-500"
                            placeholder="Enter amount"
                          />
                        </TableCell>
                        <TableCell>
                          {index > 0 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removePaymentMethod(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-end">
                <Typography variant="p" className="text-gray-700 font-medium">
                  Total Amount: ₹{getTotalAmount(newReceipt.paymentMethods).toLocaleString()}
                </Typography>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-gray-700 font-medium">Notes</Label>
              <Input
                id="notes"
                value={newReceipt.notes}
                onChange={(e) => setNewReceipt({ ...newReceipt, notes: e.target.value })}
                placeholder="Add any additional notes"
                className="bg-white text-gray-500"
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={resetForm}>
                Reset
              </Button>
              <Button type="submit">Add Receipt</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle className="text-gray-700">Recent Cash Receipts</CardTitle>
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search receipts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 bg-white"
                />
              </div>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-40 bg-white"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDateFilter('')}
                  className="shrink-0"
                >
                  <Filter className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportToCSV}
                  className="shrink-0"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Payment Methods</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReceipts.map((receipt) => (
                  <TableRow key={receipt.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{receipt.patientName}</TableCell>
                    <TableCell>{format(new Date(receipt.date), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>
                      {receipt.paymentMethods.map((pm, index) => (
                        <div key={index} className="text-sm">
                          {pm.method}: ₹{pm.amount.toLocaleString()}
                        </div>
                      ))}
                    </TableCell>
                    <TableCell className="font-medium">
                      ₹{getTotalAmount(receipt.paymentMethods).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-gray-500">{receipt.notes || '-'}</TableCell>
                  </TableRow>
                ))}
                {filteredReceipts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <Typography variant="p" className="text-gray-500">
                        {searchTerm || dateFilter ? 'No matching receipts found' : 'No receipts found'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 