// Paystack webhook — server-side confirmation that a payment actually succeeded.
//
// Why this exists: the client-side flow (shop.js's checkPaystackReturn) only runs if the
// customer's browser makes it back to /shop after paying. For M-Pesa that's a real gap —
// the STK push is approved on the phone well after checkout closes, and the tab can be
// closed, lose network, or fail to redirect in between. This endpoint is the reliable path:
// Paystack calls it server-to-server the moment a charge succeeds, independent of the
// customer's browser. It is the single source of truth for the order notification email
// (and, once configured, the WhatsApp ping) — the client no longer sends that email itself,
// to avoid notifying twice for the same sale.
//
// Set this as the "Webhook URL" in Paystack Dashboard → Settings → API Keys & Webhooks:
//   https://www.tynmaslabs.com/api/paystack-webhook

const crypto = require('crypto');

// Disable Vercel's automatic JSON body parsing — HMAC verification needs the exact raw
// bytes Paystack sent, not a re-serialized copy of the parsed object.
module.exports.config = { api: { bodyParser: false } };

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => { data += chunk; });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

// Same public, domain-locked, rate-limited key used client-side in assets/js/config.js —
// Web3Forms keys are meant to be public, so this isn't a secret worth env-varing.
const WEB3FORMS_KEY = '5169407e-3faf-48f3-a56e-76927224571d';

async function notifyEmail(payload) {
  try {
    await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_key: WEB3FORMS_KEY,
        subject: 'New Tynmas Labs order — ' + payload.reference,
        email: payload.customer_email,
        reference: payload.reference,
        amount_kes: payload.amount / 100,
        order_details: JSON.stringify(payload.metadata, null, 2),
      }),
    });
  } catch (e) { /* best-effort — a failed notification must not fail the webhook */ }
}

async function notifyWhatsApp(payload) {
  const phone = process.env.CALLMEBOT_PHONE;
  const apikey = process.env.CALLMEBOT_APIKEY;
  if (!phone || !apikey) return; // not configured yet — silently skip
  try {
    const items = (payload.metadata.items || [])
      .map((it) => `${it.name} x${it.qty}`)
      .join(', ');
    const text = `New order! ${items} — KES ${(payload.amount / 100).toLocaleString('en-US')} from ${payload.metadata.customer_name}. Ref: ${payload.reference}`;
    const url = 'https://api.callmebot.com/whatsapp.php?phone=' + encodeURIComponent(phone)
      + '&text=' + encodeURIComponent(text) + '&apikey=' + encodeURIComponent(apikey);
    await fetch(url);
  } catch (e) { /* best-effort — a failed notification must not fail the webhook */ }
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    // Still 200 — Paystack retries on non-2xx, and retrying won't fix a missing env var.
    res.status(200).json({ received: true, warning: 'PAYSTACK_SECRET_KEY not configured' });
    return;
  }

  const rawBody = await readRawBody(req);

  // Verify this call genuinely came from Paystack before trusting anything in it.
  const signature = req.headers['x-paystack-signature'];
  const expected = crypto.createHmac('sha512', secretKey).update(rawBody).digest('hex');
  if (!signature || signature !== expected) {
    res.status(401).json({ error: 'Invalid signature' });
    return;
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch (e) {
    res.status(400).json({ error: 'Invalid JSON' });
    return;
  }

  // Serverless functions can be frozen the instant a response is sent, so the notification
  // work has to finish *before* we respond — not fired-and-forgotten after res.json().
  if (event.event === 'charge.success') {
    const data = event.data || {};
    const payload = {
      reference: data.reference,
      amount: data.amount,
      customer_email: data.customer && data.customer.email,
      metadata: data.metadata || {},
    };
    await Promise.all([notifyEmail(payload), notifyWhatsApp(payload)]);
  }

  res.status(200).json({ received: true });
};
