'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { User, Phone, MapPin, Heart } from 'lucide-react';
import { usePatients, CreatePatientData, UpdatePatientData, Patient } from '@/hooks/usePatients';

interface PatientFormData {
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  email: string;
  district: string;
  state: string;
  occupation: string;
  allergies: string;
  emergencyContact: string;
}

interface PatientFormProps {
  patient?: Patient; // For editing existing patient
  onSuccess?: () => void;
  onCancel?: () => void;
  isDialog?: boolean;
}

export function PatientForm({ patient, onSuccess, onCancel, isDialog = false }: PatientFormProps) {
  const { createPatient, updatePatient } = usePatients();
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState<PatientFormData>({
    name: patient?.name || '',
    age: patient?.age || 0,
    gender: patient?.gender || 'Male',
    phone: patient?.phone || '',
    email: patient?.email || '',
    district: patient?.district || '',
    state: patient?.state || '',
    occupation: patient?.occupation || '',
    allergies: patient?.allergies || '',
    emergencyContact: patient?.emergencyContact || '',
  });
  const [errors, setErrors] = React.useState<{ [key: string]: string }>({});

  const isEditing = !!patient;

  const handleInputChange = (field: keyof PatientFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setErrors(prev => ({ ...prev, [field]: '' })); // Clear error on change
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (formData.age <= 0 || formData.age > 150) newErrors.age = 'Age must be between 1 and 150';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (formData.phone.length < 10) newErrors.phone = 'Phone number must be at least 10 digits';
    if (!formData.district.trim()) newErrors.district = 'District is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.occupation.trim()) newErrors.occupation = 'Occupation is required';
    // if (!formData.allergies.trim()) newErrors.allergies = 'Allergies field is required';
    //if (!formData.emergencyContact.trim()) newErrors.emergencyContact = 'Emergency contact is required';
    //if (formData.emergencyContact.length < 10) newErrors.emergencyContact = 'Emergency contact must be at least 10 digits';
    
    // Email validation (required and must be valid)
    // if (!formData.email.trim()) newErrors.email = 'Email is required';
    // else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    //   newErrors.email = 'Please enter a valid email address';
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const patientData: CreatePatientData | UpdatePatientData = {
        name: formData.name.trim(),
        age: formData.age,
        gender: formData.gender,
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        district: formData.district.trim(),
        state: formData.state.trim(),
        occupation: formData.occupation.trim(),
        allergies: formData.allergies.trim() || undefined,
        emergencyContact: formData.emergencyContact.trim() || undefined,
        emergencyContact: formData.emergencyContact.trim(),
      };

      let result;
      if (isEditing) {
        result = await updatePatient(patient.id, patientData);
      } else {
        result = await createPatient(patientData as CreatePatientData);
      }

      if (result) {
        toast.success(`Patient ${isEditing ? 'updated' : 'created'} successfully`);
        
        if (!isEditing) {
          // Reset form for new patient
          setFormData({
            name: '',
            age: 0,
            gender: 'Male',
            phone: '',
            email: '',
            district: '',
            state: '',
            occupation: '',
            allergies: '',
            emergencyContact: '',
          });
        }
        
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} patient:`, error);
      if (error instanceof Error) {
        toast.error(`Failed to ${isEditing ? 'update' : 'create'} patient: ${error.message}`);
      } else {
        toast.error(`Failed to ${isEditing ? 'update' : 'create'} patient`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6 text-gray-700">
      {/* Header */}
      {!isDialog && (
        <div className="flex items-center space-x-4">        
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? 'Edit Patient' : 'Register New Patient'}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditing ? 'Update patient information' : 'Add a new patient to the system'}
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter patient's full name"
                  required
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <div className="text-red-600 text-xs mt-1">{errors.name}</div>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age || ''}
                    onChange={(e) => handleInputChange('age', Number(e.target.value))}
                    placeholder="Age"
                    min="1"
                    max="150"
                    required
                    className={errors.age ? 'border-red-500' : ''}
                  />
                  {errors.age && <div className="text-red-600 text-xs mt-1">{errors.age}</div>}
                </div>

                <div>
                  <Label htmlFor="gender">Gender *</Label>
                  <Select 
                    value={formData.gender} 
                    onValueChange={(value: 'Male' | 'Female' | 'Other') => handleInputChange('gender', value)}
                    required
                  >
                    <SelectTrigger className="text-gray-700 bg-white">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent className="text-gray-700 bg-white">
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                <Label htmlFor="occupation">Occupation *</Label>
                <Input
                  id="occupation"
                  value={formData.occupation}
                  onChange={(e) => handleInputChange('occupation', e.target.value)}
                  placeholder="Enter patient's occupation"
                  required
                  className={errors.occupation ? 'border-red-500' : ''}
                />
                {errors.occupation && <div className="text-red-600 text-xs mt-1">{errors.occupation}</div>}
              </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Phone className="h-5 w-5 mr-2" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter phone number"
                  required
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && <div className="text-red-600 text-xs mt-1">{errors.phone}</div>}
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter email address"
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && <div className="text-red-600 text-xs mt-1">{errors.email}</div>}
              </div>

              <div>
                <Label htmlFor="emergencyContact">Emergency Contact</Label>
                <Input
                  id="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                  placeholder="Emergency contact number"
                  className={errors.emergencyContact ? 'border-red-500' : ''}
                />
                {errors.emergencyContact && <div className="text-red-600 text-xs mt-1">{errors.emergencyContact}</div>}
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="district">District *</Label>
                <Input
                  id="district"
                  value={formData.district}
                  onChange={(e) => handleInputChange('district', e.target.value)}
                  placeholder="Enter district"
                  required
                  className={errors.district ? 'border-red-500' : ''}
                />
                {errors.district && <div className="text-red-600 text-xs mt-1">{errors.district}</div>}
              </div>

              <div>
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  placeholder="Enter state"
                  required
                  className={errors.state ? 'border-red-500' : ''}
                />
                {errors.state && <div className="text-red-600 text-xs mt-1">{errors.state}</div>}
              </div>
            </CardContent>
          </Card>

          {/* Medical Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="h-5 w-5 mr-2" />
                Medical Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">             
              <div>
                <Label htmlFor="allergies">Allergies</Label>
                <Textarea
                  id="allergies"
                  value={formData.allergies}
                  onChange={(e) => handleInputChange('allergies', e.target.value)}
                  placeholder="List any known allergies or enter 'None'"
                  rows={3}
                  className={errors.allergies ? 'border-red-500' : ''}
                />
                {errors.allergies && <div className="text-red-600 text-xs mt-1">{errors.allergies}</div>}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={loading}>
            {loading ? (isEditing ? 'Updating...' : 'Registering...') : (isEditing ? 'Update Patient' : 'Register Patient')}
          </Button>
        </div>
      </form>
    </div>
  );
}