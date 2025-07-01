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
  Grid3X3,
  List,
  AlertTriangle
} from 'lucide-react';
import { useInventory } from '@/hooks/useInventory';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useOrders } from '@/hooks/useOrders';
import { toast } from 'sonner';
import { Table, TableHeader, TableBody, TableCell, TableRow, TableHead } from '@/components/ui/table';

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

export default function PurchaseOrdersPage() {
  const { inventory, loading: inventoryLoading, error: inventoryError, refetch: refetchInventory } = useInventory();
  const { suppliers, loading: suppliersLoading, error: suppliersError, refetch: refetchSuppliers } = useSuppliers();
  const { createOrder, loading: orderLoading } = useOrders();
  
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

  // Transform inventory data to match the expected format
  const inventoryItems: InventoryItem[] = useMemo(() => {
    return inventory.map(item => {
      const supplier = suppliers.find(s => s.id === item.supplierId);
      return {
        id: item.id,
        name: item.name,
        unit: item.unit,
        costPrice: item.costPrice,
        currentStock: item.stock,
        supplierId: item.supplierId,
        supplierName: supplier?.name || 'Unknown Supplier',
        category: item.category,
        description: undefined, // Description not available in current inventory schema
        minOrderQuantity: 5, // Default value, can be added to inventory schema later
        leadTime: 7, // Default value, can be added to inventory schema later
      };
    });
  }, [inventory, suppliers]);

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
    if (cartItems.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    // Group items by supplier
    const supplierGroups = cartItems.reduce((groups, item) => {
      if (!groups[item.supplierId]) {
        groups[item.supplierId] = {
          supplierId: item.supplierId,
          supplierName: item.supplierName,
          items: []
        };
      }
      groups[item.supplierId].items.push(item);
      return groups;
    }, {} as Record<string, { supplierId: string; supplierName: string; items: CartItem[] }>);

    // For now, just show the first supplier's checkout
    const firstSupplier = Object.values(supplierGroups)[0];
    setCheckoutData({
      supplierId: firstSupplier.supplierId,
      supplierName: firstSupplier.supplierName,
      expectedDelivery: '',
      notes: ''
    });
    setIsCheckoutOpen(true);
  };

  const getStockStatus = (currentStock: number, minOrderQuantity: number) => {
    if (currentStock === 0) {
      return { status: 'out', label: 'Out of Stock', color: 'destructive' as const, className: 'bg-red-100 text-red-800 border-red-200' };
    } else if (currentStock <= minOrderQuantity) {
      return { status: 'low', label: 'Low Stock', color: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
    } else {
      return { status: 'normal', label: 'In Stock', color: 'default' as const, className: 'bg-green-100 text-green-800 border-green-200' };
    }
  };

  // Loading state
  if (inventoryLoading || suppliersLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          <span className="text-lg">Loading procurement data...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (inventoryError || suppliersError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">
            {inventoryError || suppliersError}
          </p>
          <div className="space-x-2">
            <Button onClick={refetchInventory} variant="outline">
              Retry Inventory
            </Button>
            <Button onClick={refetchSuppliers} variant="outline">
              Retry Suppliers
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
              Cart ({getCartItemCount()})
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

              return (
                <Card key={item.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant={stockStatus.color} className={stockStatus.className}>
                        {stockStatus.label}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {item.currentStock} {item.unit}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                        <Badge variant={stockStatus.color} className={stockStatus.className}>
                          {stockStatus.label}
                        </Badge>
                      </div>

                      <p className="text-sm text-gray-600 line-clamp-2">
                        {item.description || 'No description available'}
                      </p>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Supplier:</span>
                        <span className="font-medium">{item.supplierName}</span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Category:</span>
                        <span className="font-medium capitalize">{item.category}</span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Price:</span>
                        <span className="font-medium">₹{item.costPrice}</span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Lead Time:</span>
                        <span className="font-medium">{item.leadTime} days</span>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      {cartItem ? (
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateCartQuantity(item.id, cartItem.quantity - 1)}
                            className="h-8 w-8 p-0"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="flex-1 text-center font-medium">
                            {cartItem.quantity} in cart
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateCartQuantity(item.id, cartItem.quantity + 1)}
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          onClick={() => addToCart(item)}
                          className="w-full"
                          disabled={item.currentStock === 0}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add to Cart
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Lead Time</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => {
                    const stockStatus = getStockStatus(item.currentStock, item.minOrderQuantity);
                    const cartItem = cartItems.find(cartItem => cartItem.itemId === item.id);

                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-gray-500">{item.description}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize text-gray-700">
                            {item.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Badge variant={stockStatus.color} className={stockStatus.className}>
                              {stockStatus.label}
                            </Badge>
                            <span className="text-sm text-gray-600">
                              {item.currentStock} {item.unit}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">₹{item.costPrice}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{item.supplierName}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{item.leadTime} days</div>
                        </TableCell>
                        <TableCell>
                          {cartItem ? (
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateCartQuantity(item.id, cartItem.quantity - 1)}
                                className="h-8 w-8 p-0"
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="text-sm font-medium min-w-[60px] text-center">
                                {cartItem.quantity}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateCartQuantity(item.id, cartItem.quantity + 1)}
                                className="h-8 w-8 p-0"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              onClick={() => addToCart(item)}
                              size="sm"
                              disabled={item.currentStock === 0}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No items found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Cart Dialog */}
      <Dialog open={isCartOpen} onOpenChange={setIsCartOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <ShoppingCart className="h-5 w-5 mr-2" />
              Shopping Cart
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-gray-700">
            {cartItems.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Your cart is empty</p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.itemId} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{item.itemName}</div>
                        <div className="text-sm text-gray-600">
                          ₹{item.unitPrice} × {item.quantity} {item.unit}
                        </div>
                        <div className="text-sm text-gray-500">
                          Supplier: {item.supplierName}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">₹{item.totalPrice}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.itemId)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold">Total:</span>
                    <span className="text-lg font-semibold">₹{getCartTotal().toLocaleString()}</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={clearCart}
                      className="flex-1"
                    >
                      Clear Cart
                    </Button>
                    <Button
                      onClick={() => {
                        setIsCartOpen(false);
                        handleCheckout();
                      }}
                      className="flex-1"
                    >
                      Proceed to Checkout
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
              Create Purchase Order
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-gray-700">
            <div>
              <Label htmlFor="supplier">Supplier</Label>
              <div className="mt-1 p-3 border rounded-lg bg-gray-50">
                <div className="font-medium">{checkoutData.supplierName}</div>
                <div className="text-sm text-gray-600">ID: {checkoutData.supplierId}</div>
              </div>
            </div>

            <div>
              <Label htmlFor="expectedDelivery">Expected Delivery Date</Label>
              <Input
                id="expectedDelivery"
                type="date"
                value={checkoutData.expectedDelivery}
                onChange={(e) => setCheckoutData(prev => ({ ...prev, expectedDelivery: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={checkoutData.notes}
                onChange={(e) => setCheckoutData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add any special instructions or notes..."
                rows={3}
              />
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-2">Order Summary</h4>
              <div className="space-y-2">
                {cartItems.map((item) => (
                  <div key={item.itemId} className="flex justify-between text-sm">
                    <span>{item.itemName} × {item.quantity} {item.unit}</span>
                    <span>₹{item.totalPrice}</span>
                  </div>
                ))}
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Total:</span>
                  <span>₹{getCartTotal().toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsCheckoutOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  try {
                    if (!checkoutData.expectedDelivery) {
                      toast.error('Please select an expected delivery date');
                      return;
                    }

                    // Generate PO number
                    const poNumber = `PO-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
                    
                    // Create order data
                    const orderData = {
                      poNumber,
                      supplierId: checkoutData.supplierId,
                      supplierName: checkoutData.supplierName,
                      orderDate: new Date().toISOString().split('T')[0],
                      expectedDelivery: checkoutData.expectedDelivery,
                      status: 'Draft' as const,
                      totalAmount: getCartTotal(),
                      items: cartItems.map(item => ({
                        itemId: item.itemId,
                        itemName: item.itemName,
                        quantity: item.quantity,
                        unit: item.unit,
                        unitPrice: item.unitPrice,
                        totalPrice: item.totalPrice,
                      })),
                      notes: checkoutData.notes,
                      createdBy: 'Current User', // TODO: Get from auth context
                    };

                    await createOrder(orderData);
                    clearCart();
                    setIsCheckoutOpen(false);
                  } catch (error) {
                    console.error('Error creating order:', error);
                    // Error is already handled by the useOrders hook
                  }
                }}
                disabled={orderLoading}
                className="flex-1"
              >
                {orderLoading ? 'Creating Order...' : 'Create Order'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 