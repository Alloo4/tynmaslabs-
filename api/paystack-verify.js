module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    res.status(500).json({ error: 'Paystack is not configured yet. Add PAYSTACK_SECRET_KEY in the Vercel project settings.' });
    return;
  }

  const { reference } = req.query || {};
  if (!reference) {
    res.status(400).json({ error: 'Missing transaction reference.' });
    return;
  }

  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${secretKey}` },
    });
    const data = await response.json();
    if (!response.ok || !data.status) {
      res.status(502).json({ error: data.message || 'Could not verify this transaction.' });
      return;
    }

    res.status(200).json({
      status: data.data.status, // 'success' | 'failed' | 'abandoned' ...
      reference: data.data.reference,
      amount: data.data.amount,
      metadata: data.data.metadata,
      customer_email: data.data.customer && data.data.customer.email,
    });
  } catch (err) {
    res.status(502).json({ error: 'Could not reach Paystack. Please try again.' });
  }
};
