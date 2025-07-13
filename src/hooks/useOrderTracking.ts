import { useState, useEffect, useCallback } from 'react';

interface OrderTracking {
  id: string;
  poNumber: string;
  supplierName: string;
  supplierId: string;
  orderDate: string;
  expectedDelivery: string;
  status: 'Sent' | 'Confirmed' | 'In Transit' | 'Out for Delivery' | 'Delivered' | 'Delayed';
  currentLocation?: string;
  trackingNumber?: string;
  carrier?: string;
  lastUpdate: string;
  totalAmount: number;
  items: TrackingItem[];
  notes?: string;
  contactPerson: string;
  contactPhone: string;
}

interface TrackingItem {
  itemId: string;
  itemName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

interface UseOrderTrackingOptions {
  status?: string;
  supplierId?: string;
  searchTerm?: string;
}

export function useOrderTracking(options: UseOrderTrackingOptions = {}) {
  const [orders, setOrders] = useState<OrderTracking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (options.status && options.status !== 'all') {
        params.append('status', options.status);
      }
      if (options.supplierId && options.supplierId !== 'all') {
        params.append('supplierId', options.supplierId);
      }
      
      const response = await fetch(`/api/orders/tracking?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, [options.status, options.supplierId]);

  const refreshOrders = useCallback(async () => {
    try {
      setRefreshing(true);
      await fetchOrders();
    } finally {
      setRefreshing(false);
    }
  }, [fetchOrders]);

  const refreshOrder = useCallback(async (poNumber: string) => {
    try {
      setRefreshing(true);
      
      // Simulate API call to refresh tracking data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Re-fetch all orders to get updated data
      await fetchOrders();
    } catch (err) {
      console.error('Error refreshing order:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh order');
    } finally {
      setRefreshing(false);
    }
  }, [fetchOrders]);

  const updateOrderTracking = useCallback(async (poNumber: string, updates: {
    status?: string;
    currentLocation?: string;
    trackingNumber?: string;
    carrier?: string;
    notes?: string;
  }) => {
    try {
      const response = await fetch('/api/orders/tracking', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          poNumber,
          ...updates,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order tracking');
      }

      // Re-fetch orders to get updated data
      await fetchOrders();
      
      return true;
    } catch (err) {
      console.error('Error updating order tracking:', err);
      setError(err instanceof Error ? err.message : 'Failed to update order tracking');
      return false;
    }
  }, [fetchOrders]);

  // Filter orders based on search term
  const filteredOrders = orders.filter(order => {
    if (!options.searchTerm) return true;
    
    const searchLower = options.searchTerm.toLowerCase();
    return (
      order.poNumber.toLowerCase().includes(searchLower) ||
      order.supplierName.toLowerCase().includes(searchLower) ||
      order.trackingNumber?.toLowerCase().includes(searchLower) ||
      order.contactPerson.toLowerCase().includes(searchLower)
    );
  });

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders: filteredOrders,
    loading,
    error,
    refreshing,
    refreshOrders,
    refreshOrder,
    updateOrderTracking,
  };
} 