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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  AlertTriangle,
  XCircle,
  Clock,
  Package
} from 'lucide-react';
import { useInventory } from '@/hooks/useInventory';
import AddInventoryPage from '../add/page';

export default function AllInventoryPage() {
  const { inventory, loading, error, refetch } = useInventory();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Filter inventory based on search and filters
  const filteredInventory = useMemo(() => {
    let filtered = inventory;

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

    // Stock filter
    if (stockFilter === 'low') {
      filtered = filtered.filter(item => item.stock <= item.reorderLevel && item.stock > 0);
    } else if (stockFilter === 'out') {
      filtered = filtered.filter(item => item.stock === 0);
    } else if (stockFilter === 'normal') {
      filtered = filtered.filter(item => item.stock > item.reorderLevel);
    }

    return filtered;
  }, [inventory, searchTerm, categoryFilter, stockFilter]);

  const getStockStatus = (item: any) => {
    if (item.stock === 0) {
      return { status: 'out', label: 'Out of Stock', color: 'destructive' as const };
    } else if (item.stock <= item.reorderLevel) {
      return { status: 'low', label: 'Low Stock', color: 'secondary' as const };
    } else {
      return { status: 'normal', label: 'In Stock', color: 'default' as const };
    }
  };

  const getExpiryStatus = (item: any) => {
    const now = new Date();
    const expiryDate = new Date(item.expiryDate);
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) {
      return { status: 'expired', label: 'Expired', color: 'destructive' as const };
    } else if (daysUntilExpiry <= 30) {
      return { status: 'expiring', label: `${daysUntilExpiry} days`, color: 'secondary' as const };
    } else {
      return { status: 'valid', label: 'Valid', color: 'default' as const };
    }
  };

  const categories = Array.from(new Set(inventory.map(item => item.category)));

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
          <h1 className="text-3xl font-bold text-gray-900">All Inventory Items</h1>
          <p className="text-gray-600 mt-1">Manage and monitor all inventory items</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add New Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Inventory Item</DialogTitle>
            </DialogHeader>
            <div className="p-0">
              <AddInventoryPage 
                isDialog={true}
                onSuccess={() => {
                  setIsAddDialogOpen(false);
                  refetch();
                }}
                onCancel={() => {
                  setIsAddDialogOpen(false);
                }}
              />
            </div>
          </DialogContent>
        </Dialog>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <label className="text-sm font-medium text-gray-700 mb-2 block">Stock Status</label>
              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger className="text-gray-700 bg-white">
                  <SelectValue placeholder="All stock levels" />
                </SelectTrigger>
                <SelectContent className="text-gray-700 bg-white">
                  <SelectItem value="all">All Stock Levels</SelectItem>
                  <SelectItem value="normal">Normal Stock</SelectItem>
                  <SelectItem value="low">Low Stock</SelectItem>
                  <SelectItem value="out">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Showing {filteredInventory.length} of {inventory.length} items
        </p>
        <Button variant="outline" onClick={refetch}>
          Refresh
        </Button>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInventory.map((item) => {
                const stockStatus = getStockStatus(item);
                const expiryStatus = getExpiryStatus(item);
                const totalValue = item.stock * item.sellingPrice;

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
                      <div>
                        <div className="font-medium">
                          {item.stock} {item.unit}
                        </div>
                        <div className="text-sm text-gray-500">
                          Reorder: {item.reorderLevel}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">₹{item.sellingPrice}</div>
                        <div className="text-sm text-gray-500">
                          Cost: ₹{item.costPrice}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">₹{totalValue.toLocaleString()}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={stockStatus.color}>
                        {stockStatus.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={expiryStatus.color}>
                        {expiryStatus.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          {filteredInventory.length === 0 && (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No inventory items found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 