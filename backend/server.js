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
      console.log('📍 Connection timeout: 10s');
      const result = await pool.query('SELECT NOW()');
      console.log('✅ Database connected successfully at:', result.rows[0].now);
    } catch (dbError) {
      console.log('❌ Database connection error:');
      console.log('   Error name:', dbError.name);
      console.log('   Error message:', dbError.message);
      console.log('   Error code:', dbError.code);
      console.log('⚠️ Server will start anyway (database connection is optional)');
      console.log('ℹ️  Some features may not work without database');
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 API: http://0.0.0.0:${PORT}/api`);
      console.log(`📁 Assets API: http://0.0.0.0:${PORT}/api/assets`);
      console.log(`✅ Server is healthy and ready to accept connections`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('⚠️ SIGTERM received. Shutting down gracefully...');
  console.log('📍 Timestamp:', new Date().toISOString());
  console.log('🔍 This may be caused by:');
  console.log('   - Docker/Portainer restarting the container');
  console.log('   - Watchtower updating to a new image');
  console.log('   - Healthcheck failure');
  try {
    await pool.end();
    console.log('✅ Database connections closed');
  } catch (error) {
    console.error('❌ Error closing database:', error);
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('⚠️ SIGINT received (Ctrl+C). Shutting down gracefully...');
  try {
    await pool.end();
    console.log('✅ Database connections closed');
  } catch (error) {
    console.error('❌ Error closing database:', error);
  }
  process.exit(0);
});

startServer();
