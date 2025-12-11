const express = require('express');
const { Dropbox } = require('dropbox');
const router = express.Router();

// Criar cliente Dropbox
const dropboxClient = process.env.DROPBOX_ACCESS_TOKEN
  ? new Dropbox({ accessToken: process.env.DROPBOX_ACCESS_TOKEN })
  : null;

// Middleware para verificar se Dropbox está configurado
const requireDropbox = (req, res, next) => {
  if (!dropboxClient) {
    return res.status(503).json({ error: 'Dropbox não está configurado no servidor' });
  }
  next();
};

// Converter URL do Dropbox para URL de download direto
function convertToDirectUrl(dropboxUrl) {
  // Converter URLs do tipo:
  // https://www.dropbox.com/scl/fi/xxx/file.png?rlkey=xxx&dl=0
  // Para:
  // https://dl.dropboxusercontent.com/scl/fi/xxx/file.png?rlkey=xxx

  if (dropboxUrl.includes('dropbox.com')) {
    return dropboxUrl
      .replace('www.dropbox.com', 'dl.dropboxusercontent.com')
      .replace('?dl=0', '')
      .replace('&dl=0', '');
  }

  return dropboxUrl;
}

// POST /api/assets/upload
router.post('/upload', requireDropbox, async (req, res) => {
  try {
    const { fileName, fileContent, projectId } = req.body;

    if (!fileName || !fileContent) {
      return res.status(400).json({ error: 'fileName e fileContent são obrigatórios' });
    }

    console.log('📤 Backend: Uploading file:', fileName);

    // Converter base64 para buffer
    const buffer = Buffer.from(fileContent, 'base64');

    // Definir path
    const folder = projectId || 'geral';
    const timestamp = Date.now();
    const path = `/GV-Marketing-Assets/${folder}/${timestamp}-${fileName}`;

    console.log('📁 Upload path:', path);

    // Upload para Dropbox
    const uploadResult = await dropboxClient.filesUpload({
      path,
      contents: buffer,
      mode: 'add',
      autorename: true,
      mute: false
    });

    console.log('✅ Upload successful:', uploadResult.result.path_display);

    // Criar link compartilhado
    let shareUrl;
    try {
      const shareResult = await dropboxClient.sharingCreateSharedLinkWithSettings({
        path: uploadResult.result.path_display,
        settings: {
          requested_visibility: 'public'
        }
      });
      // Converter para URL de download direto
      shareUrl = convertToDirectUrl(shareResult.result.url);
    } catch (shareError) {
      // Se já existe um link, pegar o existente
      if (shareError.error?.error?.['.tag'] === 'shared_link_already_exists') {
        const links = await dropboxClient.sharingListSharedLinks({
          path: uploadResult.result.path_display
        });
        shareUrl = convertToDirectUrl(links.result.links[0].url);
      } else {
        throw shareError;
      }
    }

    console.log('🔗 Share URL:', shareUrl);

    res.json({
      success: true,
      url: shareUrl,
      path: uploadResult.result.path_display
    });
  } catch (error) {
    console.error('❌ Backend upload error:', error);
    res.status(500).json({
      error: 'Erro ao fazer upload',
      details: error.message
    });
  }
});

// DELETE /api/assets/delete
router.delete('/delete', requireDropbox, async (req, res) => {
  try {
    const { path } = req.body;

    if (!path) {
      return res.status(400).json({ error: 'path é obrigatório' });
    }

    console.log('🗑️ Backend: Deleting file:', path);

    await dropboxClient.filesDeleteV2({ path });

    console.log('✅ Delete successful');

    res.json({ success: true });
  } catch (error) {
    console.error('❌ Backend delete error:', error);
    res.status(500).json({
      error: 'Erro ao deletar arquivo',
      details: error.message
    });
  }
});

// GET /api/assets/status - Verificar status do Dropbox
router.get('/status', (req, res) => {
  res.json({
    configured: !!dropboxClient,
    message: dropboxClient ? 'Dropbox conectado' : 'Dropbox não configurado'
  });
});

module.exports = router;
