const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// POST /api/simple-auth/login
// Autentica com credenciais fixas do .env (sem banco de dados)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Login attempt:', email);

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    // Validar credenciais com .env
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.error('❌ ADMIN_EMAIL ou ADMIN_PASSWORD não configurados no .env');
      return res.status(500).json({ error: 'Servidor não configurado corretamente' });
    }

    // Comparar credenciais
    if (email !== adminEmail || password !== adminPassword) {
      console.log('❌ Credenciais inválidas');
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Gerar JWT
    const token = jwt.sign(
      {
        email: adminEmail,
        role: 'Admin',
        userId: 'admin-001'
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    console.log('✅ Login successful for:', email);

    // Retornar token e dados do usuário
    res.json({
      success: true,
      token,
      user: {
        id: 'admin-001',
        name: 'Admin GV Marketing',
        email: adminEmail,
        role: 'Admin',
        avatarUrl: 'https://ui-avatars.com/api/?name=Admin+GV&background=7c3aed&color=fff'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

// GET /api/simple-auth/verify
// Verifica se o token JWT é válido
router.get('/verify', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido', valid: false });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    res.json({
      valid: true,
      user: {
        id: decoded.userId || 'admin-001',
        email: decoded.email,
        role: decoded.role
      }
    });
  } catch (error) {
    console.error('Token verification error:', error.message);
    res.status(401).json({ error: 'Token inválido ou expirado', valid: false });
  }
});

// POST /api/simple-auth/refresh
// Renova o token JWT
router.post('/refresh', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    // Verificar token atual
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Gerar novo token
    const newToken = jwt.sign(
      {
        email: decoded.email,
        role: decoded.role,
        userId: decoded.userId
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      token: newToken
    });
  } catch (error) {
    console.error('Token refresh error:', error.message);
    res.status(401).json({ error: 'Token inválido ou expirado' });
  }
});

module.exports = router;
