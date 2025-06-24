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
        '/stock/dashboard': () => import('@/app/stock/dashboard/page'),
        '/stock/inventory/all': () => import('@/app/stock/inventory/all/page'),
        '/stock/inventory/add': () => import('@/app/stock/inventory/add/page'),
        '/stock/inventory/adjustment': () => import('@/app/stock/inventory/adjustment/page'),
        '/stock/inventory/movements': () => import('@/app/stock/inventory/movements/page'),
        '/stock/alerts/low-stock': () => import('@/app/stock/alerts/low-stock/page'),
        '/stock/alerts/expiring': () => import('@/app/stock/alerts/expiring/page'),
        '/stock/alerts/out-of-stock': () => import('@/app/stock/alerts/out-of-stock/page'),
        '/stock/alerts/expired': () => import('@/app/stock/alerts/expired/page'),
        '/stock/procurement/orders': () => import('@/app/stock/procurement/orders/page'),
        '/stock/procurement/tracking': () => import('@/app/stock/procurement/tracking/page'),
        '/stock/procurement/receiving': () => import('@/app/stock/procurement/receiving/page'),         
        '/stock/procurement/analytics': () => import('@/app/stock/procurement/analytics/page'),   
        '/stock/suppliers/list': () => import('@/app/stock/suppliers/list/page'),
        '/stock/suppliers/add': () => import('@/app/stock/suppliers/add/page'),
        '/stock/reports/stock': () => import('@/app/stock/reports/stock/page'),
        '/stock/reports/valuation': () => import('@/app/stock/reports/valuation/page'),
        '/stock/reports/movement': () => import('@/app/stock/reports/movement/page'),
        '/stock/reports/abc': () => import('@/app/stock/reports/abc/page'),
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