'use client';

import React, { useState } from 'react';
import { X, Settings, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './dialog';
import { useTabs } from '@/contexts/TabContext';
import { TAB_CONFIG } from '@/config/tabs';

interface TabBarProps {
  className?: string;
}

export function TabBar({ className }: TabBarProps) {
  const { tabs, activeTab, setActiveTab, closeTab, maxTabs, setMaxTabs } = useTabs();
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [tempMaxTabs, setTempMaxTabs] = useState(maxTabs);

  if (tabs.length === 0) {
    return null;
  }

  const handleSaveConfig = () => {
    setMaxTabs(tempMaxTabs);
    setIsConfigOpen(false);
  };

  const isNearLimit = tabs.length >= maxTabs * TAB_CONFIG.WARNING_THRESHOLD;
  const isAtLimit = tabs.length >= maxTabs;

  return (
    <div className={cn("bg-white border-b border-gray-200", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center overflow-x-auto flex-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const tabColor = tab.color || TAB_CONFIG.TAB_SETTINGS.DEFAULT_COLOR;
            
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
                  backgroundColor: isActive ? `${tabColor}50` : `${tabColor}25`,
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
                
                {tab.closable && (
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

        {/* Tab count and configuration */}
        {TAB_CONFIG.TAB_SETTINGS.SHOW_TAB_COUNT && (
          <div className="flex items-center space-x-2 px-4 py-2 border-l border-gray-200">
            <div className="flex items-center space-x-1">
              <span className="text-xs text-gray-500">
                {tabs.length}/{maxTabs}
              </span>
              {TAB_CONFIG.TAB_SETTINGS.SHOW_WARNING_ICONS && isNearLimit && !isAtLimit && (
                <AlertTriangle className="w-3 h-3 text-yellow-500" />
              )}
              {TAB_CONFIG.TAB_SETTINGS.SHOW_WARNING_ICONS && isAtLimit && (
                <AlertTriangle className="w-3 h-3 text-red-500" />
              )}
            </div>
            
            {TAB_CONFIG.TAB_SETTINGS.SHOW_CONFIG_BUTTON && (
              <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    title="Configure tab settings"
                  >
                    <Settings className="w-3 h-3" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Tab Configuration</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="maxTabs">Maximum Number of Tabs</Label>
                      <Input
                        id="maxTabs"
                        type="number"
                        min={TAB_CONFIG.MIN_MAX_TABS}
                        max={TAB_CONFIG.MAX_MAX_TABS}
                        value={tempMaxTabs}
                        onChange={(e) => setTempMaxTabs(parseInt(e.target.value) || TAB_CONFIG.DEFAULT_MAX_TABS)}
                        className="mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        When the limit is reached, the oldest tab will be automatically closed.
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Range: {TAB_CONFIG.MIN_MAX_TABS} - {TAB_CONFIG.MAX_MAX_TABS}
                      </p>
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setTempMaxTabs(maxTabs);
                          setIsConfigOpen(false);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleSaveConfig}>
                        Save
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 