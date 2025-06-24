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
  Edit,
  AlertTriangle,
  CheckCircle,
  Package,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { useInventory } from '@/hooks/useInventory';

interface StockAdjustment {
  id: string;
  itemId: string;
  itemName: string;
  previousStock: number;
  newStock: number;
  adjustment: number;
  reason: string;
  date: string;
  adjustedBy: string;
  notes?: string;
}

export default function StockAdjustmentPage() {
  const { inventory, loading, error, refetch } = useInventory();
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>([
    {
      id: 'ADJ001',
      itemId: 'INV001',
      itemName: 'Ashwagandha',
      previousStock: 100,
      newStock: 95,
      adjustment: -5,
      reason: 'Damage',
      date: '2024-01-15',
      adjustedBy: 'John Doe',
      notes: 'Found damaged during inspection'
    },
    {
      id: 'ADJ002',
      itemId: 'INV002',
      itemName: 'Brahmi',
      previousStock: 50,
      newStock: 55,
      adjustment: 5,
      reason: 'Found',
      date: '2024-01-16',
      adjustedBy: 'Jane Smith',
      notes: 'Found extra stock in storage'
    }
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [reasonFilter, setReasonFilter] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [showAdjustmentForm, setShowAdjustmentForm] = useState(false);

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

  const getAdjustmentIcon = (adjustment: number) => {
    return adjustment > 0 ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
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

  const reasons = [
    'Damage',
    'Found',
    'Theft',
    'Expiry',
    'Quality Control',
    'System Error',
    'Other'
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          <span className="text-lg">Loading inventory...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Inventory</h2>
          <p className="text-gray-600 mb-4">{error}</p>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <label className="text-sm font-medium text-gray-700 mb-2 block">New Quantity</label>
                <Input
                  type="number"
                  placeholder="Enter new quantity"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Reason</label>
                <Select>
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

              <div className="flex items-end space-x-2">
                <Button className="flex-1">Save Adjustment</Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowAdjustmentForm(false)}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setReasonFilter('all');
                }}
                className="w-full"
              >
                Clear Filters
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
                <TableHead>Previous Stock</TableHead>
                <TableHead>New Stock</TableHead>
                <TableHead>Adjustment</TableHead>
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
                    <div className="font-medium">{adjustment.previousStock}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{adjustment.newStock}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getAdjustmentIcon(adjustment.adjustment)}
                      {getAdjustmentBadge(adjustment.adjustment)}
                    </div>
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