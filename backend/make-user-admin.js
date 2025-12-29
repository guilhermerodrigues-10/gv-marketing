const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'gv_marketing',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  ssl: (process.env.DB_HOST?.includes('supabase.com') || process.env.DB_HOST?.includes('supabase.co'))
    ? { rejectUnauthorized: false }
    : false
});

async function makeUserAdmin() {
  try {
    // Pegar email do usuário via argumento ou usar padrão
    const userEmail = process.argv[2];

    if (!userEmail) {
      console.log('❌ Erro: Forneça o email do usuário');
      console.log('Uso: node make-user-admin.js user@example.com');
      process.exit(1);
    }

    console.log(`🔍 Procurando usuário: ${userEmail}...`);

    // Verificar se usuário existe
    const userResult = await pool.query(
      'SELECT id, name, email, role FROM users WHERE email = $1',
      [userEmail]
    );

    if (userResult.rows.length === 0) {
      console.log('❌ Usuário não encontrado!');
      console.log('\n📋 Usuários disponíveis:');
      const allUsers = await pool.query('SELECT email, name, role FROM users ORDER BY created_at');
      allUsers.rows.forEach(u => {
        console.log(`  - ${u.email} (${u.name}) - Role: ${u.role}`);
      });
      await pool.end();
      process.exit(1);
    }

    const user = userResult.rows[0];
    console.log(`\n✅ Usuário encontrado:`);
    console.log(`   Nome: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role atual: ${user.role}`);

    if (user.role === 'Admin') {
      console.log('\n✅ Usuário já é Admin!');
      await pool.end();
      return;
    }

    // Atualizar para Admin
    await pool.query(
      'UPDATE users SET role = $1 WHERE id = $2',
      ['Admin', user.id]
    );

    console.log(`\n🎉 Sucesso! ${user.name} agora é Admin!`);

    await pool.end();
  } catch (error) {
    console.error('❌ Erro:', error.message);
    await pool.end();
    process.exit(1);
  }
}

makeUserAdmin();
