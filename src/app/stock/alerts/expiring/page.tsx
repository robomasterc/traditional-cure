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
  Clock,
  AlertTriangle,
  Package,
  RefreshCw,
  TrendingDown,
  Calendar
} from 'lucide-react';
import { useInventory } from '@/hooks/useInventory';

export default function ExpiringSoonPage() {
  const { inventory, loading, error, refetch } = useInventory();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [timeframeFilter, setTimeframeFilter] = useState<string>('30');

  // Filter items expiring soon
  const expiringItems = useMemo(() => {
    const now = new Date();
    const daysToExpiry = parseInt(timeframeFilter);
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + daysToExpiry);

    let filtered = inventory.filter(item => {
      if (!item.expiryDate) return false;
      const itemExpiry = new Date(item.expiryDate);
      return itemExpiry <= expiryDate && itemExpiry >= now && item.stock > 0;
    });

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    return filtered.sort((a, b) => {
      const aExpiry = new Date(a.expiryDate);
      const bExpiry = new Date(b.expiryDate);
      return aExpiry.getTime() - bExpiry.getTime();
    });
  }, [inventory, searchTerm, categoryFilter, timeframeFilter]);

  const categories = Array.from(new Set(inventory.map(item => item.category)));

  const getDaysUntilExpiry = (expiryDate: string) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpiryStatus = (daysUntilExpiry: number) => {
    if (daysUntilExpiry <= 7) {
      return { status: 'critical', label: 'Critical', color: 'destructive' as const };
    } else if (daysUntilExpiry <= 15) {
      return { status: 'warning', label: 'Warning', color: 'secondary' as const };
    } else {
      return { status: 'notice', label: 'Notice', color: 'default' as const };
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Expiring Soon</h1>
          <p className="text-gray-600 mt-1">Items nearing expiry date</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={refetch}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Clock className="h-4 w-4 mr-2" />
            Manage Expiry
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Expiring Soon</p>
                <p className="text-2xl font-bold text-orange-600">{expiringItems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">Critical (≤7 days)</p>
                <p className="text-2xl font-bold text-red-600">
                  {expiringItems.filter(item => getDaysUntilExpiry(item.expiryDate.toISOString()) <= 7).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Warning (≤15 days)</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {expiringItems.filter(item => {
                    const days = getDaysUntilExpiry(item.expiryDate.toISOString());
                    return days > 7 && days <= 15;
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-blue-600">
                  ₹{expiringItems.reduce((sum, item) => sum + (item.stock * item.sellingPrice), 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
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
                  placeholder="Search by name, ID, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="text-gray-700 bg-white">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent className="text-gray-700 bg-white">
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Timeframe</label>
              <Select value={timeframeFilter} onValueChange={setTimeframeFilter}>
                <SelectTrigger className="text-gray-700 bg-white">
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent className="text-gray-700 bg-white">
                  <SelectItem value="7">Next 7 days</SelectItem>
                  <SelectItem value="15">Next 15 days</SelectItem>
                  <SelectItem value="30">Next 30 days</SelectItem>
                  <SelectItem value="60">Next 60 days</SelectItem>
                  <SelectItem value="90">Next 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('all');
                  setTimeframeFilter('30');
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
          Showing {expiringItems.length} items expiring in the next {timeframeFilter} days
        </p>
        <div className="flex space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-orange-600" />
            <span>Expiring Soon: {expiringItems.length}</span>
          </div>
        </div>
      </div>

      {/* Expiring Items Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Days Left</TableHead>
                <TableHead>Value at Risk</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expiringItems.map((item) => {
                const daysLeft = getDaysUntilExpiry(item.expiryDate.toISOString());
                const status = getExpiryStatus(daysLeft);
                const valueAtRisk = item.stock * item.sellingPrice;

                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-500">{item.id}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize text-gray-700">
                        {item.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {item.stock} {item.unit}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(item.expiryDate).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {daysLeft} days
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-red-600">
                        ₹{valueAtRisk.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={status.color}>
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <Calendar className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          {expiringItems.length === 0 && (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-gray-500">No items expiring soon</p>
              <p className="text-sm text-gray-400 mt-1">All items have good expiry dates!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 