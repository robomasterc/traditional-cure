import { CircleUserRound, LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  TrendingUp,
  FileText,
  Users,
  List,
  UserPlus,
  BarChart3,
  UserCog,
  Clock,
  CreditCard,
  Target,
  DollarSign,
  Receipt,
  ArrowUpDown,
  FileSpreadsheet,
  Package,
  Boxes,
  Truck,
  ShoppingCart,
  Settings,
  Shield,
  Download,
  CheckCircle,
  Stethoscope,
  UserCheck,
  Calendar,
  History,
  RotateCcw,
  Search,
  Activity,
  Pill,
  Plus,
  Archive,
  Heart,
  Waves,
  Leaf,
  BookOpen,
  Flower,
  Compass,
  ClipboardList,
  Loader,
  CheckCircle2,
  Beaker,
  FlaskConical,
  Droplets,
  Shuffle,
  ShoppingBag,
  PackageOpen,
  Building,
  AlertTriangle,
  AlertCircle,
  XCircle,
  X,
  BarChart,
  TestTube,
  Award,
  ClipboardCheck,
  PieChart,
  Printer,
  Layout,
  Banknote,
  Smartphone,
  Calculator,
  CalendarDays,
  CalendarRange,
  Grid3x3,
  Edit,
  BarChart2,
  PackageCheck,
  TrendingDown,
  FileBarChart,
} from 'lucide-react';

export interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
  description: string;
  subItems?: MenuItem[];
}

export interface RoleMenu {
  role: string;
  displayName: string;
  primaryColor: string;
  icon: LucideIcon;
  menuItems: MenuItem[];
}

