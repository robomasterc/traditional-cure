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
  PackageCheck,
  AlertTriangle,
  Package,
  RefreshCw,
  Eye,
  CheckCircle,
  XCircle,
  Truck,
  Calendar,
  Clock,
  FileText,
  Plus
} from 'lucide-react';

interface GoodsReceiving {
  id: string;
  poNumber: string;
  supplierName: string;
  supplierId: string;
  orderDate: string;
  expectedDelivery: string;
  actualDelivery: string;
  status: 'Pending' | 'In Transit' | 'Arrived' | 'Inspecting' | 'Accepted' | 'Rejected' | 'Partially Accepted';
  totalItems: number;
  receivedItems: number;
  totalAmount: number;
  receivedAmount: number;
  items: ReceivingItem[];
  notes?: string;
  receivedBy: string;
  receivedAt: string;
  qualityCheck: 'Pending' | 'Passed' | 'Failed' | 'Partial';
  inspectionNotes?: string;
}

interface ReceivingItem {
  itemId: string;
  itemName: string;
  orderedQuantity: number;
  receivedQuantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  quality: 'Good' | 'Damaged' | 'Expired' | 'Wrong Item';
  notes?: string;
}

export default function GoodsReceivingPage() {
  const [receivings, setReceivings] = useState<GoodsReceiving[]>([
    {
      id: 'GR001',
      poNumber: 'PO-2024-001',
      supplierName: 'ABC Suppliers',
      supplierId: 'SUP001',
      orderDate: '2024-01-15',
      expectedDelivery: '2024-01-25',
      actualDelivery: '2024-01-24',
      status: 'Accepted',
      totalItems: 3,
      receivedItems: 3,
      totalAmount: 45000,
      receivedAmount: 45000,
      items: [
        {
          itemId: 'INV001',
          itemName: 'Ashwagandha',
          orderedQuantity: 50,
          receivedQuantity: 50,
          unit: 'kg',
          unitPrice: 500,
          totalPrice: 25000,
          quality: 'Good'
        },
        {
          itemId: 'INV002',
          itemName: 'Brahmi',
          orderedQuantity: 30,
          receivedQuantity: 30,
          unit: 'kg',
          unitPrice: 500,
          totalPrice: 15000,
          quality: 'Good'
        },
        {
          itemId: 'INV003',
          itemName: 'Ginseng',
          orderedQuantity: 10,
          receivedQuantity: 10,
          unit: 'kg',
          unitPrice: 500,
          totalPrice: 5000,
          quality: 'Good'
        }
      ],
      notes: 'All items received in good condition',
      receivedBy: 'John Doe',
      receivedAt: '2024-01-24T10:30:00Z',
      qualityCheck: 'Passed'
    },
    {
      id: 'GR002',
      poNumber: 'PO-2024-002',
      supplierName: 'XYZ Pharmaceuticals',
      supplierId: 'SUP002',
      orderDate: '2024-01-16',
      expectedDelivery: '2024-01-30',
      actualDelivery: '2024-01-29',
      status: 'Partially Accepted',
      totalItems: 2,
      receivedItems: 1,
      totalAmount: 20000,
      receivedAmount: 15000,
      items: [
        {
          itemId: 'INV004',
          itemName: 'Turmeric',
          orderedQuantity: 40,
          receivedQuantity: 30,
          unit: 'kg',
          unitPrice: 500,
          totalPrice: 15000,
          quality: 'Good',
          notes: '10kg short'
        },
        {
          itemId: 'INV005',
          itemName: 'Ginger',
          orderedQuantity: 20,
          receivedQuantity: 0,
          unit: 'kg',
          unitPrice: 250,
          totalPrice: 0,
          quality: 'Wrong Item',
          notes: 'Item not received'
        }
      ],
      notes: 'Partial delivery received',
      receivedBy: 'Jane Smith',
      receivedAt: '2024-01-29T14:15:00Z',
      qualityCheck: 'Partial',
      inspectionNotes: 'Ginger not received, Turmeric short by 10kg'
    },
    {
      id: 'GR003',
      poNumber: 'PO-2024-003',
      supplierName: 'MediCare Supplies',
      supplierId: 'SUP003',
      orderDate: '2024-01-10',
      expectedDelivery: '2024-01-20',
      actualDelivery: '',
      status: 'In Transit',
      totalItems: 1,
      receivedItems: 0,
      totalAmount: 35000,
      receivedAmount: 0,
      items: [
        {
          itemId: 'INV006',
          itemName: 'Saffron',
          orderedQuantity: 5,
          receivedQuantity: 0,
          unit: 'kg',
          unitPrice: 7000,
          totalPrice: 0,
          quality: 'Good'
        }
      ],
      notes: 'Expected to arrive tomorrow',
      receivedBy: '',
      receivedAt: '',
      qualityCheck: 'Pending'
    }
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [supplierFilter, setSupplierFilter] = useState<string>('all');
  const [qualityFilter, setQualityFilter] = useState<string>('all');

  // Filter receivings
  const filteredReceivings = useMemo(() => {
    let filtered = receivings;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(receiving =>
        receiving.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        receiving.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        receiving.receivedBy.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(receiving => receiving.status === statusFilter);
    }

    // Supplier filter
    if (supplierFilter !== 'all') {
      filtered = filtered.filter(receiving => receiving.supplierId === supplierFilter);
    }

    // Quality filter
    if (qualityFilter !== 'all') {
      filtered = filtered.filter(receiving => receiving.qualityCheck === qualityFilter);
    }

    return filtered.sort((a, b) => {
      if (a.status === 'In Transit' && b.status !== 'In Transit') return -1;
      if (a.status !== 'In Transit' && b.status === 'In Transit') return 1;
      return new Date(b.receivedAt || b.expectedDelivery).getTime() - new Date(a.receivedAt || a.expectedDelivery).getTime();
    });
  }, [receivings, searchTerm, statusFilter, supplierFilter, qualityFilter]);

  const suppliers = Array.from(new Set(receivings.map(receiving => ({ id: receiving.supplierId, name: receiving.supplierName }))));

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'Pending': { color: 'secondary' as const, bg: 'bg-gray-100 text-gray-800' },
      'In Transit': { color: 'default' as const, bg: 'bg-blue-100 text-blue-800' },
      'Arrived': { color: 'default' as const, bg: 'bg-orange-100 text-orange-800' },
      'Inspecting': { color: 'default' as const, bg: 'bg-yellow-100 text-yellow-800' },
      'Accepted': { color: 'default' as const, bg: 'bg-green-100 text-green-800' },
      'Rejected': { color: 'destructive' as const, bg: 'bg-red-100 text-red-800' },
      'Partially Accepted': { color: 'default' as const, bg: 'bg-purple-100 text-purple-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['Pending'];

    return (
      <Badge variant={config.color} className={config.bg}>
        {status}
      </Badge>
    );
  };

  const getQualityBadge = (quality: string) => {
    const qualityConfig = {
      'Pending': { color: 'secondary' as const, bg: 'bg-gray-100 text-gray-800' },
      'Passed': { color: 'default' as const, bg: 'bg-green-100 text-green-800' },
      'Failed': { color: 'destructive' as const, bg: 'bg-red-100 text-red-800' },
      'Partial': { color: 'default' as const, bg: 'bg-orange-100 text-orange-800' }
    };

    const config = qualityConfig[quality as keyof typeof qualityConfig] || qualityConfig['Pending'];

    return (
      <Badge variant={config.color} className={config.bg}>
        {quality}
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
          <h1 className="text-3xl font-bold text-gray-900">Goods Receiving</h1>
          <p className="text-gray-600 mt-1">Process incoming inventory and quality checks</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => {}}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Receiving
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
                <p className="text-sm text-gray-600">In Transit</p>
                <p className="text-2xl font-bold text-blue-600">
                  {receivings.filter(receiving => receiving.status === 'In Transit').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Arrived</p>
                <p className="text-2xl font-bold text-orange-600">
                  {receivings.filter(receiving => ['Arrived', 'Inspecting'].includes(receiving.status)).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Accepted</p>
                <p className="text-2xl font-bold text-green-600">
                  {receivings.filter(receiving => receiving.status === 'Accepted').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">Issues</p>
                <p className="text-2xl font-bold text-red-600">
                  {receivings.filter(receiving => ['Rejected', 'Partially Accepted'].includes(receiving.status)).length}
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by PO number, supplier..."
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
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Transit">In Transit</SelectItem>
                  <SelectItem value="Arrived">Arrived</SelectItem>
                  <SelectItem value="Inspecting">Inspecting</SelectItem>
                  <SelectItem value="Accepted">Accepted</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                  <SelectItem value="Partially Accepted">Partially Accepted</SelectItem>
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

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Quality</label>
              <Select value={qualityFilter} onValueChange={setQualityFilter}>
                <SelectTrigger className="text-gray-700 bg-white">
                  <SelectValue placeholder="All quality" />
                </SelectTrigger>
                <SelectContent className="text-gray-700 bg-white">
                  <SelectItem value="all">All Quality</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Passed">Passed</SelectItem>
                  <SelectItem value="Failed">Failed</SelectItem>
                  <SelectItem value="Partial">Partial</SelectItem>
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
                  setQualityFilter('all');
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
          Showing {filteredReceivings.length} of {receivings.length} receiving records
        </p>
        <div className="flex space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <PackageCheck className="h-4 w-4 text-blue-600" />
            <span>Total: {receivings.length}</span>
          </div>
        </div>
      </div>

      {/* Receiving Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PO Number</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expected Delivery</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Quality Check</TableHead>
                <TableHead>Received By</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReceivings.map((receiving) => {
                const daysUntilDelivery = getDaysUntilDelivery(receiving.expectedDelivery);
                const isOverdue = daysUntilDelivery < 0 && receiving.status === 'In Transit';

                return (
                  <TableRow key={receiving.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{receiving.poNumber}</div>
                        <div className="text-sm text-gray-500">Order: {new Date(receiving.orderDate).toLocaleDateString()}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{receiving.supplierName}</div>
                        <div className="text-sm text-gray-500">{receiving.supplierId}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(receiving.status)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">
                          {new Date(receiving.expectedDelivery).toLocaleDateString()}
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
                        <div className="text-sm">
                          {receiving.receivedItems}/{receiving.totalItems} items
                        </div>
                        <div className="text-xs text-gray-500">
                          {Math.round((receiving.receivedItems / receiving.totalItems) * 100)}% complete
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          ₹{receiving.receivedAmount.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          of ₹{receiving.totalAmount.toLocaleString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getQualityBadge(receiving.qualityCheck)}
                    </TableCell>
                    <TableCell>
                      <div>
                        {receiving.receivedBy ? (
                          <>
                            <div className="text-sm font-medium">{receiving.receivedBy}</div>
                            <div className="text-xs text-gray-500">
                              {new Date(receiving.receivedAt).toLocaleDateString()}
                            </div>
                          </>
                        ) : (
                          <span className="text-sm text-gray-400">Not received</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {receiving.status === 'Arrived' && (
                          <Button variant="ghost" size="sm">
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        {receiving.status === 'In Transit' && (
                          <Button variant="ghost" size="sm">
                            <PackageCheck className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          {filteredReceivings.length === 0 && (
            <div className="text-center py-8">
              <PackageCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No receiving records found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 