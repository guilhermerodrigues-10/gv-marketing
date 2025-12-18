const { pool } = require('./src/config/database');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function checkUser() {
  try {
    // Get email from command line args or use default
    const email = process.argv[2] || process.env.ADMIN_EMAIL || 'admin@gvmarketing.com';
    const password = process.argv[3] || process.env.ADMIN_PASSWORD || '';

    console.log('\n🔍 Checking user:', email);
    console.log('━'.repeat(60));

    // Query user from database
    const result = await pool.query(
      'SELECT id, name, email, password_hash, role, created_at FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      console.log('❌ User NOT found in database');
      console.log('\n📋 Available users:');
      const allUsers = await pool.query('SELECT id, name, email, role FROM users ORDER BY created_at');
      console.table(allUsers.rows);
    } else {
      const user = result.rows[0];
      console.log('✅ User found in database');
      console.log('\n📊 User details:');
      console.log('   ID:', user.id);
      console.log('   Name:', user.name);
      console.log('   Email:', user.email);
      console.log('   Role:', user.role);
      console.log('   Created:', user.created_at);
      console.log('   Has password_hash:', user.password_hash ? 'YES ✅' : 'NO ❌');

      if (user.password_hash) {
        console.log('   Password hash (first 50 chars):', user.password_hash.substring(0, 50) + '...');

        if (password) {
          console.log('\n🔐 Testing password comparison...');
          try {
            const isValid = await bcrypt.compare(password, user.password_hash);
            console.log('   Password matches:', isValid ? 'YES ✅' : 'NO ❌');

            if (!isValid) {
              console.log('\n💡 Trying to hash the provided password to see format:');
              const testHash = await bcrypt.hash(password, 10);
              console.log('   Test hash (first 50 chars):', testHash.substring(0, 50) + '...');
              console.log('   Stored hash starts with:', user.password_hash.substring(0, 7));
              console.log('   Test hash starts with:', testHash.substring(0, 7));
            }
          } catch (compareErr) {
            console.log('   ❌ Error comparing password:', compareErr.message);
          }
        }
      } else {
        console.log('\n⚠️  User has NO password_hash set!');
        console.log('   This user cannot login with password authentication.');
        console.log('   You need to set a password for this user.');
      }
    }

    console.log('\n━'.repeat(60));
    console.log('\n📝 .env Admin credentials:');
    console.log('   ADMIN_EMAIL:', process.env.ADMIN_EMAIL);
    console.log('   ADMIN_PASSWORD:', process.env.ADMIN_PASSWORD ? '(set)' : '(not set)');
    console.log('   JWT_SECRET:', process.env.JWT_SECRET ? '(set)' : '(not set)');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Full error:', error);
  } finally {
    await pool.end();
  }
}

checkUser();
