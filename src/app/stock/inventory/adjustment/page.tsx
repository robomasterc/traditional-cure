'use client';

import React, { useState, useMemo } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
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
  Plus, 
  AlertTriangle,
  Package,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { useInventory } from '@/hooks/useInventory';
import { useStockAdjustments } from '@/hooks/useStockAdjustments';
import { toast } from 'sonner';

export default function StockAdjustmentPage() {
  const { inventory, loading: inventoryLoading, error: inventoryError, refetch } = useInventory();
  const { adjustments, loading: adjustmentsLoading, error: adjustmentsError, createAdjustment, fetchAdjustments } = useStockAdjustments();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [reasonFilter, setReasonFilter] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [adjustmentQuantity, setAdjustmentQuantity] = useState<string>('');
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [showAdjustmentForm, setShowAdjustmentForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Get the selected inventory item
  const selectedInventoryItem = useMemo(() => {
    return inventory.find(item => item.id === selectedItem);
  }, [inventory, selectedItem]);

  // Filter adjustments based on search and filters
  const filteredAdjustments = useMemo(() => {
    let filtered = adjustments;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(adjustment =>
        adjustment.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        adjustment.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
        adjustment.adjustedBy.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Reason filter
    if (reasonFilter !== 'all') {
      filtered = filtered.filter(adjustment => adjustment.reason === reasonFilter);
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [adjustments, searchTerm, reasonFilter]);

  const getAdjustmentIcon = (reason : string) => {
    return getAdjustmentDirection(reason) === 'decrease' ? (
      <TrendingDown className="h-4 w-4 text-red-600" />
    ) : (
      <TrendingUp className="h-4 w-4 text-green-600" />
    );
  };

  const getAdjustmentBadge = (adjustment: number) => {
    return adjustment > 0 ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        +{adjustment}
      </Badge>
    ) : (
      <Badge variant="destructive">
        {adjustment}
      </Badge>
    );
  };

  const getAdjustmentDirection = (reason: string) => {
    const negativeReasons = ['damage', 'theft', 'expiry', 'quality control -', 'system error -', 'other -'];
    const isNegative = negativeReasons.some(negativeReason => 
      reason.toLowerCase().includes(negativeReason)
    );
    return isNegative ? 'decrease' : 'increase';
  };

  const handleSaveAdjustment = async () => {
    if (!selectedItem || !adjustmentQuantity || !selectedReason) {
      toast.error('Please fill in all required fields');
      return;
    }

    const quantity = Number(adjustmentQuantity);
    if (isNaN(quantity) || quantity <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    if (!selectedInventoryItem) {
      toast.error('Selected item not found');
      return;
    }

    setIsSaving(true);

    try {
      // Determine adjustment direction based on reason
      const adjustmentDirection = getAdjustmentDirection(selectedReason);
      const adjustment = adjustmentDirection === 'decrease' ? -quantity : quantity;

      // Create adjustment using the hook
      await createAdjustment({
        itemId: selectedInventoryItem.id,
        itemName: selectedInventoryItem.name,
        quantity,
        unitPrice: selectedInventoryItem.costPrice || 0,
        total: (selectedInventoryItem.costPrice || 0) * quantity,
        adjustment,
        reason: selectedReason,
        date: new Date().toISOString().split('T')[0],
        adjustedBy: 'Current User', // Will be set by API
        notes: notes || undefined,
      });

      // Reset form
      setSelectedItem('');
      setAdjustmentQuantity('');
      setSelectedReason('');
      setNotes('');
      setShowAdjustmentForm(false);

      // Refresh inventory
      await refetch();

      const adjustmentValue = adjustmentDirection === 'decrease' ? -quantity : quantity;
      toast.success(`Stock adjusted successfully. ${adjustmentValue > 0 ? '+' : ''}${adjustmentValue} ${selectedInventoryItem.unit}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast.error(errorMessage);
      console.error('Error saving adjustment:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const reasons = [
    'Damage',
    'Found',
    'Theft',
    'Expiry',
    // 'Quality Control +',
    // 'Quality Control -',
    // 'System Error +',
    // 'System Error -',
    'Other +',
    'Other -'
  ];

  if (inventoryLoading || adjustmentsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          <span className="text-lg">Loading...</span>
        </div>
      </div>
    );
  }

  if (inventoryError || adjustmentsError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{inventoryError || adjustmentsError}</p>
          <Button onClick={refetch} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 text-gray-700">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Stock Adjustment</h1>
          <p className="text-gray-600 mt-1">Adjust stock quantities</p>
        </div>
        <Button onClick={() => setShowAdjustmentForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Adjustment
        </Button>
      </div>

      {/* Quick Adjustment Form */}
      {showAdjustmentForm && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Stock Adjustment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Select Item</label>
                  <Select value={selectedItem} onValueChange={setSelectedItem}>
                    <SelectTrigger className="text-gray-700 bg-white">
                      <SelectValue placeholder="Choose item" />
                    </SelectTrigger>
                    <SelectContent className="text-gray-700 bg-white">
                      {inventory.map(item => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name} (Current: {item.stock} {item.unit})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Adjustment Quantity</label>
                  <Input
                    type="number"
                    placeholder="Enter quantity to adjust"
                    value={adjustmentQuantity}
                    onChange={(e) => setAdjustmentQuantity(e.target.value)}
                    min="0"
                    step="0.01"
                  />
                  {selectedInventoryItem && (
                    <div className="text-sm text-gray-500 mt-1">
                      Current: {selectedInventoryItem.stock} {selectedInventoryItem.unit}
                      {adjustmentQuantity && selectedReason && (
                        <span className={`ml-2 ${getAdjustmentDirection(selectedReason) === 'decrease' ? 'text-red-600' : 'text-green-600'}`}>
                          ({getAdjustmentDirection(selectedReason) === 'decrease' ? '-' : '+'}{adjustmentQuantity})
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Reason</label>
                  <Select value={selectedReason} onValueChange={setSelectedReason}>
                    <SelectTrigger className="text-gray-700 bg-white">
                      <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
                    <SelectContent className="text-gray-700 bg-white">
                      {reasons.map(reason => (
                        <SelectItem key={reason} value={reason}>
                          {reason}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Notes (Optional)</label>
                <Textarea
                  placeholder="Add any additional notes about this adjustment..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Button 
                  className="flex-1" 
                  onClick={handleSaveAdjustment}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Adjustment'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowAdjustmentForm(false);
                    setSelectedItem('');
                    setAdjustmentQuantity('');
                    setSelectedReason('');
                    setNotes('');
                  }}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by item, reason, or adjusted by..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Reason</label>
              <Select value={reasonFilter} onValueChange={setReasonFilter}>
                <SelectTrigger className="text-gray-700 bg-white">
                  <SelectValue placeholder="All reasons" />
                </SelectTrigger>
                <SelectContent className="text-gray-700 bg-white">
                  <SelectItem value="all">All Reasons</SelectItem>
                  {reasons.map(reason => (
                    <SelectItem key={reason} value={reason}>
                      {reason}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">End Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div className="flex items-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setReasonFilter('all');
                  setStartDate('');
                  setEndDate('');
                }}
                className="flex-1"
              >
                Clear Filters
              </Button>
              <Button 
                onClick={() => {
                  if (startDate && endDate) {
                    fetchAdjustments(startDate, endDate);
                  }
                }}
                disabled={!startDate || !endDate}
              >
                Apply Date Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Showing {filteredAdjustments.length} of {adjustments.length} adjustments
        </p>
        <div className="flex space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span>Positive: {adjustments.filter(a => a.adjustment > 0).length}</span>
          </div>
          <div className="flex items-center space-x-2">
            <TrendingDown className="h-4 w-4 text-red-600" />
            <span>Negative: {adjustments.filter(a => a.adjustment < 0).length}</span>
          </div>
        </div>
      </div>

      {/* Adjustments Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Adjustment</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Adjusted By</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAdjustments.map((adjustment) => (
                <TableRow key={adjustment.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{adjustment.itemName}</div>
                      <div className="text-sm text-gray-500">{adjustment.itemId}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getAdjustmentIcon(adjustment.reason)}
                      {getAdjustmentBadge(adjustment.adjustment)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">${adjustment.unitPrice.toFixed(2)}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">${adjustment.total.toFixed(2)}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize text-gray-700">
                      {adjustment.reason}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{adjustment.adjustedBy}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(adjustment.date).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-500 max-w-xs truncate">
                      {adjustment.notes || '-'}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredAdjustments.length === 0 && (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No stock adjustments found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 