const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// ── LIMITES ───────────────────────────────────────────────────────────────────
const FREE_REGISTERED_DOWNLOADS = 3; // depois do email, antes da assinatura
const MAX_CHARS = 7000;              // corta CV/vaga para controlar tokens

// ── PROMPTS ───────────────────────────────────────────────────────────────────
const SCORE_SYSTEM = `És o motor de análise de currículos da NOVU.
Recebes o currículo (CV) de um utilizador e a descrição de uma vaga.
Avalias a compatibilidade como um sistema ATS faria: comparas o título do cargo e as palavras-chave (sobretudo competências técnicas) da vaga com o conteúdo do CV.
Responde APENAS com um objeto JSON válido, sem texto à volta e sem blocos de código markdown, exatamente neste formato:
{"score": <inteiro de 0 a 100>, "missing": [<até 10 palavras-chave ou competências importantes da vaga que NÃO aparecem no CV, em português>], "titleMatch": <true ou false>}
Não inventes competências. Se faltar informação, reflete isso numa pontuação mais baixa.`;

const ADAPT_SYSTEM = `És o motor de adaptação de currículos da NOVU, especialista no mercado de trabalho português.
Reescreves o CV do utilizador para ficar alinhado com a vaga indicada, em PORTUGUÊS DE PORTUGAL.
Regras:
- Mantém SEMPRE a verdade. Nunca inventes experiência, formação ou competências que o candidato não tenha.
- Integra naturalmente as palavras-chave e o título do cargo da vaga, mas só quando correspondem ao que o candidato realmente fez.
- Usa um formato simples e compatível com ATS: sem tabelas, sem colunas, sem gráficos. Secções claras com títulos: Contacto, Resumo Profissional, Experiência, Formação, Competências.
- Frases de experiência com verbos de ação e resultados concretos quando existirem.
Responde APENAS com o texto do CV reescrito, pronto a copiar. Sem comentários, sem explicações, sem markdown de código.`;

// ── CHAMADA À CLAUDE ──────────────────────────────────────────────────────────
async function callClaude({ system, userContent, maxTokens }) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: userContent }],
    }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("Anthropic API error:", errorData);
    throw new Error("anthropic_error");
  }
  const data = await response.json();
  return data.content?.[0]?.text || "";
}

function buildUserContent(cv, job) {
  return `=== DESCRIÇÃO DA VAGA ===\n${job}\n\n=== CURRÍCULO DO UTILIZADOR ===\n${cv}`;
}

function parseScore(text) {
  const clean = (text || "").replace(/```json|```/g, "").trim();
  try {
    const obj = JSON.parse(clean);
    const score = Math.max(0, Math.min(100, parseInt(obj.score, 10) || 0));
    const missing = Array.isArray(obj.missing) ? obj.missing.slice(0, 10) : [];
    return { score, missing, titleMatch: !!obj.titleMatch };
  } catch (e) {
    // fallback: tenta extrair um número
    const m = clean.match(/\d{1,3}/);
    return { score: m ? Math.min(100, parseInt(m[0], 10)) : 0, missing: [], titleMatch: false };
  }
}

// ── RATE LIMIT ANÓNIMO (best-effort, em memória) ──────────────────────────────
const anonScore = new Map(); // ip -> { count, resetAt }   limita abuso da nota
const anonAdapt = new Map();  // ip -> count                1 download grátis

function softLimit(map, ip, max, windowMs) {
  const now = Date.now();
  if (!map.has(ip)) map.set(ip, { count: 0, resetAt: now + windowMs });
  const d = map.get(ip);
  if (now > d.resetAt) { d.count = 0; d.resetAt = now + windowMs; }
  d.count++;
  return d.count <= max;
}

// ── HANDLER ───────────────────────────────────────────────────────────────────
module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const { action } = body || {};
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";

  const cv = (body.cv || "").toString().slice(0, MAX_CHARS).trim();
  const job = (body.job || "").toString().slice(0, MAX_CHARS).trim();
  const userEmail = body.userEmail || null;

  if (!cv || !job) {
    return res.status(400).json({ error: "Cola o teu currículo e a descrição da vaga." });
  }

  // ── MODO: NOTA (grátis) ─────────────────────────────────────────────────────
  if (action === "score") {
    if (!softLimit(anonScore, ip, 25, 60 * 60 * 1000)) {
      return res.status(429).json({ error: "Demasiadas análises por agora. Tenta mais logo." });
    }
    try {
      const text = await callClaude({
        system: SCORE_SYSTEM,
        userContent: buildUserContent(cv, job),
        maxTokens: 400,
      });
      return res.status(200).json(parseScore(text));
    } catch (err) {
      return res.status(500).json({ error: "Erro ao analisar. Tenta novamente." });
    }
  }

  // ── MODO: ADAPTAR (limitado) ────────────────────────────────────────────────
  if (action === "adapt") {
    // Utilizador registado: conta os downloads na Supabase
    if (userEmail) {
      const { data } = await supabase
        .from("waitlist")
        .select("unlocked, cv_downloads")
        .eq("email", userEmail)
        .single();

      const isRegistered = data?.unlocked === true;
      if (!isRegistered) {
        return res.status(200).json({ requiresEmail: true });
      }

      const used = data?.cv_downloads || 0;
      if (used >= FREE_REGISTERED_DOWNLOADS) {
        return res.status(200).json({ requiresSubscription: true });
      }

      try {
        const adaptedCv = await callClaude({
          system: ADAPT_SYSTEM,
          userContent: buildUserContent(cv, job),
          maxTokens: 2000,
        });
        await supabase
          .from("waitlist")
          .update({ cv_downloads: used + 1 })
          .eq("email", userEmail);
        return res.status(200).json({
          adaptedCv,
          downloadsUsed: used + 1,
          downloadsLimit: FREE_REGISTERED_DOWNLOADS,
        });
      } catch (err) {
        return res.status(500).json({ error: "Erro ao adaptar o CV. Tenta novamente." });
      }
    }

    // Utilizador anónimo: 1 download grátis (cookie no cliente + limite best-effort por IP)
    if (!softLimit(anonAdapt, ip, 1, 24 * 60 * 60 * 1000)) {
      return res.status(200).json({ requiresEmail: true });
    }
    try {
      const adaptedCv = await callClaude({
        system: ADAPT_SYSTEM,
        userContent: buildUserContent(cv, job),
        maxTokens: 2000,
      });
      return res.status(200).json({ adaptedCv, anonymousUsed: true });
    } catch (err) {
      return res.status(500).json({ error: "Erro ao adaptar o CV. Tenta novamente." });
    }
  }

  return res.status(400).json({ error: "Ação inválida." });
};
