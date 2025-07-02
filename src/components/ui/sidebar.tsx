'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Typography } from './typography';
import { Button } from './button';
import { ChevronLeft, ChevronRight, User, ChevronDown } from 'lucide-react';
import { getMenuByRole } from '@/config/menu';
import { useTabNavigation } from '@/hooks/useTabNavigation';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from 'next/link';

interface SidebarProps {
  userRoles: string[];
  userName: string;
}

export function Sidebar({ userRoles, userName }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedRole, setExpandedRole] = useState<string | null>(null);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const [showUserRoles, setShowUserRoles] = useState(false);
  const { openTab } = useTabNavigation();

  // Set first role as expanded by default
  useEffect(() => {
    if (userRoles.length > 0 && !expandedRole) {
      setExpandedRole(userRoles[0]);
    }
  }, [userRoles, expandedRole]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleRole = (role: string) => {
    setExpandedRole(expandedRole === role ? null : role);
  };

  const toggleSubmenu = (label: string) => {
    setExpandedMenu(expandedMenu === label ? null : label);
  };

  const toggleUserRoles = () => {
    setShowUserRoles(!showUserRoles);
  };

  const handleMenuClick = (menuItem: { subItems?: unknown[]; path?: string; label: string; icon?: React.ComponentType<{ className?: string }> }, color?: string) => {
    if (menuItem.subItems) {
      toggleSubmenu(menuItem.label);
      return;
    }

    // Open tab for the menu item
    if (menuItem.path) {
      openTab(menuItem.path, menuItem.label, menuItem.icon, color);
    }
  };

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
              Healthy n Happy
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

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2">
          <TooltipProvider>
            {userRoles.map((role) => {
              const menu = getMenuByRole(role);
              if (!menu) return null;

              return (
                <div key={role} className="mb-2">
                  {/* Role Header */}
                  <button
                    onClick={() => toggleRole(role)}
                    className={cn(
                      "w-full flex items-center justify-between p-2 rounded-md hover:bg-green-100",
                      expandedRole === role && "bg-yellow-100"
                    )}
                  >
                    <div className="flex items-center">
                      <menu.icon size={25} className="mr-2" style={{ color: menu.primaryColor }} />
                      {!isCollapsed && (
                        <Typography className="font-medium text-lg font-bold" style={{ color: menu.primaryColor }}>{menu.displayName}</Typography>
                      )}
                    </div>
                    {!isCollapsed && (
                      <ChevronDown
                        size={16}
                        className={cn(
                          "transition-transform",
                          expandedRole === role ? "transform rotate-180" : ""
                        )}
                      />
                    )}
                  </button>

                  {/* Role Menu Items */}
                  {expandedRole === role && (
                    <div className="">
                      {menu.menuItems.map((item) => (
                        <div key={item.id}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => handleMenuClick(item, menu.primaryColor)}
                                className={cn(
                                  "w-full flex flex-col sm:flex-row items-center p-1 rounded-md hover:bg-gray-100"
                                )}
                              >
                                <item.icon size={20} className="text-green-600" />
                                {!isCollapsed && <Typography className="ml-3 text-sm">{item.label}</Typography>}
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="right"><p>{item.description}</p></TooltipContent>
                          </Tooltip>

                          {/* Submenu */}
                          {item.subItems && expandedMenu === item.label && (
                            <div className="ml-8 mt-1 space-y-0.5">
                              {item.subItems.map((subItem) => (
                                <Tooltip key={subItem.id}>
                                  <TooltipTrigger asChild>
                                    <button
                                      onClick={() => handleMenuClick(subItem, menu.primaryColor)}
                                      className={cn(
                                        "block p-2 rounded-md hover:bg-gray-100 w-full text-left"
                                      )}
                                    >
                                      <Typography variant="small">{subItem.label}</Typography>
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent side="right">
                                    <p>{subItem.description}</p>
                                  </TooltipContent>
                                </Tooltip>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </TooltipProvider>
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-gray-200 relative">
          <div className="flex items-center space-x-2">
            <Button
              onClick={toggleUserRoles}
              variant="ghost"
              size="icon"
              className="p-2 bg-primary-50 rounded-full hover:bg-primary-100 transition-colors"
            >
              <User size={20} className="text-green-600" />
            </Button>
            {!isCollapsed && (
              <Typography 
                onClick={toggleUserRoles}
                className="cursor-pointer hover:text-primary-600 transition-colors"
              >
                {userName}
              </Typography>
            )}
          </div>
          
          {/* Roles Dropdown */}
          {showUserRoles && (
            <div className={cn(
              "absolute bg-white rounded-md shadow-lg border border-gray-200 z-10",
              isCollapsed ? "left-16 bottom-0 w-48" : "left-0 bottom-full mb-2 w-48"
            )}>
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