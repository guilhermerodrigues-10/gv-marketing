const bcrypt = require('bcrypt');
const { Pool } = require('pg');

// Configuração do banco de dados
const pool = new Pool({
  host: 'aws-0-us-west-2.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.hywyqckkahlxevvtzkfw',
  password: '1N6sup0mk3x5R0ym',
  ssl: { rejectUnauthorized: false }
});

async function resetPassword() {
  const email = 'guilherme@gvmarketing.us';
  const newPassword = 'Admin123!';

  try {
    console.log('🔐 Resetando senha do usuário...');
    console.log('📧 Email:', email);

    // Hash da nova senha
    const passwordHash = await bcrypt.hash(newPassword, 10);
    console.log('🔒 Hash gerado');

    // Atualizar senha no banco
    const result = await pool.query(
      'UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING id, name, email',
      [passwordHash, email]
    );

    if (result.rows.length === 0) {
      console.log('❌ Usuário não encontrado. Criando novo usuário...');

      // Criar novo usuário
      const createResult = await pool.query(
        `INSERT INTO users (name, email, password_hash, role, avatar_url)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, name, email, role`,
        ['Guilherme', email, passwordHash, 'Admin', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guilherme']
      );

      console.log('✅ Usuário criado com sucesso!');
      console.log('👤 Dados:', createResult.rows[0]);
    } else {
      console.log('✅ Senha atualizada com sucesso!');
      console.log('👤 Usuário:', result.rows[0]);
    }

    console.log('\n🎉 Credenciais:');
    console.log('📧 Email:', email);
    console.log('🔑 Senha:', newPassword);
    console.log('\n✅ Agora você pode fazer login no sistema!');

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
  }
}

resetPassword();
