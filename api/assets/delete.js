// Vercel Serverless Function: Delete Asset from Dropbox
const { Dropbox } = require('dropbox');

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

  if (req.method !== 'DELETE' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verificar se Dropbox está configurado
    if (!process.env.DROPBOX_ACCESS_TOKEN) {
      return res.status(503).json({ error: 'Dropbox não está configurado no servidor' });
    }

    const dropboxClient = new Dropbox({ accessToken: process.env.DROPBOX_ACCESS_TOKEN });

    const { path } = req.body;

    if (!path) {
      return res.status(400).json({ error: 'path é obrigatório' });
    }

    console.log('🗑️ Deleting file:', path);

    // Deletar do Dropbox
    await dropboxClient.filesDeleteV2({ path });

    console.log('✅ Delete successful');

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('❌ Delete error:', error);
    res.status(500).json({
      error: 'Erro ao deletar arquivo',
      details: error.message
    });
  }
};
