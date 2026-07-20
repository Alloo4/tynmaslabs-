const PRODUCTS = require('../assets/data/products.json');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    res.status(500).json({ error: 'Paystack is not configured yet. Add PAYSTACK_SECRET_KEY in the Vercel project settings.' });
    return;
  }

  const { items, customer } = req.body || {};

  if (!Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: 'Your cart is empty.' });
    return;
  }
  if (!customer || !customer.email || !customer.name) {
    res.status(400).json({ error: 'Name and email are required.' });
    return;
  }

  // Recompute the total server-side from the product catalog — never trust a client-supplied amount.
  let amountKES = 0;
  const lineItems = [];
  for (const item of items) {
    const product = PRODUCTS.find((p) => p.id === item.id);
    const qty = Math.max(1, Math.min(99, Number(item.qty) || 1));
    if (!product) {
      res.status(400).json({ error: `Unknown product: ${item.id}` });
      return;
    }
    amountKES += product.price * qty;
    lineItems.push({ id: product.id, name: product.name, qty, unitPrice: product.price, color: item.color, mat: item.mat });
  }

  const proto = req.headers['x-forwarded-proto'] || 'https';
  const origin = `${proto}://${req.headers.host}`;

  try {
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: customer.email,
        amount: Math.round(amountKES * 100), // KES lowest unit (cents)
        currency: 'KES',
        callback_url: `${origin}/shop.html`,
        metadata: {
          customer_name: customer.name,
          customer_phone: customer.phone || '',
          delivery: customer.delivery || '',
          address: customer.address || '',
          items: lineItems,
        },
      }),
    });

    const data = await response.json();
    if (!response.ok || !data.status) {
      res.status(502).json({ error: data.message || 'Paystack could not start this transaction.' });
      return;
    }

    res.status(200).json({
      authorization_url: data.data.authorization_url,
      reference: data.data.reference,
    });
  } catch (err) {
    res.status(502).json({ error: 'Could not reach Paystack. Please try again.' });
  }
};
