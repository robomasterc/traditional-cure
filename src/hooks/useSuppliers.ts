import { useState, useEffect, useCallback } from 'react';

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
  address: string;
  speciality: string;
}

interface UseSuppliersReturn {
  suppliers: Supplier[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getSupplierById: (id: string) => Supplier | undefined;
  getSuppliersBySpeciality: (speciality: string) => Supplier[];
}

export function useSuppliers(): UseSuppliersReturn {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<number>(0);
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  const fetchSuppliers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/suppliers');
      if (!response.ok) {
        throw new Error('Failed to fetch suppliers');
      }
      
      const data = await response.json() as Supplier[];
      setSuppliers(data);
      setLastFetch(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching suppliers:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    await fetchSuppliers();
  }, [fetchSuppliers]);

  useEffect(() => {
    const shouldFetch = suppliers.length === 0 || (Date.now() - lastFetch) > CACHE_DURATION;
    if (shouldFetch) {
      fetchSuppliers();
    }
  }, [fetchSuppliers, suppliers.length, lastFetch, CACHE_DURATION]);

  const getSupplierById = useCallback((id: string): Supplier | undefined => {
    return suppliers.find(supplier => supplier.id === id);
  }, [suppliers]);

  const getSuppliersBySpeciality = useCallback((speciality: string): Supplier[] => {
    return suppliers.filter(supplier => supplier.speciality === speciality);
  }, [suppliers]);

  return {
    suppliers,
    loading,
    error,
    refetch,
    getSupplierById,
    getSuppliersBySpeciality,
  };
} 