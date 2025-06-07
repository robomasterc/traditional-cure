'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Typography } from './typography';
import { Button } from './button';
import { ChevronLeft, ChevronRight, LayoutDashboard, User, Pill, DollarSign, Package } from 'lucide-react';

interface SidebarProps {
  userRoles: string[];
  userName: string;
}

const navigationItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "doctor", "pharmacist", "cash_manager", "stock_manager"],
  },
  {
    label: "Admin",
    href: "/admin",
    icon: User,
    roles: ["admin"],
    submenu: [
      { label: "Users", href: "/admin/users" },
      { label: "Roles", href: "/admin/roles" },
      { label: "Settings", href: "/admin/settings" },
    ],
  },
  {
    label: "Doctor",
    href: "/doctor",
    icon: User,
    roles: ["admin", "doctor"],
    submenu: [
      { label: "Patients", href: "/doctor/patients" },
      { label: "Appointments", href: "/doctor/appointments" },
      { label: "Prescriptions", href: "/doctor/prescriptions" },
    ],
  },
  {
    label: "Pharmacy",
    href: "/pharmacy",
    icon: Pill,
    roles: ["admin", "doctor", "pharmacist"],
    submenu: [
      { label: "Inventory", href: "/pharmacy/inventory" },
      { label: "Prescriptions", href: "/pharmacy/prescriptions" },
      { label: "Orders", href: "/pharmacy/orders" },
    ],
  },
  {
    label: "Cash",
    href: "/cash",
    icon: DollarSign,
    roles: ["admin", "cash_manager"],
    submenu: [
      { label: "Transactions", href: "/cash/transactions" },
      { label: "Reports", href: "/cash/reports" },
      { label: "Billing", href: "/cash/billing" },
    ],
  },
  {
    label: "Stock",
    href: "/stock",
    icon: Package,
    roles: ["admin", "doctor", "pharmacist", "stock_manager"],
    submenu: [
      { label: "Inventory", href: "/stock/inventory" },
      { label: "Orders", href: "/stock/orders" },
      { label: "Suppliers", href: "/stock/suppliers" },
    ],
  },
];

export function Sidebar({ userRoles, userName }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const [showUserRoles, setShowUserRoles] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleSubmenu = (label: string) => {
    setExpandedMenu(expandedMenu === label ? null : label);
  };

  const toggleUserRoles = () => {
    setShowUserRoles(!showUserRoles);
  };

  const accessibleItems = navigationItems.filter(item =>
    item.roles.some(role => userRoles.includes(role))
  );

  return (
    <div
      className={cn(
        "h-screen bg-white border-r border-gray-200 transition-all duration-300",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {!isCollapsed && (
            <Typography variant="h4" className="text-gray-900">
              ATC
            </Typography>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSidebar}
            className="ml-auto"
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </Button>
        </div>

        {/* User Info */}
        {!isCollapsed && (
          <div className="p-4 border-b border-gray-200 relative">
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleUserRoles}
                className="p-2 bg-primary-50 rounded-full hover:bg-primary-100 transition-colors"
              >
                <User size={20} className="text-green-600 " />
              </button>
              <Typography>{userName}</Typography>
            </div>
            
            {/* Roles Dropdown */}
            {showUserRoles && (
              <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                <div className="p-3">
                  <Typography variant="small" className="text-gray-500 mb-2">
                    Your Roles
                  </Typography>
                  <div className="space-y-1">
                    {userRoles.map((role) => (
                      <div
                        key={role}
                        className="px-2 py-1 bg-gray-50 rounded text-sm text-gray-700"
                      >
                        {role}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2">
          {accessibleItems.map((item) => (
            <div key={item.href}>
              <button
                onClick={() => toggleSubmenu(item.label)}
                className={cn(
                  "w-full flex items-center p-2 rounded-md hover:bg-gray-100",
                  pathname.startsWith(item.href) && "bg-gray-100"
                )}
              >
                <item.icon size={20} className="text-green-600" />
                {!isCollapsed && (
                  <Typography className="ml-3">{item.label}</Typography>
                )}
              </button>

              {/* Submenu */}
              {!isCollapsed && expandedMenu === item.label && item.submenu && (
                <div className="ml-8 mt-1 space-y-1">
                  {item.submenu.map((subItem) => (
                    <Link
                      key={subItem.href}
                      href={subItem.href}
                      className={cn(
                        "block p-2 rounded-md hover:bg-gray-100",
                        pathname === subItem.href && "bg-gray-100"
                      )}
                    >
                      <Typography variant="small">{subItem.label}</Typography>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <Link href="/auth/signout">
            <Button variant="outline" size="sm" className="w-full">
              Sign Out
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
} 