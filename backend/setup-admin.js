const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { pool } = require('./src/config/database');

// Generate UUID v4
function generateUUID() {
  return crypto.randomUUID();
}

async function createAdmin() {
  try {
    const email = 'admin@gvmarketing.com';
    const password = 'GVMarketing2024!@Secure';
    const name = 'Admin GV Marketing';
    const role = 'Admin';
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    console.log('✅ Password hashed successfully');
    
    // First, try to disable the trigger temporarily
    console.log('Attempting to disable trigger...');
    try {
      await pool.query('ALTER TABLE users DISABLE TRIGGER hash_password;');
      console.log('✅ Trigger disabled');
    } catch (e) {
      console.log('⚠️ Could not disable trigger (might not exist), continuing...');
    }
    
    // Check if admin already exists
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    
    if (existing.rows.length > 0) {
      console.log('Admin already exists, deleting and recreating...');
      // Delete and recreate to bypass trigger
      await pool.query('DELETE FROM users WHERE email = $1', [email]);
    }
    
    // Create new admin with explicit UUID
    const adminId = generateUUID();
    const insertResult = await pool.query(
      'INSERT INTO users (id, name, email, password_hash, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, name, role',
      [adminId, name, email, passwordHash, role]
    );
    console.log('✅ Admin created:', insertResult.rows[0]);
    
    // Re-enable trigger
    try {
      await pool.query('ALTER TABLE users ENABLE TRIGGER hash_password;');
      console.log('✅ Trigger re-enabled');
    } catch (e) {
      console.log('⚠️ Could not re-enable trigger');
    }
    
    console.log('\n✅ Admin user setup complete!');
    console.log(`ID: ${adminId}`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.where) console.error('  Where:', error.where);
    process.exit(1);
  }
}

createAdmin();