export const roleBasedMenus: RoleMenu[] = [
  // ============================================================================
  // ADMIN ROLE - Complete System Access
  // ============================================================================
  {
    role: "admin",
    displayName: "Administrator",
    primaryColor: "#8B5CF6", // Purple
    icon: CircleUserRound,    
    menuItems: [
      // {
      //   id: "dashboard",
      //   label: "Dashboard",
      //   icon: LayoutDashboard,
      //   path: "/admin/dashboard",
      //   description: "Overview of practice performance and key metrics",
      //   subItems: [
      //     {
      //       id: "analytics",
      //       label: "Analytics",
      //       icon: TrendingUp,
      //       path: "/admin/analytics",
      //       description: "Business intelligence and performance analytics"
      //     },
      //     {
      //       id: "reports",
      //       label: "Reports",
      //       icon: FileText,
      //       path: "/admin/reports",
      //       description: "Generate comprehensive business reports"
      //     }
      //   ]
      // },
      // {
      //   id: "patients",
      //   label: "Patient Management",
      //   icon: Users,
      //   path: "/admin/patients",
      //   description: "Complete patient database management",
      //   subItems: [
      //     {
      //       id: "patient-list",
      //       label: "All Patients",
      //       icon: List,
      //       path: "/admin/patients/list",
      //       description: "View and manage all patient records"
      //     },
      //     {
      //       id: "patient-add",
      //       label: "Add Patient",
      //       icon: UserPlus,
      //       path: "/admin/patients/add",
      //       description: "Register new patients"
      //     },
      //     {
      //       id: "patient-analytics",
      //       label: "Patient Analytics",
      //       icon: BarChart3,
      //       path: "/admin/patients/analytics",
      //       description: "Patient demographics and treatment analytics"
      //     }
      //   ]
      // },
      // {
      //   id: "staff",
      //   label: "Staff Management",
      //   icon: UserCog,
      //   path: "/admin/staff",
      //   description: "Employee management and administration",
      //   subItems: [
      //     {
      //       id: "staff-list",
      //       label: "All Staff",
      //       icon: Users,
      //       path: "/admin/staff/list",
      //       description: "View all staff members and their details"
      //     },
      //     {
      //       id: "staff-add",
      //       label: "Add Staff",
      //       icon: UserPlus,
      //       path: "/admin/staff/add",
      //       description: "Add new team members"
      //     },
      //     {
      //       id: "attendance",
      //       label: "Attendance",
      //       icon: Clock,
      //       path: "/admin/staff/attendance",
      //       description: "Track staff attendance and working hours"
      //     },
      //     {
      //       id: "payroll",
      //       label: "Payroll",
      //       icon: CreditCard,
      //       path: "/admin/staff/payroll",
      //       description: "Manage salaries and payments"
      //     },
      //     {
      //       id: "performance",
      //       label: "Performance",
      //       icon: Target,
      //       path: "/admin/staff/performance",
      //       description: "Staff performance metrics and evaluations"
      //     }
      //   ]
      // },
      {
        id: "financial",
        label: "Financials",
        icon: DollarSign,
        path: "/admin/financial",
        description: "Complete financial oversight and reporting"
      }
      // {
      //   id: "inventory",
      //   label: "Inventory Overview",
      //   icon: Package,
      //   path: "/admin/inventory",
      //   description: "Complete inventory management oversight",
      //   subItems: [
      //     {
      //       id: "stock-overview",
      //       label: "Stock Overview",
      //       icon: Boxes,
      //       path: "/admin/inventory/overview",
      //       description: "Overall inventory status and alerts"
      //     },
      //     {
      //       id: "suppliers",
      //       label: "Suppliers",
      //       icon: Truck,
      //       path: "/admin/inventory/suppliers",
      //       description: "Manage supplier relationships"
      //     },
      //     {
      //       id: "purchase-analytics",
      //       label: "Purchase Analytics",
      //       icon: ShoppingCart,
      //       path: "/admin/inventory/analytics",
      //       description: "Procurement and cost analysis"
      //     }
      //   ]
      // },
      // {
      //   id: "settings",
      //   label: "System Settings",
      //   icon: Settings,
      //   path: "/admin/settings",
      //   description: "System configuration and administration",
      //   subItems: [
      //     {
      //       id: "users",
      //       label: "User Management",
      //       icon: Shield,
      //       path: "/admin/settings/users",
      //       description: "Manage user accounts and permissions"
      //     },
      //     {
      //       id: "backup",
      //       label: "Backup & Export",
      //       icon: Download,
      //       path: "/admin/settings/backup",
      //       description: "Data backup and export functions"
      //     },
      //     {
      //       id: "compliance",
      //       label: "Compliance",
      //       icon: CheckCircle,
      //       path: "/admin/settings/compliance",
      //       description: "Regulatory compliance management"
      //     }
      //   ]
      // }
    ]
  },

  // ============================================================================
  // DOCTOR ROLE - Clinical Operations Focus
  // ============================================================================
  {
    role: "doctor",
    displayName: "Doctor",
    primaryColor: "#10B981", // Emerald
    icon: Stethoscope,
    menuItems: [
      {
        id: "dashboard",
        label: "Clinical Dashboard",
        icon: Stethoscope,
        path: "/doctor/dashboard",
        description: "Today's appointments and clinical overview"
      },
      {
        id: "consultations",
        label: "Consultations",
        icon: UserCheck,
        path: "/doctor/consultations",
        description: "Patient consultations and examinations",
        subItems: [
          {
            id: "today-appointments",
            label: "Today's Appointments",
            icon: Calendar,
            path: "/doctor/consultations/today",
            description: "Scheduled appointments for today"
          },
          {
            id: "consultation-history",
            label: "Consultation History",
            icon: History,
            path: "/doctor/consultations/history",
            description: "Past consultation records"
          },
          {
            id: "follow-ups",
            label: "Follow-ups",
            icon: RotateCcw,
            path: "/doctor/consultations/follow-ups",
            description: "Patients due for follow-up"
          }
        ]
      },
      {
        id: "patients",
        label: "My Patients",
        icon: Users,
        path: "/doctor/patients",
        description: "Patients under your care",
        subItems: [
          {
            id: "active-patients",
            label: "Active Patients",
            icon: UserCheck,
            path: "/doctor/patients/active",
            description: "Currently treating patients"
          },
          {
            id: "patient-search",
            label: "Search Patients",
            icon: Search,
            path: "/doctor/patients/search",
            description: "Find patient records quickly"
          },
          {
            id: "treatment-outcomes",
            label: "Treatment Outcomes",
            icon: Activity,
            path: "/doctor/patients/outcomes",
            description: "Track treatment effectiveness"
          }
        ]
      },
      {
        id: "prescriptions",
        label: "Prescriptions",
        icon: Pill,
        path: "/doctor/prescriptions",
        description: "Create and manage prescriptions",
        subItems: [
          {
            id: "create-prescription",
            label: "New Prescription",
            icon: Plus,
            path: "/doctor/prescriptions/create",
            description: "Create new herbal prescriptions"
          },
          {
            id: "prescription-templates",
            label: "Templates",
            icon: FileText,
            path: "/doctor/prescriptions/templates",
            description: "Common prescription templates"
          },
          {
            id: "prescription-history",
            label: "Prescription History",
            icon: Archive,
            path: "/doctor/prescriptions/history",
            description: "Previously issued prescriptions"
          }
        ]
      },
      {
        id: "treatments",
        label: "Treatment Plans",
        icon: Heart,
        path: "/doctor/treatments",
        description: "Manage treatment protocols",
        subItems: [
          {
            id: "panchakarma",
            label: "Panchakarma",
            icon: Waves,
            path: "/doctor/treatments/panchakarma",
            description: "Panchakarma therapy management"
          },
          {
            id: "ayurvedic-protocols",
            label: "Ayurvedic Protocols",
            icon: Leaf,
            path: "/doctor/treatments/protocols",
            description: "Traditional treatment protocols"
          },
          {
            id: "progress-tracking",
            label: "Progress Tracking",
            icon: TrendingUp,
            path: "/doctor/treatments/progress",
            description: "Monitor patient progress"
          }
        ]
      },
      {
        id: "knowledge",
        label: "Knowledge Base",
        icon: BookOpen,
        path: "/doctor/knowledge",
        description: "Medical references and resources",
        subItems: [
          {
            id: "herb-database",
            label: "Herb Database",
            icon: Flower,
            path: "/doctor/knowledge/herbs",
            description: "Comprehensive herb information"
          },
          {
            id: "dosha-guide",
            label: "Dosha Guide",
            icon: Compass,
            path: "/doctor/knowledge/doshas",
            description: "Dosha assessment guidelines"
          },
          {
            id: "pulse-reference",
            label: "Pulse Diagnosis",
            icon: Activity,
            path: "/doctor/knowledge/pulse",
            description: "Pulse reading reference guide"
          }
        ]
      }
    ]
  },

  // ============================================================================
  // PHARMACIST ROLE - Medicine & Inventory Focus
  // ============================================================================
  {
    role: "pharmacist",
    displayName: "Pharmacist",
    primaryColor: "#3B82F6", // Blue
    icon: Pill,
    menuItems: [
      {
        id: "dashboard",
        label: "Pharmacy Dashboard",
        icon: Pill,
        path: "/pharmacist/dashboard",
        description: "Prescription queue and inventory status"
      },
      {
        id: "prescriptions",
        label: "Prescription Queue",
        icon: ClipboardList,
        path: "/pharmacist/prescriptions",
        description: "Pending and active prescriptions",
        subItems: [
          {
            id: "pending-prescriptions",
            label: "Pending",
            icon: Clock,
            path: "/pharmacist/prescriptions/pending",
            description: "Prescriptions awaiting preparation"
          },
          {
            id: "in-progress",
            label: "In Progress",
            icon: Loader,
            path: "/pharmacist/prescriptions/progress",
            description: "Currently preparing medicines"
          },
          {
            id: "ready-for-pickup",
            label: "Ready for Pickup",
            icon: CheckCircle2,
            path: "/pharmacist/prescriptions/ready",
            description: "Completed prescriptions"
          },
          {
            id: "dispensed",
            label: "Dispensed",
            icon: Package,
            path: "/pharmacist/prescriptions/dispensed",
            description: "Successfully dispensed medicines"
          }
        ]
      },
      {
        id: "inventory",
        label: "Inventory Management",
        icon: Package,
        path: "/pharmacist/inventory",
        description: "Medicine stock and quality control",
        subItems: [
          {
            id: "current-stock",
            label: "Current Stock",
            icon: Boxes,
            path: "/pharmacist/inventory/stock",
            description: "View all medicine inventory"
          },
          {
            id: "low-stock-alerts",
            label: "Low Stock Alerts",
            icon: AlertTriangle,
            path: "/pharmacist/inventory/alerts",
            description: "Items requiring reorder"
          },
          {
            id: "expiry-tracking",
            label: "Expiry Tracking",
            icon: Calendar,
            path: "/pharmacist/inventory/expiry",
            description: "Monitor medicine expiration dates"
          },
          {
            id: "quality-control",
            label: "Quality Control",
            icon: Shield,
            path: "/pharmacist/inventory/quality",
            description: "Quality checks and certifications"
          }
        ]
      },
      {
        id: "preparation",
        label: "Medicine Preparation",
        icon: Beaker,
        path: "/pharmacist/preparation",
        description: "Herbal medicine preparation workspace",
        subItems: [
          {
            id: "formulations",
            label: "Formulations",
            icon: FlaskConical,
            path: "/pharmacist/preparation/formulations",
            description: "Recipe management and preparation"
          },
          {
            id: "oil-preparation",
            label: "Oil Preparation",
            icon: Droplets,
            path: "/pharmacist/preparation/oils",
            description: "Medicated oil preparation"
          },
          {
            id: "powder-mixing",
            label: "Powder Mixing",
            icon: Shuffle,
            path: "/pharmacist/preparation/powders",
            description: "Herbal powder formulations"
          },
          {
            id: "batch-records",
            label: "Batch Records",
            icon: FileSpreadsheet,
            path: "/pharmacist/preparation/batches",
            description: "Preparation batch documentation"
          }
        ]
      },
      {
        id: "sales",
        label: "Medicine Sales",
        icon: ShoppingCart,
        path: "/pharmacist/sales",
        description: "Over-the-counter sales and billing",
        subItems: [
          {
            id: "pos-system",
            label: "Point of Sale",
            icon: CreditCard,
            path: "/pharmacist/sales/pos",
            description: "Process medicine sales"
          },
          {
            id: "product-catalog",
            label: "Product Catalog",
            icon: Grid3x3,
            path: "/pharmacist/sales/catalog",
            description: "Available products and pricing"
          },
          {
            id: "sales-history",
            label: "Sales History",
            icon: History,
            path: "/pharmacist/sales/history",
            description: "Transaction history and reports"
          }
        ]
      },
      {
        id: "suppliers",
        label: "Supplier Relations",
        icon: Truck,
        path: "/pharmacist/suppliers",
        description: "Manage supplier relationships",
        subItems: [
          {
            id: "supplier-list",
            label: "All Suppliers",
            icon: Building,
            path: "/pharmacist/suppliers/list",
            description: "Supplier contact information"
          },
          {
            id: "purchase-requests",
            label: "Purchase Requests",
            icon: ShoppingBag,
            path: "/pharmacist/suppliers/requests",
            description: "Submit purchase requests"
          },
          {
            id: "incoming-orders",
            label: "Incoming Orders",
            icon: PackageOpen,
            path: "/pharmacist/suppliers/incoming",
            description: "Track incoming shipments"
          }
        ]
      }
    ]
  },

  // ============================================================================
  // CASH MANAGER ROLE - Financial Operations Focus
  // ============================================================================
  {
    role: "cash_manager",
    displayName: "Cash Manager",
    primaryColor: "#F59E0B", // Amber
    icon: DollarSign,
    menuItems: [
      // {
      //   id: "dashboard",
      //   label: "Financials",
      //   icon: DollarSign,
      //   path: "/cash/dashboard",
      //   description: "Today's financial summary and transactions",
      //   // subItems: [
      //   //   {
      //   //     id: "summary",
      //   //     label: "Financial summary",
      //   //     icon: DollarSign,
      //   //     path: "/cash/dashboard",
      //   //     description: "Financial Summary and Reports"
      //   //   }
      //   // ]
      // },
      {
        id: "billing",
        label: "Patient Billing",
        icon: Receipt,
        path: "/cash/billing",
        description: "Process patient payments and billing",
        // subItems: [
        //   {
        //     id: "consultation-billing",
        //     label: "Consultation Billing",
        //     icon: Stethoscope,
        //     path: "/cash/billing/consultation",
        //     description: "Bill consultation fees"
        //   },
        //   {
        //     id: "medicine-billing",
        //     label: "Medicine Billing",
        //     icon: Pill,
        //     path: "/cash/billing/medicine",
        //     description: "Process medicine payments"
        //   },
        //   {
        //     id: "treatment-billing",
        //     label: "Treatment Billing",
        //     icon: Heart,
        //     path: "/cash/billing/treatment",
        //     description: "Bill treatment packages"
        //   },
        //   {
        //     id: "pending-payments",
        //     label: "Pending Payments",
        //     icon: Clock,
        //     path: "/cash/billing/pending",
        //     description: "Outstanding patient bills"
        //   }
        // ]
      },
      {
        id: "transactions",
        label: "Transactions",
        icon: ArrowUpDown,
        path: "/cash/transactions",
        description: "Record and manage all transactions",
        // subItems: [
        //   {
        //     id: "income-entry",
        //     label: "Income Entry",
        //     icon: TrendingUp,
        //     path: "/cash/transactions/income",
        //     description: "Record income transactions"
        //   },
        //   {
        //     id: "expense-entry",
        //     label: "Expense Entry",
        //     icon: TrendingDown,
        //     path: "/cash/transactions/expense",
        //     description: "Record expense transactions"
        //   },
        //   {
        //     id: "transaction-history",
        //     label: "Transaction History",
        //     icon: History,
        //     path: "/cash/transactions/history",
        //     description: "View all transaction records"
        //   }
        // ]
      },
      // {
      //   id: "payments",
      //   label: "Payment Methods",
      //   icon: CreditCard,
      //   path: "/cash/payments",
      //   description: "Manage different payment methods",
      //   subItems: [
      //     {
      //       id: "cash-payments",
      //       label: "Cash Payments",
      //       icon: Banknote,
      //       path: "/cash/payments/cash",
      //       description: "Handle cash transactions"
      //     },
      //     {
      //       id: "upi-payments",
      //       label: "UPI Payments",
      //       icon: Smartphone,
      //       path: "/cash/payments/upi",
      //       description: "Process UPI transactions"
      //     },
      //     {
      //       id: "card-payments",
      //       label: "Card Payments",
      //       icon: CreditCard,
      //       path: "/cash/payments/card",
      //       description: "Handle card payments"
      //     },
      //     {
      //       id: "payment-reconciliation",
      //       label: "Reconciliation",
      //       icon: Calculator,
      //       path: "/cash/payments/reconciliation",
      //       description: "Daily payment reconciliation"
      //     }
      //   ]
      // },
      {
        id: "receipts",
        label: "Receipt Management",
        icon: FileBarChart,
        path: "/cash/receipts",
        description: "Generate and manage receipts",
        subItems: [
          {
            id: "generate-receipt",
            label: "Generate Receipt",
            icon: Printer,
            path: "/cash/receipts/generate",
            description: "Create new receipts"
          },
          {
            id: "receipt-templates",
            label: "Receipt Templates",
            icon: Layout,
            path: "/cash/receipts/templates",
            description: "Manage receipt formats"
          },
          {
            id: "receipt-history",
            label: "Receipt History",
            icon: Archive,
            path: "/cash/receipts/history",
            description: "View all generated receipts"
          }
        ]
      }
    ]
  },

  // ============================================================================
  // STOCK MANAGER ROLE - Procurement & Supply Chain Focus
  // ============================================================================
  {
    role: "stock_manager",
    displayName: "Stock Manager",
    primaryColor: "#8B5A2B", // Brown
    icon: Boxes,
    menuItems: [
      {
        id: "dashboard",
        label: "Inventory Dashboard",
        icon: Package,
        path: "/stock/dashboard",
        description: "Inventory overview and alerts"
      },
      {
        id: "inventory",
        label: "Stock Management",
        icon: Boxes,
        path: "/stock/inventory/",
        description: "Complete inventory control",
        subItems: [
          {
            id: "all-items",
            label: "All Items",
            icon: Package,
            path: "/stock/inventory/all",
            description: "Complete inventory listing"
          },
          {
            id: "add-item",
            label: "Add New Item",
            icon: Plus,
            path: "/stock/inventory/add",
            description: "Add new inventory items"
          },
          {
            id: "stock-movements",
            label: "Stock Movements",
            icon: ArrowUpDown,
            path: "/stock/inventory/movements",
            description: "Track inventory ins and outs"
          },
          {
            id: "stock-adjustment",
            label: "Stock Adjustment",
            icon: Edit,
            path: "/stock/inventory/adjustment",
            description: "Adjust stock quantities"
          }
        ]
      },
      {
        id: "alerts",
        label: "Stock Alerts",
        icon: AlertTriangle,
        path: "/stock/alerts",
        description: "Monitor critical stock levels",
        subItems: [
          {
            id: "low-stock",
            label: "Low Stock",
            icon: AlertCircle,
            path: "/stock/alerts/low-stock",
            description: "Items below reorder level"
          },
          {
            id: "out-of-stock",
            label: "Out of Stock",
            icon: XCircle,
            path: "/stock/alerts/out-of-stock",
            description: "Items completely out of stock"
          },
          {
            id: "expiring-soon",
            label: "Expiring Soon",
            icon: Clock,
            path: "/stock/alerts/expiring",
            description: "Items nearing expiry date"
          },
          {
            id: "expired-items",
            label: "Expired Items",
            icon: X,
            path: "/stock/alerts/expired",
            description: "Expired inventory items"
          }
        ]
      },
      {
        id: "procurement",
        label: "Procurement",
        icon: ShoppingCart,
        path: "/stock/procurement",
        description: "Purchase orders and supplier management",
        subItems: [
          {
            id: "purchase-orders",
            label: "Purchase Orders",
            icon: FileText,
            path: "/stock/procurement/orders",
            description: "Create and manage purchase orders"
          },
          {
            id: "order-tracking",
            label: "Order Tracking",
            icon: Truck,
            path: "/stock/procurement/tracking",
            description: "Track pending orders"
          },
          {
            id: "receiving",
            label: "Goods Receiving",
            icon: PackageCheck,
            path: "/stock/procurement/receiving",
            description: "Process incoming inventory"
          },
          {
            id: "procurement-analytics",
            label: "Procurement Analytics",
            icon: BarChart,
            path: "/stock/procurement/analytics",
            description: "Purchase analysis and trends"
          }
        ]
      },
      {
        id: "suppliers",
        label: "Supplier Management",
        icon: Building,
        path: "/stock/suppliers",
        description: "Manage supplier relationships",
        subItems: [
          {
            id: "supplier-list",
            label: "All Suppliers",
            icon: Users,
            path: "/stock/suppliers/list",
            description: "Complete supplier directory"
          },
          {
            id: "add-supplier",
            label: "Add Supplier",
            icon: UserPlus,
            path: "/stock/suppliers/add",
            description: "Register new suppliers"
          },
          {
            id: "supplier-performance",
            label: "Performance",
            icon: Target,
            path: "/stock/suppliers/performance",
            description: "Evaluate supplier performance"
          },
          {
            id: "price-comparison",
            label: "Price Comparison",
            icon: BarChart2,
            path: "/stock/suppliers/pricing",
            description: "Compare supplier pricing"
          }
        ]
      },
      {
        id: "quality",
        label: "Quality Control",
        icon: Shield,
        path: "/stock/quality",
        description: "Quality assurance and testing",
        subItems: [
          {
            id: "incoming-inspection",
            label: "Incoming Inspection",
            icon: Search,
            path: "/stock/quality/inspection",
            description: "Quality check incoming goods"
          },
          {
            id: "quality-certificates",
            label: "Certificates",
            icon: Award,
            path: "/stock/quality/certificates",
            description: "Manage quality certificates"
          },
          {
            id: "batch-testing",
            label: "Batch Testing",
            icon: TestTube,
            path: "/stock/quality/testing",
            description: "Track batch testing results"
          },
          {
            id: "quality-reports",
            label: "Quality Reports",
            icon: ClipboardCheck,
            path: "/stock/quality/reports",
            description: "Generate quality reports"
          }
        ]
      },
      {
        id: "reports",
        label: "Inventory Reports",
        icon: FileSpreadsheet,
        path: "/stock/reports",
        description: "Comprehensive inventory reporting",
        subItems: [
          {
            id: "stock-report",
            label: "Stock Report",
            icon: Package,
            path: "/stock/reports/stock",
            description: "Current stock status report"
          },
          {
            id: "valuation-report",
            label: "Valuation Report",
            icon: DollarSign,
            path: "/stock/reports/valuation",
            description: "Inventory valuation analysis"
          },
          {
            id: "movement-report",
            label: "Movement Report",
            icon: Activity,
            path: "/stock/reports/movement",
            description: "Stock movement analysis"
          },
          {
            id: "abc-analysis",
            label: "ABC Analysis",
            icon: TrendingUp,
            path: "/stock/reports/abc",
            description: "ABC classification analysis"
          }
        ]
      }
    ]
  }
];

