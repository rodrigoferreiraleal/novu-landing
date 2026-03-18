// api/stats.js
// GET /api/stats → devolve contagens públicas (utilizadores, vagas, documentos)

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=300'); // cache 5 min

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método não permitido.' });

  try {
    // Contar utilizadores registados
    const { count: users } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true });

    // Contar vagas aprovadas activas
    const { count: vagas } = await supabase
      .from('vagas')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'aprovada')
      .gt('expira_em', new Date().toISOString());

    // Contar candidaturas
    const { count: candidaturas } = await supabase
      .from('candidaturas')
      .select('*', { count: 'exact', head: true });

    return res.status(200).json({
      users:        users        || 0,
      vagas:        vagas        || 0,
      candidaturas: candidaturas || 0,
    });

  } catch (err) {
    console.error('GET /api/stats error:', err);
    // Em caso de erro devolver valores seguros — não quebrar o site
    return res.status(200).json({ users: 0, vagas: 0, candidaturas: 0 });
  }
};
