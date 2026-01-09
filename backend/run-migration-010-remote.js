require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔗 Connecting to Supabase database...');
    await client.connect();
    console.log('✅ Connected successfully');

    const migrationPath = path.join(__dirname, 'src', 'migrations', '010_add_project_id_to_it_demands.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('\n📝 Running migration 010: Add project_id to IT demands...\n');
    console.log(sql);
    console.log('\n🔄 Executing...');

    await client.query(sql);

    console.log('✅ Migration 010 completed successfully!');
    console.log('\n📊 New column "project_id" has been added to IT demands');
    console.log('   IT demands can now be linked to projects');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n👋 Database connection closed');
  }
}

runMigration();
