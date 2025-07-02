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
  TrendingUp,
  RefreshCw,
  Download,
  Eye,
  BarChart,
  DollarSign,
  Star,
  Target,
  Calculator,
  Package
} from 'lucide-react';

interface ABCItem {
  id: string;
  name: string;
  code: string;
  category: string;
  annualUsage: number;
  unitCost: number;
  annualValue: number;
  cumulativeValue: number;
  cumulativePercentage: number;
  abcClass: 'A' | 'B' | 'C';
  turnoverRate: number;
  stockLevel: number;
  reorderPoint: number;
  supplier: string;
  location: string;
  lastOrderDate: string;
  leadTime: number;
  criticality: 'High' | 'Medium' | 'Low';
  managementStrategy: string;
}

export default function ABCAnalysisPage() {
  const [abcItems] = useState<ABCItem[]>([
    {
      id: 'INV001',
      name: 'Ashwagandha',
      code: 'ASH001',
      category: 'Herbal Medicines',
      annualUsage: 600,
      unitCost: 500,
      annualValue: 300000,
      cumulativeValue: 300000,
      cumulativePercentage: 35.2,
      abcClass: 'A',
      turnoverRate: 12.5,
      stockLevel: 45,
      reorderPoint: 25,
      supplier: 'ABC Suppliers',
      location: 'Warehouse A',
      lastOrderDate: '2024-01-15',
      leadTime: 7,
      criticality: 'High',
      managementStrategy: 'Tight control, frequent review'
    },
    {
      id: 'INV002',
      name: 'Brahmi',
      code: 'BRH002',
      category: 'Herbal Medicines',
      annualUsage: 360,
      unitCost: 500,
      annualValue: 180000,
      cumulativeValue: 480000,
      cumulativePercentage: 56.3,
      abcClass: 'A',
      turnoverRate: 8.3,
      stockLevel: 15,
      reorderPoint: 20,
      supplier: 'XYZ Pharmaceuticals',
      location: 'Warehouse A',
      lastOrderDate: '2024-01-10',
      leadTime: 5,
      criticality: 'High',
      managementStrategy: 'Regular monitoring, safety stock'
    },
    {
      id: 'INV003',
      name: 'Ginseng',
      code: 'GIN003',
      category: 'Herbal Medicines',
      annualUsage: 120,
      unitCost: 1400,
      annualValue: 168000,
      cumulativeValue: 648000,
      cumulativePercentage: 76.0,
      abcClass: 'B',
      turnoverRate: 4.2,
      stockLevel: 20,
      reorderPoint: 15,
      supplier: 'MediCare Supplies',
      location: 'Warehouse B',
      lastOrderDate: '2024-01-05',
      leadTime: 10,
      criticality: 'Medium',
      managementStrategy: 'Periodic review, moderate control'
    },
    {
      id: 'INV004',
      name: 'Turmeric',
      code: 'TUR004',
      category: 'Herbal Medicines',
      annualUsage: 1440,
      unitCost: 500,
      annualValue: 720000,
      cumulativeValue: 1368000,
      cumulativePercentage: 160.5,
      abcClass: 'A',
      turnoverRate: 6.2,
      stockLevel: 120,
      reorderPoint: 30,
      supplier: 'HealthPlus Distributors',
      location: 'Warehouse A',
      lastOrderDate: '2024-01-12',
      leadTime: 3,
      criticality: 'High',
      managementStrategy: 'High volume, efficient ordering'
    },
    {
      id: 'INV005',
      name: 'Ginger',
      code: 'GIN005',
      category: 'Herbal Medicines',
      annualUsage: 1140,
      unitCost: 250,
      annualValue: 285000,
      cumulativeValue: 1653000,
      cumulativePercentage: 193.9,
      abcClass: 'B',
      turnoverRate: 15.8,
      stockLevel: 35,
      reorderPoint: 25,
      supplier: 'Natural Remedies Co.',
      location: 'Warehouse B',
      lastOrderDate: '2024-01-08',
      leadTime: 4,
      criticality: 'Medium',
      managementStrategy: 'Fast moving, regular replenishment'
    },
    {
      id: 'INV006',
      name: 'Saffron',
      code: 'SAF006',
      category: 'Herbal Medicines',
      annualUsage: 60,
      unitCost: 7000,
      annualValue: 420000,
      cumulativeValue: 2073000,
      cumulativePercentage: 243.2,
      abcClass: 'A',
      turnoverRate: 2.1,
      stockLevel: 5,
      reorderPoint: 10,
      supplier: 'Premium Herbs Ltd',
      location: 'Warehouse A',
      lastOrderDate: '2024-01-03',
      leadTime: 15,
      criticality: 'High',
      managementStrategy: 'Premium item, careful management'
    },
    {
      id: 'INV007',
      name: 'Neem',
      code: 'NEE007',
      category: 'Herbal Medicines',
      annualUsage: 300,
      unitCost: 300,
      annualValue: 90000,
      cumulativeValue: 2163000,
      cumulativePercentage: 253.8,
      abcClass: 'C',
      turnoverRate: 3.5,
      stockLevel: 50,
      reorderPoint: 40,
      supplier: 'Local Herbs Co.',
      location: 'Warehouse B',
      lastOrderDate: '2024-01-01',
      leadTime: 2,
      criticality: 'Low',
      managementStrategy: 'Simple control, bulk ordering'
    },
    {
      id: 'INV008',
      name: 'Tulsi',
      code: 'TUL008',
      category: 'Herbal Medicines',
      annualUsage: 480,
      unitCost: 200,
      annualValue: 96000,
      cumulativeValue: 2259000,
      cumulativePercentage: 265.0,
      abcClass: 'C',
      turnoverRate: 5.8,
      stockLevel: 80,
      reorderPoint: 60,
      supplier: 'Garden Herbs Inc',
      location: 'Warehouse A',
      lastOrderDate: '2023-12-28',
      leadTime: 1,
      criticality: 'Low',
      managementStrategy: 'Standard control, routine ordering'
    }
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [abcClassFilter, setAbcClassFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [criticalityFilter, setCriticalityFilter] = useState<string>('all');

  // Filter ABC items
  const filteredItems = useMemo(() => {
    let filtered = abcItems;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.supplier.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // ABC class filter
    if (abcClassFilter !== 'all') {
      filtered = filtered.filter(item => item.abcClass === abcClassFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    // Criticality filter
    if (criticalityFilter !== 'all') {
      filtered = filtered.filter(item => item.criticality === criticalityFilter);
    }

    return filtered.sort((a, b) => a.cumulativePercentage - b.cumulativePercentage);
  }, [abcItems, searchTerm, abcClassFilter, categoryFilter, criticalityFilter]);

  const categories = Array.from(new Set(abcItems.map(item => item.category)));

  const getABCClassBadge = (abcClass: string) => {
    const classConfig = {
      'A': { color: 'destructive' as const, bg: 'bg-red-100 text-red-800' },
      'B': { color: 'default' as const, bg: 'bg-yellow-100 text-yellow-800' },
      'C': { color: 'secondary' as const, bg: 'bg-blue-100 text-blue-800' }
    };

    const config = classConfig[abcClass as keyof typeof classConfig] || classConfig['C'];

    return (
      <Badge variant={config.color} className={config.bg}>
        Class {abcClass}
      </Badge>
    );
  };

  const getCriticalityBadge = (criticality: string) => {
    const criticalityConfig = {
      'High': { color: 'destructive' as const, bg: 'bg-red-100 text-red-800' },
      'Medium': { color: 'default' as const, bg: 'bg-yellow-100 text-yellow-800' },
      'Low': { color: 'secondary' as const, bg: 'bg-green-100 text-green-800' }
    };

    const config = criticalityConfig[criticality as keyof typeof criticalityConfig] || criticalityConfig['Low'];

    return (
      <Badge variant={config.color} className={config.bg}>
        {criticality}
      </Badge>
    );
  };

  const getTurnoverColor = (rate: number) => {
    if (rate >= 12) return 'text-green-600';
    if (rate >= 8) return 'text-yellow-600';
    if (rate >= 4) return 'text-orange-600';
    return 'text-red-600';
  };

  // Calculate ABC analysis statistics
  const abcStats = useMemo(() => {
    const totalItems = abcItems.length;
    const totalValue = abcItems.reduce((sum, item) => sum + item.annualValue, 0);
    
    const classAItems = abcItems.filter(item => item.abcClass === 'A');
    const classBItems = abcItems.filter(item => item.abcClass === 'B');
    const classCItems = abcItems.filter(item => item.abcClass === 'C');

    const classAValue = classAItems.reduce((sum, item) => sum + item.annualValue, 0);
    const classBValue = classBItems.reduce((sum, item) => sum + item.annualValue, 0);
    const classCValue = classCItems.reduce((sum, item) => sum + item.annualValue, 0);

    return {
      totalItems,
      totalValue,
      classAItems: classAItems.length,
      classBItems: classBItems.length,
      classCItems: classCItems.length,
      classAValue,
      classBValue,
      classCValue,
      classAValuePercent: Math.round((classAValue / totalValue) * 100),
      classBValuePercent: Math.round((classBValue / totalValue) * 100),
      classCValuePercent: Math.round((classCValue / totalValue) * 100)
    };
  }, [abcItems]);

  return (
    <div className="space-y-6 p-6 text-gray-700">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ABC Analysis</h1>
          <p className="text-gray-600 mt-1">ABC classification analysis</p>
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

      {/* ABC Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calculator className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-blue-600">{abcStats.totalItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-green-600">₹{(abcStats.totalValue / 100000).toFixed(1)}L</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Avg Value/Item</p>
                <p className="text-2xl font-bold text-purple-600">₹{(abcStats.totalValue / abcStats.totalItems / 1000).toFixed(0)}K</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Analysis Date</p>
                <p className="text-2xl font-bold text-orange-600">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ABC Class Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="h-5 w-5 mr-2 text-red-500" />
              Class A Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Items Count</span>
                <span className="text-sm font-medium text-red-600">{abcStats.classAItems}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Value</span>
                <span className="text-sm font-medium">₹{(abcStats.classAValue / 1000).toFixed(0)}K</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Value %</span>
                <span className="text-sm font-bold text-red-600">{abcStats.classAValuePercent}%</span>
              </div>
              <div className="pt-2 border-t">
                <div className="text-xs text-gray-500">
                  High value items requiring tight control
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2 text-yellow-500" />
              Class B Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Items Count</span>
                <span className="text-sm font-medium text-yellow-600">{abcStats.classBItems}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Value</span>
                <span className="text-sm font-medium">₹{(abcStats.classBValue / 1000).toFixed(0)}K</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Value %</span>
                <span className="text-sm font-bold text-yellow-600">{abcStats.classBValuePercent}%</span>
              </div>
              <div className="pt-2 border-t">
                <div className="text-xs text-gray-500">
                  Medium value items with moderate control
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2 text-blue-500" />
              Class C Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Items Count</span>
                <span className="text-sm font-medium text-blue-600">{abcStats.classCItems}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Value</span>
                <span className="text-sm font-medium">₹{(abcStats.classCValue / 1000).toFixed(0)}K</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Value %</span>
                <span className="text-sm font-bold text-blue-600">{abcStats.classCValuePercent}%</span>
              </div>
              <div className="pt-2 border-t">
                <div className="text-xs text-gray-500">
                  Low value items with simple control
                </div>
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
              <label className="text-sm font-medium text-gray-700 mb-2 block">ABC Class</label>
              <Select value={abcClassFilter} onValueChange={setAbcClassFilter}>
                <SelectTrigger className="text-gray-700 bg-white">
                  <SelectValue placeholder="All classes" />
                </SelectTrigger>
                <SelectContent className="text-gray-700 bg-white">
                  <SelectItem value="all">All Classes</SelectItem>
                  <SelectItem value="A">Class A</SelectItem>
                  <SelectItem value="B">Class B</SelectItem>
                  <SelectItem value="C">Class C</SelectItem>
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
              <label className="text-sm font-medium text-gray-700 mb-2 block">Criticality</label>
              <Select value={criticalityFilter} onValueChange={setCriticalityFilter}>
                <SelectTrigger className="text-gray-700 bg-white">
                  <SelectValue placeholder="All criticality" />
                </SelectTrigger>
                <SelectContent className="text-gray-700 bg-white">
                  <SelectItem value="all">All Criticality</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setAbcClassFilter('all');
                  setCategoryFilter('all');
                  setCriticalityFilter('all');
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
          Showing {filteredItems.length} of {abcItems.length} items
        </p>
        <div className="flex space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <span>Total: {abcItems.length}</span>
          </div>
        </div>
      </div>

      {/* ABC Analysis Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>ABC Class</TableHead>
                <TableHead>Annual Value</TableHead>
                <TableHead>Cumulative %</TableHead>
                <TableHead>Usage & Cost</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Criticality</TableHead>
                <TableHead>Strategy</TableHead>
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
                    {getABCClassBadge(item.abcClass)}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">₹{item.annualValue.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">
                        {item.cumulativePercentage.toFixed(1)}% of total
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm font-medium">{item.cumulativePercentage.toFixed(1)}%</div>
                      <div className="text-xs text-gray-500">
                        ₹{item.cumulativeValue.toLocaleString()}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm">
                        <span className="text-gray-500">Usage: </span>
                        <span className="font-medium">{item.annualUsage}</span>
                        {/* <span className="font-medium">{item.annualUsage} {item.unit}</span> */}
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-500">Cost: </span>
                        <span className="font-medium">₹{item.unitCost}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Stock: {item.stockLevel} | Reorder: {item.reorderPoint}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className={`text-sm font-medium ${getTurnoverColor(item.turnoverRate)}`}>
                        {item.turnoverRate}/month
                      </div>
                      <div className="text-xs text-gray-500">
                        Turnover Rate
                      </div>
                      <div className="text-xs text-gray-500">
                        Lead Time: {item.leadTime} days
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getCriticalityBadge(item.criticality)}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm">{item.managementStrategy}</div>
                      <div className="text-xs text-gray-500">
                        {item.supplier}
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
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No items found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 