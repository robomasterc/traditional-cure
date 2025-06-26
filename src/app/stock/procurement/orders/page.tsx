'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Search, 
  Filter, 
  Plus, 
  Minus,
  Package,
  ShoppingCart,
  Trash2,
  Send,
  Building,
  DollarSign,
  CheckCircle,
  Clock,
  TrendingUp,
  Grid3X3,
  List
} from 'lucide-react';

interface CartItem {
  itemId: string;
  itemName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  supplierId: string;
  supplierName: string;
}

interface InventoryItem {
  id: string;
  name: string;
  unit: string;
  costPrice: number;
  currentStock: number;
  supplierId: string;
  supplierName: string;
  category: string;
  description?: string;
  minOrderQuantity: number;
  leadTime: number; // in days
}

interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  rating: number;
  deliveryTime: number; // average delivery time in days
}

export default function PurchaseOrdersPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [supplierFilter, setSupplierFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Dialog states
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutData, setCheckoutData] = useState({
    supplierId: '',
    supplierName: '',
    expectedDelivery: '',
    notes: ''
  });

  // Mock data
  const suppliers: Supplier[] = [
    { id: 'SUP001', name: 'ABC Suppliers', email: 'abc@suppliers.com', phone: '+91-9876543210', rating: 4.5, deliveryTime: 7 },
    { id: 'SUP002', name: 'XYZ Pharmaceuticals', email: 'xyz@pharma.com', phone: '+91-9876543211', rating: 4.2, deliveryTime: 10 },
    { id: 'SUP003', name: 'Herbal Solutions Ltd', email: 'herbal@ltd.com', phone: '+91-9876543212', rating: 4.8, deliveryTime: 5 }
  ];

  const inventoryItems: InventoryItem[] = [
    { id: 'INV001', name: 'Ashwagandha', unit: 'kg', costPrice: 500, currentStock: 10, supplierId: 'SUP001', supplierName: 'ABC Suppliers', category: 'Herbs', description: 'Traditional Ayurvedic herb for stress relief', minOrderQuantity: 5, leadTime: 7 },
    { id: 'INV002', name: 'Brahmi', unit: 'kg', costPrice: 500, currentStock: 5, supplierId: 'SUP001', supplierName: 'ABC Suppliers', category: 'Herbs', description: 'Memory enhancing herb', minOrderQuantity: 3, leadTime: 7 },
    { id: 'INV003', name: 'Tulsi', unit: 'kg', costPrice: 300, currentStock: 20, supplierId: 'SUP002', supplierName: 'XYZ Pharmaceuticals', category: 'Herbs', description: 'Holy basil for immunity', minOrderQuantity: 10, leadTime: 5 },
    { id: 'INV004', name: 'Neem', unit: 'kg', costPrice: 400, currentStock: 15, supplierId: 'SUP002', supplierName: 'XYZ Pharmaceuticals', category: 'Herbs', description: 'Natural antibacterial herb', minOrderQuantity: 5, leadTime: 8 },
    { id: 'INV005', name: 'Amla', unit: 'kg', costPrice: 350, currentStock: 8, supplierId: 'SUP003', supplierName: 'Herbal Solutions Ltd', category: 'Fruits', description: 'Vitamin C rich fruit', minOrderQuantity: 5, leadTime: 6 },
    { id: 'INV006', name: 'Ginger', unit: 'kg', costPrice: 250, currentStock: 25, supplierId: 'SUP003', supplierName: 'Herbal Solutions Ltd', category: 'Spices', description: 'Digestive aid and anti-inflammatory', minOrderQuantity: 5, leadTime: 4 }
  ];

  // Filter and sort inventory items
  const filteredItems = useMemo(() => {
    let filtered = inventoryItems;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.supplierName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    // Supplier filter
    if (supplierFilter !== 'all') {
      filtered = filtered.filter(item => item.supplierId === supplierFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          return a.costPrice - b.costPrice;
        case 'stock':
          return a.currentStock - b.currentStock;
        case 'supplier':
          return a.supplierName.localeCompare(b.supplierName);
        default:
          return 0;
      }
    });

    return filtered;
  }, [inventoryItems, searchTerm, categoryFilter, supplierFilter, sortBy]);

  const categories = Array.from(new Set(inventoryItems.map(item => item.category)));
  const suppliersList = Array.from(new Set(inventoryItems.map(item => ({ id: item.supplierId, name: item.supplierName }))));

  // Cart functions
  const addToCart = (item: InventoryItem, quantity: number = 1) => {
    const existingItem = cartItems.find(cartItem => cartItem.itemId === item.id);
    
    if (existingItem) {
      setCartItems(prev => prev.map(cartItem => 
        cartItem.itemId === item.id 
          ? { ...cartItem, quantity: cartItem.quantity + quantity, totalPrice: (cartItem.quantity + quantity) * cartItem.unitPrice }
          : cartItem
      ));
    } else {
      const newCartItem: CartItem = {
        itemId: item.id,
        itemName: item.name,
        quantity: quantity,
        unit: item.unit,
        unitPrice: item.costPrice,
        totalPrice: item.costPrice * quantity,
        supplierId: item.supplierId,
        supplierName: item.supplierName
      };
      setCartItems(prev => [...prev, newCartItem]);
    }
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.itemId !== itemId));
  };

  const updateCartQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
    } else {
      setCartItems(prev => prev.map(item => 
        item.itemId === itemId 
          ? { ...item, quantity, totalPrice: item.unitPrice * quantity }
          : item
      ));
    }
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const getCartItemCount = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    
    // Group items by supplier
    const itemsBySupplier = cartItems.reduce((acc, item) => {
      if (!acc[item.supplierId]) {
        acc[item.supplierId] = {
          supplierId: item.supplierId,
          supplierName: item.supplierName,
          items: []
        };
      }
      acc[item.supplierId].items.push(item);
      return acc;
    }, {} as Record<string, { supplierId: string; supplierName: string; items: CartItem[] }>);

    // Create purchase orders for each supplier
    const purchaseOrders = Object.values(itemsBySupplier).map((supplierGroup, index) => {
      const totalAmount = supplierGroup.items.reduce((sum, item) => sum + item.totalPrice, 0);
      const expectedDelivery = new Date();
      const supplier = suppliers.find(s => s.id === supplierGroup.supplierId);
      expectedDelivery.setDate(expectedDelivery.getDate() + (supplier?.deliveryTime || 7));
      
      return {
        id: `PO${Date.now()}-${index}`,
        poNumber: `PO-2024-${String(Date.now()).slice(-3)}-${index + 1}`,
        supplierName: supplierGroup.supplierName,
        supplierId: supplierGroup.supplierId,
        orderDate: new Date().toISOString().split('T')[0],
        expectedDelivery: expectedDelivery.toISOString().split('T')[0],
        status: 'Draft' as const,
        totalAmount,
        items: supplierGroup.items.map(item => ({
          itemId: item.itemId,
          itemName: item.itemName,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice
        })),
        notes: checkoutData.notes,
        createdBy: 'Current User',
        createdAt: new Date().toISOString()
      };
    });

    console.log('Creating purchase orders:', purchaseOrders);
    // Here you would typically send the purchase orders to your API
    clearCart();
    setIsCheckoutOpen(false);
  };

  const getStockStatus = (currentStock: number, minOrderQuantity: number) => {
    if (currentStock === 0) return { status: 'Out of Stock', color: 'text-red-600', bg: 'bg-red-100' };
    if (currentStock < minOrderQuantity) return { status: 'Low Stock', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { status: 'In Stock', color: 'text-green-600', bg: 'bg-green-100' };
  };

  return (
    <div className="flex h-full">
      {/* Main Content */}
      <div className="flex-1 space-y-6 p-6 text-gray-700 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Procurement Catalog</h1>
            <p className="text-gray-600 mt-1">Browse and add items to your purchase cart</p>
          </div>
          <div className="flex space-x-2">
            {/* View Toggle */}
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="h-8 w-8 p-0"
                title="Grid View"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="h-8 w-8 p-0"
                title="List View"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            
            <Button 
              variant="outline" 
              onClick={() => setIsCartOpen(true)}
              className="relative"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Cart
              {getCartItemCount() > 0 && (
                <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs">
                  {getCartItemCount()}
                </Badge>
              )}
            </Button>
            <Button 
              onClick={() => setIsCheckoutOpen(true)}
              disabled={cartItems.length === 0}
            >
              <Send className="h-4 w-4 mr-2" />
              Checkout ({cartItems.length} orders)
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Package className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Total Items</p>
                  <p className="text-2xl font-bold text-blue-600">{inventoryItems.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">Cart Items</p>
                  <p className="text-2xl font-bold text-green-600">{getCartItemCount()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-600">Cart Total</p>
                  <p className="text-2xl font-bold text-purple-600">₹{getCartTotal().toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Building className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-600">Suppliers</p>
                  <p className="text-2xl font-bold text-orange-600">{suppliers.length}</p>
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
              Filters & Search
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
                <label className="text-sm font-medium text-gray-700 mb-2 block">Supplier</label>
                <Select value={supplierFilter} onValueChange={setSupplierFilter}>
                  <SelectTrigger className="text-gray-700 bg-white">
                    <SelectValue placeholder="All suppliers" />
                  </SelectTrigger>
                  <SelectContent className="text-gray-700 bg-white">
                    <SelectItem value="all">All Suppliers</SelectItem>
                    {suppliersList.map(supplier => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Sort By</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="text-gray-700 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="text-gray-700 bg-white">
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="price">Price</SelectItem>
                    <SelectItem value="stock">Stock</SelectItem>
                    <SelectItem value="supplier">Supplier</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setCategoryFilter('all');
                    setSupplierFilter('all');
                    setSortBy('name');
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
            Showing {filteredItems.length} of {inventoryItems.length} items
          </p>
          <div className="flex space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4 text-blue-600" />
              <span>Total: {inventoryItems.length}</span>
            </div>
          </div>
        </div>

        {/* Items Display */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const stockStatus = getStockStatus(item.currentStock, item.minOrderQuantity);
              const cartItem = cartItems.find(cartItem => cartItem.itemId === item.id);
              const supplier = suppliers.find(s => s.id === item.supplierId);

              return (
                <Card key={item.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Item Header */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </div>

                      {/* Stock Status */}
                      <div className="flex items-center justify-between">
                        <Badge className={`${stockStatus.bg} ${stockStatus.color}`}>
                          {stockStatus.status}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          Stock: {item.currentStock} {item.unit}
                        </span>
                      </div>

                      {/* Supplier Info */}
                      <div className="flex items-center space-x-2">
                        <Building className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{item.supplierName}</span>
                        {supplier && (
                          <Badge variant="outline" className="text-xs">
                            ⭐ {supplier.rating}
                          </Badge>
                        )}
                      </div>

                      {/* Price and Lead Time */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-green-600">₹{item.costPrice.toLocaleString()}</p>
                          <p className="text-sm text-gray-500">per {item.unit}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Lead Time</p>
                          <p className="text-sm font-medium">{item.leadTime} days</p>
                        </div>
                      </div>

                      {/* Add to Cart */}
                      <div className="space-y-2">
                        {cartItem ? (
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateCartQuantity(item.id, cartItem.quantity - 1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="text-sm font-medium min-w-[2rem] text-center">
                              {cartItem.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateCartQuantity(item.id, cartItem.quantity + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFromCart(item.id)}
                              className="text-red-600 ml-auto"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            onClick={() => addToCart(item, item.minOrderQuantity)}
                            disabled={item.currentStock === 0}
                            className="w-full"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add to Cart ({item.minOrderQuantity} {item.unit})
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-200">
                {filteredItems.map((item) => {
                  const stockStatus = getStockStatus(item.currentStock, item.minOrderQuantity);
                  const cartItem = cartItems.find(cartItem => cartItem.itemId === item.id);
                  const supplier = suppliers.find(s => s.id === item.supplierId);

                  return (
                    <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        {/* Item Info */}
                        <div className="flex-1">
                          <div className="flex items-start space-x-4">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                                <Badge className={`${stockStatus.bg} ${stockStatus.color}`}>
                                  {stockStatus.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <div className="flex items-center space-x-1">
                                  <Building className="h-4 w-4" />
                                  <span>{item.supplierName}</span>
                                  {supplier && (
                                    <Badge variant="outline" className="text-xs">
                                      ⭐ {supplier.rating}
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Package className="h-4 w-4" />
                                  <span>Stock: {item.currentStock} {item.unit}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Clock className="h-4 w-4" />
                                  <span>Lead: {item.leadTime} days</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="text-right mr-6">
                          <p className="text-2xl font-bold text-green-600">₹{item.costPrice.toLocaleString()}</p>
                          <p className="text-sm text-gray-500">per {item.unit}</p>
                        </div>

                        {/* Cart Controls */}
                        <div className="flex items-center space-x-3">
                          {cartItem ? (
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateCartQuantity(item.id, cartItem.quantity - 1)}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="text-sm font-medium min-w-[2rem] text-center">
                                {cartItem.quantity}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateCartQuantity(item.id, cartItem.quantity + 1)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFromCart(item.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              onClick={() => addToCart(item, item.minOrderQuantity)}
                              disabled={item.currentStock === 0}
                              size="sm"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add ({item.minOrderQuantity})
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {filteredItems.length === 0 && (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No items found</p>
          </div>
        )}
      </div>

      {/* Cart Sidebar */}
      <Dialog open={isCartOpen} onOpenChange={setIsCartOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <ShoppingCart className="h-5 w-5 mr-2" />
              Shopping Cart ({getCartItemCount()} items)
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Your cart is empty</p>
              </div>
            ) : (
              <>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={item.itemId} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.itemName}</p>
                        <p className="text-xs text-gray-600">{item.supplierName}</p>
                        <p className="text-xs text-gray-500">₹{item.unitPrice.toLocaleString()} per {item.unit}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateCartQuantity(item.itemId, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateCartQuantity(item.itemId, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.itemId)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">₹{item.totalPrice.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-medium">Total:</span>
                    <span className="text-2xl font-bold text-green-600">₹{getCartTotal().toLocaleString()}</span>
                  </div>
                  <div className="space-y-2">
                    <Button onClick={() => setIsCheckoutOpen(true)} className="w-full">
                      <Send className="h-4 w-4 mr-2" />
                      Proceed to Checkout
                    </Button>
                    <Button variant="outline" onClick={clearCart} className="w-full">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear Cart
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Checkout Dialog */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Send className="h-5 w-5 mr-2" />
              Checkout & Create Purchase Orders
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <Label htmlFor="notes">Order Notes</Label>
              <Textarea
                value={checkoutData.notes}
                onChange={(e) => setCheckoutData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add any special instructions or notes..."
                rows={3}
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Order Summary</Label>
              <div className="mt-2 space-y-2">
                {Object.entries(cartItems.reduce((acc, item) => {
                  if (!acc[item.supplierId]) {
                    acc[item.supplierId] = {
                      supplierName: item.supplierName,
                      items: [],
                      total: 0
                    };
                  }
                  acc[item.supplierId].items.push(item);
                  acc[item.supplierId].total += item.totalPrice;
                  return acc;
                }, {} as Record<string, { supplierName: string; items: CartItem[]; total: number }>)).map(([supplierId, data]) => (
                  <div key={supplierId} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">{data.supplierName}</h4>
                      <span className="font-bold text-green-600">₹{data.total.toLocaleString()}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {data.items.length} item{data.items.length !== 1 ? 's' : ''} • 
                      Expected delivery: {new Date(Date.now() + (suppliers.find(s => s.id === supplierId)?.deliveryTime || 7) * 24 * 60 * 60 * 1000).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
              <span className="text-lg font-medium">Total Order Value:</span>
              <span className="text-2xl font-bold text-green-600">₹{getCartTotal().toLocaleString()}</span>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCheckoutOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCheckout}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Create Purchase Orders
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 