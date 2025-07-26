#!/usr/bin/env node

/**
 * Initialize SQLite database with sample data and create admin user
 * Usage: npm run init-sqlite
 */

import { SQLiteService } from '../lib/sqlite';
import { UserRole } from '../types/auth';

async function initializeSQLite() {
  console.log('🚀 Initializing SQLite database...');
  
  try {
    const sqliteService = new SQLiteService();
    
    // Create admin user
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@atc.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const adminName = process.env.ADMIN_NAME || 'System Administrator';
    
    console.log('👤 Creating admin user...');
    await sqliteService.createUser(adminEmail, adminPassword, adminName, ['admin']);
    
    // Create some sample users
    console.log('👥 Creating sample users...');
    await sqliteService.createUser('doctor@atc.com', 'doctor123', 'Dr. John Smith', ['doctor']);
    await sqliteService.createUser('pharmacist@atc.com', 'pharmacist123', 'Jane Pharmacist', ['pharmacist']);
    await sqliteService.createUser('cashier@atc.com', 'cashier123', 'Bob Cashier', ['cash_manager']);
    
    // Insert sample suppliers
    console.log('🏪 Creating sample suppliers...');
    await sqliteService.appendRow('suppliers', {
      id: 'SUP001',
      name: 'Ayurvedic Herbs Ltd',
      contact: 'contact@ayurvedicherbs.com',
      phone: '+91-9876543210',
      email: 'sales@ayurvedicherbs.com',
      address: '123 Herb Street, Kerala, India',
      speciality: 'Traditional Herbs'
    });

    await sqliteService.appendRow('suppliers', {
      id: 'SUP002',
      name: 'Natural Medicines Co',
      contact: 'info@naturalmeds.com',
      phone: '+91-9876543211',
      email: 'orders@naturalmeds.com',
      address: '456 Medicine Avenue, Karnataka, India',
      speciality: 'Ayurvedic Formulations'
    });

    // Insert sample inventory items
    console.log('📦 Creating sample inventory...');
    await sqliteService.appendRow('inventory', {
      id: 'INV001',
      name: 'Ashwagandha Powder',
      category: 'Powder',
      stock: 100,
      unit: 'kg',
      cost_price: 500.00,
      selling_price: 650.00,
      supplier_id: 'SUP001',
      expiry_date: '2025-12-31',
      reorder_level: 20,
      batch_number: 'ASH2024001',
      description: 'Premium quality Ashwagandha root powder'
    });

    await sqliteService.appendRow('inventory', {
      id: 'INV002',
      name: 'Triphala Tablets',
      category: 'Tablet',
      stock: 500,
      unit: 'pieces',
      cost_price: 2.00,
      selling_price: 3.00,
      supplier_id: 'SUP002',
      expiry_date: '2026-06-30',
      reorder_level: 100,
      batch_number: 'TRI2024001',
      description: 'Traditional Triphala formulation tablets'
    });

    // Insert sample staff
    console.log('👨‍⚕️ Creating sample staff...');
    await sqliteService.appendRow('staff', {
      id: 'STF001',
      name: 'Dr. John Smith',
      role: 'doctor',
      email: 'doctor@atc.com',
      phone: '+91-9876543220',
      salary: 50000.00,
      join_date: '2024-01-01',
      status: 'Active',
      permissions: JSON.stringify(['prescribe', 'consult', 'view_patients'])
    });

    await sqliteService.appendRow('staff', {
      id: 'STF002',
      name: 'Jane Pharmacist',
      role: 'pharmacist',
      email: 'pharmacist@atc.com',
      phone: '+91-9876543221',
      salary: 30000.00,
      join_date: '2024-01-15',
      status: 'Active',
      permissions: JSON.stringify(['dispense', 'manage_inventory', 'view_prescriptions'])
    });

    console.log('✅ SQLite database initialized successfully!');
    console.log('📝 Admin credentials:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log('🔗 Access the application at http://localhost:3000/auth/signin-sqlite');
    
  } catch (error) {
    console.error('❌ Error initializing SQLite database:', error);
    process.exit(1);
  }
}

// Run the initialization if this file is executed directly
if (require.main === module) {
  initializeSQLite();
}

export { initializeSQLite };