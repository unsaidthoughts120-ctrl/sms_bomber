// api/send.js
const twilio = require('twilio');

module.exports = async (req, res) => {
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.setHeader('Allow', ['POST', 'GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get your Twilio credentials from environment variables
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const client = twilio(accountSid, authToken);

  try {
    let to, message, from;

    // ✅ Support both POST and GET
    if (req.method === 'POST') {
      ({ to, message, from } = req.body || {});
    } else if (req.method === 'GET') {
      // Example: /api/send?to=%2B639123456789&message=Hello&from=ConfessPH
      to = req.query.to;
      message = req.query.message;
      from = req.query.from;
    }

    if (!to || !message)
      return res.status(400).json({ error: "'to' and 'message' are required." });

    // If no 'from' provided, use a default alphanumeric name
    if (!from) from = 'ConfessPH'; // your page or app name

    // Create SMS
    const msg = await client.messages.create({
      body: message,
      to: to,
      from: from, // 👈 alphanumeric sender name (no number needed)
    });

    return res.status(200).json({
      ok: true,
      sid: msg.sid,
      from,
      to,
      message,
    });
  } catch (err) {
    console.error('SMS send error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};
