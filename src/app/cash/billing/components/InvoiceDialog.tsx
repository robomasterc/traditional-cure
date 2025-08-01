'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';
import { useInventory } from '@/hooks/useInventory';


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

interface PaymentMethod {
  method: 'Cash' | 'UPI';
  amount: number;
}

interface InvoiceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: InvoiceItem[];
  editId?: string;
  selectedPatientId?: string;
  selectedDoctorId?: string;
  isViewMode?: boolean;
}

export default function InvoiceDialog({ isOpen, onClose, onSuccess, editData, editId, selectedPatientId, selectedDoctorId, isViewMode = false }: InvoiceDialogProps) {
  const [items, setItems] = React.useState<InvoiceItem[]>([
    {
      patientId: '',
      doctorId: '',
      type: 'Consultation',
      category: '',
      description: '',
      quantity: 1,
      amount: 0,
      total: 0
    }
  ]);
  const [paymentMethods, setPaymentMethods] = React.useState<PaymentMethod[]>([
    { method: 'Cash', amount: 0 },
    { method: 'UPI', amount: 0 }
  ]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { getAvailableMedicines } = useInventory();

  const updatePaymentMethod = (index: number, field: keyof PaymentMethod, value: string | number) => {
    const newPaymentMethods = [...paymentMethods];
    newPaymentMethods[index] = { ...newPaymentMethods[index], [field]: value };
    setPaymentMethods(newPaymentMethods);
  };

  React.useEffect(() => {
    if (editData && editData.length > 0) {
      setItems(editData);
    } else {
      // Reset form for new consultation
      setItems([{
        patientId: selectedPatientId || '',
        doctorId: selectedDoctorId || '',
        type: !editId ? 'Consultation' : 'Medicine',
        category: '',
        description: '',
        quantity: 1,
        amount: 0,
        total: 0
      }]);
    }
    
    // Clear payment amounts on dialog open
    setPaymentMethods([
      { method: 'Cash', amount: 0 },
      { method: 'UPI', amount: 0 }
    ]);
    
    // Clear any previous errors when opening dialog
    setError(null);
  }, [editData, isOpen, selectedPatientId, selectedDoctorId, editId]);

  const addRow = () => {
    setItems([...items, {
      patientId: selectedPatientId || '',
      doctorId: selectedDoctorId || '',
      type: !editId ? 'Consultation' : 'Medicine',
      category: '',
      description: '',
      quantity: 1,
      amount: 0,
      total: 0
    }]);
  };

  const removeRow = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // If category changed to 'Overall', make amount negative
    if (field === 'category' && value === 'Overall' && newItems[index].amount > 0) {
      newItems[index].amount = -newItems[index].amount;
    }
    
    // If type is Medicine and category is selected, auto-fill from inventory
    if (field === 'category' && newItems[index].type === 'Medicine' && value) {
      const availableMedicines = getAvailableMedicines();
      const selectedMedicine = availableMedicines.find(med => med.id === value);
      if (selectedMedicine) {
        newItems[index].description = selectedMedicine.name;
        newItems[index].amount = selectedMedicine.sellingPrice;
        newItems[index].total = newItems[index].quantity * selectedMedicine.sellingPrice;
      }
    }
    
    // Calculate total
    if (field === 'quantity' || field === 'amount') {
      const item = newItems[index];
      newItems[index].total = item.quantity * item.amount;
    }
    
    setItems(newItems);
  };

  const handleInputChange = (index: number, field: keyof InvoiceItem) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = e.target as unknown as { value: string };
    let value: string | number;
    
    if (field === 'quantity' || field === 'amount') {
      value = Number(target.value);
      // If category is discount, make amount negative
      if (field === 'amount' && items[index].type === 'Discount') {
        value = -Math.abs(value);
      }
    } else {
      value = target.value;
    }
    
    updateItem(index, field, value);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      // For edit mode, exclude consultation items
      if (editId && item.type === 'Consultation') {
        return sum;
      }
      return sum + item.total;
    }, 0);
  };

  const calculatePaymentTotal = () => {
    return paymentMethods.reduce((sum, pm) => sum + pm.amount, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null); // Clear any previous errors

    try {
      // Validate payment methods
      const invoiceTotal = calculateTotal();
      const paymentTotal = calculatePaymentTotal();
      
      if (paymentTotal !== invoiceTotal) {
        throw new Error(`Payment total (₹${paymentTotal}) must equal invoice total (₹${invoiceTotal})`);
      }

      if (editId) {
        // Edit mode: Handle consultation with PUT, others with POST
        const consultationItems = items.filter(item => item.type === 'Consultation');
        const otherItems = items.filter(item => item.type !== 'Consultation');
        
                
        // Append other items with POST
        if (otherItems.length > 0) {
          const response = await fetch('/api/cash/invoices', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              items: otherItems,
              status: 'Complete',
              invoiceId: editId, // Carry forward the existing invoice ID
              paymentMethods: paymentMethods // Include payment methods
            }),
          });

          if (!response.ok) {
            const errorData = await response.json() as { error?: string };
            throw new Error(errorData.error || 'Failed to create additional items');
          }
        }

        // Update consultation items with PUT
        if (consultationItems.length > 0) {
          const response = await fetch(`/api/cash/invoices`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: editId,
              status: 'Complete',
              paymentMethods: paymentMethods // Include payment methods for transaction creation
            }),
          });

          if (!response.ok) {
            const errorData = await response.json() as { error?: string };
            throw new Error(errorData.error || 'Failed to update consultation');
          }
        }

        toast.success('Invoice updated successfully');
      } else {
        // Create new invoice
        
        // Filter out items with missing required fields
        const validItems = items.filter(item => 
          item.patientId && 
          item.doctorId && 
          item.type && 
          item.category && 
          item.quantity > 0 && 
          item.amount > 0
        );
        
        
        if (validItems.length === 0) {
          throw new Error('Please fill in all required fields for at least one item');
        }
        
        // Generate a unique invoice ID with timestamp and random suffix
        const uniqueInvoiceId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const response = await fetch('/api/cash/invoices', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            invoiceId: uniqueInvoiceId,
            items: validItems,
            status: 'Ready',
            paymentMethods: paymentMethods // Include payment methods
          }),
        });

        if (!response.ok) {
          const errorData = await response.json() as { error?: string };
          throw new Error(errorData.error || 'Failed to create invoice');
        }

        toast.success('Invoice created successfully');
      }

      onSuccess();
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeCategories = (type: string): (string | { value: string; label: string })[] => {
    switch (type) {
      case 'Consultation':
        return ['New Client', 'Follow-up', 'Emergency'];
      case 'Medicine':
        // Return available medicines from inventory
        const availableMedicines = getAvailableMedicines();
        return availableMedicines.map(med => ({
          value: med.id,
          label: `${med.name} (₹${med.sellingPrice}) - Stock: ${med.stock} ${med.unit}`
        }));
      case 'Procedure':
        return ['Panchatilyam', 'Massage', 'Therapy', 'Other'];
      case 'Discount':
        return ['Overall', 'Medicine', 'Procedure', 'Other'];
      default:
        return [];
    }
  };

  const formatAmountDisplay = (amount: number, category: string) => {
    if (category === 'Overall') {
      return Math.abs(amount).toString();
    }
    return amount.toString();
  };

  const getCategoryDisplayValue = (type: string, category: string) => {
    if (type === 'Medicine' && category) {
      const availableMedicines = getAvailableMedicines();
      const selectedMedicine = availableMedicines.find(med => med.id === category);
      return selectedMedicine ? selectedMedicine.name : category;
    }
    return category;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[80vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isViewMode ? 'View Invoice For: ' + items[0].patientId : 
             editId ? 'Edit Invoice For: ' + items[0].patientId : 'Add New Invoice'}
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}



        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <thead>
                <tr className="border-b text-gray-700">
                  {!editId && <th className="text-left p-2 w-24">Patient ID</th>}
                  <th className="text-left p-2 w-24">Doctor ID</th>
                  <th className="text-left p-2 w-28">Type</th>
                  <th className="text-left p-2 w-32">Category</th>
                  <th className="text-left p-2 w-40">Description</th>
                  <th className="text-left p-2 w-16">Qty</th>
                  <th className="text-left p-2 w-24">Amount</th>
                  <th className="text-left p-2 w-24">Total</th>
                  <th className="text-left p-2 w-16">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index} className="border-b">
                    {!editId && (
                      <td className="p-2">
                        <Input
                          value={item.patientId}
                          onChange={handleInputChange(index, 'patientId')}
                          placeholder="Patient ID"
                          required
                          className={`w-full ${isViewMode ? 'bg-gray-100' : ''}`}
                          disabled={isViewMode}
                        />
                      </td>
                    )}
                    <td className="p-2">
                      <Input
                        value={item.doctorId}
                        onChange={handleInputChange(index, 'doctorId')}
                        placeholder="Doctor ID"
                        required
                        className={`w-full ${(editId && item.type === 'Consultation') || isViewMode ? 'bg-gray-100' : ''}`}
                        disabled={Boolean(editId && item.type === 'Consultation') || isViewMode}
                      />
                    </td>
                    <td className="p-2">
                      <Select
                        value={item.type}
                        onValueChange={(value: 'Consultation' | 'Medicine' | 'Procedure' | 'Discount') => 
                          updateItem(index, 'type', value)
                        }
                        disabled={Boolean(editId && item.type === 'Consultation') || isViewMode}
                      >
                        <SelectTrigger className={`w-full text-gray-700 bg-white ${(editId && item.type === 'Consultation') || isViewMode ? 'bg-gray-100' : ''}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="text-gray-700 bg-white">
                          <SelectItem value="Consultation">Consultation</SelectItem>
                          <SelectItem value="Medicine">Medicine</SelectItem>
                          <SelectItem value="Procedure">Procedure</SelectItem>
                          <SelectItem value="Discount">Discount</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-2">
                      <Select
                        value={item.category}
                        onValueChange={(value) => updateItem(index, 'category', value)}
                        disabled={Boolean(editId && item.type === 'Consultation') || isViewMode}
                      >
                        <SelectTrigger className={`w-full text-gray-700 bg-white ${(editId && item.type === 'Consultation') || isViewMode ? 'bg-gray-100' : ''}`}>
                          <SelectValue placeholder="Category">
                            {getCategoryDisplayValue(item.type, item.category)}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="text-gray-700 bg-white">
                          {getTypeCategories(item.type).map((category: string | { value: string; label: string }) => {
                            if (typeof category === 'string') {
                              return (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              );
                            } else {
                              return (
                                <SelectItem key={category.value} value={category.value}>
                                  {category.label}
                                </SelectItem>
                              );
                            }
                          })}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-2">
                      <Input
                        value={item.description}
                        onChange={handleInputChange(index, 'description')}
                        placeholder="Description"
                        className={`w-full ${(editId && item.type === 'Consultation') || isViewMode ? 'bg-gray-100' : ''}`}
                        disabled={Boolean(editId && item.type === 'Consultation') || isViewMode}
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={handleInputChange(index, 'quantity')}
                        min="0"
                        required
                        className={`w-full ${(editId && item.type === 'Consultation') || isViewMode ? 'bg-gray-100' : ''}`}
                        disabled={Boolean(editId && item.type === 'Consultation') || isViewMode}
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        type="number"
                        value={formatAmountDisplay(item.amount, item.category)}
                        onChange={handleInputChange(index, 'amount')}
                        min="0"
                        step="0.01"
                        required
                        className={`w-full ${(editId && item.type === 'Consultation') || isViewMode ? 'bg-gray-100' : ''}`}
                        disabled={Boolean(editId && item.type === 'Consultation') || isViewMode}
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        type="number"
                        value={item.total}
                        readOnly
                        className="bg-gray-50 w-full"
                      />
                    </td>
                    <td className="p-2">
                      {items.length > 1 && !(editId && item.type === 'Consultation') && !isViewMode && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeRow(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center border-t pt-4">
            <div className="text-lg font-semibold text-gray-700">
              Invoice Total: ₹{calculateTotal().toFixed(2)}
            </div>
          </div>

          {!isViewMode && (
            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={addRow}>
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>
          )}

          {/* Payment Methods Section */}
          {!isViewMode && (
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Payment Methods</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cash-amount">Cash Amount</Label>
                  <Input
                    id="cash-amount"
                    type="number"
                    value={paymentMethods.find(p => p.method === 'Cash')?.amount || 0}
                    onChange={(e) => {
                      const target = e.target as unknown as { value: string };
                      const cashIndex = paymentMethods.findIndex(p => p.method === 'Cash');
                      if (cashIndex !== -1) {
                        updatePaymentMethod(cashIndex, 'amount', Number(target.value));
                      }
                    }}
                    placeholder="Enter cash amount"
                    className="w-full"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <Label htmlFor="upi-amount">UPI Amount</Label>
                  <Input
                    id="upi-amount"
                    type="number"
                    value={paymentMethods.find(p => p.method === 'UPI')?.amount || 0}
                    onChange={(e) => {
                      const target = e.target as unknown as { value: string };
                      const upiIndex = paymentMethods.findIndex(p => p.method === 'UPI');
                      if (upiIndex !== -1) {
                        updatePaymentMethod(upiIndex, 'amount', Number(target.value));
                      }
                    }}
                    placeholder="Enter UPI amount"
                    className="w-full"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              <div className="mt-3 text-sm text-gray-600">
                Payment Total: ₹{calculatePaymentTotal().toFixed(2)}
                {calculatePaymentTotal() !== calculateTotal() && (
                  <span className="text-red-600 ml-2">
                    (Must equal invoice total)
                  </span>
                )}
              </div>
            </div>
          )}
          
          <div className="flex justify-between">
            {isViewMode ? (
              <Button type="button" onClick={onClose}>
                Close
              </Button>
            ) : (
              <>
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Processing...' : (editId ? 'Update Invoice' : 'Create Invoice')}
                </Button>
              </>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 