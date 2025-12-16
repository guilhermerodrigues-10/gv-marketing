const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
require('dotenv').config();

const authRoutes = require('./src/routes/auth.routes');
const simpleAuthRoutes = require('./src/routes/simple-auth.routes');
const assetsRoutes = require('./src/routes/assets.routes');
const apiRoutes = require('./src/routes/index');
const { pool } = require('./src/config/database');
const { requireAuth } = require('./src/middleware/auth.middleware');

const app = express();
const PORT = process.env.PORT || 3001;

// Security headers with Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.dropboxapi.com", "https://content.dropboxapi.com"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

// CORS Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Muitas requisições, tente novamente mais tarde'
});

app.use('/api/', limiter);

// Routes
app.use('/api/auth', authRoutes); // Auth com PostgreSQL (pode não funcionar sem DB)
app.use('/api/simple-auth', simpleAuthRoutes); // Auth simples com .env (SEMPRE funciona!)
app.use('/api/assets', assetsRoutes); // Upload de assets (sem autenticação - verificação no frontend)
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection (optional - não falha se não tiver PostgreSQL)
    try {
      console.log('🔄 Tentando conectar ao banco de dados...');
      await pool.query('SELECT NOW()');
      console.log('✅ Database connected successfully');
    } catch (dbError) {
      console.log('❌ Database connection error:');
      console.log('   Error name:', dbError.name);
      console.log('   Error message:', dbError.message);
      console.log('   Error code:', dbError.code);
      console.log('⚠️ Database not available (PostgreSQL not installed or not configured)');
      console.log('ℹ️  Assets upload via Dropbox will still work!');
      console.log('ℹ️  To use full backend features, install PostgreSQL and configure backend/.env');
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 API: http://localhost:${PORT}/api`);
      console.log(`📁 Assets API: http://localhost:${PORT}/api/assets`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Closing server...');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Closing server...');
  await pool.end();
  process.exit(0);
});

startServer();
