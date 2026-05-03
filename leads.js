const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// ── RATE LIMIT POR IP ─────────────────────────────────────────────────────
const ipRateMap = new Map();
const IP_LIMIT = 5;          // máx 5 leads por IP
const IP_WINDOW_MS = 60 * 60 * 1000; // janela de 1 hora

function checkRateLimit(ip) {
  const now = Date.now();
  if (!ipRateMap.has(ip)) {
    ipRateMap.set(ip, { count: 1, resetAt: now + IP_WINDOW_MS });
    return true;
  }
  const data = ipRateMap.get(ip);
  if (now > data.resetAt) {
    data.count = 1;
    data.resetAt = now + IP_WINDOW_MS;
    return true;
  }
  if (data.count >= IP_LIMIT) return false;
  data.count++;
  return true;
}

// ── SANITIZAÇÃO ───────────────────────────────────────────────────────────
function sanitize(str, maxLen = 200) {
  if (!str || typeof str !== "string") return "";
  return str
    .trim()
    .slice(0, maxLen)
    .replace(/[<>"'`]/g, ""); // remove caracteres perigosos
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

// Categorias permitidas — lista fechada
const ALLOWED_CATEGORIAS = [
  "juridico", "habitacao", "trabalho", "bancario",
  "documentacao", "saude", "educacao", "outro"
];

// ── HANDLER ───────────────────────────────────────────────────────────────
module.exports = async function handler(req, res) {
  // Só aceita POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // CORS — só aceita do próprio domínio
  const origin = req.headers["origin"] || "";
  const allowed = ["https://novuai.pt", "https://www.novuai.pt", "http://localhost"];
  if (origin && !allowed.some(a => origin.startsWith(a))) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim()
    || req.socket?.remoteAddress
    || "unknown";

  // Rate limit
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: "Demasiados pedidos. Tenta mais tarde." });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

  // ── HONEYPOT — campo invisível que bots preenchem ─────────────────────
  if (body.website || body.telefone_extra) {
    // Bot detectado — resposta falsa de sucesso para não revelar a detecção
    return res.status(200).json({ success: true });
  }

  // ── VALIDAÇÃO ─────────────────────────────────────────────────────────
  const email     = sanitize(body.email, 254);
  const categoria = sanitize(body.categoria, 50).toLowerCase();
  const localizacao = sanitize(body.localizacao, 100);
  const descricao = sanitize(body.descricao, 800);
  const urgencia  = sanitize(body.urgencia, 20).toLowerCase();
  const lang      = sanitize(body.lang, 5) || "pt";
  const consent   = body.consent === true;

  // Email obrigatório e válido
  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ error: "Email inválido." });
  }

  // Categoria tem de estar na lista
  if (!ALLOWED_CATEGORIAS.includes(categoria)) {
    return res.status(400).json({ error: "Categoria inválida." });
  }

  // Localização obrigatória
  if (!localizacao) {
    return res.status(400).json({ error: "Localização obrigatória." });
  }

  // Descrição mínima
  if (!descricao || descricao.length < 10) {
    return res.status(400).json({ error: "Descrição demasiado curta." });
  }

  // Urgência válida
  const allowedUrgencia = ["baixa", "media", "alta", "low", "medium", "high", "baja", "media", "alta"];
  if (!allowedUrgencia.includes(urgencia)) {
    return res.status(400).json({ error: "Urgência inválida." });
  }

  // Consentimento obrigatório
  if (!consent) {
    return res.status(400).json({ error: "Consentimento obrigatório." });
  }

  // ── GUARDAR NO SUPABASE ───────────────────────────────────────────────
  try {
    const { error: dbError } = await supabase
      .from("leads")
      .insert({
        email,
        categoria,
        localizacao,
        descricao,
        urgencia,
        lang,
        ip_hash: ip.slice(0, 8) + "****", // guardar só prefixo do IP (RGPD)
      });

    if (dbError) {
      console.error("Supabase leads error:", dbError);
      // Não falhar silenciosamente — mas não expor detalhes ao cliente
      return res.status(500).json({ error: "Erro ao guardar o pedido. Tenta novamente." });
    }
  } catch (err) {
    console.error("DB error:", err);
    return res.status(500).json({ error: "Erro interno." });
  }

  // ── NOTIFICAÇÃO POR EMAIL (Formspree) ─────────────────────────────────
  try {
    const urgenciaLabel = { baixa: "🟢 Baixa", media: "🟡 Média", alta: "🔴 Alta",
                            low: "🟢 Low", medium: "🟡 Medium", high: "🔴 High",
                            baja: "🟢 Baja" }[urgencia] || urgencia;

    await fetch("https://formspree.io/f/xdawgkvq", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({
        _subject: `🆕 Novo lead NOVU — ${categoria} — ${localizacao}`,
        email,
        categoria,
        localizacao,
        descricao,
        urgencia: urgenciaLabel,
        lang,
        source: "novu-lead-form",
      }),
    });
  } catch (err) {
    // Falha no email não impede o sucesso — o lead já foi guardado
    console.error("Formspree error:", err);
  }

  return res.status(200).json({ success: true });
};
