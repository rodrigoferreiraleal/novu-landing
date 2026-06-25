// api/sync-vagas.js
// ───────────────────────────────────────────────────────────────────────────
// Agregador de vagas REAIS (Jooble) → tabela `vagas` da NOVU.
//
// Princípios honestos:
//  • As vagas agregadas têm fonte='jooble' e um link_externo: a candidatura
//    vai para a FONTE original (não se recolhe CV na NOVU para vagas que a
//    NOVU não controla).
//  • Guarda-se só um resumo (snippet) + link, nunca o texto integral.
//  • Cada vaga tem validade (expira_em); as antigas são removidas no próximo sync.
//  • As vagas internas (publicadas por empregadores no "+ Publicar Vaga")
//    têm fonte='interna' e NUNCA são tocadas por esta função.
//
// Formato CommonJS (convenção NOVU). Corre via Vercel Cron (diário) ou
// manualmente em /api/sync-vagas?secret=CRON_SECRET.
// ───────────────────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;
const JOOBLE_KEY   = process.env.JOOBLE_API_KEY;
const CRON_SECRET  = process.env.CRON_SECRET;

// Pesquisas-alvo: setores onde os imigrantes em Portugal mais procuram trabalho.
const BUSCAS = [
  { categoria: "Restauração", keywords: "restauração ajudante de cozinha", location: "Portugal" },
  { categoria: "Limpeza",     keywords: "limpeza empregada de limpeza",     location: "Portugal" },
  { categoria: "Construção",  keywords: "construção civil servente pedreiro", location: "Portugal" },
  { categoria: "Logística",   keywords: "armazém operador logística estafeta", location: "Portugal" },
  { categoria: "Hotelaria",   keywords: "hotelaria rececionista camareira",  location: "Portugal" },
  { categoria: "Cuidados",    keywords: "cuidador auxiliar lar idosos",      location: "Portugal" },
  { categoria: "Agricultura", keywords: "agricultura apanha colheita campo", location: "Portugal" },
];

const POR_BUSCA = 8;       // resultados por pesquisa
const VALIDADE_DIAS = 10;  // quanto tempo uma vaga agregada fica ativa sem ser revista

function autorizado(req) {
  if (!CRON_SECRET) return false;
  const auth = req.headers["authorization"] || "";
  const q = (req.query && req.query.secret) || "";
  return auth === `Bearer ${CRON_SECRET}` || q === CRON_SECRET;
}

async function buscarJooble(keywords, location) {
  const r = await fetch(`https://jooble.org/api/${JOOBLE_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ keywords, location, page: "1", ResultOnPage: POR_BUSCA }),
  });
  if (!r.ok) throw new Error(`Jooble HTTP ${r.status}`);
  const data = await r.json();
  return Array.isArray(data.jobs) ? data.jobs : [];
}

function limpar(txt, max) {
  if (!txt) return "";
  const t = String(txt).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return max && t.length > max ? t.slice(0, max - 1) + "…" : t;
}

function mapear(job, categoria) {
  const id = job.id != null ? String(job.id) : (job.link || "").slice(-40);
  return {
    titulo: limpar(job.title, 120) || "Vaga",
    empresa_nome: limpar(job.company, 80) || "Empresa",
    categoria,
    cidade: limpar(job.location, 80) || "Portugal",
    tipo: limpar(job.type, 40) || "",
    tipo_rem: job.salary ? "indicado" : "",
    valor_rem: limpar(job.salary, 60) || "A combinar",
    descricao: limpar(job.snippet, 600),
    link_externo: job.link || "",
    fonte: "jooble",
    external_id: "jooble-" + id,
    empresa_emoji: "🌐",
    status: "aprovada",
    destaque: false,
    expira_em: new Date(Date.now() + VALIDADE_DIAS * 86400000).toISOString(),
  };
}

async function upsert(rows) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/vagas?on_conflict=external_id`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify(rows),
  });
  if (!r.ok) throw new Error(`Supabase upsert HTTP ${r.status}: ${await r.text()}`);
}

async function limparExpiradas() {
  // Remove apenas vagas AGREGADAS já expiradas. As internas nunca são tocadas.
  const nowIso = new Date().toISOString();
  await fetch(
    `${SUPABASE_URL}/rest/v1/vagas?fonte=eq.jooble&expira_em=lt.${encodeURIComponent(nowIso)}`,
    {
      method: "DELETE",
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, Prefer: "return=minimal" },
    }
  );
}

module.exports = async (req, res) => {
  if (!autorizado(req)) return res.status(401).json({ error: "Não autorizado" });
  if (!SUPABASE_URL || !SUPABASE_KEY || !JOOBLE_KEY) {
    return res.status(500).json({ error: "Faltam variáveis de ambiente: SUPABASE_URL, SUPABASE_ANON_KEY, JOOBLE_API_KEY" });
  }

  let encontradas = 0;
  const vistos = new Set();
  const lote = [];

  try {
    for (const b of BUSCAS) {
      let jobs = [];
      try {
        jobs = await buscarJooble(b.keywords, b.location);
      } catch (e) {
        continue; // se uma pesquisa falhar, segue para a próxima
      }
      for (const job of jobs) {
        encontradas++;
        const row = mapear(job, b.categoria);
        if (!row.link_externo || vistos.has(row.external_id)) continue;
        vistos.add(row.external_id);
        lote.push(row);
      }
    }

    if (lote.length) {
      for (let i = 0; i < lote.length; i += 50) {
        await upsert(lote.slice(i, i + 50));
      }
    }

    await limparExpiradas();

    return res.status(200).json({ ok: true, encontradas, agregadas: lote.length });
  } catch (e) {
    return res.status(500).json({ error: String((e && e.message) || e) });
  }
};
