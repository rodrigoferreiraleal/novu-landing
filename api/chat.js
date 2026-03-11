export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { messages, action, email, name, lang } = req.body;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (action === 'register') {
    const check = await fetch(`${supabaseUrl}/rest/v1/waitlist?email=eq.${encodeURIComponent(email)}&select=id,unlocked`, {
      headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
    });
    const existing = await check.json();

    if (existing.length > 0) {
      return res.status(200).json({ success: true, unlocked: true });
    }

    await fetch(`${supabaseUrl}/rest/v1/waitlist`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        name,
        email,
        lang,
        questions_used: 4,
        unlocked: true
      })
    });

    return res.status(200).json({ success: true, unlocked: true });
  }

  const SYSTEM_PROMPT = `És a NOVU, uma assistente especializada em burocracia portuguesa para imigrantes.

Responde apenas sobre:
- imigração
- documentos
- impostos
- vida prática em Portugal

Usa linguagem simples e amigável.
Máximo 150 palavras.
Termina sempre com: ⚠️ Confirma sempre nos portais oficiais.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages
    })
  });

  const data = await response.json();

  res.status(200).json({
    reply: data.content?.[0]?.text || 'Erro na resposta.'
  });
}
