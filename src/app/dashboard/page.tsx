'use client';

import { useSession } from "next-auth/react";

export default function DashboardPage() {  
  const { data: session } = useSession();

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Welcome, {session?.user?.name}!      
      </h2>
      <p className="text-gray-600">
        This is your healthcare dashboard. Here you can manage your health records and appointments.
      </p>
    </div>
  );
} 