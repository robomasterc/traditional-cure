'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Typography } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';

import { toast } from 'sonner';
import { 
  Plus,
  Edit,
  RefreshCw,
  Eye
} from 'lucide-react';
import InvoiceDialog from './components/InvoiceDialog';

// Import the InvoiceItem type from the dialog component
interface InvoiceItem {
  patientId: string;
  doctorId: string;
  type: 'Consultation' | 'Medicine' | 'Procedure' | 'Discount';
  category: string;
  description: string;
  quantity: number;
  amount: number;
  total: number;
}





interface InvoiceRecord {
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
  items?: Array<{
    doctorId: string;
    type: string;
    category: string;
    description: string;
    quantity: number;
    amount: number;
    total: number;
  }>;
}


export default function BillingPage() {
  const [invoices, setInvoices] = React.useState<InvoiceRecord[]>([]);
  const [loadingInvoices, setLoadingInvoices] = React.useState(false);
  const [showInvoiceDialog, setShowInvoiceDialog] = React.useState(false);
  const [editingInvoice, setEditingInvoice] = React.useState<{ id: string; items: Array<{ patientId: string; doctorId: string; type: string; category: string; description: string; quantity: number; amount: number; total: number }> } | null>(null);
  const [selectedPatientId, setSelectedPatientId] = React.useState<string>('');
  const [selectedDoctorId, setSelectedDoctorId] = React.useState<string>('');
  const [isViewMode, setIsViewMode] = React.useState(false);

  const fetchInvoices = async () => {
    setLoadingInvoices(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/cash/invoices?date=${today}`);
      if (response.ok) {
        const data = await response.json() as InvoiceRecord[];
        setInvoices(data);
      }
    } catch {
      console.error('Error fetching invoices');
      toast.error('Failed to fetch invoices');
    } finally {
      setLoadingInvoices(false);
    }
  };

  React.useEffect(() => {
    fetchInvoices();
  }, []);



  

  const handleEditInvoice = (invoice: InvoiceRecord) => {
    
    // Extract patient and doctor IDs from the invoice
    setSelectedPatientId(invoice.patientId);
    setSelectedDoctorId(invoice.doctorId);
    
    // Convert the items array to the format expected by InvoiceDialog
    const editItems = invoice.items?.map((item: { doctorId: string; type: string; category: string; description: string; quantity: number; amount: number; total: number }) => ({
      patientId: invoice.patientId,
      doctorId: item.doctorId,
      type: item.type as 'Consultation' | 'Medicine' | 'Procedure' | 'Discount',
      category: item.category,
      description: item.description,
      quantity: item.quantity,
      amount: item.amount,
      total: item.total
    })) || [];
    
    
    setEditingInvoice({
      id: invoice.id,
      items: editItems as InvoiceItem[]
    });
    setIsViewMode(false);
    setShowInvoiceDialog(true);
  };

  const handleViewInvoice = (invoice: InvoiceRecord) => {
    
    // Extract patient and doctor IDs from the invoice
    setSelectedPatientId(invoice.patientId);
    setSelectedDoctorId(invoice.doctorId);
    
    // Convert the items array to the format expected by InvoiceDialog
    const viewItems = invoice.items?.map((item: { doctorId: string; type: string; category: string; description: string; quantity: number; amount: number; total: number }) => ({
      patientId: invoice.patientId,
      doctorId: item.doctorId,
      type: item.type as 'Consultation' | 'Medicine' | 'Procedure' | 'Discount',
      category: item.category,
      description: item.description,
      quantity: item.quantity,
      amount: item.amount,
      total: item.total
    })) || [];
    
    
    setEditingInvoice({
      id: invoice.id,
      items: viewItems as InvoiceItem[]
    });
    setIsViewMode(true);
    setShowInvoiceDialog(true);
  };

  const handleInvoiceSuccess = () => {
    fetchInvoices();
    setEditingInvoice(null);
  };
  

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
              onClick={() => {
                setSelectedPatientId('');
                setSelectedDoctorId('');
                setShowInvoiceDialog(true);
              }}
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
          Today&apos;s Invoices
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
            <table className="w-full text-sm text-gray-700">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">ID</th>
                  <th className="text-left p-2">Patient ID</th>
                  <th className="text-left p-2">Doctor ID</th>
                  <th className="text-left p-2">Category</th>
                  <th className="text-left p-2">Description</th>
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
                    <td className="p-2">{invoice.category}</td>
                    <td className="p-2">{invoice.description}</td>
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
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewInvoice(invoice)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {invoice.status !== 'Complete' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditInvoice(invoice)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
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
          setSelectedPatientId('');
          setSelectedDoctorId('');
          setIsViewMode(false);
        }}
        onSuccess={handleInvoiceSuccess}
        editData={editingInvoice?.items as InvoiceItem[]}
        editId={editingInvoice?.id}
        selectedPatientId={selectedPatientId}
        selectedDoctorId={selectedDoctorId}
        isViewMode={isViewMode}
      />
    </div>
  );
} 