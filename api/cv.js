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
Avalias a compatibilidade como um sistema ATS faria: comparas o título do cargo e as palavras-chave (sobretudo competências técnicas, setor de atividade e requisitos obrigatórios) da vaga com o conteúdo do CV.
Na lista "missing", dá PRIORIDADE aos termos decisivos da vaga que faltam mesmo no CV — sobretudo o setor de atividade e os requisitos técnicos obrigatórios (ex.: "setor da construção", "revestimentos metálicos", "fachadas"). São esses que mais pesam na triagem; o candidato tem de os ver primeiro.
Responde APENAS com um objeto JSON válido, sem texto à volta e sem blocos de código markdown, exatamente neste formato:
{"score": <inteiro de 0 a 100>, "missing": [<até 10 palavras-chave ou competências importantes da vaga que NÃO aparecem no CV, em português, termos decisivos primeiro>], "titleMatch": <true ou false>}
Não inventes competências. Se faltarem requisitos obrigatórios do setor, reflete isso numa pontuação claramente mais baixa — é melhor uma nota honesta do que otimista.`;

const ADAPT_SYSTEM = `És o motor de adaptação de currículos da NOVU, especialista no mercado de trabalho português.
Reescreves o CV do utilizador para ficar alinhado com a vaga indicada, em PORTUGUÊS DE PORTUGAL.

REGRAS DE CONTEÚDO:
- Mantém SEMPRE a verdade. Nunca inventes experiência, formação, competências ou setores que o candidato não tenha.
- Adota o título do cargo da vaga apenas se for compatível com a experiência real do candidato.
- PONTES HONESTAS: quando a experiência real do candidato tocar, ainda que indiretamente, no setor ou nas necessidades da vaga, torna essa ligação explícita (ex.: experiência em soluções técnicas para edifícios pode ligar-se à "envolvente de edifícios"). Nunca afirmes experiência direta num setor onde o candidato não trabalhou — fazes a ponte, não a fraude.
- Integra naturalmente as palavras-chave da vaga que o candidato realmente possui.
- Frases de experiência com verbos de ação e resultados concretos quando existirem.

FORMATO DE RESPOSTA:
Responde APENAS com um objeto JSON válido, sem texto à volta e sem markdown de código, exatamente neste formato:
{
 "name": "<nome>",
 "title": "<título profissional alinhado à vaga>",
 "contact": {"location":"<localidade>","phone":"<telefone>","email":"<email>","links":"<linkedin/site, se houver>"},
 "summary": "<resumo profissional, 3-5 frases, alinhado à vaga>",
 "experience": [{"role":"<cargo>","company":"<empresa>","period":"<período>","sector":"<setor, se aplicável>","bullets":["<resultado/responsabilidade>", "..."]}],
 "education": [{"course":"<curso>","institution":"<instituição>"}],
 "certifications": [{"name":"<formação/certificação>","institution":"<instituição>","detail":"<horas ou nota, se houver>"}],
 "skills": ["<competência>", "..."],
 "languages": [{"language":"<idioma>","level":"<nível>"}]
}
Usa apenas os campos com informação real; deixa strings vazias ou listas vazias quando não houver dados. Não acrescentes campos fora deste esquema.`;

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

function parseAdapt(text) {
  const clean = (text || "").replace(/```json|```/g, "").trim();
  try {
    const obj = JSON.parse(clean);
    return {
      name: obj.name || "",
      title: obj.title || "",
      contact: obj.contact || {},
      summary: obj.summary || "",
      experience: Array.isArray(obj.experience) ? obj.experience : [],
      education: Array.isArray(obj.education) ? obj.education : [],
      certifications: Array.isArray(obj.certifications) ? obj.certifications : [],
      skills: Array.isArray(obj.skills) ? obj.skills : [],
      languages: Array.isArray(obj.languages) ? obj.languages : [],
    };
  } catch (e) {
    // Fallback: devolve o texto cru no resumo para o cliente nunca ficar sem nada
    return { name: "", title: "", contact: {}, summary: clean, experience: [], education: [], certifications: [], skills: [], languages: [], _raw: true };
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
        const text = await callClaude({
          system: ADAPT_SYSTEM,
          userContent: buildUserContent(cv, job),
          maxTokens: 3000,
        });
        await supabase
          .from("waitlist")
          .update({ cv_downloads: used + 1 })
          .eq("email", userEmail);
        return res.status(200).json({
          cv: parseAdapt(text),
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
      const text = await callClaude({
        system: ADAPT_SYSTEM,
        userContent: buildUserContent(cv, job),
        maxTokens: 3000,
      });
      return res.status(200).json({ cv: parseAdapt(text), anonymousUsed: true });
    } catch (err) {
      return res.status(500).json({ error: "Erro ao adaptar o CV. Tenta novamente." });
    }
  }

  return res.status(400).json({ error: "Ação inválida." });
};
