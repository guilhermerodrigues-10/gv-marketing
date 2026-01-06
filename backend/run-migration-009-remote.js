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

    const migrationPath = path.join(__dirname, 'src', 'migrations', '009_add_bloqueado_status.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('\n📝 Running migration 009: Add bloqueado status...\n');
    console.log(sql);
    console.log('\n🔄 Executing...');

    await client.query(sql);

    console.log('✅ Migration 009 completed successfully!');
    console.log('\n📊 New status "bloqueado" has been added to IT demands');
    console.log('   Available statuses: backlog, em-analise, bloqueado, em-desenvolvimento, em-teste, concluido');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n👋 Database connection closed');
  }
}

runMigration();
