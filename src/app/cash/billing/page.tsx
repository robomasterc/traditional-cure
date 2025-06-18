'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Typography } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { 
  Stethoscope, 
  Pill, 
  Syringe, 
  Clock,
  ChevronDown,
  ChevronUp,
  Plus,
  Edit,
  RefreshCw
} from 'lucide-react';
import InvoiceDialog from './components/InvoiceDialog';

interface BillingOption {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

interface BillingForm {
  patientId: string;
  amount: number;
  paymentMethod: 'cash' | 'upi';
  description: string;
}

interface InvoiceItem {
  id: string;
  patientId: string;
  doctorId: string;
  type: string;
  category: string;
  description: string;
  quantity: number;
  amount: number;
  total: number;
  status: string;
  createdBy: string;
  createdAt: string;
}

const billingOptions: BillingOption[] = [
  {
    id: 'consultation',
    label: 'Consultation Billing',
    icon: Stethoscope,
    description: 'Process consultation payments'
  },
  {
    id: 'medicine',
    label: 'Medicine Billing',
    icon: Pill,
    description: 'Process medicine payments'
  },
  {
    id: 'treatment',
    label: 'Treatment Billing',
    icon: Syringe,
    description: 'Process treatment payments'
  },
  {
    id: 'pending',
    label: 'Pending Payments',
    icon: Clock,
    description: 'View pending payments'
  }
];

export default function BillingPage() {
  const { data: session } = useSession();
  const [activeSection, setActiveSection] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [invoices, setInvoices] = React.useState<InvoiceItem[]>([]);
  const [loadingInvoices, setLoadingInvoices] = React.useState(false);
  const [showInvoiceDialog, setShowInvoiceDialog] = React.useState(false);
  const [editingInvoice, setEditingInvoice] = React.useState<{ id: string; items: any[] } | null>(null);
  const [formData, setFormData] = React.useState<BillingForm>({
    patientId: '',
    amount: 0,
    paymentMethod: 'cash',
    description: ''
  });

  const fetchInvoices = async () => {
    setLoadingInvoices(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/cash/invoices?date=${today}`);
      if (response.ok) {
        const data = await response.json() as InvoiceItem[];
        setInvoices(data);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error('Failed to fetch invoices');
    } finally {
      setLoadingInvoices(false);
    }
  };

  React.useEffect(() => {
    fetchInvoices();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = e.target as unknown as { name: string; value: string };
    const { name, value } = target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent, category: string) => {
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
          category: category,
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

  const handleEditInvoice = (invoice: InvoiceItem) => {
    const invoiceItem = {
      patientId: invoice.patientId,
      doctorId: invoice.doctorId,
      type: invoice.type as 'Consultation' | 'Medicine' | 'Procedure' | 'Discount',
      category: invoice.category,
      description: invoice.description,
      quantity: invoice.quantity,
      amount: invoice.amount,
      total: invoice.total
    };
    
    setEditingInvoice({
      id: invoice.id,
      items: [invoiceItem]
    });
    setShowInvoiceDialog(true);
  };

  const handleInvoiceSuccess = () => {
    fetchInvoices();
    setEditingInvoice(null);
  };

  const renderBillingForm = (category: string, title: string) => (
    <Card className="p-6 mt-4">
      <form onSubmit={(e) => handleSubmit(e, category)} className="space-y-6">
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

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder={`Enter ${category.toLowerCase()} details`}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? 'Processing...' : `Process ${title}`}
          </Button>
        </div>
      </form>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <Typography variant="h2" className="mb-2">
              Patient Billing
            </Typography>
            <Typography variant="small" color="muted">
              Manage patient billing and payments
            </Typography>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchInvoices}
              disabled={loadingInvoices}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loadingInvoices ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={() => setShowInvoiceDialog(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Consultation
            </Button>
          </div>
        </div>
      </div>

      {/* Today's Invoices Table */}
      <Card className="p-6">
        <Typography variant="h3" className="mb-4">
          Today's Invoices
        </Typography>
        
        {loadingInvoices ? (
          <div className="text-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
            <Typography variant="small" color="muted">Loading invoices...</Typography>
          </div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-8">
            <Typography variant="small" color="muted">No invoices for today</Typography>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">ID</th>
                  <th className="text-left p-2">Patient ID</th>
                  <th className="text-left p-2">Doctor ID</th>
                  <th className="text-left p-2">Type</th>
                  <th className="text-left p-2">Category</th>
                  <th className="text-left p-2">Description</th>
                  <th className="text-left p-2">Qty</th>
                  <th className="text-left p-2">Amount</th>
                  <th className="text-left p-2">Total</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">{invoice.id}</td>
                    <td className="p-2">{invoice.patientId}</td>
                    <td className="p-2">{invoice.doctorId}</td>
                    <td className="p-2">{invoice.type}</td>
                    <td className="p-2">{invoice.category}</td>
                    <td className="p-2">{invoice.description}</td>
                    <td className="p-2">{invoice.quantity}</td>
                    <td className="p-2">₹{invoice.amount}</td>
                    <td className="p-2 font-medium">₹{invoice.total}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        invoice.status === 'Complete' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="p-2">
                      {invoice.status !== 'Complete' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditInvoice(invoice)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {billingOptions.map((option) => (
          <Card 
            key={option.id}
            className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setActiveSection(activeSection === option.id ? null : option.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                  <option.icon className="w-6 h-6" />
                </div>
                <div>
                  <Typography variant="small" className="font-medium">
                    {option.label}
                  </Typography>
                  <Typography variant="small" color="muted">
                    {option.description}
                  </Typography>
                </div>
              </div>
              {activeSection === option.id ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </div>
          </Card>
        ))}
      </div>

      {activeSection === 'consultation' && renderBillingForm('Consultation', 'Consultation')}
      {activeSection === 'medicine' && renderBillingForm('Medicine', 'Medicine')}
      {activeSection === 'treatment' && renderBillingForm('Treatment', 'Treatment')}
      
      {activeSection === 'pending' && (
        <Card className="p-6 mt-4">
          <Typography variant="h3" className="mb-4">
            Pending Payments
          </Typography>
          <Typography variant="small" color="muted">
            No pending payments at the moment.
          </Typography>
        </Card>
      )} */}

      <InvoiceDialog
        isOpen={showInvoiceDialog}
        onClose={() => {
          setShowInvoiceDialog(false);
          setEditingInvoice(null);
        }}
        onSuccess={handleInvoiceSuccess}
        editData={editingInvoice?.items}
        editId={editingInvoice?.id}
      />
    </div>
  );
} 