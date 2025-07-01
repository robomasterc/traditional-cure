import { useState } from 'react';
import { toast } from 'sonner';

export interface OrderItem {
  itemId: string;
  itemName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  orderDate: string;
  expectedDelivery: string;
  status: 'Draft' | 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';
  totalAmount: number;
  items: OrderItem[];
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export const useOrders = () => {
  const [loading, setLoading] = useState(false);

  const createOrder = async (orderData: Omit<PurchaseOrder, 'id' | 'createdAt'>) => {
    setLoading(true);
    try {
      const order: PurchaseOrder = {
        ...orderData,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(order),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create order');
      }

      const createdOrder = await response.json();
      toast.success('Purchase order created successfully');
      return createdOrder;
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create order');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getOrders = async (filters?: {
    status?: string;
    supplierId?: string;
  }) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.supplierId) params.append('supplierId', filters.supplierId);

      const response = await fetch(`/api/orders?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    createOrder,
    getOrders,
    loading,
  };
}; 