// Utility function to get menu by role
export const getMenuByRole = (role: string): RoleMenu | undefined => {
  return roleBasedMenus.find(menu => menu.role === role);
};

// Extract all permissions from menu structure
export const extractPermissions = (menuItems: MenuItem[]): string[] => {
  const permissions: string[] = [];
  
  const extractFromItems = (items: MenuItem[]) => {
    items.forEach(item => {
      permissions.push(item.id);
      if (item.subItems) {
        extractFromItems(item.subItems);
      }
    });
  };
  
  extractFromItems(menuItems);
  return permissions;
};

// Generate breadcrumb navigation
export const generateBreadcrumbs = (path: string, role: string): string[] => {
  const menu = getMenuByRole(role);
  if (!menu) return [];
  
  const pathSegments = path.split('/').filter(Boolean);
  const breadcrumbs: string[] = [];
  
  // Add role-based home
  breadcrumbs.push(menu.displayName);
  
  // Find matching menu items
  const findInMenu = (items: MenuItem[], segments: string[], depth: number = 0): boolean => {
    if (depth >= segments.length) return true;
    
    const currentSegment = segments[depth];
    const item = items.find(menuItem => 
      menuItem.path.split('/').pop() === currentSegment
    );
    
    if (item) {
      breadcrumbs.push(item.label);
      if (item.subItems && depth + 1 < segments.length) {
        return findInMenu(item.subItems, segments, depth + 1);
      }
      return true;
    }
    
    return false;
  };
  
  findInMenu(menu.menuItems, pathSegments.slice(1)); // Skip role segment
  return breadcrumbs;
};

