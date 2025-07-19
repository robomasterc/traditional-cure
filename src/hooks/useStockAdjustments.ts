import { useState, useEffect, useCallback } from 'react';

export interface StockAdjustment {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  adjustment: number;
  reason: string;
  date: string;
  adjustedBy: string;
  notes?: string;
}

export function useStockAdjustments() {
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAdjustments = useCallback(async (startDate?: string, endDate?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const response = await fetch(`/api/stock/adjustments?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch stock adjustments');
      }
      
      const data = await response.json();
      setAdjustments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  const createAdjustment = useCallback(async (adjustment: Omit<StockAdjustment, 'id'>) => {
    try {
      const response = await fetch('/api/stock/adjustments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adjustment),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create adjustment');
      }

      const newAdjustment = await response.json();
      setAdjustments(prev => [newAdjustment, ...prev]);
      return newAdjustment;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  }, []);

  useEffect(() => {
    // Default to last 30 days
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    fetchAdjustments(startDate, endDate);
  }, [fetchAdjustments]);

  return {
    adjustments,
    loading,
    error,
    fetchAdjustments,
    createAdjustment,
  };
} 