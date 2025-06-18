'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Typography } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

interface ConsultationBill {
  patientId: string;
  doctorId: string;
  amount: number;
  paymentMethod: 'cash' | 'upi';
  description: string;
}

export default function ConsultationBillingPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState<ConsultationBill>({
    patientId: '',
    doctorId: '',
    amount: 0,
    paymentMethod: 'cash',
    description: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? Number(value) : value
    }));
  };

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
          type: 'Income',
          category: 'Consultation',
          cash: formData.paymentMethod === 'cash' ? formData.amount : 0,
          upi: formData.paymentMethod === 'upi' ? formData.amount : 0,
          description: formData.description,
          patientId: formData.patientId,
          staffId: session?.user?.name || '',
          date: new Date().toISOString(),
          createdBy: session?.user?.name || '',
          createdAt: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process payment');
      }

      toast.success('Payment processed successfully');
      setFormData({
        patientId: '',
        doctorId: '',
        amount: 0,
        paymentMethod: 'cash',
        description: ''
      });
    } catch (error) {
      toast.error('Failed to process payment');
      console.error('Error processing payment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <Typography variant="h2" className="mb-4">
          Consultation Billing
        </Typography>
        <Typography variant="small" color="muted">
          Process consultation payments for patients
        </Typography>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="patientId">Patient ID</Label>
              <Input
                id="patientId"
                name="patientId"
                value={formData.patientId}
                onChange={handleChange}
                placeholder="Enter patient ID"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="doctorId">Doctor ID</Label>
              <Input
                id="doctorId"
                name="doctorId"
                value={formData.doctorId}
                onChange={handleChange}
                placeholder="Enter doctor ID"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleChange}
                placeholder="Enter amount"
                required
                min="0"
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select
                name="paymentMethod"
                value={formData.paymentMethod}
                onValueChange={(value: 'cash' | 'upi') => 
                  setFormData(prev => ({ ...prev, paymentMethod: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter consultation details"
                required
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? 'Processing...' : 'Process Payment'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
} 