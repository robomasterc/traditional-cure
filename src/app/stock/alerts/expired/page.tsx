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
  X,
  AlertTriangle,
  Package,
  RefreshCw,
  Trash2,
  TrendingDown
} from 'lucide-react';
import { useInventory } from '@/hooks/useInventory';

export default function ExpiredItemsPage() {
  const { inventory, loading, error, refetch } = useInventory();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [disposalFilter, setDisposalFilter] = useState<string>('all');

  // Filter expired items
  const expiredItems = useMemo(() => {
    const now = new Date();

    let filtered = inventory.filter(item => {
      if (!item.expiryDate) return false;
      const itemExpiry = new Date(item.expiryDate);
      return itemExpiry < now && item.stock > 0;
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

    // Disposal filter
    if (disposalFilter === 'disposed') {
      // This would typically filter by disposal status from a separate field
      // For now, we'll show all expired items
    }

    return filtered.sort((a, b) => {
      const aExpiry = new Date(a.expiryDate);
      const bExpiry = new Date(b.expiryDate);
      return aExpiry.getTime() - bExpiry.getTime();
    });
  }, [inventory, searchTerm, categoryFilter, disposalFilter]);

  const categories = Array.from(new Set(inventory.map(item => item.category)));

  const getDaysSinceExpiry = (expiryDate: string) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = now.getTime() - expiry.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpirySeverity = (daysSinceExpiry: number) => {
    if (daysSinceExpiry <= 7) {
      return { status: 'recent', label: 'Recent', color: 'secondary' as const };
    } else if (daysSinceExpiry <= 30) {
      return { status: 'moderate', label: 'Moderate', color: 'default' as const };
    } else {
      return { status: 'old', label: 'Old', color: 'destructive' as const };
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
          <h1 className="text-3xl font-bold text-gray-900">Expired Items</h1>
          <p className="text-gray-600 mt-1">Expired inventory items</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={refetch}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            Dispose All
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <X className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">Total Expired</p>
                <p className="text-2xl font-bold text-red-600">{expiredItems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Value Lost</p>
                <p className="text-2xl font-bold text-orange-600">
                  ₹{expiredItems.reduce((sum, item) => sum + (item.stock * item.sellingPrice), 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Recent (≤7 days)</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {expiredItems.filter(item => getDaysSinceExpiry(item.expiryDate) <= 7).length}
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
                <p className="text-sm text-gray-600">Categories Affected</p>
                <p className="text-2xl font-bold text-blue-600">
                  {new Set(expiredItems.map(item => item.category)).size}
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
              <label className="text-sm font-medium text-gray-700 mb-2 block">Disposal Status</label>
              <Select value={disposalFilter} onValueChange={setDisposalFilter}>
                <SelectTrigger className="text-gray-700 bg-white">
                  <SelectValue placeholder="All items" />
                </SelectTrigger>
                <SelectContent className="text-gray-700 bg-white">
                  <SelectItem value="all">All Items</SelectItem>
                  <SelectItem value="pending">Pending Disposal</SelectItem>
                  <SelectItem value="disposed">Disposed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('all');
                  setDisposalFilter('all');
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
          Showing {expiredItems.length} expired items
        </p>
        <div className="flex space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <X className="h-4 w-4 text-red-600" />
            <span>Expired: {expiredItems.length}</span>
          </div>
        </div>
      </div>

      {/* Expired Items Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Expired Stock</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Days Expired</TableHead>
                <TableHead>Value Lost</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expiredItems.map((item) => {
                const daysExpired = getDaysSinceExpiry(item.expiryDate);
                const severity = getExpirySeverity(daysExpired);
                const valueLost = item.stock * item.sellingPrice;

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
                      <div className="font-medium text-red-600">
                        {item.stock} {item.unit}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(item.expiryDate).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-red-600">
                        {daysExpired} days
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-red-600">
                        ₹{valueLost.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={severity.color}>
                        {severity.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" className="text-red-600">
                          <Trash2 className="h-4 w-4" />
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
          
          {expiredItems.length === 0 && (
            <div className="text-center py-8">
              <X className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-gray-500">No expired items found</p>
              <p className="text-sm text-gray-400 mt-1">All items are within expiry dates!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 