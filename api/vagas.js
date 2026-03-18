// api/vagas.js
// GET  /api/vagas?categoria=xxx&cidade=xxx&status=aprovada  → lista vagas
// POST /api/vagas  → cria empresa + vaga (submitted pelo formulário)

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'novu_admin_2026';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // ── GET — listar vagas públicas aprovadas ──────────────────
  if (req.method === 'GET') {
    try {
      const { categoria, cidade, status, admin } = req.query;

      // Admin autenticado vê tudo
      const isAdmin = admin === ADMIN_SECRET;

      let query = supabase
        .from('vagas')
        .select('*, empresas(estrelas, avaliacoes, verificada)')
        .gt('expira_em', new Date().toISOString())
        .order('destaque', { ascending: false })
        .order('created_at', { ascending: false });

      if (!isAdmin) {
        query = query.eq('status', 'aprovada');
      } else if (status) {
        query = query.eq('status', status);
      }

      if (categoria && categoria !== 'todos') {
        query = query.or(`categoria.eq.${categoria},tipo.eq.${categoria}`);
      }

      if (cidade && cidade !== 'todas') {
        query = query.eq('cidade', cidade);
      }

      const { data, error } = await query;
      if (error) throw error;

      return res.status(200).json({ vagas: data || [] });
    } catch (err) {
      console.error('GET /api/vagas error:', err);
      return res.status(500).json({ error: 'Erro ao carregar vagas.' });
    }
  }

  // ── POST — empresa submete nova vaga ──────────────────────
  if (req.method === 'POST') {
    try {
      const {
        empresa_nome, empresa_nif, empresa_cidade, empresa_email,
        empresa_emoji,
        titulo, categoria, tipo, cidade, bairro,
        tipo_rem, valor_rem, descricao
      } = req.body;

      // Validação básica
      if (!empresa_nome || !empresa_nif || !empresa_email || !titulo || !categoria || !valor_rem || !descricao) {
        return res.status(400).json({ error: 'Campos obrigatórios em falta.' });
      }

      // NIF — validação simples (9 dígitos)
      const nifLimpo = empresa_nif.replace(/\D/g, '');
      if (nifLimpo.length !== 9) {
        return res.status(400).json({ error: 'NIF inválido. Deve ter 9 dígitos.' });
      }

      // 1. Criar ou encontrar empresa pelo NIF
      let empresa;
      const { data: empExistente } = await supabase
        .from('empresas')
        .select('*')
        .eq('nif', nifLimpo)
        .single();

      if (empExistente) {
        empresa = empExistente;
      } else {
        const { data: novaEmpresa, error: empError } = await supabase
          .from('empresas')
          .insert({
            nome: empresa_nome,
            nif: nifLimpo,
            cidade: empresa_cidade || cidade,
            email: empresa_email,
            verificada: false
          })
          .select()
          .single();

        if (empError) throw empError;
        empresa = novaEmpresa;
      }

      // 2. Criar vaga com status 'pendente' — aparece no admin, não público
      // NOTA: muda para 'aprovada' se quiseres publicação imediata sem revisão
      const { data: vaga, error: vagaError } = await supabase
        .from('vagas')
        .insert({
          empresa_id:    empresa.id,
          empresa_nome:  empresa.nome,
          empresa_emoji: empresa_emoji || '🏢',
          titulo,
          categoria,
          tipo:          tipo || categoria,
          cidade:        cidade || empresa_cidade,
          bairro:        bairro || '',
          tipo_rem,
          valor_rem,
          descricao,
          status:        'aprovada'   // ← muda para 'pendente' quando quiseres revisão manual
        })
        .select()
        .single();

      if (vagaError) throw vagaError;

      return res.status(201).json({
        success: true,
        vaga_id: vaga.id,
        message: 'Vaga publicada com sucesso.'
      });

    } catch (err) {
      console.error('POST /api/vagas error:', err);
      return res.status(500).json({ error: 'Erro ao publicar vaga. Tenta novamente.' });
    }
  }

  // ── PATCH — admin aprova/remove vaga ──────────────────────
  if (req.method === 'PATCH') {
    try {
      const { id, status, admin } = req.body;

      if (admin !== ADMIN_SECRET) {
        return res.status(403).json({ error: 'Não autorizado.' });
      }

      if (!['aprovada', 'pendente', 'removida'].includes(status)) {
        return res.status(400).json({ error: 'Status inválido.' });
      }

      const { error } = await supabase
        .from('vagas')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('PATCH /api/vagas error:', err);
      return res.status(500).json({ error: 'Erro ao actualizar vaga.' });
    }
  }

  // ── DELETE — admin remove vaga permanentemente ────────────
  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      const admin = req.headers['authorization'];

      if (admin !== ADMIN_SECRET) {
        return res.status(403).json({ error: 'Não autorizado.' });
      }

      const { error } = await supabase
        .from('vagas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('DELETE /api/vagas error:', err);
      return res.status(500).json({ error: 'Erro ao remover vaga.' });
    }
  }

  return res.status(405).json({ error: 'Método não permitido.' });
};
