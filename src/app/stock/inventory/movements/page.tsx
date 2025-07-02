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
  ArrowUp,
  ArrowDown,
  Calendar,
  Package
} from 'lucide-react';

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

export default function StockMovementsPage() {
  const [movements] = useState<StockMovement[]>([
    {
      id: 'MOV001',
      itemId: 'INV001',
      itemName: 'Ashwagandha',
      type: 'IN',
      quantity: 50,
      reason: 'Purchase',
      date: '2024-01-15',
      reference: 'PO-2024-001',
      notes: 'New stock received'
    },
    {
      id: 'MOV002',
      itemId: 'INV002',
      itemName: 'Brahmi',
      type: 'OUT',
      quantity: 10,
      reason: 'Sale',
      date: '2024-01-16',
      reference: 'INV-2024-001',
      notes: 'Sold to patient'
    }
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');

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

    // Date filter
    if (dateFilter) {
      filtered = filtered.filter(movement => movement.date === dateFilter);
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [movements, searchTerm, typeFilter, dateFilter]);

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

  return (
    <div className="space-y-6 p-6 text-gray-700">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Stock Movements</h1>
          <p className="text-gray-600 mt-1">Track inventory ins and outs</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Record Movement
        </Button>
      </div>

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
                  placeholder="Search by item, reference, or reason..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
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

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setTypeFilter('all');
                  setDateFilter('');
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
          Showing {filteredMovements.length} of {movements.length} movements
        </p>
        <div className="flex space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <ArrowUp className="h-4 w-4 text-green-600" />
            <span>Stock In: {movements.filter(m => m.type === 'IN').length}</span>
          </div>
          <div className="flex items-center space-x-2">
            <ArrowDown className="h-4 w-4 text-red-600" />
            <span>Stock Out: {movements.filter(m => m.type === 'OUT').length}</span>
          </div>
        </div>
      </div>

      {/* Movements Table */}
      <Card>
        <CardContent className="p-0">
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
          
          {filteredMovements.length === 0 && (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No stock movements found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 