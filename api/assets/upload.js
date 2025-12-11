// Vercel Serverless Function: Upload Asset to Dropbox
const { Dropbox } = require('dropbox');

// Converter URL do Dropbox para URL de download direto
function convertToDirectUrl(dropboxUrl) {
  if (dropboxUrl.includes('dropbox.com')) {
    return dropboxUrl
      .replace('www.dropbox.com', 'dl.dropboxusercontent.com')
      .replace('?dl=0', '')
      .replace('&dl=0', '');
  }
  return dropboxUrl;
}

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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verificar se Dropbox está configurado
    if (!process.env.DROPBOX_ACCESS_TOKEN) {
      return res.status(503).json({ error: 'Dropbox não está configurado no servidor' });
    }

    const dropboxClient = new Dropbox({ accessToken: process.env.DROPBOX_ACCESS_TOKEN });

    const { fileName, fileContent, projectId } = req.body;

    if (!fileName || !fileContent) {
      return res.status(400).json({ error: 'fileName e fileContent são obrigatórios' });
    }

    console.log('📤 Uploading file:', fileName);

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

    res.status(200).json({
      success: true,
      url: shareUrl,
      path: uploadResult.result.path_display
    });
  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({
      error: 'Erro ao fazer upload',
      details: error.message
    });
  }
};
