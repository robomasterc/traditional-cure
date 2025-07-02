'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  AlertTriangle, 
  Plus, 
  ShoppingCart,
  Package,
  TrendingDown
} from 'lucide-react';
import { useInventory } from '@/hooks/useInventory';

export default function LowStockAlertsPage() {
  const { inventory, loading, error, refetch } = useInventory();

  const lowStockItems = inventory.filter(item => 
    item.stock <= item.reorderLevel && item.stock > 0
  );

  const getUrgencyLevel = (item: { stock: number; reorderLevel: number }) => {
    const stockPercentage = (item.stock / item.reorderLevel) * 100;
    if (stockPercentage <= 25) {
      return { level: 'critical', label: 'Critical', color: 'destructive' as const };
    } else if (stockPercentage <= 50) {
      return { level: 'high', label: 'High', color: 'secondary' as const };
    } else {
      return { level: 'medium', label: 'Medium', color: 'default' as const };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <div className="animate-spin h-6 w-6 border-2 border-orange-600 border-t-transparent rounded-full"></div>
          <span className="text-lg">Loading low stock alerts...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Alerts</h2>
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
          <h1 className="text-3xl font-bold text-gray-900">Low Stock Alerts</h1>
          <p className="text-gray-600 mt-1">
            Items below reorder level that need attention
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={refetch}>
            Refresh
          </Button>
          <Button>
            <ShoppingCart className="h-4 w-4 mr-2" />
            Create Purchase Order
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{lowStockItems.length}</div>
            <p className="text-xs text-muted-foreground">
              Items need reordering
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Level</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {lowStockItems.filter(item => (item.stock / item.reorderLevel) * 100 <= 25).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Below 25% of reorder level
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estimated Value</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ₹{lowStockItems.reduce((sum, item) => sum + (item.stock * item.sellingPrice), 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Current stock value
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Items Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
            Low Stock Items ({lowStockItems.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {lowStockItems.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-gray-500">No low stock alerts! All items are well stocked.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Reorder Level</TableHead>
                  <TableHead>Stock Level</TableHead>
                  <TableHead>Urgency</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowStockItems.map((item) => {
                  const urgency = getUrgencyLevel(item);
                  const stockPercentage = (item.stock / item.reorderLevel) * 100;
                  const suggestedOrder = Math.max(item.reorderLevel * 2, 10);

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
                            {stockPercentage.toFixed(1)}% of reorder level
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{item.reorderLevel} {item.unit}</div>
                      </TableCell>
                      <TableCell>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              urgency.level === 'critical' ? 'bg-red-500' :
                              urgency.level === 'high' ? 'bg-orange-500' : 'bg-yellow-500'
                            }`}
                            style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                          ></div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={urgency.color}>
                          {urgency.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <ShoppingCart className="h-4 w-4 mr-1" />
                            Order {suggestedOrder}
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 