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
  Package,
  RefreshCw,
  Download,
  Eye,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  BarChart,
  PieChart,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

interface StockItem {
  id: string;
  name: string;
  code: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  totalValue: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Overstocked';
  lastUpdated: string;
  expiryDate?: string;
  supplier: string;
  location: string;
  reorderPoint: number;
  reorderQuantity: number;
}

export default function StockReportPage() {
  const [stockItems, setStockItems] = useState<StockItem[]>([
    {
      id: 'INV001',
      name: 'Ashwagandha',
      code: 'ASH001',
      category: 'Herbal Medicines',
      currentStock: 45,
      minStock: 20,
      maxStock: 100,
      unit: 'kg',
      costPrice: 500,
      sellingPrice: 750,
      totalValue: 22500,
      status: 'In Stock',
      lastUpdated: '2024-01-20T10:30:00Z',
      expiryDate: '2025-06-15',
      supplier: 'ABC Suppliers',
      location: 'Warehouse A - Shelf 1',
      reorderPoint: 25,
      reorderQuantity: 50
    },
    {
      id: 'INV002',
      name: 'Brahmi',
      code: 'BRH002',
      category: 'Herbal Medicines',
      currentStock: 15,
      minStock: 20,
      maxStock: 80,
      unit: 'kg',
      costPrice: 500,
      sellingPrice: 800,
      totalValue: 7500,
      status: 'Low Stock',
      lastUpdated: '2024-01-19T14:15:00Z',
      expiryDate: '2025-03-20',
      supplier: 'XYZ Pharmaceuticals',
      location: 'Warehouse A - Shelf 2',
      reorderPoint: 20,
      reorderQuantity: 40
    },
    {
      id: 'INV003',
      name: 'Ginseng',
      code: 'GIN003',
      category: 'Herbal Medicines',
      currentStock: 0,
      minStock: 10,
      maxStock: 50,
      unit: 'kg',
      costPrice: 1400,
      sellingPrice: 2100,
      totalValue: 0,
      status: 'Out of Stock',
      lastUpdated: '2024-01-18T16:45:00Z',
      expiryDate: '2024-12-31',
      supplier: 'MediCare Supplies',
      location: 'Warehouse B - Shelf 1',
      reorderPoint: 15,
      reorderQuantity: 25
    },
    {
      id: 'INV004',
      name: 'Turmeric',
      code: 'TUR004',
      category: 'Herbal Medicines',
      currentStock: 120,
      minStock: 30,
      maxStock: 100,
      unit: 'kg',
      costPrice: 500,
      sellingPrice: 750,
      totalValue: 60000,
      status: 'Overstocked',
      lastUpdated: '2024-01-20T09:20:00Z',
      expiryDate: '2025-08-10',
      supplier: 'HealthPlus Distributors',
      location: 'Warehouse A - Shelf 3',
      reorderPoint: 30,
      reorderQuantity: 60
    },
    {
      id: 'INV005',
      name: 'Ginger',
      code: 'GIN005',
      category: 'Herbal Medicines',
      currentStock: 35,
      minStock: 25,
      maxStock: 80,
      unit: 'kg',
      costPrice: 250,
      sellingPrice: 400,
      totalValue: 8750,
      status: 'In Stock',
      lastUpdated: '2024-01-20T11:10:00Z',
      expiryDate: '2024-11-30',
      supplier: 'Natural Remedies Co.',
      location: 'Warehouse B - Shelf 2',
      reorderPoint: 25,
      reorderQuantity: 40
    }
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');

  // Filter stock items
  const filteredItems = useMemo(() => {
    let filtered = stockItems;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.supplier.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    // Location filter
    if (locationFilter !== 'all') {
      filtered = filtered.filter(item => item.location.includes(locationFilter));
    }

    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [stockItems, searchTerm, statusFilter, categoryFilter, locationFilter]);

  const categories = Array.from(new Set(stockItems.map(item => item.category)));
  const locations = Array.from(new Set(stockItems.map(item => item.location.split(' - ')[0])));

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'In Stock': { color: 'default' as const, bg: 'bg-green-100 text-green-800' },
      'Low Stock': { color: 'default' as const, bg: 'bg-orange-100 text-orange-800' },
      'Out of Stock': { color: 'destructive' as const, bg: 'bg-red-100 text-red-800' },
      'Overstocked': { color: 'default' as const, bg: 'bg-yellow-100 text-yellow-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['In Stock'];

    return (
      <Badge variant={config.color} className={config.bg}>
        {status}
      </Badge>
    );
  };

  const getStockLevelColor = (current: number, min: number, max: number) => {
    const percentage = (current / max) * 100;
    if (current === 0) return 'text-red-600';
    if (current <= min) return 'text-orange-600';
    if (percentage > 100) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpiryStatus = (expiryDate: string) => {
    const daysUntil = getDaysUntilExpiry(expiryDate);
    if (daysUntil < 0) return { status: 'Expired', color: 'text-red-600' };
    if (daysUntil <= 30) return { status: 'Expiring Soon', color: 'text-orange-600' };
    if (daysUntil <= 90) return { status: 'Expiring', color: 'text-yellow-600' };
    return { status: 'Valid', color: 'text-green-600' };
  };

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalItems = stockItems.length;
    const inStock = stockItems.filter(item => item.status === 'In Stock').length;
    const lowStock = stockItems.filter(item => item.status === 'Low Stock').length;
    const outOfStock = stockItems.filter(item => item.status === 'Out of Stock').length;
    const overstocked = stockItems.filter(item => item.status === 'Overstocked').length;
    const totalValue = stockItems.reduce((sum, item) => sum + item.totalValue, 0);
    const avgStockLevel = stockItems.reduce((sum, item) => sum + (item.currentStock / item.maxStock), 0) / totalItems * 100;

    return {
      totalItems,
      inStock,
      lowStock,
      outOfStock,
      overstocked,
      totalValue,
      avgStockLevel: Math.round(avgStockLevel)
    };
  }, [stockItems]);

  return (
    <div className="space-y-6 p-6 text-gray-700">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Stock Report</h1>
          <p className="text-gray-600 mt-1">Current stock status report</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => {}}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-blue-600">{summaryStats.totalItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">In Stock</p>
                <p className="text-2xl font-bold text-green-600">{summaryStats.inStock}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-orange-600">{summaryStats.lowStock}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-purple-600">₹{(summaryStats.totalValue / 1000).toFixed(0)}K</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-6 w-6 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">Out of Stock</p>
                <p className="text-xl font-bold text-red-600">{summaryStats.outOfStock}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-6 w-6 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Overstocked</p>
                <p className="text-xl font-bold text-yellow-600">{summaryStats.overstocked}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart className="h-6 w-6 text-indigo-500" />
              <div>
                <p className="text-sm text-gray-600">Avg Stock Level</p>
                <p className="text-xl font-bold text-indigo-600">{summaryStats.avgStockLevel}%</p>
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="text-gray-700 bg-white">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent className="text-gray-700 bg-white">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="In Stock">In Stock</SelectItem>
                  <SelectItem value="Low Stock">Low Stock</SelectItem>
                  <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                  <SelectItem value="Overstocked">Overstocked</SelectItem>
                </SelectContent>
              </Select>
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
              <label className="text-sm font-medium text-gray-700 mb-2 block">Location</label>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="text-gray-700 bg-white">
                  <SelectValue placeholder="All locations" />
                </SelectTrigger>
                <SelectContent className="text-gray-700 bg-white">
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map(location => (
                    <SelectItem key={location} value={location}>
                      {location}
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
                  setStatusFilter('all');
                  setCategoryFilter('all');
                  setLocationFilter('all');
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
          Showing {filteredItems.length} of {stockItems.length} items
        </p>
        <div className="flex space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <Package className="h-4 w-4 text-blue-600" />
            <span>Total: {stockItems.length}</span>
          </div>
        </div>
      </div>

      {/* Stock Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Stock Level</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => {
                const stockLevelColor = getStockLevelColor(item.currentStock, item.minStock, item.maxStock);
                const expiryStatus = item.expiryDate ? getExpiryStatus(item.expiryDate) : null;

                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-500">{item.code}</div>
                        <div className="text-xs text-gray-400">{item.category}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className={`font-medium ${stockLevelColor}`}>
                          {item.currentStock} {item.unit}
                        </div>
                        <div className="text-xs text-gray-500">
                          Min: {item.minStock} | Max: {item.maxStock}
                        </div>
                        <div className="text-xs text-gray-500">
                          Reorder: {item.reorderQuantity} at {item.reorderPoint}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(item.status)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">₹{item.totalValue.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">
                          Cost: ₹{item.costPrice} | Sell: ₹{item.sellingPrice}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.expiryDate ? (
                        <div>
                          <div className="text-sm">
                            {new Date(item.expiryDate).toLocaleDateString()}
                          </div>
                          <div className={`text-xs font-medium ${expiryStatus?.color}`}>
                            {expiryStatus?.status}
                          </div>
                          <div className="text-xs text-gray-500">
                            {getDaysUntilExpiry(item.expiryDate)} days left
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">No expiry</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">{item.location}</div>
                        <div className="text-xs text-gray-500">{item.supplier}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">
                          {new Date(item.lastUpdated).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(item.lastUpdated).toLocaleTimeString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <BarChart className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          {filteredItems.length === 0 && (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No items found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 