// api/send.js
const twilio = require("twilio");

module.exports = async (req, res) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const client = twilio(accountSid, authToken);

  try {
    let phone, message, from;

    // URL format: ?+639123456789.Hello%20Crush.ConfessPH
    const query = Object.keys(req.query)[0];
    if (query) {
      const parts = decodeURIComponent(query).split(".");
      phone = parts[0];
      message = parts[1];
      from = parts[2];
    }

    if (!phone || !message)
      return res.status(400).json({
        error:
          "Usage: /api/send?<phone>.<message>.<from> — example: /api/send?+639123456789.Hello%20Crush.ConfessPH",
      });

    if (!from) from = "ConfessPH"; // default sender name

    const msg = await client.messages.create({
      body: message,
      to: phone,
      from: from,
    });

    return res.status(200).json({
      ok: true,
      sid: msg.sid,
      from,
      to: phone,
      message,
    });
  } catch (err) {
    console.error("SMS send error:", err.message);
    return res.status(500).json({ error: err.message });
  }
};
