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
  Plus, 
  FileText,
  AlertTriangle,
  Package,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Send
} from 'lucide-react';

interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierName: string;
  supplierId: string;
  orderDate: string;
  expectedDelivery: string;
  status: 'Draft' | 'Sent' | 'Confirmed' | 'In Transit' | 'Received' | 'Cancelled';
  totalAmount: number;
  items: PurchaseOrderItem[];
  notes?: string;
  createdBy: string;
  createdAt: string;
}

interface PurchaseOrderItem {
  itemId: string;
  itemName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

export default function PurchaseOrdersPage() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([
    {
      id: 'PO001',
      poNumber: 'PO-2024-001',
      supplierName: 'ABC Suppliers',
      supplierId: 'SUP001',
      orderDate: '2024-01-15',
      expectedDelivery: '2024-01-25',
      status: 'Sent',
      totalAmount: 25000,
      items: [
        {
          itemId: 'INV001',
          itemName: 'Ashwagandha',
          quantity: 50,
          unit: 'kg',
          unitPrice: 500,
          totalPrice: 25000
        }
      ],
      notes: 'Urgent order for low stock items',
      createdBy: 'John Doe',
      createdAt: '2024-01-15T10:00:00Z'
    },
    {
      id: 'PO002',
      poNumber: 'PO-2024-002',
      supplierName: 'XYZ Pharmaceuticals',
      supplierId: 'SUP002',
      orderDate: '2024-01-16',
      expectedDelivery: '2024-01-30',
      status: 'Draft',
      totalAmount: 15000,
      items: [
        {
          itemId: 'INV002',
          itemName: 'Brahmi',
          quantity: 30,
          unit: 'kg',
          unitPrice: 500,
          totalPrice: 15000
        }
      ],
      notes: 'Regular monthly order',
      createdBy: 'Jane Smith',
      createdAt: '2024-01-16T14:30:00Z'
    }
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [supplierFilter, setSupplierFilter] = useState<string>('all');

  // Filter purchase orders
  const filteredOrders = useMemo(() => {
    let filtered = purchaseOrders;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.createdBy.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Supplier filter
    if (supplierFilter !== 'all') {
      filtered = filtered.filter(order => order.supplierId === supplierFilter);
    }

    return filtered.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
  }, [purchaseOrders, searchTerm, statusFilter, supplierFilter]);

  const suppliers = Array.from(new Set(purchaseOrders.map(order => ({ id: order.supplierId, name: order.supplierName }))));

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'Draft': { color: 'secondary' as const, bg: 'bg-gray-100 text-gray-800' },
      'Sent': { color: 'default' as const, bg: 'bg-blue-100 text-blue-800' },
      'Confirmed': { color: 'default' as const, bg: 'bg-green-100 text-green-800' },
      'In Transit': { color: 'default' as const, bg: 'bg-orange-100 text-orange-800' },
      'Received': { color: 'default' as const, bg: 'bg-green-100 text-green-800' },
      'Cancelled': { color: 'destructive' as const, bg: 'bg-red-100 text-red-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['Draft'];

    return (
      <Badge variant={config.color} className={config.bg}>
        {status}
      </Badge>
    );
  };

  const getDaysUntilDelivery = (expectedDelivery: string) => {
    const now = new Date();
    const delivery = new Date(expectedDelivery);
    const diffTime = delivery.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6 p-6 text-gray-700">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Purchase Orders</h1>
          <p className="text-gray-600 mt-1">Create and manage purchase orders</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => {}}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Purchase Order
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-blue-600">{purchaseOrders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Pending Orders</p>
                <p className="text-2xl font-bold text-green-600">
                  {purchaseOrders.filter(order => ['Sent', 'Confirmed', 'In Transit'].includes(order.status)).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-orange-600">
                  {purchaseOrders.filter(order => {
                    const daysUntil = getDaysUntilDelivery(order.expectedDelivery);
                    return daysUntil < 0 && ['Sent', 'Confirmed', 'In Transit'].includes(order.status);
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Send className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-purple-600">
                  ₹{purchaseOrders.reduce((sum, order) => sum + order.totalAmount, 0).toLocaleString()}
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
                  placeholder="Search by PO number, supplier, or creator..."
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
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Sent">Sent</SelectItem>
                  <SelectItem value="Confirmed">Confirmed</SelectItem>
                  <SelectItem value="In Transit">In Transit</SelectItem>
                  <SelectItem value="Received">Received</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
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
                  {suppliers.map(supplier => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
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
                  setSupplierFilter('all');
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
          Showing {filteredOrders.length} of {purchaseOrders.length} purchase orders
        </p>
        <div className="flex space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4 text-blue-600" />
            <span>Total: {purchaseOrders.length}</span>
          </div>
        </div>
      </div>

      {/* Purchase Orders Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PO Number</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Order Date</TableHead>
                <TableHead>Expected Delivery</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => {
                const daysUntilDelivery = getDaysUntilDelivery(order.expectedDelivery);
                const isOverdue = daysUntilDelivery < 0 && ['Sent', 'Confirmed', 'In Transit'].includes(order.status);

                return (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.poNumber}</div>
                        <div className="text-sm text-gray-500">Created by {order.createdBy}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.supplierName}</div>
                        <div className="text-sm text-gray-500">{order.supplierId}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(order.orderDate).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">
                          {new Date(order.expectedDelivery).toLocaleDateString()}
                        </div>
                        {isOverdue ? (
                          <div className="text-xs text-red-600">
                            {Math.abs(daysUntilDelivery)} days overdue
                          </div>
                        ) : daysUntilDelivery >= 0 && daysUntilDelivery <= 7 ? (
                          <div className="text-xs text-orange-600">
                            {daysUntilDelivery} days left
                          </div>
                        ) : (
                          <div className="text-xs text-gray-500">
                            {daysUntilDelivery} days left
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(order.status)}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        ₹{order.totalAmount.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </div>
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
          
          {filteredOrders.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No purchase orders found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 