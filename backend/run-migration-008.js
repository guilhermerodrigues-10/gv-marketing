const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'gv_marketing',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  // SSL somente para Supabase
  ssl: (process.env.DB_HOST?.includes('supabase.com') || process.env.DB_HOST?.includes('supabase.co'))
    ? { rejectUnauthorized: false }
    : false
});

async function runMigration() {
  const client = await pool.connect();

  try {
    console.log('🔄 Running migration: 008_update_it_demands_schema.sql...');

    const migrationPath = path.join(__dirname, 'src', 'migrations', '008_update_it_demands_schema.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    await client.query(migrationSQL);

    console.log('✅ Migration completed successfully!');
    console.log('📋 IT Demands table updated with: priority, due_date, assignees');
  } catch (error) {
    console.error('❌ Migration error:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
