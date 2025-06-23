'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { 
  Package, 
  Save, 
  ArrowLeft,
  Plus,
  AlertCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface InventoryFormData {
  name: string;
  category: string;
  stock: number;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  supplierId: string;
  reorderLevel: number;
  batchNumber: string;
  expiryDate: string;
  description?: string;
}

export default function AddInventoryItemPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<InventoryFormData>({
    name: '',
    category: '',
    stock: 0,
    unit: '',
    costPrice: 0,
    sellingPrice: 0,
    supplierId: '',
    reorderLevel: 0,
    batchNumber: '',
    expiryDate: '',
    description: ''
  });

  const categories = [
    { value: 'Herb', label: 'Herb' },
    { value: 'Oil', label: 'Oil' },
    { value: 'Powder', label: 'Powder' },
    { value: 'Tablet', label: 'Tablet' },
    { value: 'Liquid', label: 'Liquid' }
  ];

  const units = [
    { value: 'kg', label: 'Kilogram (kg)' },
    { value: 'g', label: 'Gram (g)' },
    { value: 'ml', label: 'Milliliter (ml)' },
    { value: 'l', label: 'Liter (l)' },
    { value: 'pcs', label: 'Pieces (pcs)' },
    { value: 'bottles', label: 'Bottles' },
    { value: 'boxes', label: 'Boxes' }
  ];

  const handleInputChange = (field: keyof InventoryFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateBatchNumber = () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `B${timestamp}${random}`.toUpperCase();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.name || !formData.category || !formData.unit) {
        throw new Error('Please fill in all required fields');
      }

      if (formData.costPrice <= 0 || formData.sellingPrice <= 0) {
        throw new Error('Prices must be greater than zero');
      }

      if (formData.stock < 0) {
        throw new Error('Stock cannot be negative');
      }

      // Generate ID
      const id = `INV${Date.now()}`;

      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          ...formData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create inventory item');
      }

      toast.success('Inventory item created successfully');
      router.push('/stock/inventory/all');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast.error(errorMessage);
      console.error('Error creating inventory item:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Inventory Item</h1>
          <p className="text-gray-600 mt-1">Create a new inventory item with all necessary details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Item Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter item name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => handleInputChange('category', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter item description"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Stock Information */}
          <Card>
            <CardHeader>
              <CardTitle>Stock Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="stock">Initial Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => handleInputChange('stock', Number(e.target.value))}
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <Label htmlFor="unit">Unit *</Label>
                  <Select 
                    value={formData.unit} 
                    onValueChange={(value) => handleInputChange('unit', value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map(unit => (
                        <SelectItem key={unit.value} value={unit.value}>
                          {unit.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="reorderLevel">Reorder Level</Label>
                <Input
                  id="reorderLevel"
                  type="number"
                  value={formData.reorderLevel}
                  onChange={(e) => handleInputChange('reorderLevel', Number(e.target.value))}
                  placeholder="Minimum stock level"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <Label htmlFor="batchNumber">Batch Number</Label>
                <div className="flex space-x-2">
                  <Input
                    id="batchNumber"
                    value={formData.batchNumber}
                    onChange={(e) => handleInputChange('batchNumber', e.target.value)}
                    placeholder="Enter batch number"
                  />
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => handleInputChange('batchNumber', generateBatchNumber())}
                  >
                    Generate
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Information */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="costPrice">Cost Price (₹) *</Label>
                <Input
                  id="costPrice"
                  type="number"
                  value={formData.costPrice}
                  onChange={(e) => handleInputChange('costPrice', Number(e.target.value))}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <Label htmlFor="sellingPrice">Selling Price (₹) *</Label>
                <Input
                  id="sellingPrice"
                  type="number"
                  value={formData.sellingPrice}
                  onChange={(e) => handleInputChange('sellingPrice', Number(e.target.value))}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              {formData.costPrice > 0 && formData.sellingPrice > 0 && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm text-blue-800">
                    <div>Profit Margin: ₹{(formData.sellingPrice - formData.costPrice).toFixed(2)}</div>
                    <div>Margin %: {((formData.sellingPrice - formData.costPrice) / formData.costPrice * 100).toFixed(1)}%</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="supplierId">Supplier ID</Label>
                <Input
                  id="supplierId"
                  value={formData.supplierId}
                  onChange={(e) => handleInputChange('supplierId', e.target.value)}
                  placeholder="Enter supplier ID"
                />
              </div>

              <div>
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                />
              </div>

              {formData.expiryDate && (
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
                    <span className="text-sm text-yellow-800">
                      Expires on {new Date(formData.expiryDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Create Item
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
} 