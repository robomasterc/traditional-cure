import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Stock Management - ATC Healthcare',
  description: 'Inventory and stock management system for ATC Healthcare',
};

export default function StockLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
} 