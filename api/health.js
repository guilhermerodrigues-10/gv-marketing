// Vercel Serverless Function: Health Check
module.exports = async (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'GV Marketing API',
    version: '1.0.0'
  });
};
