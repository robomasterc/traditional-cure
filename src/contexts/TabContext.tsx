'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

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
  addTab: (tab: Tab) => void;
  removeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  closeTab: (tabId: string) => void;
  clearTabs: () => void;
}

const TabContext = createContext<TabContextType | undefined>(undefined);

export function TabProvider({ children }: { children: ReactNode }) {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTab, setActiveTabState] = useState<string | null>(null);

  const addTab = (tab: Tab) => {
    setTabs(prevTabs => {
      // Check if tab already exists
      const existingTab = prevTabs.find(t => t.id === tab.id);
      if (existingTab) {
        setActiveTabState(tab.id);
        return prevTabs;
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
      addTab,
      removeTab,
      setActiveTab,
      closeTab,
      clearTabs
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