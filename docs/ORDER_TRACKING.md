# Order Tracking System

## Overview

The Order Tracking system has been updated to pull data from the backend (Google Sheets) instead of using static data. This provides real-time tracking information for purchase orders and shipments.

## Features

- **Real-time Data**: Orders are fetched from Google Sheets via API
- **Status Tracking**: Track orders through various statuses (Sent, Confirmed, In Transit, Out for Delivery, Delivered, Delayed)
- **Filtering**: Filter by status, supplier, and search terms
- **Contact Integration**: Direct WhatsApp messaging to suppliers
- **Refresh Capability**: Manual refresh of tracking data
- **Responsive Design**: Works on desktop and mobile devices

## API Endpoints

### GET /api/orders/tracking
Fetches order tracking data with optional filters.

**Query Parameters:**
- `status` (optional): Filter by order status
- `supplierId` (optional): Filter by supplier ID
- `id` (optional): Get specific order by ID

**Response:**
```json
[
  {
    "id": "TR001",
    "poNumber": "PO-2024-001",
    "supplierName": "ABC Suppliers",
    "supplierId": "SUP001",
    "orderDate": "2024-01-15",
    "expectedDelivery": "2024-01-22",
    "status": "In Transit",
    "currentLocation": "Mumbai Distribution Center",
    "trackingNumber": "TRK123456789",
    "carrier": "Express Logistics",
    "lastUpdate": "2024-01-20T14:30:00Z",
    "totalAmount": 25000,
    "items": [...],
    "notes": "Package left distribution center",
    "contactPerson": "Rajesh Kumar",
    "contactPhone": "+91 98765 43210"
  }
]
```

### PUT /api/orders/tracking
Updates order tracking information.

**Request Body:**
```json
{
  "poNumber": "PO-2024-001",
  "status": "In Transit",
  "currentLocation": "Mumbai Distribution Center",
  "trackingNumber": "TRK123456789",
  "carrier": "Express Logistics",
  "notes": "Updated tracking information"
}
```

## Data Structure

### Google Sheets - Orders Table
The system reads from the `Orders` sheet with the following columns:
- ID
- PO Number
- Supplier ID
- Order Date
- Item ID
- Item Name
- Quantity
- Unit Price
- Total
- Notes
- Status (using CreatedBy field)
- Created At

### Google Sheets - Suppliers Table
Supplier information is fetched from the `Suppliers` sheet:
- ID
- Name
- Contact
- Phone
- Email
- Address
- Speciality

## Frontend Components

### useOrderTracking Hook
A custom React hook that manages order tracking state and API calls:

```typescript
const {
  orders,
  loading,
  error,
  refreshing,
  refreshOrders,
  refreshOrder,
  updateOrderTracking,
} = useOrderTracking({
  status: statusFilter,
  supplierId: supplierFilter,
  searchTerm,
});
```

### OrderTrackingPage Component
The main page component that displays:
- Summary cards with order statistics
- Filter controls (search, status, supplier)
- Orders table with tracking information
- Order details modal
- Action buttons (view details, contact supplier, refresh)

## Setup Instructions

1. **Environment Variables**: Ensure Google Sheets API credentials are configured
2. **Sample Data**: Run the sample data scripts to populate test data:
   ```bash
   npx tsx src/scripts/addSampleSuppliers.ts
   npx tsx src/scripts/addSampleOrders.ts
   ```
3. **Access**: Navigate to `/stock/procurement/tracking` to view the order tracking page

## Status Mapping

The system maps order statuses from the database to tracking statuses:
- `Draft` → `Sent`
- `Pending` → `Sent`
- `Confirmed` → `Confirmed`
- `Shipped` → `In Transit`
- `Delivered` → `Delivered`
- `Cancelled` → `Delayed`

## Features in Detail

### Summary Cards
- **Active Orders**: Orders with status Sent, Confirmed, In Transit, or Out for Delivery
- **Delivered**: Orders with status Delivered
- **Delayed**: Orders with status Delayed
- **Overdue**: Orders past expected delivery date

### Filtering
- **Search**: Search by PO number, supplier name, tracking number, or contact person
- **Status**: Filter by order status
- **Supplier**: Filter by specific supplier

### Actions
- **View Details**: Opens modal with complete order information
- **Contact Supplier**: Opens WhatsApp with pre-filled message
- **Refresh**: Updates tracking information for specific order or all orders

### Responsive Design
- Mobile-friendly interface
- Collapsible filters
- Touch-friendly buttons
- Optimized table layout for small screens

## Error Handling

The system includes comprehensive error handling:
- Loading states during API calls
- Error messages for failed requests
- Retry functionality
- Graceful fallbacks for missing data

## Future Enhancements

Potential improvements for the order tracking system:
- Real-time updates via WebSocket
- Email notifications for status changes
- Integration with external tracking APIs
- Advanced analytics and reporting
- Bulk operations for multiple orders 