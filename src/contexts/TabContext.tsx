'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { TAB_CONFIG } from '@/config/tabs';

export interface Tab {
  id: string;
  title: string;
  path: string;
  icon?: React.ComponentType<{ className?: string }>;
  color?: string;
  component: ReactNode;
  closable?: boolean;
}

interface TabContextType {
  tabs: Tab[];
  activeTab: string | null;
  maxTabs: number;
  setMaxTabs: (max: number) => void;
  addTab: (tab: Tab) => void;
  removeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  closeTab: (tabId: string) => void;
  clearTabs: () => void;
  closeOldestTab: () => void;
}

const TabContext = createContext<TabContextType | undefined>(undefined);

export function TabProvider({ children }: { children: ReactNode }) {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTab, setActiveTabState] = useState<string | null>(null);
  const [maxTabs, setMaxTabsState] = useState<number>(TAB_CONFIG.DEFAULT_MAX_TABS);

  const setMaxTabs = (max: number) => {
    // Ensure the value is within allowed bounds
    const clampedMax = Math.max(
      TAB_CONFIG.MIN_MAX_TABS,
      Math.min(TAB_CONFIG.MAX_MAX_TABS, max)
    );
    
    setMaxTabsState(clampedMax);
    
    // If current tabs exceed new limit, close oldest tabs
    if (tabs.length > clampedMax) {
      const tabsToRemove = tabs.length - clampedMax;
      setTabs(prevTabs => {
        const newTabs = prevTabs.slice(tabsToRemove);
        // If active tab was removed, set first remaining tab as active
        if (!newTabs.find(tab => tab.id === activeTab)) {
          setActiveTabState(newTabs[0]?.id || null);
        }
        return newTabs;
      });
    }
  };

  const closeOldestTab = () => {
    setTabs(prevTabs => {
      if (prevTabs.length === 0) return prevTabs;
      
      const oldestTab = prevTabs[0]; // First tab is oldest
      const newTabs = prevTabs.slice(1);
      
      // If we're closing the active tab, switch to the next available tab
      if (activeTab === oldestTab.id) {
        setActiveTabState(newTabs[0]?.id || null);
      }
      
      return newTabs;
    });
  };

  const addTab = (tab: Tab) => {
    setTabs(prevTabs => {
      // Check if tab already exists
      const existingTab = prevTabs.find(t => t.id === tab.id);
      if (existingTab) {
        setActiveTabState(tab.id);
        return prevTabs;
      }
      
      // Check if we've reached the maximum number of tabs
      if (prevTabs.length >= maxTabs && TAB_CONFIG.AUTO_CLOSE_OLDEST) {
        // Close the oldest tab (first in the array)
        const newTabs = [...prevTabs.slice(1), tab];
        setActiveTabState(tab.id);
        return newTabs;
      }
      
      // Add new tab
      const newTabs = [...prevTabs, tab];
      setActiveTabState(tab.id);
      return newTabs;
    });
  };

  const removeTab = (tabId: string) => {
    setTabs(prevTabs => {
      const newTabs = prevTabs.filter(tab => tab.id !== tabId);
      
      // If we're removing the active tab, switch to the next available tab
      if (activeTab === tabId) {
        const currentIndex = prevTabs.findIndex(tab => tab.id === tabId);
        const nextTab = newTabs[currentIndex] || newTabs[currentIndex - 1];
        setActiveTabState(nextTab?.id || null);
      }
      
      return newTabs;
    });
  };

  const setActiveTab = (tabId: string) => {
    setActiveTabState(tabId);
  };

  const closeTab = (tabId: string) => {
    removeTab(tabId);
  };

  const clearTabs = () => {
    setTabs([]);
    setActiveTabState(null);
  };

  return (
    <TabContext.Provider value={{
      tabs,
      activeTab,
      maxTabs,
      setMaxTabs,
      addTab,
      removeTab,
      setActiveTab,
      closeTab,
      clearTabs,
      closeOldestTab
    }}>
      {children}
    </TabContext.Provider>
  );
}

export function useTabs() {
  const context = useContext(TabContext);
  if (context === undefined) {
    throw new Error('useTabs must be used within a TabProvider');
  }
  return context;
} 