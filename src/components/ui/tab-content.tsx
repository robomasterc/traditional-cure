'use client';

import React from 'react';
import { useTabs } from '@/contexts/TabContext';

interface TabContentProps {
  className?: string;
}

export function TabContent({ className }: TabContentProps) {
  const { tabs, activeTab } = useTabs();

  if (tabs.length === 0) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center text-gray-500">
          <p className="text-lg font-medium">No tabs open</p>
          <p className="text-sm">Click on a menu item to open a tab</p>
        </div>
      </div>
    );
  }

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  if (!activeTabData) {
    return null;
  }

  return (
    <div className={`h-full overflow-auto ${className}`}>
      {activeTabData.component}
    </div>
  );
} 