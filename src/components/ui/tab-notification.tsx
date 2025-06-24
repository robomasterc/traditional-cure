'use client';

import React, { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { useTabs } from '@/contexts/TabContext';
import { TAB_CONFIG } from '@/config/tabs';

interface TabNotificationProps {
  className?: string;
}

export function TabNotification({ className }: TabNotificationProps) {
  const { tabs, maxTabs, closeOldestTab } = useTabs();
  const [showWarning, setShowWarning] = useState(false);
  const [showLimit, setShowLimit] = useState(false);

  useEffect(() => {
    const isNearLimit = tabs.length >= maxTabs * TAB_CONFIG.WARNING_THRESHOLD;
    const isAtLimit = tabs.length >= maxTabs;

    setShowWarning(isNearLimit && !isAtLimit);
    setShowLimit(isAtLimit);
  }, [tabs.length, maxTabs]);

  if (!showWarning && !showLimit) {
    return null;
  }

  return (
    <div className={cn("fixed top-4 right-4 z-50 max-w-sm", className)}>
      {showWarning && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-2 shadow-lg">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-800">
                Approaching Tab Limit
              </h3>
              <p className="text-sm text-red-400 mt-1">
                You have {tabs.length}/{maxTabs} tabs open. Consider closing some tabs to avoid automatic closure.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowWarning(false)}
              className="ml-2 h-6 w-6 p-0 text-yellow-600 hover:text-yellow-800"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}

      {showLimit && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800">
                Tab Limit Reached
              </h3>
              <p className="text-sm text-red-700 mt-1">
                You have reached the maximum of {maxTabs} tabs. The oldest tab will be closed when you open a new one.
              </p>
              <div className="mt-3 flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={closeOldestTab}
                  className="text-red-600 border-red-300 hover:bg-red-100"
                >
                  Close Oldest Tab
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowLimit(false)}
                  className="text-red-600 hover:bg-red-100"
                >
                  Dismiss
                </Button>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowLimit(false)}
              className="ml-2 h-6 w-6 p-0 text-red-600 hover:text-red-800"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 