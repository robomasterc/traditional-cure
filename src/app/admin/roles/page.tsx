'use client';

import { useState, useEffect } from 'react';
import { Typography } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

interface UserRole {
  email: string;
  roles: string[];
}

const availableRoles = [
  { id: 'admin', label: 'Admin' },
  { id: 'doctor', label: 'Doctor' },
  { id: 'pharmacist', label: 'Pharmacist' },
  { id: 'cash_manager', label: 'Cash Manager' },
  { id: 'stock_manager', label: 'Stock Manager' },
];

export default function RoleManagementPage() {
  const [users, setUsers] = useState<UserRole[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/roles');
      const data = await response.json();
      setUsers(data);
    } catch {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleToggle = (roleId: string) => {
    setSelectedRoles(prev =>
      prev.includes(roleId)
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handleAddUser = async () => {
    if (!newEmail || selectedRoles.length === 0) {
      toast.error('Please enter an email and select at least one role');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail, roles: selectedRoles }),
      });

      if (!response.ok) throw new Error('Failed to add user');
      
      await fetchUsers();
      setNewEmail('');
      setSelectedRoles([]);
      toast.success('User roles updated successfully');
    } catch {
      toast.error('Failed to update user roles');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateRoles = async (email: string, roles: string[]) => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/roles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, roles }),
      });

      if (!response.ok) throw new Error('Failed to update roles');
      
      await fetchUsers();
      toast.success('User roles updated successfully');
    } catch {
      toast.error('Failed to update user roles');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (email: string) => {
    if (!confirm('Are you sure you want to remove this user?')) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/roles?email=${encodeURIComponent(email)}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete user');
      
      await fetchUsers();
      toast.success('User removed successfully');
    } catch {
      toast.error('Failed to remove user');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <Typography>Loading...</Typography>
      </div>
    );
  }

  return (
    <div className="p-8">
      <Typography variant="h2" className="mb-8">Role Management</Typography>

      {/* Add New User Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <Typography variant="h3" className="mb-4">Add New User</Typography>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <Typography variant="small" className="mb-2">Email</Typography>
            <Input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Enter user email"
            />
          </div>
          <div className="flex-1">
            <Typography variant="small" className="mb-2">Roles</Typography>
            <div className="flex flex-wrap gap-2">
              {availableRoles.map((role) => (
                <label key={role.id} className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedRoles.includes(role.id)}
                    onCheckedChange={() => handleRoleToggle(role.id)}
                  />
                  <Typography variant="small">{role.label}</Typography>
                </label>
              ))}
            </div>
          </div>
          <Button
            onClick={handleAddUser}
            disabled={saving || !newEmail || selectedRoles.length === 0}
          >
            Add User
          </Button>
        </div>
      </div>

      {/* User List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <Typography variant="h3">User Roles</Typography>
        </div>
        <div className="divide-y divide-gray-200">
          {users.map((user) => (
            <div key={user.email} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Typography variant="h4">{user.email}</Typography>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteUser(user.email)}
                >
                  Remove User
                </Button>
              </div>
              <div className="flex flex-wrap gap-4">
                {availableRoles.map((role) => (
                  <label key={role.id} className="flex items-center gap-2">
                    <Checkbox
                      checked={user.roles.includes(role.id)}
                      onCheckedChange={() => {
                        const newRoles = user.roles.includes(role.id)
                          ? user.roles.filter(r => r !== role.id)
                          : [...user.roles, role.id];
                        handleUpdateRoles(user.email, newRoles);
                      }}
                    />
                    <Typography variant="small">{role.label}</Typography>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 