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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  AlertTriangle,
  Package,
  Calendar,
  Hash,
  Tag
} from 'lucide-react';
import { useInventory, InventoryItem } from '@/hooks/useInventory';
import { AddInventoryForm } from '../add/AddInventoryForm';
import { toast } from 'sonner';

export default function AllInventoryPage() {
  const { inventory, loading, error, refetch } = useInventory();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // Filter inventory based on search and filters
  const filteredInventory = useMemo(() => {
    let filtered = inventory;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    // Stock filter
    if (stockFilter === 'low') {
      filtered = filtered.filter(item => item.stock <= item.reorderLevel && item.stock > 0);
    } else if (stockFilter === 'out') {
      filtered = filtered.filter(item => item.stock === 0);
    } else if (stockFilter === 'normal') {
      filtered = filtered.filter(item => item.stock > item.reorderLevel);
    }

    return filtered;
  }, [inventory, searchTerm, categoryFilter, stockFilter]);

  const getStockStatus = (item: InventoryItem) => {
    if (item.stock === 0) {
      return { status: 'out', label: 'Out of Stock', color: 'destructive' as const, className: 'bg-red-100 text-red-800 border-red-200' };
    } else if (item.stock <= item.reorderLevel) {
      return { status: 'low', label: 'Low Stock', color: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
    } else {
      return { status: 'normal', label: 'In Stock', color: 'default' as const, className: 'bg-green-100 text-green-800 border-green-200' };
    }
  };

  const getExpiryStatus = (item: InventoryItem) => {
    const now = new Date();
    const expiryDate = new Date(item.expiryDate);
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) {
      return { status: 'expired', label: 'Expired', color: 'destructive' as const, className: 'bg-red-100 text-red-800 border-red-200' };
    } else if (daysUntilExpiry <= 30) {
      return { status: 'expiring', label: `${daysUntilExpiry} days`, color: 'secondary' as const, className: 'bg-orange-100 text-orange-800 border-orange-200' };
    } else {
      return { status: 'valid', label: 'Valid', color: 'default' as const, className: 'bg-green-100 text-green-800 border-green-200' };
    }
  };

  const handleViewItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsViewDialogOpen(true);
  };

  const handleEditItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsEditDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedItem) return;
    
    try {
      // TODO: Implement delete API call
      // await deleteInventoryItem(selectedItem.id);
      setIsDeleteDialogOpen(false);
      setSelectedItem(null);
      refetch();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const categories = Array.from(new Set(inventory.map(item => item.category)));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          <span className="text-lg">Loading inventory...</span>
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
          <h1 className="text-3xl font-bold text-gray-900">All Inventory Items</h1>
          <p className="text-gray-600 mt-1">Manage and monitor all inventory items</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add New Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Inventory Item</DialogTitle>
            </DialogHeader>
            <div className="p-0">
              <AddInventoryForm 
                isDialog={true}
                onSuccess={() => {
                  setIsAddDialogOpen(false);
                  refetch();
                }}
                onCancel={() => {
                  setIsAddDialogOpen(false);
                }}
              />
            </div>
          </DialogContent>
        </Dialog>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, ID, or category..."
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
              <label className="text-sm font-medium text-gray-700 mb-2 block">Stock Status</label>
              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger className="text-gray-700 bg-white">
                  <SelectValue placeholder="All stock levels" />
                </SelectTrigger>
                <SelectContent className="text-gray-700 bg-white">
                  <SelectItem value="all">All Stock Levels</SelectItem>
                  <SelectItem value="normal">Normal Stock</SelectItem>
                  <SelectItem value="low">Low Stock</SelectItem>
                  <SelectItem value="out">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Showing {filteredInventory.length} of {inventory.length} items
        </p>
        <Button variant="outline" onClick={refetch}>
          Refresh
        </Button>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInventory.map((item) => {
                const stockStatus = getStockStatus(item);
                const expiryStatus = getExpiryStatus(item);
                const totalValue = item.stock * item.sellingPrice;

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
                          Reorder: {item.reorderLevel}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">₹{item.sellingPrice}</div>
                        <div className="text-sm text-gray-500">
                          Cost: ₹{item.costPrice}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">₹{totalValue.toLocaleString()}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={stockStatus.color} className={stockStatus.className}>
                        {stockStatus.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={expiryStatus.color} className={expiryStatus.className}>
                        {expiryStatus.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewItem(item)}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditItem(item)}
                          title="Edit Item"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {/* <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600"
                          onClick={() => handleDeleteItem(item)}
                          title="Delete Item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button> */}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          {filteredInventory.length === 0 && (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No inventory items found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Item Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Eye className="h-5 w-5 mr-2" />
              Item Details
            </DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Hash className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">ID:</span>
                    <span className="text-sm text-gray-900">{selectedItem.id}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Tag className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Name:</span>
                    <span className="text-sm text-gray-900">{selectedItem.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">Category:</span>
                    <Badge variant="outline" className="capitalize text-gray-700">
                      {selectedItem.category}
                    </Badge>
                  </div>

                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">Stock:</span>
                    <span className="text-sm text-gray-900">{selectedItem.stock} {selectedItem.unit}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">Reorder Level:</span>
                    <span className="text-sm text-gray-900">{selectedItem.reorderLevel}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">Cost Price:</span>
                    <span className="text-sm text-gray-900">₹{selectedItem.costPrice}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">Selling Price:</span>
                    <span className="text-sm text-gray-900">₹{selectedItem.sellingPrice}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Expiry Date:</span>
                  <span className="text-sm text-gray-900">
                    {new Date(selectedItem.expiryDate).toLocaleDateString()}
                  </span>
                  <Badge variant={getExpiryStatus(selectedItem).color} className={getExpiryStatus(selectedItem).className}>
                    {getExpiryStatus(selectedItem).label}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">Batch Number:</span>
                  <span className="text-sm text-gray-900">{selectedItem.batchNumber}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">Supplier ID:</span>
                  <span className="text-sm text-gray-900">{selectedItem.supplierId}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Stock Status:</span>
                <Badge variant={getStockStatus(selectedItem).color} className={getStockStatus(selectedItem).className}>
                  {getStockStatus(selectedItem).label}
                </Badge>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Inventory Item</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Item Name</label>
                  <Input 
                    value={selectedItem.name} 
                    onChange={(e) => setSelectedItem({...selectedItem, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
                  <Select value={selectedItem.category} onValueChange={(value) => setSelectedItem({...selectedItem, category: value as 'Herb' | 'Oil' | 'Powder' | 'Tablet' | 'Liquid'})}>
                    <SelectTrigger className="text-gray-700 bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="text-gray-700 bg-white">
                      <SelectItem value="Herb">Herb</SelectItem>
                      <SelectItem value="Oil">Oil</SelectItem>
                      <SelectItem value="Powder">Powder</SelectItem>
                      <SelectItem value="Tablet">Tablet</SelectItem>
                      <SelectItem value="Liquid">Liquid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Stock</label>
                  <Input 
                    type="number"
                    value={selectedItem.stock} 
                    onChange={(e) => setSelectedItem({...selectedItem, stock: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Unit</label>
                  <Select value={selectedItem.unit} onValueChange={(value) => setSelectedItem({...selectedItem, unit: value})}>
                    <SelectTrigger className="text-gray-700 bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="text-gray-700 bg-white">
                      <SelectItem value="kg">Kilogram (kg)</SelectItem>
                      <SelectItem value="g">Gram (g)</SelectItem>
                      <SelectItem value="ml">Milliliter (ml)</SelectItem>
                      <SelectItem value="l">Liter (l)</SelectItem>
                      <SelectItem value="pcs">Pieces (pcs)</SelectItem>
                      <SelectItem value="bottles">Bottles</SelectItem>
                      <SelectItem value="boxes">Boxes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Cost Price (₹)</label>
                  <Input 
                    type="number"
                    value={selectedItem.costPrice} 
                    onChange={(e) => setSelectedItem({...selectedItem, costPrice: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Selling Price (₹)</label>
                  <Input 
                    type="number"
                    value={selectedItem.sellingPrice} 
                    onChange={(e) => setSelectedItem({...selectedItem, sellingPrice: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Reorder Level</label>
                  <Input 
                    type="number"
                    value={selectedItem.reorderLevel} 
                    onChange={(e) => setSelectedItem({...selectedItem, reorderLevel: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Expiry Date</label>
                  <Input 
                    type="date"
                    value={new Date(selectedItem.expiryDate).toISOString().split('T')[0]} 
                    onChange={(e) => setSelectedItem({...selectedItem, expiryDate: new Date(e.target.value)})}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setSelectedItem(null);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={async () => {
                    try {
                      // Ensure all required fields are present and properly formatted
                      const updateData = {
                        id: selectedItem.id,
                        name: selectedItem.name,
                        category: selectedItem.category,
                        stock: Number(selectedItem.stock),
                        unit: selectedItem.unit,
                        costPrice: Number(selectedItem.costPrice),
                        sellingPrice: Number(selectedItem.sellingPrice),
                        supplierId: selectedItem.supplierId,
                        expiryDate: selectedItem.expiryDate,
                        reorderLevel: Number(selectedItem.reorderLevel),
                        batchNumber: selectedItem.batchNumber,
                        createdAt: selectedItem.createdAt || new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                      };


                      const response = await fetch('/api/inventory', {
                        method: 'PUT',
                        headers: {
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(updateData)
                      });

                      if (!response.ok) {
                        const errorData = await response.json();
                        console.error('API Error:', errorData);
                        throw new Error(errorData.error || 'Failed to update item');
                      }

                      // Show success message
                      toast.success('Item updated successfully');
                      setIsEditDialogOpen(false);
                      setSelectedItem(null);
                      refetch();
                    } catch (error) {
                      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
                      toast.error(errorMessage);
                      console.error('Error updating item:', error);
                    }
                  }}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <Trash2 className="h-5 w-5 mr-2" />
              Delete Item
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{selectedItem?.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSelectedItem(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 