const { handleUpload } = require('@vercel/blob/client');
const { rateLimit } = require('./_rate-limit');

const VALID_EXT = ['stl', 'obj', '3mf', 'step', 'stp'];

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  if (!rateLimit(req, res, { windowMs: 60000, max: 10 })) return;

  try {
    const jsonResponse = await handleUpload({
      body: req.body,
      request: req,
      onBeforeGenerateToken: async (pathname) => {
        const ext = (pathname.split('.').pop() || '').toLowerCase();
        if (!VALID_EXT.includes(ext)) {
          throw new Error('Unsupported file type — only STL, OBJ, 3MF and STEP files are accepted.');
        }
        return {
          addRandomSuffix: true,
          maximumSizeInBytes: 256 * 1024 * 1024, // matches the 256 MB limit shown on the quote form
        };
      },
      onUploadCompleted: async () => {},
    });

    res.status(200).json(jsonResponse);
  } catch (err) {
    res.status(400).json({ error: err.message || 'Upload could not be authorized.' });
  }
};
