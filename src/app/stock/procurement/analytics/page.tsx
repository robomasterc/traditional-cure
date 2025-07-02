'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  Filter, 
  BarChart,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Calendar,
  RefreshCw,
  Download,
  Eye,
  PieChart,
  LineChart,
  BarChart3
} from 'lucide-react';

interface ProcurementAnalytics {
  id: string;
  period: string;
  totalOrders: number;
  totalSpent: number;
  avgOrderValue: number;
  onTimeDelivery: number;
  lateDeliveries: number;
  qualityIssues: number;
  topSuppliers: SupplierAnalytics[];
  topItems: ItemAnalytics[];
  monthlyTrends: MonthlyTrend[];
}

interface SupplierAnalytics {
  supplierId: string;
  supplierName: string;
  totalOrders: number;
  totalSpent: number;
  avgDeliveryTime: number;
  qualityScore: number;
  onTimeDeliveryRate: number;
}

interface ItemAnalytics {
  itemId: string;
  itemName: string;
  totalQuantity: number;
  totalSpent: number;
  avgUnitPrice: number;
  orderFrequency: number;
}

interface MonthlyTrend {
  month: string;
  orders: number;
  spent: number;
  avgDeliveryTime: number;
}

export default function ProcurementAnalyticsPage() {
  const [analytics] = useState<ProcurementAnalytics>({
    id: 'ANALYTICS_2024',
    period: 'Last 12 Months',
    totalOrders: 156,
    totalSpent: 2450000,
    avgOrderValue: 15705,
    onTimeDelivery: 142,
    lateDeliveries: 14,
    qualityIssues: 8,
    topSuppliers: [
      {
        supplierId: 'SUP001',
        supplierName: 'ABC Suppliers',
        totalOrders: 45,
        totalSpent: 675000,
        avgDeliveryTime: 8.5,
        qualityScore: 4.8,
        onTimeDeliveryRate: 95.6
      },
      {
        supplierId: 'SUP002',
        supplierName: 'XYZ Pharmaceuticals',
        totalOrders: 38,
        totalSpent: 570000,
        avgDeliveryTime: 7.2,
        qualityScore: 4.6,
        onTimeDeliveryRate: 92.1
      },
      {
        supplierId: 'SUP003',
        supplierName: 'MediCare Supplies',
        totalOrders: 32,
        totalSpent: 480000,
        avgDeliveryTime: 9.1,
        qualityScore: 4.4,
        onTimeDeliveryRate: 87.5
      },
      {
        supplierId: 'SUP004',
        supplierName: 'HealthPlus Distributors',
        totalOrders: 28,
        totalSpent: 420000,
        avgDeliveryTime: 6.8,
        qualityScore: 4.7,
        onTimeDeliveryRate: 96.4
      },
      {
        supplierId: 'SUP005',
        supplierName: 'Natural Remedies Co.',
        totalOrders: 13,
        totalSpent: 305000,
        avgDeliveryTime: 10.2,
        qualityScore: 4.2,
        onTimeDeliveryRate: 76.9
      }
    ],
    topItems: [
      {
        itemId: 'INV001',
        itemName: 'Ashwagandha',
        totalQuantity: 850,
        totalSpent: 425000,
        avgUnitPrice: 500,
        orderFrequency: 23
      },
      {
        itemId: 'INV002',
        itemName: 'Brahmi',
        totalQuantity: 620,
        totalSpent: 310000,
        avgUnitPrice: 500,
        orderFrequency: 18
      },
      {
        itemId: 'INV003',
        itemName: 'Ginseng',
        totalQuantity: 280,
        totalSpent: 392000,
        avgUnitPrice: 1400,
        orderFrequency: 15
      },
      {
        itemId: 'INV004',
        itemName: 'Turmeric',
        totalQuantity: 1200,
        totalSpent: 600000,
        avgUnitPrice: 500,
        orderFrequency: 25
      },
      {
        itemId: 'INV005',
        itemName: 'Ginger',
        totalQuantity: 950,
        totalSpent: 237500,
        avgUnitPrice: 250,
        orderFrequency: 20
      }
    ],
    monthlyTrends: [
      { month: 'Jan', orders: 12, spent: 180000, avgDeliveryTime: 8.2 },
      { month: 'Feb', orders: 15, spent: 225000, avgDeliveryTime: 7.8 },
      { month: 'Mar', orders: 18, spent: 270000, avgDeliveryTime: 8.5 },
      { month: 'Apr', orders: 14, spent: 210000, avgDeliveryTime: 7.9 },
      { month: 'May', orders: 16, spent: 240000, avgDeliveryTime: 8.1 },
      { month: 'Jun', orders: 13, spent: 195000, avgDeliveryTime: 8.3 },
      { month: 'Jul', orders: 17, spent: 255000, avgDeliveryTime: 7.7 },
      { month: 'Aug', orders: 19, spent: 285000, avgDeliveryTime: 8.0 },
      { month: 'Sep', orders: 11, spent: 165000, avgDeliveryTime: 8.4 },
      { month: 'Oct', orders: 14, spent: 210000, avgDeliveryTime: 7.6 },
      { month: 'Nov', orders: 16, spent: 240000, avgDeliveryTime: 8.2 },
      { month: 'Dec', orders: 15, spent: 225000, avgDeliveryTime: 7.9 }
    ]
  });

  const [periodFilter, setPeriodFilter] = useState<string>('12months');
  const [supplierFilter, setSupplierFilter] = useState<string>('all');

  const onTimeDeliveryRate = useMemo(() => {
    return Math.round((analytics.onTimeDelivery / analytics.totalOrders) * 100);
  }, [analytics]);

  const qualityIssueRate = useMemo(() => {
    return Math.round((analytics.qualityIssues / analytics.totalOrders) * 100);
  }, [analytics]);

  const getQualityScoreColor = (score: number) => {
    if (score >= 4.5) return 'text-green-600';
    if (score >= 4.0) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getDeliveryRateColor = (rate: number) => {
    if (rate >= 95) return 'text-green-600';
    if (rate >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6 p-6 text-gray-700">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Procurement Analytics</h1>
          <p className="text-gray-600 mt-1">Purchase analysis and trends</p>
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

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Analytics Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Time Period</label>
              <Select value={periodFilter} onValueChange={setPeriodFilter}>
                <SelectTrigger className="text-gray-700 bg-white">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent className="text-gray-700 bg-white">
                  <SelectItem value="3months">Last 3 Months</SelectItem>
                  <SelectItem value="6months">Last 6 Months</SelectItem>
                  <SelectItem value="12months">Last 12 Months</SelectItem>
                  <SelectItem value="ytd">Year to Date</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Supplier</label>
              <Select value={supplierFilter} onValueChange={setSupplierFilter}>
                <SelectTrigger className="text-gray-700 bg-white">
                  <SelectValue placeholder="All suppliers" />
                </SelectTrigger>
                <SelectContent className="text-gray-700 bg-white">
                  <SelectItem value="all">All Suppliers</SelectItem>
                  {analytics.topSuppliers.map(supplier => (
                    <SelectItem key={supplier.supplierId} value={supplier.supplierId}>
                      {supplier.supplierName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setPeriodFilter('12months');
                  setSupplierFilter('all');
                }}
                className="w-full"
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-blue-600">{analytics.totalOrders}</p>
                <div className="flex items-center text-xs text-green-600">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12% vs last period
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-green-600">₹{(analytics.totalSpent / 100000).toFixed(1)}L</p>
                <div className="flex items-center text-xs text-green-600">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +8% vs last period
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Avg Order Value</p>
                <p className="text-2xl font-bold text-purple-600">₹{analytics.avgOrderValue.toLocaleString()}</p>
                <div className="flex items-center text-xs text-red-600">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  -3% vs last period
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">On-Time Delivery</p>
                <p className="text-2xl font-bold text-orange-600">{onTimeDeliveryRate}%</p>
                <div className="flex items-center text-xs text-green-600">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +2% vs last period
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Delivery Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">On-Time Deliveries</span>
                <span className="text-sm font-medium text-green-600">{analytics.onTimeDelivery}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Late Deliveries</span>
                <span className="text-sm font-medium text-red-600">{analytics.lateDeliveries}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Quality Issues</span>
                <span className="text-sm font-medium text-orange-600">{analytics.qualityIssues}</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Success Rate</span>
                  <span className="text-sm font-bold text-green-600">{onTimeDeliveryRate}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="h-5 w-5 mr-2" />
              Quality Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Quality Issues</span>
                <span className="text-sm font-medium text-red-600">{analytics.qualityIssues}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Issue Rate</span>
                <span className="text-sm font-medium text-red-600">{qualityIssueRate}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avg Quality Score</span>
                <span className="text-sm font-medium text-green-600">4.5/5.0</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Quality Rating</span>
                  <span className="text-sm font-bold text-green-600">Excellent</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <LineChart className="h-5 w-5 mr-2" />
              Cost Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Spent</span>
                <span className="text-sm font-medium">₹{(analytics.totalSpent / 100000).toFixed(1)}L</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avg Order Value</span>
                <span className="text-sm font-medium">₹{analytics.avgOrderValue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Cost per Item</span>
                <span className="text-sm font-medium">₹{(analytics.totalSpent / analytics.topItems.reduce((sum, item) => sum + item.totalQuantity, 0)).toFixed(0)}</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Budget Utilization</span>
                  <span className="text-sm font-bold text-blue-600">85%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Suppliers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart className="h-5 w-5 mr-2" />
            Top Suppliers Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Supplier</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Avg Delivery Time</TableHead>
                <TableHead>Quality Score</TableHead>
                <TableHead>On-Time Rate</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analytics.topSuppliers.map((supplier) => (
                <TableRow key={supplier.supplierId}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{supplier.supplierName}</div>
                      <div className="text-sm text-gray-500">{supplier.supplierId}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{supplier.totalOrders}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">₹{(supplier.totalSpent / 1000).toFixed(0)}K</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{supplier.avgDeliveryTime} days</div>
                  </TableCell>
                  <TableCell>
                    <div className={`font-medium ${getQualityScoreColor(supplier.qualityScore)}`}>
                      {supplier.qualityScore}/5.0
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className={`font-medium ${getDeliveryRateColor(supplier.onTimeDeliveryRate)}`}>
                      {supplier.onTimeDeliveryRate}%
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Top Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="h-5 w-5 mr-2" />
            Top Purchased Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Total Quantity</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Avg Unit Price</TableHead>
                <TableHead>Order Frequency</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analytics.topItems.map((item) => (
                <TableRow key={item.itemId}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{item.itemName}</div>
                      <div className="text-sm text-gray-500">{item.itemId}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{item.totalQuantity.toLocaleString()}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">₹{(item.totalSpent / 1000).toFixed(0)}K</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">₹{item.avgUnitPrice.toLocaleString()}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{item.orderFrequency} orders</div>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 