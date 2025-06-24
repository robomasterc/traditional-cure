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
  Truck,
  AlertTriangle,
  Package,
  RefreshCw,
  Eye,
  Phone,
  MapPin,
  Clock,
  Calendar,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface OrderTracking {
  id: string;
  poNumber: string;
  supplierName: string;
  supplierId: string;
  orderDate: string;
  expectedDelivery: string;
  status: 'Sent' | 'Confirmed' | 'In Transit' | 'Out for Delivery' | 'Delivered' | 'Delayed';
  currentLocation?: string;
  trackingNumber?: string;
  carrier?: string;
  lastUpdate: string;
  totalAmount: number;
  items: TrackingItem[];
  notes?: string;
  contactPerson: string;
  contactPhone: string;
}

interface TrackingItem {
  itemId: string;
  itemName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

export default function OrderTrackingPage() {
  const [orders, setOrders] = useState<OrderTracking[]>([
    {
      id: 'TR001',
      poNumber: 'PO-2024-001',
      supplierName: 'ABC Suppliers',
      supplierId: 'SUP001',
      orderDate: '2024-01-15',
      expectedDelivery: '2024-01-25',
      status: 'In Transit',
      currentLocation: 'Mumbai Distribution Center',
      trackingNumber: 'TRK123456789',
      carrier: 'Express Logistics',
      lastUpdate: '2024-01-20T14:30:00Z',
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
      notes: 'Package left distribution center',
      contactPerson: 'Rajesh Kumar',
      contactPhone: '+91 98765 43210'
    },
    {
      id: 'TR002',
      poNumber: 'PO-2024-002',
      supplierName: 'XYZ Pharmaceuticals',
      supplierId: 'SUP002',
      orderDate: '2024-01-16',
      expectedDelivery: '2024-01-30',
      status: 'Confirmed',
      lastUpdate: '2024-01-18T10:15:00Z',
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
      notes: 'Order confirmed, preparing for shipment',
      contactPerson: 'Priya Sharma',
      contactPhone: '+91 87654 32109'
    },
    {
      id: 'TR003',
      poNumber: 'PO-2024-003',
      supplierName: 'MediCare Supplies',
      supplierId: 'SUP003',
      orderDate: '2024-01-10',
      expectedDelivery: '2024-01-20',
      status: 'Delayed',
      currentLocation: 'Delhi Hub',
      trackingNumber: 'TRK987654321',
      carrier: 'FastTrack Delivery',
      lastUpdate: '2024-01-19T16:45:00Z',
      totalAmount: 35000,
      items: [
        {
          itemId: 'INV003',
          itemName: 'Ginseng',
          quantity: 25,
          unit: 'kg',
          unitPrice: 1400,
          totalPrice: 35000
        }
      ],
      notes: 'Weather delay in transit',
      contactPerson: 'Amit Patel',
      contactPhone: '+91 76543 21098'
    }
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [supplierFilter, setSupplierFilter] = useState<string>('all');

  // Filter orders
  const filteredOrders = useMemo(() => {
    let filtered = orders;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.trackingNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
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

    return filtered.sort((a, b) => new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime());
  }, [orders, searchTerm, statusFilter, supplierFilter]);

  const suppliers = Array.from(new Set(orders.map(order => ({ id: order.supplierId, name: order.supplierName }))));

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'Sent': { color: 'default' as const, bg: 'bg-blue-100 text-blue-800' },
      'Confirmed': { color: 'default' as const, bg: 'bg-green-100 text-green-800' },
      'In Transit': { color: 'default' as const, bg: 'bg-orange-100 text-orange-800' },
      'Out for Delivery': { color: 'default' as const, bg: 'bg-purple-100 text-purple-800' },
      'Delivered': { color: 'default' as const, bg: 'bg-green-100 text-green-800' },
      'Delayed': { color: 'destructive' as const, bg: 'bg-red-100 text-red-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['Sent'];

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

  const getTimeSinceUpdate = (lastUpdate: string) => {
    const now = new Date();
    const update = new Date(lastUpdate);
    const diffTime = now.getTime() - update.getTime();
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  return (
    <div className="space-y-6 p-6 text-gray-700">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order Tracking</h1>
          <p className="text-gray-600 mt-1">Track pending orders and shipments</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => {}}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Truck className="h-4 w-4 mr-2" />
            Track New Order
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Truck className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Active Orders</p>
                <p className="text-2xl font-bold text-blue-600">
                  {orders.filter(order => ['Sent', 'Confirmed', 'In Transit', 'Out for Delivery'].includes(order.status)).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Delivered</p>
                <p className="text-2xl font-bold text-green-600">
                  {orders.filter(order => order.status === 'Delivered').length}
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
                <p className="text-sm text-gray-600">Delayed</p>
                <p className="text-2xl font-bold text-orange-600">
                  {orders.filter(order => order.status === 'Delayed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-purple-600">
                  {orders.filter(order => {
                    const daysUntil = getDaysUntilDelivery(order.expectedDelivery);
                    return daysUntil < 0 && ['Sent', 'Confirmed', 'In Transit', 'Out for Delivery'].includes(order.status);
                  }).length}
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
                  placeholder="Search by PO number, supplier, tracking number..."
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
                  <SelectItem value="Sent">Sent</SelectItem>
                  <SelectItem value="Confirmed">Confirmed</SelectItem>
                  <SelectItem value="In Transit">In Transit</SelectItem>
                  <SelectItem value="Out for Delivery">Out for Delivery</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                  <SelectItem value="Delayed">Delayed</SelectItem>
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
          Showing {filteredOrders.length} of {orders.length} tracked orders
        </p>
        <div className="flex space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <Truck className="h-4 w-4 text-blue-600" />
            <span>Active: {orders.filter(order => ['Sent', 'Confirmed', 'In Transit', 'Out for Delivery'].includes(order.status)).length}</span>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PO Number</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expected Delivery</TableHead>
                <TableHead>Current Location</TableHead>
                <TableHead>Last Update</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => {
                const daysUntilDelivery = getDaysUntilDelivery(order.expectedDelivery);
                const isOverdue = daysUntilDelivery < 0 && ['Sent', 'Confirmed', 'In Transit', 'Out for Delivery'].includes(order.status);

                return (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.poNumber}</div>
                        {order.trackingNumber && (
                          <div className="text-sm text-gray-500">#{order.trackingNumber}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.supplierName}</div>
                        <div className="text-sm text-gray-500">{order.supplierId}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(order.status)}
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
                        ) : daysUntilDelivery >= 0 && daysUntilDelivery <= 3 ? (
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
                      <div>
                        {order.currentLocation ? (
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3 text-gray-400" />
                            <span className="text-sm">{order.currentLocation}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Not available</span>
                        )}
                        {order.carrier && (
                          <div className="text-xs text-gray-500">{order.carrier}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">
                          {new Date(order.lastUpdate).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {getTimeSinceUpdate(order.lastUpdate)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm font-medium">{order.contactPerson}</div>
                        <div className="text-xs text-gray-500">{order.contactPhone}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Phone className="h-4 w-4" />
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
          
          {filteredOrders.length === 0 && (
            <div className="text-center py-8">
              <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No orders found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 