'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Search, 
  Filter, 
  ArrowUp,
  ArrowDown,
  Calendar,
  Package,
  Loader2,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { useStockMovements } from '@/hooks/useStockMovements';

export default function StockMovementsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const initialLoadDone = useRef(false);

  const { 
    movements, 
    netMovements,
    viewMode,
    setViewMode,
    loading, 
    error, 
    // fetchMovements, 
    getMovementsByDate,
    getMovementsByDateRange,
    getNetMovementsByMedicine,
    getLast1MonthsNetMovements,
    getSummary
  } = useStockMovements();

  // Set default date range (last 30 months) and fetch net movements by medicine
  useEffect(() => {
    if (!initialLoadDone.current) {
      const today = new Date();
      const oneMonthsAgo = new Date();
      oneMonthsAgo.setMonth(today.getMonth() - 1);
      
      const defaultStartDate = oneMonthsAgo.toISOString().split('T')[0];
      const defaultEndDate = today.toISOString().split('T')[0];
      
      setStartDate(defaultStartDate);
      setEndDate(defaultEndDate);
      setDateFilter(defaultEndDate);
      
      getLast1MonthsNetMovements();
      initialLoadDone.current = true;
    }
  }, [getLast1MonthsNetMovements]);

  // Filter movements based on search and filters
  const filteredMovements = useMemo(() => {
    let filtered = movements;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(movement =>
        movement.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movement.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movement.reason.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(movement => movement.type === typeFilter);
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [movements, searchTerm, typeFilter]);

  // Filter net movements based on search
  const filteredNetMovements = useMemo(() => {
    let filtered = netMovements;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(movement =>
        movement.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movement.itemId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [netMovements, searchTerm]);

  const getMovementIcon = (type: 'IN' | 'OUT') => {
    return type === 'IN' ? (
      <ArrowUp className="h-4 w-4 text-green-600" />
    ) : (
      <ArrowDown className="h-4 w-4 text-red-600" />
    );
  };

  const getMovementBadge = (type: 'IN' | 'OUT') => {
    return type === 'IN' ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        Stock In
      </Badge>
    ) : (
      <Badge variant="destructive">
        Stock Out
      </Badge>
    );
  };

  const getNetMovementBadge = (netMovement: number) => {
    if (netMovement > 0) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Net Gain</Badge>;
    } else if (netMovement < 0) {
      return <Badge variant="destructive">Net Loss</Badge>;
    } else {
      return <Badge variant="outline">Balanced</Badge>;
    }
  };

  const handleDateChange = (newDate: string) => {
    setDateFilter(newDate);
    getMovementsByDate(newDate);
    setViewMode('date');
  };

  const handleDateRangeChange = () => {
    if (startDate && endDate) {
      if (viewMode === 'medicine') {
        getNetMovementsByMedicine(startDate, endDate);
      } else {
        getMovementsByDateRange(startDate, endDate);
      }
    }
  };

  const handleViewModeChange = (mode: 'date' | 'medicine') => {
    setViewMode(mode);
    if (mode === 'medicine') {
      if (startDate && endDate) {
        getNetMovementsByMedicine(startDate, endDate);
      } else {
        getLast1MonthsNetMovements();
      }
    } else {
      if (dateFilter) {
        getMovementsByDate(dateFilter);
      } else {
        getMovementsByDateRange(startDate, endDate);
      }
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    const today = new Date().toISOString().split('T')[0];
    setDateFilter(today);
    getMovementsByDate(today);
    setViewMode('date');
  };

  const summary = getSummary();

  return (
    <div className="space-y-6 p-6 text-gray-700">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Stock Movements</h1>
          <p className="text-gray-600 mt-1">
            {viewMode === 'medicine' 
              ? 'Net stock movement per medicine for selected time range' 
              : 'Track inventory ins and outs from invoices and orders'
            }
          </p>
        </div>
        {/* <div className="flex space-x-2">
          <Button variant="outline" onClick={handleDebugClick}>
            🐛 Debug
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Record Movement
          </Button>
        </div> */}
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">Error: {error}</p>
          </CardContent>
        </Card>
      )}

      {/* View Mode Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            View Mode
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Button
              variant={viewMode === 'medicine' ? 'default' : 'outline'}
              onClick={() => handleViewModeChange('medicine')}
              className="flex items-center space-x-2"
            >
              <TrendingUp className="h-4 w-4" />
              <span>Net by Medicine</span>
            </Button>
            <Button
              variant={viewMode === 'date' ? 'default' : 'outline'}
              onClick={() => handleViewModeChange('date')}
              className="flex items-center space-x-2"
            >
              <Calendar className="h-4 w-4" />
              <span>By Date</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={viewMode === 'medicine' ? "Search by medicine name..." : "Search by item, reference, or reason..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {viewMode === 'date' && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Movement Type</label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="text-gray-700 bg-white">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent className="text-gray-700 bg-white">
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="IN">Stock In</SelectItem>
                    <SelectItem value="OUT">Stock Out</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {viewMode === 'date' ? (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Start Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            )}

            {viewMode === 'medicine' && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">End Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            )}

            <div className="flex items-end space-x-2">
              {viewMode === 'medicine' && (
                <Button 
                  variant="outline" 
                  onClick={handleDateRangeChange}
                  className="flex-1"
                >
                  Apply Range
                </Button>
              )}
              <Button 
                variant="outline" 
                onClick={handleClearFilters}
                className="flex-1"
              >
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          {viewMode === 'medicine' 
            ? `Showing ${filteredNetMovements.length} of ${netMovements.length} medicines for ${startDate} to ${endDate}`
            : `Showing ${filteredMovements.length} of ${movements.length} movements for ${dateFilter}`
          }
        </p>
        <div className="flex space-x-4 text-sm">
          {viewMode === 'medicine' ? (
            <>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span>Total Stock In: {summary.totalStockIn} units</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingDown className="h-4 w-4 text-red-600" />
                <span>Total Stock Out: {summary.totalStockOut} units</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`font-medium ${summary.netMovement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  Net: {summary.netMovement >= 0 ? '+' : ''}{summary.netMovement} units
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center space-x-2">
                <ArrowUp className="h-4 w-4 text-green-600" />
                <span>Stock In: {summary.stockInCount} ({summary.totalStockIn} units)</span>
              </div>
              <div className="flex items-center space-x-2">
                <ArrowDown className="h-4 w-4 text-red-600" />
                <span>Stock Out: {summary.stockOutCount} ({summary.totalStockOut} units)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`font-medium ${summary.netMovement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  Net: {summary.netMovement >= 0 ? '+' : ''}{summary.netMovement} units
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Movements Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 text-gray-400 mx-auto mb-4 animate-spin" />
              <p className="text-gray-500">Loading stock movements...</p>
            </div>
          ) : (
            <>
              {viewMode === 'medicine' ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Medicine</TableHead>
                      <TableHead>Total Stock In</TableHead>
                      <TableHead>Total Stock Out</TableHead>
                      <TableHead>Net Movement</TableHead>
                      <TableHead>Movement Count</TableHead>
                      <TableHead>Avg Monthly</TableHead>
                      <TableHead>Last Movement</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredNetMovements.map((movement) => (
                      <TableRow key={movement.itemId}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{movement.itemName}</div>
                            <div className="text-sm text-gray-500">{movement.itemId}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <ArrowUp className="h-4 w-4 text-green-600" />
                            <span className="font-medium">{movement.totalStockIn}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <ArrowDown className="h-4 w-4 text-red-600" />
                            <span className="font-medium">{movement.totalStockOut}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getNetMovementBadge(movement.netMovement)}
                            <span className={`font-medium ${movement.netMovement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {movement.netMovement >= 0 ? '+' : ''}{movement.netMovement}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{movement.movementCount}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{movement.averageMonthlyMovement.toFixed(1)}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(movement.lastMovementDate).toLocaleDateString()}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMovements.map((movement) => (
                      <TableRow key={movement.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{movement.itemName}</div>
                            <div className="text-sm text-gray-500">{movement.itemId}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getMovementIcon(movement.type)}
                            {getMovementBadge(movement.type)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {movement.type === 'IN' ? '+' : '-'}{movement.quantity}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize text-gray-700">
                            {movement.reason}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{movement.reference}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(movement.date).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {movement.notes || '-'}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              
              {((viewMode === 'medicine' && filteredNetMovements.length === 0) || 
                (viewMode === 'date' && filteredMovements.length === 0)) && !loading && (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {viewMode === 'medicine' 
                      ? `No net movements found for ${startDate} to ${endDate}`
                      : `No stock movements found for ${dateFilter}`
                    }
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 