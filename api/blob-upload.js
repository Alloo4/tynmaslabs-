const { handleUpload } = require('@vercel/blob/client');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const jsonResponse = await handleUpload({
      body: req.body,
      request: req,
      onBeforeGenerateToken: async () => ({
        addRandomSuffix: true,
        maximumSizeInBytes: 256 * 1024 * 1024, // matches the 256 MB limit shown on the quote form
      }),
      onUploadCompleted: async () => {},
    });

    res.status(200).json(jsonResponse);
  } catch (err) {
    res.status(400).json({ error: err.message || 'Upload could not be authorized.' });
  }
};
