// Vercel serverless function: POST /api/chat  with { messages: [{ role, content }] }
// Free option: set GEMINI_API_KEY (get it free at https://aistudio.google.com/apikey).
// Optional: set ANTHROPIC_API_KEY instead to use Claude. Never put keys in index.html.
const SYSTEM = `You are the assistant inside MoMoney, a website for pregnant women and new moms in the US. The site has: help programs you may qualify for, a marketplace to swap or rent baby gear and find sitters, the cheapest prices for newborn and pregnancy items by city, and a mom community.
Answer any question helpfully and briefly, in the language the user writes in.
For medical, legal or money questions give general information, say you are not a doctor, lawyer or financial advisor, and suggest asking a professional for personal decisions. If someone describes an emergency, tell them to call 911.
Do not invent prices, deadlines or program rules. If you are unsure, say so and point to the official website.`;

const wait = ms => new Promise(r => setTimeout(r, ms));

// Tries several Gemini models, so a busy or missing model does not break the chat.
async function askGemini(key, msgs) {
  const models = [process.env.GEMINI_MODEL, 'gemini-flash-latest', 'gemini-flash-lite-latest', 'gemini-3.8-flash'].filter(Boolean);
  let lastErr = 'Gemini error', lastStatus = 0;
  for (const model of models) {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM }] },
        contents: msgs.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
        generationConfig: { maxOutputTokens: 800 }
      })
    });
    const j = await r.json().catch(() => ({}));
    if (r.ok) {
      const parts = (j.candidates && j.candidates[0] && j.candidates[0].content && j.candidates[0].content.parts) || [];
      return parts.map(p => p.text || '').join('\n') || 'Sorry, I could not answer that. Please try another question.';
    }
    lastStatus = r.status;
    lastErr = (j.error && j.error.message) || 'Gemini error';
    if (r.status === 401 || r.status === 403) break; // bad key, trying other models will not help
    await wait(500); // busy (503), rate limited (429) or model not found (404): try the next model
  }
  if ([429, 500, 503].includes(lastStatus)) throw new Error('The assistant is busy right now. Please try again in a few seconds.');
  throw new Error(lastErr);
}

async function askClaude(key, msgs) {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: process.env.ANTHROPIC_MODEL || 'claude-haiku-5-5', max_tokens: 600, system: SYSTEM, messages: msgs })
  });
  const j = await r.json();
  if (!r.ok) throw new Error((j.error && j.error.message) || 'Claude error');
  return (j.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n');
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST' });
  const gKey = process.env.GEMINI_API_KEY, aKey = process.env.ANTHROPIC_API_KEY;
  if (!gKey && !aKey) return res.status(500).json({ error: 'Missing GEMINI_API_KEY' });

  let msgs = (req.body && req.body.messages) || [];
  msgs = msgs
    .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-12)
    .map(m => ({ role: m.role, content: m.content.slice(0, 2000) }));
  while (msgs.length && msgs[0].role !== 'user') msgs.shift();
  if (!msgs.length) return res.status(400).json({ error: 'No message' });

  try {
    const reply = gKey ? await askGemini(gKey, msgs) : await askClaude(aKey, msgs);
    return res.status(200).json({ reply });
  } catch (e) {
    return res.status(502).json({ error: String(e.message || 'Request failed') });
  }
};
