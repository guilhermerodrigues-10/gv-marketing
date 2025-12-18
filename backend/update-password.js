const { pool } = require('./src/config/database');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function updatePassword() {
  try {
    const email = process.argv[2];
    const newPassword = process.argv[3];

    if (!email || !newPassword) {
      console.log('Usage: node update-password.js <email> <new-password>');
      console.log('Example: node update-password.js guilherme@gvmarketing.us "NewPassword123!"');
      process.exit(1);
    }

    console.log('\n🔐 Updating password for:', email);
    console.log('━'.repeat(60));

    // Check if user exists
    const result = await pool.query(
      'SELECT id, name, email, role FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      console.log('❌ User not found:', email);
      process.exit(1);
    }

    const user = result.rows[0];
    console.log('✅ User found:');
    console.log('   Name:', user.name);
    console.log('   Email:', user.email);
    console.log('   Role:', user.role);

    // Hash the new password
    console.log('\n🔄 Hashing new password...');
    const passwordHash = await bcrypt.hash(newPassword, 10);
    console.log('✅ Password hashed successfully');

    // Update the password
    console.log('\n💾 Updating password in database...');
    await pool.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [passwordHash, user.id]
    );

    console.log('✅ Password updated successfully!');

    // Verify the update
    console.log('\n🔍 Verifying password...');
    const verifyResult = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [user.id]
    );

    const isValid = await bcrypt.compare(newPassword, verifyResult.rows[0].password_hash);
    console.log('   Password verification:', isValid ? 'SUCCESS ✅' : 'FAILED ❌');

    console.log('\n━'.repeat(60));
    console.log('✅ Done! You can now login with:');
    console.log('   Email:', email);
    console.log('   Password:', newPassword);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Full error:', error);
  } finally {
    await pool.end();
  }
}

updatePassword();
