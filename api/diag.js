module.exports = async (req, res) => {
  res.status(200).json({
    hasOidcToken: !!process.env.VERCEL_OIDC_TOKEN,
    hasBlobStoreId: !!process.env.BLOB_STORE_ID,
    hasBlobRwToken: !!process.env.BLOB_READ_WRITE_TOKEN,
    hasBlobWebhookKey: !!process.env.BLOB_WEBHOOK_PUBLIC_KEY,
    vercelEnv: process.env.VERCEL_ENV || null,
  });
};
