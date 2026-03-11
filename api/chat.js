export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { messages } = req.body;

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
      system: `És a NOVU, uma assistente especializada em burocracia portuguesa para imigrantes. Responde sempre em Português de Portugal. Sê calorosa, clara e concisa. Nunca dás aconselhamento jurídico — dás informação e orientação. Máximo 150 palavras por resposta.`,
      messages
    })
  });

  const data = await response.json();
  res.status(200).json({ reply: data.content?.[0]?.text || 'Erro na resposta.' });
}
