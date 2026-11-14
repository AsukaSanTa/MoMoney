// Vercel serverless function: POST /api/chat  with { messages: [{ role, content }] }
// Add ANTHROPIC_API_KEY in your Vercel project settings. Never put the key in index.html.
const SYSTEM = `You are the assistant inside MoMoney, a website for pregnant women and new moms in the US. The site has: help programs you may qualify for, a marketplace to swap or rent baby gear, nanny ads, the cheapest prices for newborn and pregnancy items by city, and a mom community.
Answer any question helpfully and briefly, in the language the user writes in.
For medical, legal or money questions give general information, say you are not a doctor, lawyer or financial advisor, and suggest asking a professional for personal decisions. If someone describes an emergency, tell them to call 911.
Do not invent prices, deadlines or program rules. If you are unsure, say so and point to the official website.`;

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST' });
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(500).json({ error: 'Missing ANTHROPIC_API_KEY' });

  let msgs = (req.body && req.body.messages) || [];
  msgs = msgs
    .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-12)
    .map(m => ({ role: m.role, content: m.content.slice(0, 2000) }));
  while (msgs.length && msgs[0].role !== 'user') msgs.shift();
  if (!msgs.length) return res.status(400).json({ error: 'No message' });

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || 'claude-haiku-5-5',
        max_tokens: 600,
        system: SYSTEM,
        messages: msgs
      })
    });
    const j = await r.json();
    if (!r.ok) return res.status(502).json({ error: (j.error && j.error.message) || 'Upstream error' });
    const reply = (j.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n');
    return res.status(200).json({ reply });
  } catch (e) {
    return res.status(500).json({ error: 'Request failed' });
  }
};
