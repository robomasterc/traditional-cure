import { useState, useEffect, useCallback } from 'react';

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  email?: string;
  district: string;
  state: string;
  occupation: string;
  allergies?: string;
  emergencyContact?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePatientData {
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  email?: string;
  district: string;
  state: string;
  occupation: string;
  allergies?: string;
  emergencyContact?: string;
}

export type UpdatePatientData = Partial<CreatePatientData>;

interface UsePatientsReturn {
  patients: Patient[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createPatient: (data: CreatePatientData) => Promise<Patient | null>;
  updatePatient: (id: string, data: UpdatePatientData) => Promise<Patient | null>;
  deletePatient: (id: string) => Promise<boolean>;
  getPatientById: (id: string) => Patient | undefined;
  searchPatients: (query: string) => Patient[];
  getPatientsByGender: (gender: string) => Patient[];
  searchLoading: boolean;
}

export function usePatients(): UsePatientsReturn {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<number>(0);
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  const fetchPatients = useCallback(async (searchQuery?: string, gender?: string) => {
    try {
      const isSearch = searchQuery || gender;
      if (isSearch) {
        setSearchLoading(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (gender) params.append('gender', gender);
      
      const response = await fetch(`/api/patients?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch patients');
      }
      
      const data = await response.json() as Patient[];
      // Convert date strings back to Date objects
      const processedData = data.map(patient => ({
        ...patient,
        createdAt: new Date(patient.createdAt),
        updatedAt: new Date(patient.updatedAt),
      }));
      
      setPatients(processedData);
      if (!isSearch) {
        setLastFetch(Date.now());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching patients:', err);
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    await fetchPatients();
  }, [fetchPatients]);

  const createPatient = useCallback(async (data: CreatePatientData): Promise<Patient | null> => {
    try {
      setError(null);
      const patientData = {
        ...data,
        id: `PAT${Date.now()}`, // Generate ID
      };

      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patientData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create patient');
      }

      const newPatient = await response.json() as Patient;
      const processedPatient = {
        ...newPatient,
        createdAt: new Date(newPatient.createdAt),
        updatedAt: new Date(newPatient.updatedAt),
      };

      setPatients(prev => [processedPatient, ...prev]);
      return processedPatient;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create patient';
      setError(errorMessage);
      console.error('Error creating patient:', err);
      return null;
    }
  }, []);

  const updatePatient = useCallback(async (id: string, data: UpdatePatientData): Promise<Patient | null> => {
    try {
      setError(null);
      const response = await fetch(`/api/patients?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update patient');
      }

      const updatedPatient = await response.json() as Patient;
      const processedPatient = {
        ...updatedPatient,
        createdAt: new Date(updatedPatient.createdAt),
        updatedAt: new Date(updatedPatient.updatedAt),
      };

      setPatients(prev => prev.map(patient => 
        patient.id === id ? processedPatient : patient
      ));
      return processedPatient;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update patient';
      setError(errorMessage);
      console.error('Error updating patient:', err);
      return null;
    }
  }, []);

  const deletePatient = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null);
      const response = await fetch(`/api/patients?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete patient');
      }

      setPatients(prev => prev.filter(patient => patient.id !== id));
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete patient';
      setError(errorMessage);
      console.error('Error deleting patient:', err);
      return false;
    }
  }, []);

  useEffect(() => {
    const shouldFetch = patients.length === 0 || (Date.now() - lastFetch) > CACHE_DURATION;
    if (shouldFetch) {
      fetchPatients();
    }
  }, [fetchPatients, patients.length, lastFetch, CACHE_DURATION]);

  const getPatientById = useCallback((id: string): Patient | undefined => {
    return patients.find(patient => patient.id === id);
  }, [patients]);

  const searchPatients = useCallback((query: string): Patient[] => {
    if (!query.trim()) return patients;
    
    const queryLower = query.toLowerCase();
    return patients.filter(patient => 
      patient.name.toLowerCase().includes(queryLower) ||
      patient.phone.includes(query) ||
      (patient.email && patient.email.toLowerCase().includes(queryLower))
    );
  }, [patients]);

  const getPatientsByGender = useCallback((gender: string): Patient[] => {
    return patients.filter(patient => patient.gender === gender);
  }, [patients]);

  return {
    patients,
    loading,
    error,
    refetch,
    createPatient,
    updatePatient,
    deletePatient,
    getPatientById,
    searchPatients,
    getPatientsByGender,
    searchLoading,
  };
}