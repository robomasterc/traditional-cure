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
  DollarSign,
  RefreshCw,
  Download,
  Eye,
  TrendingUp,
  TrendingDown,
  BarChart,
  PieChart,
  Calculator,
  Package,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  Percent
} from 'lucide-react';

interface ValuationItem {
  id: string;
  name: string;
  code: string;
  category: string;
  currentStock: number;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  totalCostValue: number;
  totalSellingValue: number;
  profitMargin: number;
  profitAmount: number;
  lastPurchaseDate: string;
  lastPurchasePrice: number;
  avgPurchasePrice: number;
  priceChange: number;
  priceChangePercent: number;
  turnoverRate: number;
  daysInStock: number;
  supplier: string;
  status: 'Profitable' | 'Low Margin' | 'Loss Making' | 'New Item';
}

export default function ValuationReportPage() {
  const [valuationItems, setValuationItems] = useState<ValuationItem[]>([
    {
      id: 'INV001',
      name: 'Ashwagandha',
      code: 'ASH001',
      category: 'Herbal Medicines',
      currentStock: 45,
      unit: 'kg',
      costPrice: 500,
      sellingPrice: 750,
      totalCostValue: 22500,
      totalSellingValue: 33750,
      profitMargin: 50,
      profitAmount: 11250,
      lastPurchaseDate: '2024-01-15',
      lastPurchasePrice: 500,
      avgPurchasePrice: 480,
      priceChange: 20,
      priceChangePercent: 4.2,
      turnoverRate: 12.5,
      daysInStock: 30,
      supplier: 'ABC Suppliers',
      status: 'Profitable'
    },
    {
      id: 'INV002',
      name: 'Brahmi',
      code: 'BRH002',
      category: 'Herbal Medicines',
      currentStock: 15,
      unit: 'kg',
      costPrice: 500,
      sellingPrice: 800,
      totalCostValue: 7500,
      totalSellingValue: 12000,
      profitMargin: 60,
      profitAmount: 4500,
      lastPurchaseDate: '2024-01-10',
      lastPurchasePrice: 500,
      avgPurchasePrice: 520,
      priceChange: -20,
      priceChangePercent: -3.8,
      turnoverRate: 8.3,
      daysInStock: 45,
      supplier: 'XYZ Pharmaceuticals',
      status: 'Profitable'
    },
    {
      id: 'INV003',
      name: 'Ginseng',
      code: 'GIN003',
      category: 'Herbal Medicines',
      currentStock: 0,
      unit: 'kg',
      costPrice: 1400,
      sellingPrice: 2100,
      totalCostValue: 0,
      totalSellingValue: 0,
      profitMargin: 50,
      profitAmount: 0,
      lastPurchaseDate: '2024-01-05',
      lastPurchasePrice: 1400,
      avgPurchasePrice: 1350,
      priceChange: 50,
      priceChangePercent: 3.7,
      turnoverRate: 0,
      daysInStock: 0,
      supplier: 'MediCare Supplies',
      status: 'New Item'
    },
    {
      id: 'INV004',
      name: 'Turmeric',
      code: 'TUR004',
      category: 'Herbal Medicines',
      currentStock: 120,
      unit: 'kg',
      costPrice: 500,
      sellingPrice: 550,
      totalCostValue: 60000,
      totalSellingValue: 66000,
      profitMargin: 10,
      profitAmount: 6000,
      lastPurchaseDate: '2024-01-12',
      lastPurchasePrice: 500,
      avgPurchasePrice: 490,
      priceChange: 10,
      priceChangePercent: 2.0,
      turnoverRate: 6.2,
      daysInStock: 60,
      supplier: 'HealthPlus Distributors',
      status: 'Low Margin'
    },
    {
      id: 'INV005',
      name: 'Ginger',
      code: 'GIN005',
      category: 'Herbal Medicines',
      currentStock: 35,
      unit: 'kg',
      costPrice: 250,
      sellingPrice: 400,
      totalCostValue: 8750,
      totalSellingValue: 14000,
      profitMargin: 60,
      profitAmount: 5250,
      lastPurchaseDate: '2024-01-08',
      lastPurchasePrice: 250,
      avgPurchasePrice: 240,
      priceChange: 10,
      priceChangePercent: 4.2,
      turnoverRate: 15.8,
      daysInStock: 25,
      supplier: 'Natural Remedies Co.',
      status: 'Profitable'
    }
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [marginFilter, setMarginFilter] = useState<string>('all');

  // Filter valuation items
  const filteredItems = useMemo(() => {
    let filtered = valuationItems;

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

    // Margin filter
    if (marginFilter !== 'all') {
      const minMargin = parseFloat(marginFilter);
      filtered = filtered.filter(item => item.profitMargin >= minMargin);
    }

    return filtered.sort((a, b) => b.totalCostValue - a.totalCostValue);
  }, [valuationItems, searchTerm, statusFilter, categoryFilter, marginFilter]);

  const categories = Array.from(new Set(valuationItems.map(item => item.category)));

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'Profitable': { color: 'default' as const, bg: 'bg-green-100 text-green-800' },
      'Low Margin': { color: 'default' as const, bg: 'bg-yellow-100 text-yellow-800' },
      'Loss Making': { color: 'destructive' as const, bg: 'bg-red-100 text-red-800' },
      'New Item': { color: 'default' as const, bg: 'bg-blue-100 text-blue-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['Profitable'];

    return (
      <Badge variant={config.color} className={config.bg}>
        {status}
      </Badge>
    );
  };

  const getPriceChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getMarginColor = (margin: number) => {
    if (margin >= 50) return 'text-green-600';
    if (margin >= 25) return 'text-yellow-600';
    if (margin >= 10) return 'text-orange-600';
    return 'text-red-600';
  };

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalItems = valuationItems.length;
    const totalCostValue = valuationItems.reduce((sum, item) => sum + item.totalCostValue, 0);
    const totalSellingValue = valuationItems.reduce((sum, item) => sum + item.totalSellingValue, 0);
    const totalProfit = valuationItems.reduce((sum, item) => sum + item.profitAmount, 0);
    const avgProfitMargin = valuationItems.reduce((sum, item) => sum + item.profitMargin, 0) / totalItems;
    const profitableItems = valuationItems.filter(item => item.status === 'Profitable').length;
    const lowMarginItems = valuationItems.filter(item => item.status === 'Low Margin').length;
    const lossMakingItems = valuationItems.filter(item => item.status === 'Loss Making').length;

    return {
      totalItems,
      totalCostValue,
      totalSellingValue,
      totalProfit,
      avgProfitMargin: Math.round(avgProfitMargin),
      profitableItems,
      lowMarginItems,
      lossMakingItems,
      totalValue: totalSellingValue
    };
  }, [valuationItems]);

  return (
    <div className="space-y-6 p-6 text-gray-700">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Valuation Report</h1>
          <p className="text-gray-600 mt-1">Inventory valuation analysis</p>
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
              <Calculator className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total Cost Value</p>
                <p className="text-2xl font-bold text-blue-600">₹{(summaryStats.totalCostValue / 1000).toFixed(0)}K</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Total Selling Value</p>
                <p className="text-2xl font-bold text-green-600">₹{(summaryStats.totalSellingValue / 1000).toFixed(0)}K</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Total Profit</p>
                <p className="text-2xl font-bold text-purple-600">₹{(summaryStats.totalProfit / 1000).toFixed(0)}K</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Percent className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Avg Profit Margin</p>
                <p className="text-2xl font-bold text-orange-600">{summaryStats.avgProfitMargin}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Profitable Items</p>
                <p className="text-xl font-bold text-green-600">{summaryStats.profitableItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-6 w-6 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Low Margin Items</p>
                <p className="text-xl font-bold text-yellow-600">{summaryStats.lowMarginItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-6 w-6 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">Loss Making Items</p>
                <p className="text-xl font-bold text-red-600">{summaryStats.lossMakingItems}</p>
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
                  <SelectItem value="Profitable">Profitable</SelectItem>
                  <SelectItem value="Low Margin">Low Margin</SelectItem>
                  <SelectItem value="Loss Making">Loss Making</SelectItem>
                  <SelectItem value="New Item">New Item</SelectItem>
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
              <label className="text-sm font-medium text-gray-700 mb-2 block">Min Margin</label>
              <Select value={marginFilter} onValueChange={setMarginFilter}>
                <SelectTrigger className="text-gray-700 bg-white">
                  <SelectValue placeholder="All margins" />
                </SelectTrigger>
                <SelectContent className="text-gray-700 bg-white">
                  <SelectItem value="all">All Margins</SelectItem>
                  <SelectItem value="50">50%+</SelectItem>
                  <SelectItem value="25">25%+</SelectItem>
                  <SelectItem value="10">10%+</SelectItem>
                  <SelectItem value="0">Any Margin</SelectItem>
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
                  setMarginFilter('all');
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
          Showing {filteredItems.length} of {valuationItems.length} items
        </p>
        <div className="flex space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-blue-600" />
            <span>Total Value: ₹{(summaryStats.totalValue / 1000).toFixed(0)}K</span>
          </div>
        </div>
      </div>

      {/* Valuation Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Stock & Value</TableHead>
                <TableHead>Pricing</TableHead>
                <TableHead>Profit Analysis</TableHead>
                <TableHead>Price Trends</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Last Purchase</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
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
                      <div className="font-medium">{item.currentStock} {item.unit}</div>
                      <div className="text-sm text-gray-600">
                        Cost: ₹{item.totalCostValue.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">
                        Sell: ₹{item.totalSellingValue.toLocaleString()}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm">
                        <span className="text-gray-500">Cost: </span>
                        <span className="font-medium">₹{item.costPrice}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-500">Sell: </span>
                        <span className="font-medium">₹{item.sellingPrice}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-500">Avg: </span>
                        <span className="font-medium">₹{item.avgPurchasePrice}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className={`font-medium ${getMarginColor(item.profitMargin)}`}>
                        {item.profitMargin}% margin
                      </div>
                      <div className="text-sm text-gray-600">
                        Profit: ₹{item.profitAmount.toLocaleString()}
                      </div>
                      {getStatusBadge(item.status)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className={`text-sm font-medium ${getPriceChangeColor(item.priceChange)}`}>
                        ₹{item.priceChange > 0 ? '+' : ''}{item.priceChange}
                      </div>
                      <div className={`text-xs ${getPriceChangeColor(item.priceChangePercent)}`}>
                        {item.priceChangePercent > 0 ? '+' : ''}{item.priceChangePercent}%
                      </div>
                      <div className="text-xs text-gray-500">
                        vs avg purchase
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm">
                        <span className="text-gray-500">Turnover: </span>
                        <span className="font-medium">{item.turnoverRate}/month</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-500">Days: </span>
                        <span className="font-medium">{item.daysInStock}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.supplier}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm">
                        {new Date(item.lastPurchaseDate).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        ₹{item.lastPurchasePrice}
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
              ))}
            </TableBody>
          </Table>
          
          {filteredItems.length === 0 && (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No items found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 