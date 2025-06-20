'use client';

import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { useTabs, Tab } from '@/contexts/TabContext';

interface TabBarProps {
  className?: string;
}

export function TabBar({ className }: TabBarProps) {
  const { tabs, activeTab, setActiveTab, closeTab } = useTabs();

  if (tabs.length === 0) {
    return null;
  }

  return (
    <div className={cn("bg-white border-b border-gray-200", className)}>
      <div className="flex items-center overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const tabColor = tab.color || '#3B82F6'; // Default blue if no color
          
          return (
            <div
              key={tab.id}
              className={cn(
                "flex items-center min-w-0 border-r rounded-lg border-gray-200 last:border-r-0",
                isActive
                  ? "border-b-2"
                  : "bg-gray-50 hover:bg-gray-100"
              )}
              style={{
                backgroundColor: isActive ? `${tabColor}10` : undefined,
                borderBottomColor: isActive ? tabColor : undefined
              }}
            >
              <button
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center px-4 py-2 text-sm font-medium min-w-0 flex-1",
                  isActive
                    ? "font-semibold"
                    : "text-gray-600 hover:text-gray-900"
                )}
                style={{
                  color: isActive ? tabColor : undefined
                }}
              >
                {tab.icon && (
                  <div 
                    className="w-4 h-4 mr-2 flex-shrink-0"
                    style={{
                      color: isActive ? tabColor : '#6B7280'
                    }}
                  >
                    <tab.icon />
                  </div>
                )}
                <span className="truncate">{tab.title}</span>
              </button>
              
              {tab.closable !== false && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tab.id);
                  }}
                  className={cn(
                    "h-6 w-6 p-0 ml-1 mr-2",
                    isActive
                      ? "hover:bg-opacity-20"
                      : "text-gray-500 hover:text-gray-700"
                  )}
                  style={{
                    color: isActive ? tabColor : undefined,
                    backgroundColor: isActive ? `${tabColor}20` : undefined
                  }}
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
} 