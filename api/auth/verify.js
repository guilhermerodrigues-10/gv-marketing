// Vercel Serverless Function: Verify JWT Token
const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ valid: false, error: 'Token não fornecido' });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    res.status(200).json({
      valid: true,
      user: {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role
      }
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ valid: false, error: 'Token expirado' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ valid: false, error: 'Token inválido' });
    }
    res.status(500).json({ valid: false, error: 'Erro ao verificar token' });
  }
};
