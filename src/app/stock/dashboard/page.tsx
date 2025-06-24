'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  XCircle,
  Plus,
  Search,
  Filter,
  RefreshCw
} from 'lucide-react';
import { useInventory } from '@/hooks/useInventory';

interface DashboardStats {
  totalItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  expiringItems: number;
  totalValue: number;
  categories: { [key: string]: number };
}

export default function StockDashboardPage() {
  const { inventory, loading, error, refetch } = useInventory();
  const [stats, setStats] = React.useState<DashboardStats>({
    totalItems: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    expiringItems: 0,
    totalValue: 0,
    categories: {}
  });

  // Calculate dashboard statistics
  React.useEffect(() => {
    if (inventory.length > 0) {
      const now = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(now.getDate() + 30);

      const newStats: DashboardStats = {
        totalItems: inventory.length,
        lowStockItems: inventory.filter(item => item.stock <= item.reorderLevel && item.stock > 0).length,
        outOfStockItems: inventory.filter(item => item.stock === 0).length,
        expiringItems: inventory.filter(item => 
          new Date(item.expiryDate) <= thirtyDaysFromNow && 
          new Date(item.expiryDate) > now
        ).length,
        totalValue: inventory.reduce((sum, item) => sum + (item.stock * item.sellingPrice), 0),
        categories: inventory.reduce((acc, item) => {
          acc[item.category] = (acc[item.category] || 0) + 1;
          return acc;
        }, {} as { [key: string]: number })
      };

      setStats(newStats);
    }
  }, [inventory]);

  const getLowStockItems = () => {
    return inventory.filter(item => item.stock <= item.reorderLevel && item.stock > 0);
  };

  const getOutOfStockItems = () => {
    return inventory.filter(item => item.stock === 0);
  };

  const getExpiringItems = () => {
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);
    
    return inventory.filter(item => 
      new Date(item.expiryDate) <= thirtyDaysFromNow && 
      new Date(item.expiryDate) > now
    );
  };

  const getStockUtilization = (item: any) => {
    const utilization = (item.stock / (item.stock + item.reorderLevel)) * 100;
    return Math.min(utilization, 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <RefreshCw className="animate-spin h-6 w-6 text-blue-600" />
          <span className="text-lg">Loading inventory data...</span>
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
            <RefreshCw className="h-4 w-4 mr-2" />
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
          <h1 className="text-3xl font-bold text-gray-900">Inventory Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor your inventory status and alerts</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={refetch}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalItems}</div>
            <p className="text-xs text-muted-foreground">
              Across {Object.keys(stats.categories).length} categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.lowStockItems}</div>
            <p className="text-xs text-muted-foreground">
              Below reorder level
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.outOfStockItems}</div>
            <p className="text-xs text-muted-foreground">
              Zero stock items
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₹{stats.totalValue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Current stock value
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {getLowStockItems().length === 0 ? (
              <p className="text-gray-500 text-sm">No low stock items</p>
            ) : (
              <div className="space-y-3">
                {getLowStockItems().slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-gray-600">{item.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-orange-600">
                        {item.stock} {item.unit}
                      </p>
                      <p className="text-xs text-gray-500">
                        Reorder: {item.reorderLevel}
                      </p>
                    </div>
                  </div>
                ))}
                {getLowStockItems().length > 5 && (
                  <p className="text-sm text-gray-500 text-center">
                    +{getLowStockItems().length - 5} more items
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Out of Stock Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <XCircle className="h-5 w-5 text-red-500 mr-2" />
              Out of Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            {getOutOfStockItems().length === 0 ? (
              <p className="text-gray-500 text-sm">No out of stock items</p>
            ) : (
              <div className="space-y-3">
                {getOutOfStockItems().slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-gray-600">{item.category}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="destructive">Out of Stock</Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        ₹{item.sellingPrice}
                      </p>
                    </div>
                  </div>
                ))}
                {getOutOfStockItems().length > 5 && (
                  <p className="text-sm text-gray-500 text-center">
                    +{getOutOfStockItems().length - 5} more items
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Expiring Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 text-yellow-500 mr-2" />
            Expiring Soon (Next 30 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {getExpiringItems().length === 0 ? (
            <p className="text-gray-500 text-sm">No items expiring soon</p>
          ) : (
            <div className="space-y-3">
              {getExpiringItems().slice(0, 10).map((item) => {
                const daysUntilExpiry = Math.ceil(
                  (new Date(item.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                );
                return (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-gray-600">{item.category} • {item.stock} {item.unit}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={daysUntilExpiry <= 7 ? "destructive" : "secondary"}>
                        {daysUntilExpiry} days
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(item.expiryDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })}
              {getExpiringItems().length > 10 && (
                <p className="text-sm text-gray-500 text-center">
                  +{getExpiringItems().length - 10} more items
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Object.entries(stats.categories).map(([category, count]) => (
              <div key={category} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{count}</div>
                <div className="text-sm text-gray-600 capitalize">{category}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 