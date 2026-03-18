// api/candidaturas.js
// POST /api/candidaturas → guarda candidatura no Supabase + envia email via Formspree

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // ── GET — admin lista candidaturas ──
  if (req.method === 'GET') {
    const { admin } = req.query;
    const ADMIN_SECRET = process.env.ADMIN_SECRET || 'novu_admin_2026';
    if (admin !== ADMIN_SECRET) return res.status(403).json({ error: 'Não autorizado.' });
    const { data, error } = await supabase
      .from('candidaturas')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ candidaturas: data || [] });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  try {
    const { vaga_id, vaga_titulo, empresa_nome, nome, telefone, email, mensagem } = req.body;

    // Validação
    if (!vaga_id || !nome || !telefone || !email) {
      return res.status(400).json({ error: 'Campos obrigatórios em falta.' });
    }

    // Verificar se a vaga existe e está aprovada
    const { data: vaga, error: vagaError } = await supabase
      .from('vagas')
      .select('id, titulo, empresa_nome, status')
      .eq('id', vaga_id)
      .eq('status', 'aprovada')
      .single();

    if (vagaError || !vaga) {
      return res.status(404).json({ error: 'Vaga não encontrada ou não disponível.' });
    }

    // Guardar candidatura no Supabase
    const { error: candError } = await supabase
      .from('candidaturas')
      .insert({
        vaga_id,
        nome,
        telefone,
        email,
        mensagem: mensagem || ''
      });

    if (candError) throw candError;

    // Enviar email via Formspree (notificação para geral@novuai.pt)
    // O CV (se existir) é enviado directamente do frontend via Formspree
    // Este endpoint guarda os dados estruturados no Supabase
    try {
      const fd = new URLSearchParams();
      fd.append('_subject', `NOVU Empregos — Candidatura: ${vaga.titulo}`);
      fd.append('vaga', vaga.titulo);
      fd.append('empresa', vaga.empresa_nome);
      fd.append('nome', nome);
      fd.append('telefone', telefone);
      fd.append('email', email);
      fd.append('mensagem', mensagem || '(sem mensagem)');
      fd.append('fonte', 'novuai.pt/empregos (API)');

      await fetch('https://formspree.io/f/xdawgkvq', {
        method: 'POST',
        body: fd,
        headers: { 'Accept': 'application/json' }
      });
    } catch (emailErr) {
      // Email falhou mas candidatura foi guardada — não é erro crítico
      console.warn('Email Formspree falhou:', emailErr.message);
    }

    return res.status(201).json({
      success: true,
      message: 'Candidatura enviada com sucesso.'
    });

  } catch (err) {
    console.error('POST /api/candidaturas error:', err);
    return res.status(500).json({ error: 'Erro ao enviar candidatura. Tenta novamente.' });
  }
};
