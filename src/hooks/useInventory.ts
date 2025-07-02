'use client';
import { useState, useEffect, useCallback } from 'react';

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Herb' | 'Oil' | 'Powder' | 'Tablet' | 'Liquid';
  stock: number;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  supplierId: string;
  expiryDate: Date;
  reorderLevel: number;
  batchNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

interface UseInventoryReturn {
  inventory: InventoryItem[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getMedicineById: (id: string) => InventoryItem | undefined;
  getMedicinesByCategory: (category: string) => InventoryItem[];
  getAvailableMedicines: () => InventoryItem[];
}

export function useInventory(): UseInventoryReturn {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<number>(0);
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/inventory');
      if (!response.ok) {
        throw new Error('Failed to fetch inventory');
      }
      
      const data = await response.json() as InventoryItem[];
      setInventory(data);
      setLastFetch(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    await fetchInventory();
  }, [fetchInventory]);

  useEffect(() => {
    const shouldFetch = inventory.length === 0 || (Date.now() - lastFetch) > CACHE_DURATION;
    if (shouldFetch) {
      fetchInventory();
    }
  }, [fetchInventory, inventory.length, lastFetch, CACHE_DURATION]);

  const getMedicineById = useCallback((id: string): InventoryItem | undefined => {
    return inventory.find(item => item.id === id);
  }, [inventory]);

  const getMedicinesByCategory = useCallback((category: string): InventoryItem[] => {
    return inventory.filter(item => item.category === category);
  }, [inventory]);

  const getAvailableMedicines = useCallback((): InventoryItem[] => {
    return inventory.filter(item => item.stock > 0);
  }, [inventory]);

  return {
    inventory,
    loading,
    error,
    refetch,
    getMedicineById,
    getMedicinesByCategory,
    getAvailableMedicines,
  };
} 