// Utility function to merge menu items and remove duplicates
const mergeMenuItems = (items: MenuItem[]): MenuItem[] => {
  const mergedItems = new Map<string, MenuItem>();

  items.forEach(item => {
    if (!mergedItems.has(item.id)) {
      mergedItems.set(item.id, item);
    } else {
      // If item exists, merge subItems if they exist
      const existingItem = mergedItems.get(item.id)!;
      if (item.subItems && existingItem.subItems) {
        const mergedSubItems = mergeMenuItems([...existingItem.subItems, ...item.subItems]);
        existingItem.subItems = mergedSubItems;
      }
    }
  });

  return Array.from(mergedItems.values());
};

// Utility function to get merged menu for multiple roles
export const getMergedMenuForRoles = (roles: string[]): RoleMenu | undefined => {
  if (!roles.length) return undefined;

  // Get all menus for the user's roles
  const roleMenus = roles
    .map(role => getMenuByRole(role))
    .filter((menu): menu is RoleMenu => menu !== undefined);

  if (!roleMenus.length) return undefined;

  // Use the first role's display name and color
  const primaryRole = roleMenus[0];
  
  // Merge all menu items
  const allMenuItems = roleMenus.flatMap(menu => menu.menuItems);
  const mergedMenuItems = mergeMenuItems(allMenuItems);

  return {
    role: roles.join('_'),
    displayName: primaryRole.displayName,
    primaryColor: primaryRole.primaryColor,
    icon: primaryRole.icon,
    menuItems: mergedMenuItems
  };
}; 