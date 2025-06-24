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
  Users,
  UserPlus,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Star,
  Package,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';

interface Supplier {
  id: string;
  name: string;
  code: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gstNumber: string;
  panNumber: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  category: string;
  rating: number;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  avgDeliveryTime: number;
  qualityScore: number;
  onTimeDeliveryRate: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function SupplierListPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([
    {
      id: 'SUP001',
      name: 'ABC Suppliers',
      code: 'ABC001',
      contactPerson: 'Rajesh Kumar',
      email: 'rajesh@abcsuppliers.com',
      phone: '+91 98765 43210',
      address: '123 Industrial Area, Phase 1',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      gstNumber: '27AABCA1234A1Z5',
      panNumber: 'AABCA1234A',
      status: 'Active',
      category: 'Herbal Medicines',
      rating: 4.8,
      totalOrders: 45,
      totalSpent: 675000,
      lastOrderDate: '2024-01-15',
      avgDeliveryTime: 8.5,
      qualityScore: 4.8,
      onTimeDeliveryRate: 95.6,
      notes: 'Reliable supplier for herbal medicines',
      createdAt: '2023-01-15T10:00:00Z',
      updatedAt: '2024-01-15T14:30:00Z'
    },
    {
      id: 'SUP002',
      name: 'XYZ Pharmaceuticals',
      code: 'XYZ002',
      contactPerson: 'Priya Sharma',
      email: 'priya@xyzpharma.com',
      phone: '+91 87654 32109',
      address: '456 Pharma Park, Sector 2',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110001',
      gstNumber: '07XYZPH5678B2Z6',
      panNumber: 'XYZPH5678B',
      status: 'Active',
      category: 'Allopathic Medicines',
      rating: 4.6,
      totalOrders: 38,
      totalSpent: 570000,
      lastOrderDate: '2024-01-16',
      avgDeliveryTime: 7.2,
      qualityScore: 4.6,
      onTimeDeliveryRate: 92.1,
      notes: 'Good quality allopathic medicines',
      createdAt: '2023-02-20T11:00:00Z',
      updatedAt: '2024-01-16T16:45:00Z'
    },
    {
      id: 'SUP003',
      name: 'MediCare Supplies',
      code: 'MED003',
      contactPerson: 'Amit Patel',
      email: 'amit@medicare.com',
      phone: '+91 76543 21098',
      address: '789 Medical Hub, Block A',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001',
      gstNumber: '29MEDSU9012C3Z7',
      panNumber: 'MEDSU9012C',
      status: 'Active',
      category: 'Medical Equipment',
      rating: 4.4,
      totalOrders: 32,
      totalSpent: 480000,
      lastOrderDate: '2024-01-10',
      avgDeliveryTime: 9.1,
      qualityScore: 4.4,
      onTimeDeliveryRate: 87.5,
      notes: 'Specialized in medical equipment',
      createdAt: '2023-03-10T09:30:00Z',
      updatedAt: '2024-01-10T12:15:00Z'
    },
    {
      id: 'SUP004',
      name: 'HealthPlus Distributors',
      code: 'HLT004',
      contactPerson: 'Sneha Reddy',
      email: 'sneha@healthplus.com',
      phone: '+91 65432 10987',
      address: '321 Health Zone, Unit 5',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500001',
      gstNumber: '36HLTDI3456D4Z8',
      panNumber: 'HLTDI3456D',
      status: 'Active',
      category: 'Health Supplements',
      rating: 4.7,
      totalOrders: 28,
      totalSpent: 420000,
      lastOrderDate: '2024-01-12',
      avgDeliveryTime: 6.8,
      qualityScore: 4.7,
      onTimeDeliveryRate: 96.4,
      notes: 'Premium health supplements supplier',
      createdAt: '2023-04-05T14:20:00Z',
      updatedAt: '2024-01-12T10:30:00Z'
    },
    {
      id: 'SUP005',
      name: 'Natural Remedies Co.',
      code: 'NAT005',
      contactPerson: 'Vikram Singh',
      email: 'vikram@naturalremedies.com',
      phone: '+91 54321 09876',
      address: '654 Nature Valley, Plot 12',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411001',
      gstNumber: '27NATRE7890E5Z9',
      panNumber: 'NATRE7890E',
      status: 'Suspended',
      category: 'Ayurvedic Medicines',
      rating: 4.2,
      totalOrders: 13,
      totalSpent: 305000,
      lastOrderDate: '2023-12-20',
      avgDeliveryTime: 10.2,
      qualityScore: 4.2,
      onTimeDeliveryRate: 76.9,
      notes: 'Suspended due to quality issues',
      createdAt: '2023-05-15T16:45:00Z',
      updatedAt: '2023-12-20T18:20:00Z'
    }
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [ratingFilter, setRatingFilter] = useState<string>('all');

  // Filter suppliers
  const filteredSuppliers = useMemo(() => {
    let filtered = suppliers;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(supplier =>
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.phone.includes(searchTerm)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(supplier => supplier.status === statusFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(supplier => supplier.category === categoryFilter);
    }

    // Rating filter
    if (ratingFilter !== 'all') {
      const minRating = parseFloat(ratingFilter);
      filtered = filtered.filter(supplier => supplier.rating >= minRating);
    }

    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [suppliers, searchTerm, statusFilter, categoryFilter, ratingFilter]);

  const categories = Array.from(new Set(suppliers.map(supplier => supplier.category)));

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'Active': { color: 'default' as const, bg: 'bg-green-100 text-green-800' },
      'Inactive': { color: 'secondary' as const, bg: 'bg-gray-100 text-gray-800' },
      'Suspended': { color: 'destructive' as const, bg: 'bg-red-100 text-red-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['Inactive'];

    return (
      <Badge variant={config.color} className={config.bg}>
        {status}
      </Badge>
    );
  };

  const getRatingStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-3 w-3 ${
                star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
              }`}
            />
          ))}
        </div>
        <span className="text-xs text-gray-600">({rating})</span>
      </div>
    );
  };

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
          <h1 className="text-3xl font-bold text-gray-900">All Suppliers</h1>
          <p className="text-gray-600 mt-1">Complete supplier directory</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => {}}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Supplier
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total Suppliers</p>
                <p className="text-2xl font-bold text-blue-600">{suppliers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Active Suppliers</p>
                <p className="text-2xl font-bold text-green-600">
                  {suppliers.filter(supplier => supplier.status === 'Active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-purple-600">
                  {suppliers.reduce((sum, supplier) => sum + supplier.totalOrders, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-orange-600">
                  ₹{(suppliers.reduce((sum, supplier) => sum + supplier.totalSpent, 0) / 100000).toFixed(1)}L
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
                  placeholder="Search suppliers..."
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
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Suspended">Suspended</SelectItem>
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
              <label className="text-sm font-medium text-gray-700 mb-2 block">Min Rating</label>
              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger className="text-gray-700 bg-white">
                  <SelectValue placeholder="All ratings" />
                </SelectTrigger>
                <SelectContent className="text-gray-700 bg-white">
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="4.5">4.5+ Stars</SelectItem>
                  <SelectItem value="4.0">4.0+ Stars</SelectItem>
                  <SelectItem value="3.5">3.5+ Stars</SelectItem>
                  <SelectItem value="3.0">3.0+ Stars</SelectItem>
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
                  setRatingFilter('all');
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
          Showing {filteredSuppliers.length} of {suppliers.length} suppliers
        </p>
        <div className="flex space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-blue-600" />
            <span>Total: {suppliers.length}</span>
          </div>
        </div>
      </div>

      {/* Suppliers Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Supplier</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Last Order</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSuppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{supplier.name}</div>
                      <div className="text-sm text-gray-500">{supplier.code}</div>
                      <div className="text-xs text-gray-400">{supplier.city}, {supplier.state}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm font-medium">{supplier.contactPerson}</div>
                      <div className="text-xs text-gray-500 flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {supplier.email}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {supplier.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(supplier.status)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{supplier.category}</div>
                  </TableCell>
                  <TableCell>
                    {getRatingStars(supplier.rating)}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-xs">
                        <span className="text-gray-500">Quality: </span>
                        <span className={`font-medium ${getQualityScoreColor(supplier.qualityScore)}`}>
                          {supplier.qualityScore}/5.0
                        </span>
                      </div>
                      <div className="text-xs">
                        <span className="text-gray-500">On-time: </span>
                        <span className={`font-medium ${getDeliveryRateColor(supplier.onTimeDeliveryRate)}`}>
                          {supplier.onTimeDeliveryRate}%
                        </span>
                      </div>
                      <div className="text-xs">
                        <span className="text-gray-500">Avg Delivery: </span>
                        <span className="font-medium">{supplier.avgDeliveryTime} days</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm">
                        {new Date(supplier.lastOrderDate).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {supplier.totalOrders} orders
                      </div>
                      <div className="text-xs text-gray-500">
                        ₹{(supplier.totalSpent / 1000).toFixed(0)}K spent
                      </div>
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
              ))}
            </TableBody>
          </Table>
          
          {filteredSuppliers.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No suppliers found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 