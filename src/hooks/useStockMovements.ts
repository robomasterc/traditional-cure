import { useState, useEffect, useCallback } from 'react';

interface StockMovement {
  id: string;
  itemId: string;
  itemName: string;
  type: 'IN' | 'OUT';
  quantity: number;
  reason: string;
  date: string;
  reference: string;
  notes?: string;
}

interface NetStockMovement {
  itemId: string;
  itemName: string;
  totalStockIn: number;
  totalStockOut: number;
  netMovement: number;
  movementCount: number;
  lastMovementDate: string;
  averageMonthlyMovement: number;
}

interface StockMovementsParams {
  date?: string;
  startDate?: string;
  endDate?: string;
  groupBy?: 'date' | 'medicine';
}

export function useStockMovements() {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [netMovements, setNetMovements] = useState<NetStockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'date' | 'medicine'>('date');

  const fetchMovements = useCallback(async (params: StockMovementsParams = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const { date, startDate, endDate, groupBy = 'date' } = params;
      
      // Build query parameters
      const queryParams = new URLSearchParams();
      if (date) queryParams.append('date', date);
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);
      if (groupBy) queryParams.append('groupBy', groupBy);
      
      const apiUrl = `/api/stock/movements?${queryParams.toString()}`;
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch stock movements: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (groupBy === 'medicine') {
        setNetMovements(data);
        setMovements([]);
        setViewMode('medicine');
      } else {
        setMovements(data);
        setNetMovements([]);
        setViewMode('date');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setMovements([]);
      setNetMovements([]);
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array - function will be stable

  const getMovementsByDate = useCallback((date: string) => {
    return fetchMovements({ date, groupBy: 'date' });
  }, [fetchMovements]);

  const getMovementsByDateRange = useCallback((startDate: string, endDate: string) => {
    return fetchMovements({ startDate, endDate, groupBy: 'date' });
  }, [fetchMovements]);

  const getNetMovementsByMedicine = useCallback((startDate?: string, endDate?: string) => {
    return fetchMovements({ startDate, endDate, groupBy: 'medicine' });
  }, [fetchMovements]);

  const getTodayMovements = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return fetchMovements({ date: today, groupBy: 'date' });
  }, [fetchMovements]);

  const getLast1MonthsNetMovements = useCallback(() => {
    return fetchMovements({ groupBy: 'medicine' });
  }, [fetchMovements]);

  // Get summary statistics
  const getSummary = useCallback(() => {
    if (viewMode === 'medicine') {
      const totalStockIn = netMovements.reduce((sum, m) => sum + m.totalStockIn, 0);
      const totalStockOut = netMovements.reduce((sum, m) => sum + m.totalStockOut, 0);
      
      return {
        totalMedicines: netMovements.length,
        totalStockIn,
        totalStockOut,
        netMovement: totalStockIn - totalStockOut,
        averageNetMovement: netMovements.length > 0 ? (totalStockIn - totalStockOut) / netMovements.length : 0
      };
    } else {
      const stockIn = movements.filter(m => m.type === 'IN');
      const stockOut = movements.filter(m => m.type === 'OUT');
      
      const totalStockIn = stockIn.reduce((sum, m) => sum + m.quantity, 0);
      const totalStockOut = stockOut.reduce((sum, m) => sum + m.quantity, 0);
      
      return {
        totalMovements: movements.length,
        stockInCount: stockIn.length,
        stockOutCount: stockOut.length,
        totalStockIn,
        totalStockOut,
        netMovement: totalStockIn - totalStockOut
      };
    }
  }, [movements, netMovements, viewMode]);

  return {
    movements,
    netMovements,
    loading,
    error,
    viewMode,
    fetchMovements,
    getMovementsByDate,
    getMovementsByDateRange,
    getNetMovementsByMedicine,
    getTodayMovements,
    getLast1MonthsNetMovements,
    getSummary,
    setViewMode
  };
} 