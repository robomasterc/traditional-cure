'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'Income' | 'Expense';
  onSuccess: () => void;
}

export function TransactionModal({ isOpen, onClose, type, onSuccess }: TransactionModalProps) {
  const { data: session } = useSession();
  const [formData, setFormData] = React.useState({
    type,
    category: '',
    cash: 0,
    upi: 0,
    description: '',
    patientId: '',
    staffId: session?.user?.name || '',
    date: new Date().toISOString(),
    createdBy: session?.user?.name || '',
    createdAt: new Date().toISOString()
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target as unknown as { name: string; value: string };
    setFormData(prev => ({ ...prev, [target.name]: target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/cash/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          cash: formData.cash.toString(),
          upi: formData.upi.toString()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to record transaction');
      }

      toast.success(`${type} recorded successfully`);
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Failed to record transaction');
      console.error('Error recording transaction:', error);
    }
  };

  const categories = type === 'Income' 
    ? ['Consultation', 'Medicine', 'Procedure', 'Other']
    : ['Salary', 'Rent', 'Utilities', 'Maintenance', 'Equipment', 'Refund', 'Other'];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Record {type}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className="w-full h-10 rounded-md border border-input bg-white px-3 py-2 text-sm text-gray-700"
              >
                <option value="">Select category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            {/* <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                readOnly
                value={formData.date}
                onChange={handleChange}
                className="w-full"
              />
            </div> */}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cash">Cash Amount</Label>
              <Input
                id="cash"
                name="cash"
                type="number"
                placeholder="Enter cash amount"
                value={formData.cash}
                onChange={handleChange}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="upi">UPI Amount</Label>
              <Input
                id="upi"
                name="upi"
                type="number"
                placeholder="Enter UPI amount"
                value={formData.upi}
                onChange={handleChange}
                className="w-full"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="patientId">Reference ID</Label>
            <Input
              id="patientId"
              name="patientId"
              placeholder="Enter reference ID like Patient ID, Invoice ID, Supplier ID, etc."
              value={formData.patientId}
              onChange={handleChange}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              required
              placeholder={`Enter transaction description like for ${type === 'Income' ? 'Medicine' : 'House Rent'}`}
              value={formData.description}
              onChange={handleChange}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="staffId">Staff ID</Label>
            <Input
              id="staffId"
              name="staffId"
              value={formData.staffId}
              onChange={handleChange}
              className="w-full"
              readOnly
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Record {type}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 