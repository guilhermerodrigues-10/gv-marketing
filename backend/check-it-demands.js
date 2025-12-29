const { pool } = require('./src/config/database');

async function checkTable() {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'it_demands'
      ORDER BY ordinal_position
    `);

    console.log('✅ IT Demands table exists!');
    console.log('\nColumns:');
    result.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });

    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    await pool.end();
  }
}

checkTable();
