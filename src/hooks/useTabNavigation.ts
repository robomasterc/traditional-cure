'use client';

import React from 'react';
import { useTabs } from '@/contexts/TabContext';

export function useTabNavigation() {
  const { addTab } = useTabs();

  const openTab = async (path: string, title: string, icon?: any, color?: string) => {
    try {
      let Component: React.ComponentType;
      
      // Map paths to components
      const componentMap: Record<string, () => Promise<any>> = {
        '/dashboard': () => import('@/app/dashboard/page'),
        '/cash/dashboard': () => import('@/app/cash/dashboard/page'),
        '/cash/transactions': () => import('@/app/cash/transactions/page'),
        '/cash/billing': () => import('@/app/cash/billing/page'),
        '/cash/transactions/income': () => import('@/app/cash/transactions/income/page'),
        '/cash/transactions/expense': () => import('@/app/cash/transactions/expense/page'),
        '/admin/financial': () => import('@/app/admin/financial/page'),
      };

      const importFn = componentMap[path];
      if (!importFn) {
        console.warn('No component found for path:', path);
        return;
      }

      const module = await importFn();
      Component = module.default;

      addTab({
        id: path,
        title,
        path,
        icon,
        color,
        component: React.createElement(Component),
        closable: true
      });
    } catch (error) {
      console.error('Error loading component:', error);
    }
  };

  return { openTab };
} 