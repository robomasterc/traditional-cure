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
  Activity,
  RefreshCw,
  Download,
  Eye,
  TrendingUp,
  TrendingDown,
  BarChart,
  ArrowUp,
  ArrowDown,
  Package,
  Calendar,
  Clock,
  DollarSign,
  Users,
  Truck,
  ShoppingCart,
  RotateCcw
} from 'lucide-react';

interface MovementItem {
  id: string;
  name: string;
  code: string;
  category: string;
  openingStock: number;
  closingStock: number;
  totalIn: number;
  totalOut: number;
  netMovement: number;
  movementType: 'Positive' | 'Negative' | 'Neutral';
  unit: string;
  avgDailyMovement: number;
  turnoverRate: number;
  lastMovementDate: string;
  lastMovementType: 'In' | 'Out';
  lastMovementQuantity: number;
  lastMovementValue: number;
  supplier: string;
  location: string;
  period: string;
}

export default function MovementReportPage() {
  const [movementItems, setMovementItems] = useState<MovementItem[]>([
    {
      id: 'INV001',
      name: 'Ashwagandha',
      code: 'ASH001',
      category: 'Herbal Medicines',
      openingStock: 50,
      closingStock: 45,
      totalIn: 25,
      totalOut: 30,
      netMovement: -5,
      movementType: 'Negative',
      unit: 'kg',
      avgDailyMovement: 2.5,
      turnoverRate: 12.5,
      lastMovementDate: '2024-01-20',
      lastMovementType: 'Out',
      lastMovementQuantity: 5,
      lastMovementValue: 3750,
      supplier: 'ABC Suppliers',
      location: 'Warehouse A',
      period: 'Last 30 Days'
    },
    {
      id: 'INV002',
      name: 'Brahmi',
      code: 'BRH002',
      category: 'Herbal Medicines',
      openingStock: 30,
      closingStock: 15,
      totalIn: 10,
      totalOut: 25,
      netMovement: -15,
      movementType: 'Negative',
      unit: 'kg',
      avgDailyMovement: 1.2,
      turnoverRate: 8.3,
      lastMovementDate: '2024-01-19',
      lastMovementType: 'Out',
      lastMovementQuantity: 8,
      lastMovementValue: 6400,
      supplier: 'XYZ Pharmaceuticals',
      location: 'Warehouse A',
      period: 'Last 30 Days'
    },
    {
      id: 'INV003',
      name: 'Ginseng',
      code: 'GIN003',
      category: 'Herbal Medicines',
      openingStock: 0,
      closingStock: 20,
      totalIn: 20,
      totalOut: 0,
      netMovement: 20,
      movementType: 'Positive',
      unit: 'kg',
      avgDailyMovement: 0.7,
      turnoverRate: 0,
      lastMovementDate: '2024-01-18',
      lastMovementType: 'In',
      lastMovementQuantity: 20,
      lastMovementValue: 28000,
      supplier: 'MediCare Supplies',
      location: 'Warehouse B',
      period: 'Last 30 Days'
    },
    {
      id: 'INV004',
      name: 'Turmeric',
      code: 'TUR004',
      category: 'Herbal Medicines',
      openingStock: 100,
      closingStock: 120,
      totalIn: 40,
      totalOut: 20,
      netMovement: 20,
      movementType: 'Positive',
      unit: 'kg',
      avgDailyMovement: 2.0,
      turnoverRate: 6.2,
      lastMovementDate: '2024-01-20',
      lastMovementType: 'In',
      lastMovementQuantity: 15,
      lastMovementValue: 7500,
      supplier: 'HealthPlus Distributors',
      location: 'Warehouse A',
      period: 'Last 30 Days'
    },
    {
      id: 'INV005',
      name: 'Ginger',
      code: 'GIN005',
      category: 'Herbal Medicines',
      openingStock: 40,
      closingStock: 35,
      totalIn: 20,
      totalOut: 25,
      netMovement: -5,
      movementType: 'Negative',
      unit: 'kg',
      avgDailyMovement: 1.5,
      turnoverRate: 15.8,
      lastMovementDate: '2024-01-20',
      lastMovementType: 'Out',
      lastMovementQuantity: 3,
      lastMovementValue: 1200,
      supplier: 'Natural Remedies Co.',
      location: 'Warehouse B',
      period: 'Last 30 Days'
    }
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [movementTypeFilter, setMovementTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [periodFilter, setPeriodFilter] = useState<string>('30days');

  // Filter movement items
  const filteredItems = useMemo(() => {
    let filtered = movementItems;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.supplier.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Movement type filter
    if (movementTypeFilter !== 'all') {
      filtered = filtered.filter(item => item.movementType === movementTypeFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    return filtered.sort((a, b) => Math.abs(b.netMovement) - Math.abs(a.netMovement));
  }, [movementItems, searchTerm, movementTypeFilter, categoryFilter]);

  const categories = Array.from(new Set(movementItems.map(item => item.category)));

  const getMovementTypeBadge = (type: string) => {
    const typeConfig = {
      'Positive': { color: 'default' as const, bg: 'bg-green-100 text-green-800' },
      'Negative': { color: 'destructive' as const, bg: 'bg-red-100 text-red-800' },
      'Neutral': { color: 'secondary' as const, bg: 'bg-gray-100 text-gray-800' }
    };

    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig['Neutral'];

    return (
      <Badge variant={config.color} className={config.bg}>
        {type}
      </Badge>
    );
  };

  const getMovementIcon = (type: string) => {
    if (type === 'Positive') return <ArrowUp className="h-4 w-4 text-green-600" />;
    if (type === 'Negative') return <ArrowDown className="h-4 w-4 text-red-600" />;
    return <RotateCcw className="h-4 w-4 text-gray-600" />;
  };

  const getTurnoverColor = (rate: number) => {
    if (rate >= 15) return 'text-green-600';
    if (rate >= 10) return 'text-yellow-600';
    if (rate >= 5) return 'text-orange-600';
    return 'text-red-600';
  };

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalItems = movementItems.length;
    const positiveMovements = movementItems.filter(item => item.movementType === 'Positive').length;
    const negativeMovements = movementItems.filter(item => item.movementType === 'Negative').length;
    const totalIn = movementItems.reduce((sum, item) => sum + item.totalIn, 0);
    const totalOut = movementItems.reduce((sum, item) => sum + item.totalOut, 0);
    const netMovement = movementItems.reduce((sum, item) => sum + item.netMovement, 0);
    const avgTurnoverRate = movementItems.reduce((sum, item) => sum + item.turnoverRate, 0) / totalItems;

    return {
      totalItems,
      positiveMovements,
      negativeMovements,
      totalIn,
      totalOut,
      netMovement,
      avgTurnoverRate: Math.round(avgTurnoverRate * 10) / 10
    };
  }, [movementItems]);

  return (
    <div className="space-y-6 p-6 text-gray-700">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Movement Report</h1>
          <p className="text-gray-600 mt-1">Stock movement analysis</p>
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
              <Activity className="h-8 w-8 text-blue-500" />
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
              <ArrowUp className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Total In</p>
                <p className="text-2xl font-bold text-green-600">{summaryStats.totalIn}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <ArrowDown className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">Total Out</p>
                <p className="text-2xl font-bold text-red-600">{summaryStats.totalOut}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Net Movement</p>
                <p className={`text-2xl font-bold ${summaryStats.netMovement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {summaryStats.netMovement >= 0 ? '+' : ''}{summaryStats.netMovement}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Movement Analysis Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-6 w-6 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Positive Movements</p>
                <p className="text-xl font-bold text-green-600">{summaryStats.positiveMovements}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-6 w-6 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">Negative Movements</p>
                <p className="text-xl font-bold text-red-600">{summaryStats.negativeMovements}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <RotateCcw className="h-6 w-6 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Avg Turnover Rate</p>
                <p className="text-xl font-bold text-blue-600">{summaryStats.avgTurnoverRate}/month</p>
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
              <label className="text-sm font-medium text-gray-700 mb-2 block">Movement Type</label>
              <Select value={movementTypeFilter} onValueChange={setMovementTypeFilter}>
                <SelectTrigger className="text-gray-700 bg-white">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent className="text-gray-700 bg-white">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Positive">Positive</SelectItem>
                  <SelectItem value="Negative">Negative</SelectItem>
                  <SelectItem value="Neutral">Neutral</SelectItem>
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
              <label className="text-sm font-medium text-gray-700 mb-2 block">Period</label>
              <Select value={periodFilter} onValueChange={setPeriodFilter}>
                <SelectTrigger className="text-gray-700 bg-white">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent className="text-gray-700 bg-white">
                  <SelectItem value="7days">Last 7 Days</SelectItem>
                  <SelectItem value="30days">Last 30 Days</SelectItem>
                  <SelectItem value="90days">Last 90 Days</SelectItem>
                  <SelectItem value="1year">Last 1 Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setMovementTypeFilter('all');
                  setCategoryFilter('all');
                  setPeriodFilter('30days');
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
          Showing {filteredItems.length} of {movementItems.length} items
        </p>
        <div className="flex space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <Activity className="h-4 w-4 text-blue-600" />
            <span>Total: {movementItems.length}</span>
          </div>
        </div>
      </div>

      {/* Movement Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Stock Levels</TableHead>
                <TableHead>Movement</TableHead>
                <TableHead>Movement Type</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Last Movement</TableHead>
                <TableHead>Location</TableHead>
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
                      <div className="text-sm">
                        <span className="text-gray-500">Opening: </span>
                        <span className="font-medium">{item.openingStock} {item.unit}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-500">Closing: </span>
                        <span className="font-medium">{item.closingStock} {item.unit}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.period}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="flex items-center space-x-1">
                        {getMovementIcon(item.movementType)}
                        <span className={`font-medium ${item.netMovement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {item.netMovement >= 0 ? '+' : ''}{item.netMovement} {item.unit}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        In: {item.totalIn} | Out: {item.totalOut}
                      </div>
                      <div className="text-xs text-gray-500">
                        Avg: {item.avgDailyMovement}/day
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getMovementTypeBadge(item.movementType)}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className={`text-sm font-medium ${getTurnoverColor(item.turnoverRate)}`}>
                        {item.turnoverRate}/month
                      </div>
                      <div className="text-xs text-gray-500">
                        Turnover Rate
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm">
                        {new Date(item.lastMovementDate).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.lastMovementType}: {item.lastMovementQuantity} {item.unit}
                      </div>
                      <div className="text-xs text-gray-500">
                        ₹{item.lastMovementValue.toLocaleString()}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm">{item.location}</div>
                      <div className="text-xs text-gray-500">{item.supplier}</div>
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
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No movements found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 