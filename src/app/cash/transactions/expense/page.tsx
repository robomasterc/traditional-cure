'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Typography } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { TrendingDown, ArrowDownRight } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function ExpenseEntryPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    type: 'Expense',
    category: '',
    cash: '',
    upi: '',
    description: '',
    patientId: '',
    staffId: session?.user?.name || '',
    date: new Date().toISOString().split('T')[0],
    createdBy: session?.user?.name || '',
    createdAt: new Date().toISOString()
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/cash/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          cash: parseFloat(formData.cash) || 0,
          upi: parseFloat(formData.upi) || 0,
          createdBy: session?.user?.name
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to record expense');
      }

      toast.success('Expense recorded successfully');
      router.push('/cash/transactions/history');
    } catch (error) {
      toast.error('Failed to record expense');
      console.error('Error recording expense:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target as unknown as { name: string; value: string };
    setFormData(prev => ({ ...prev, [target.name]: target.value }));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-lg bg-rose-50 text-rose-600">
              <TrendingDown className="w-6 h-6" />
            </div>
            <div>
              <Typography variant="small" color="muted">New Expense</Typography>
              <Typography variant="h4">Entry Form</Typography>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full h-10 rounded-md border border-input bg-white px-3 py-2 text-sm text-gray-700 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Select category</option>
                <option value="Salary">Salary</option>
                <option value="Rent">Rent</option>
                <option value="Medicine">Medicine</option>
                <option value="Utilities">Utilities</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Equipment">Equipment</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                readOnly
                className="w-full bg-gray-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="cash">Cash Amount</Label>
              <Input
                id="cash"
                name="cash"
                type="decimal"
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
                type="decimal"
                placeholder="Enter UPI amount"
                value={formData.upi}
                onChange={handleChange}
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="patientId">Patient ID (Optional)</Label>
              <Input
                id="patientId"
                name="patientId"
                placeholder="Enter patient ID or Phone Number"
                value={formData.patientId}
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
                readOnly
                className="w-full bg-gray-50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Enter transaction description like for House Rent"
              value={formData.description}
              onChange={handleChange}
              required
              className="w-full"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex items-center space-x-2"
              disabled={loading}
            >
              <ArrowDownRight className="w-4 h-4" />
              <span>{loading ? 'Recording...' : 'Record Expense'}</span>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
} 