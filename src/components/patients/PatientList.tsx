'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Search, 
  Users, 
  Phone, 
  Mail, 
  MapPin, 
  UserPlus, 
  Edit, 
  Eye, 
  Filter,
  Calendar,
  Heart,
  RefreshCw,
  Grid3X3,
  List,
  ChevronLeft,
  ChevronRight,
  User
} from 'lucide-react';
import { usePatients, Patient } from '@/hooks/usePatients';
import { PatientForm } from './PatientForm';

interface PatientListProps {
  showAddButton?: boolean;
  onPatientSelect?: (patient: Patient) => void;
  selectable?: boolean;
}

export function PatientList({ showAddButton = true, onPatientSelect, selectable = false }: PatientListProps) {
  const { patients, loading, error, refetch } = usePatients();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [genderFilter, setGenderFilter] = React.useState<string>('');
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [editingPatient, setEditingPatient] = React.useState<Patient | null>(null);
  const [selectedPatient, setSelectedPatient] = React.useState<Patient | null>(null);
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(10);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  // Filter patients based on search query and gender filter
  const filteredPatients = React.useMemo(() => {
    let filtered = patients;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(patient => 
        patient.name.toLowerCase().includes(query) ||
        patient.phone.includes(searchQuery) ||
        (patient.email && patient.email.toLowerCase().includes(query))
      );
    }

    if (genderFilter && genderFilter !== 'All') {
      filtered = filtered.filter(patient => patient.gender === genderFilter);
    }

    return filtered;
  }, [patients, searchQuery, genderFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPatients = filteredPatients.slice(startIndex, endIndex);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, genderFilter, itemsPerPage]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handlePatientClick = (patient: Patient) => {
    if (selectable && onPatientSelect) {
      onPatientSelect(patient);
    } else {
      setSelectedPatient(patient);
    }
  };

  const handleAddSuccess = () => {
    setIsAddDialogOpen(false);
    refetch();
  };

  const handleEditSuccess = () => {
    setEditingPatient(null);
    refetch();
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getAgeGroup = (age: number) => {
    if (age < 18) return 'Minor';
    if (age < 60) return 'Adult';
    return 'Senior';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading patients...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-red-500">Error loading patients: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 text-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Users className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Patient Directory</h1>
            <p className="text-gray-600 mt-1">
              Manage patient records and information ({filteredPatients.length} patients)
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          {/* View Toggle */}  
          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {showAddButton && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Patient
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Register New Patient</DialogTitle>
                </DialogHeader>
                <PatientForm 
                  onSuccess={handleAddSuccess}
                  onCancel={() => setIsAddDialogOpen(false)}
                  isDialog={true}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search" className="sr-only">Search patients</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="search"
                  placeholder="Search by name, phone, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-Auto">
                <Select value={genderFilter} onValueChange={setGenderFilter}>
                  <SelectTrigger className="bg-white border-gray-300 hover:border-gray-400 focus:border-blue-500">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by gender" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-300 text-gray-700">
                    <SelectItem value="All">All</SelectItem>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="w-Auto">
                <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
                  <SelectTrigger className="bg-white border-gray-300 hover:border-gray-400 focus:border-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-300 text-gray-700">
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Pagination Info */}
          {filteredPatients.length > 0 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredPatients.length)} of {filteredPatients.length} patients
              </div>
              
              {totalPages > 1 && (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else {
                        const start = Math.max(1, currentPage - 2);
                        const end = Math.min(totalPages, start + 4);
                        pageNum = start + i;
                        if (pageNum > end) return null;
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Patient Display */}
      {filteredPatients.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No patients found</h3>
            <p className="text-gray-600">
              {searchQuery || genderFilter 
                ? "Try adjusting your search filters" 
                : showAddButton 
                ? "Start by adding your first patient" 
                : "No patients available"}
            </p>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedPatients.map((patient) => (
            <Card 
              key={patient.id} 
              className={`hover:shadow-lg transition-shadow duration-200 ${
                selectable ? 'cursor-pointer hover:bg-blue-50' : ''
              }`}
              onClick={() => handlePatientClick(patient)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{patient.name}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="secondary">
                          {patient.age} years • {patient.gender}
                        </Badge>
                        <Badge variant="outline">
                          {getAgeGroup(patient.age)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  {!selectable && (
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPatient(patient);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingPatient(patient);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  {patient.phone}
                </div>
                
                {patient.email && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    {patient.email}
                  </div>
                )}
                
                <div className="flex items-start text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-1">{patient.district}, {patient.state}</span>
                </div>

                {(patient.occupation || patient.medicalHistory) && (
                  <div className="pt-2 border-t">
                    {patient.occupation && (
                      <div className="flex items-center text-sm text-blue-600 mb-1">
                        <User className="h-4 w-4 mr-2" />
                        <span className="line-clamp-1">Occupation: {patient.occupation}</span>
                      </div>
                    )}
                    {patient.medicalHistory && (
                      <div className="flex items-center text-sm text-blue-600">
                        <Heart className="h-4 w-4 mr-2" />
                        <span className="line-clamp-1">Medical History</span>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    Registered: {formatDate(patient.createdAt)}
                  </div>
                  <div>ID: {patient.id}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* List View */
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4 font-semibold text-gray-900">Patient</th>
                    <th className="text-left p-4 font-semibold text-gray-900">Contact</th>
                    <th className="text-left p-4 font-semibold text-gray-900">Age & Gender</th>
                    <th className="text-left p-4 font-semibold text-gray-900">Location</th>
                    <th className="text-left p-4 font-semibold text-gray-900">Other Info</th>
                    <th className="text-left p-4 font-semibold text-gray-900">Registered</th>
                    {!selectable && <th className="text-left p-4 font-semibold text-gray-900">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {paginatedPatients.map((patient, index) => (
                    <tr 
                      key={patient.id}
                      className={`border-b hover:bg-gray-50 ${
                        selectable ? 'cursor-pointer' : ''
                      } ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}
                      onClick={() => selectable && handlePatientClick(patient)}
                    >
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{patient.name}</div>
                            <div className="text-sm text-gray-500">ID: {patient.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Phone className="h-3 w-3 mr-2 text-gray-400" />
                            {patient.phone}
                          </div>
                          {patient.email && (
                            <div className="flex items-center text-sm">
                              <Mail className="h-3 w-3 mr-2 text-gray-400" />
                              {patient.email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <Badge variant="secondary">
                            {patient.age} years
                          </Badge>
                          <div className="text-sm text-gray-600">{patient.gender}</div>
                          <Badge variant="outline" className="text-xs">
                            {getAgeGroup(patient.age)}
                          </Badge>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="text-sm text-gray-600">{patient.district}</div>
                          <div className="text-xs text-gray-500">{patient.state}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          {patient.occupation && (
                            <div className="flex items-center text-xs text-blue-600">
                              <User className="h-3 w-3 mr-1" />
                              {patient.occupation}
                            </div>
                          )}
                          {patient.medicalHistory && (
                            <div className="flex items-center text-xs text-blue-600">
                              <Heart className="h-3 w-3 mr-1" />
                              Medical History
                            </div>
                          )}
                          {!patient.occupation && !patient.medicalHistory && (
                            <span className="text-xs text-gray-400">None</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-gray-600">
                          {formatDate(patient.createdAt)}
                        </div>
                      </td>
                      {!selectable && (
                        <td className="p-4">
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPatient(patient);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingPatient(patient);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Patient Dialog */}
      <Dialog open={!!editingPatient} onOpenChange={() => setEditingPatient(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Patient Information</DialogTitle>
          </DialogHeader>
          {editingPatient && (
            <PatientForm 
              patient={editingPatient}
              onSuccess={handleEditSuccess}
              onCancel={() => setEditingPatient(null)}
              isDialog={true}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Patient Details Dialog */}
      <Dialog open={!!selectedPatient} onOpenChange={() => setSelectedPatient(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Patient Details</DialogTitle>
          </DialogHeader>
          {selectedPatient && (
            <div className="space-y-6 text-gray-700">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{selectedPatient.name}</h2>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge>{selectedPatient.age} years</Badge>
                    <Badge variant="secondary">{selectedPatient.gender}</Badge>
                    <Badge variant="outline">{getAgeGroup(selectedPatient.age)}</Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Contact Information</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center text-sm">
                      <Phone className="h-4 w-4 mr-2 text-gray-500" />
                      {selectedPatient.phone}
                    </div>
                    {selectedPatient.email && (
                      <div className="flex items-center text-sm">
                        <Mail className="h-4 w-4 mr-2 text-gray-500" />
                        {selectedPatient.email}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-semibold text-gray-700">Emergency Contact</Label>
                  <div className="mt-2">
                    <div className="flex items-center text-sm">
                      <Phone className="h-4 w-4 mr-2 text-gray-500" />
                      {selectedPatient.emergencyContact}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold text-gray-700">Location</Label>
                <div className="mt-2 flex items-start text-sm">
                  <MapPin className="h-4 w-4 mr-2 text-gray-500 mt-0.5" />
                  {selectedPatient.district}, {selectedPatient.state}
                </div>
              </div>

              {selectedPatient.medicalHistory && (
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Medical History</Label>
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg text-sm">
                    {selectedPatient.medicalHistory}
                  </div>
                </div>
              )}

              {selectedPatient.occupation && (
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Occupation</Label>
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg text-sm flex items-start">
                    <User className="h-4 w-4 mr-2 text-blue-600 mt-0.5" />
                    {selectedPatient.occupation}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t">
                <div>Patient ID: {selectedPatient.id}</div>
                <div>Registered: {formatDate(selectedPatient.createdAt)}</div>
                <div>Updated: {formatDate(selectedPatient.updatedAt)}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}