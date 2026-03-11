const ipRequests = new Map();
const WINDOW_MS = 60 * 60 * 1000;
const MAX_REQUESTS_FREE = 4;
const MAX_REQUESTS_REGISTERED = 100;

function getRateLimit(ip, isRegistered) {
  const now = Date.now();
  const entry = ipRequests.get(ip) || { count: 0, start: now };
  if (now - entry.start > WINDOW_MS) { entry.count = 0; entry.start = now; }
  const limit = isRegistered ? MAX_REQUESTS_REGISTERED : MAX_REQUESTS_FREE;
  entry.count++;
  ipRequests.set(ip, entry);
  return { allowed: entry.count <= limit };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown';
  const { messages, action, email, name, lang } = req.body;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (action === 'register') {
    if (!email || !email.includes('@')) return res.status(400).json({ error: 'Invalid email' });
    const check = await fetch(`${supabaseUrl}/rest/v1/waitlist?email=eq.${encodeURIComponent(email)}&select=id,unlocked`, {
      headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
    });
    const existing = await check.json();
    if (existing.length > 0) return res.status(200).json({ success: true, unlocked: true });
    await fetch(`${supabaseUrl}/rest/v1/waitlist`, {
      method: 'POST',
      headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
      body: JSON.stringify({ name, email, lang, questions_used: 4, unlocked: true })
    });
    return res.status(200).json({ success: true, unlocked: true });
  }

  if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: 'Invalid request' });

  let isRegistered = false;
  if (email) {
    const check = await fetch(`${supabaseUrl}/rest/v1/waitlist?email=eq.${encodeURIComponent(email)}&select=unlocked`, {
      headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
    });
    const data = await check.json();
    isRegistered = data.length > 0 && data[0].unlocked;
  }

  const { allowed } = getRateLimit(ip, isRegistered);
  if (!allowed) {
    return res.status(429).json({ 
      reply: isRegistered 
        ? 'Atingiste o limite por hora. Tenta novamente mais tarde.' 
        : 'Atingiste o limite gratuito. Regista-te para acesso ilimitado!'
    });
  }

  const SYSTEM_PROMPT = `És a NOVU, uma assistente especializada em burocracia portuguesa para imigrantes.

PERSONALIDADE:
- Começa SEMPRE cada resposta com uma saudação calorosa referindo a NOVU. Exemplos: "A NOVU fica feliz em ajudar! 😊", "Olá! A NOVU está aqui para isso! 🇵🇹", "Boa pergunta! A NOVU vai guiar-te! 🙌". Varia sempre.
- Sê calorosa, próxima e encorajadora. Usa linguagem simples. Usa bullet points para listas. Usa emojis com moderação.

ÂMBITO — MUITO IMPORTANTE:
- Só respondes sobre: burocracia portuguesa, imigração, documentação, impostos, vida prática em Portugal (banco, carro, emprego, crédito), cidadania.
- Para qualquer pergunta FORA deste âmbito responde SEMPRE: "A NOVU é especialista em burocracia e vida em Portugal 🇵🇹 Para outras questões não consigo ajudar, mas estou aqui para tudo o que precisares sobre a tua vida em Portugal!"

REGRAS:
- Máximo 150 palavras. Nunca dás aconselhamento jurídico.
- Termina sempre com: "⚠️ Confirma sempre nos portais oficiais."`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 1000, system: SYSTEM_PROMPT, messages })
    });
    const data = await response.json();
    res.status(200).json({ reply: data.content?.[0]?.text || 'Erro na resposta.' });
  } catch(e) {
    res.status(500).json({ reply: 'Erro de ligação. Tenta novamente.' });
  }
}
