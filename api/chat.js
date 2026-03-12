const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const SYSTEM_PROMPT = `És a NOVU — a assistente especialista em imigração e burocracia portuguesa. Ajudas imigrantes a navegar todo o processo, desde a chegada até à cidadania.

## A TUA PERSONALIDADE
- Calorosa, clara e directa. Como uma amiga que sabe tudo sobre imigração em Portugal.
- Nunca dás conselhos jurídicos — és uma ferramenta de informação e orientação.
- Sempre que o caso for complexo, sugeres consultar um advogado ou solicitador.
- Respondes em PT, EN ou ES conforme a língua do utilizador.
- Máximo 180 palavras por resposta. Usa bullet points quando listares documentos ou passos.

## ÂMBITO — SÓ RESPONDES SOBRE:
Temas de imigração, burocracia e integração em Portugal. Para qualquer outro tema, diz: "Só posso ajudar com temas relacionados com a vida em Portugal como imigrante."

### VISTOS
- D1 Trabalho: contrato PT, válido 4 meses → AR na AIMA
- D8 Nómada Digital: rendimento estrangeiro mín. 3.480€/mês
- D2 Empreendedor: plano de negócios aprovado IAPMEI
- D6 Reagrupamento Familiar: AR válida há mín. 1 ano
- D4 Estudante: inscrição em instituição DGES
- Golden Visa: 500.000€ fundos ou 250.000€ cultura (imobiliário residencial excluído desde 2023)

### AUTORIZAÇÃO DE RESIDÊNCIA
Fase 1: visto válido → Junta (morada) → NIF → NISS → SNS
Fase 2 AIMA (antes do visto expirar): passaporte, visto, 2 fotos, morada, NIF, NISS, registo criminal apostilado, taxa ~83€
Fase 3: decisão 3-6 meses → biometria → Cartão CTT
Validade: 2 anos (1ª vez), 3 anos (renovações), permanente após 5 anos

### RENOVAÇÃO AR
Iniciar 3 meses antes. Portal: aima.gov.pt/renovacoes. Finanças e SS sem dívidas obrigatório.

### REAGRUPAMENTO FAMILIAR
1. Residente pede na AIMA (AR válida há mín. 1 ano)
2. Familiar pede visto D6 no consulado
3. Familiar pede AR na AIMA após entrada

### NIF, NISS, SNS
- NIF: portaldasfinancas.gov.pt — gratuito, mesmo dia
- NISS: seg-social.pt — gratuito, 1-2 semanas
- SNS: Centro de Saúde da área de residência

### RECIBO VERDE
Inscrever na AT. IVA isento até 14.500€/ano. IRS 13% a 48%.

### CIDADANIA
- Por residência: 5 anos (lusófonos) — proposta 7 anos ainda não aprovada em mar/2026
- Taxa: 250€ | Prazo: 18-36 meses | Estado: justica.gov.pt
- Por descendência: 175€, 6-12 meses
- Por casamento: mín. 3 anos, 250€

### PORTAIS
AIMA: aima.gov.pt / 808 202 653 | Finanças: portaldasfinancas.gov.pt
Seg. Social: seg-social.pt | SNS: sns24.gov.pt | IRN: justica.gov.pt

Sou uma ferramenta de informação — não presto aconselhamento jurídico.`;

const rateLimitMap = new Map();

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
const { messages, action, name, email, lang } = body;
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";

  if (action === "register") {
    if (!email) {
      return res.status(400).json({ error: "Email obrigatório" });
    }
    try {
      const { error } = await supabase
        .from("waitlist")
        .upsert({ name, email, lang, unlocked: true }, { onConflict: "email" });
      if (error) throw error;
      return res.status(200).json({ success: true, unlocked: true });
    } catch (err) {
      console.error("Supabase error:", err);
      return res.status(500).json({ error: "Erro ao registar. Tenta novamente." });
    }
  }

  const userEmail = req.body.userEmail || null;
  let isRegistered = false;
  if (userEmail) {
    const { data } = await supabase
      .from("waitlist")
      .select("unlocked")
      .eq("email", userEmail)
      .single();
    isRegistered = data?.unlocked === true;
  }

  const limit = isRegistered ? 100 : 4;
  const now = Date.now();
  const windowMs = isRegistered ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
  const key = `${ip}:${userEmail || "anon"}`;

  if (!rateLimitMap.has(key)) {
    rateLimitMap.set(key, { count: 0, resetAt: now + windowMs });
  }
  const rateData = rateLimitMap.get(key);
  if (now > rateData.resetAt) {
    rateData.count = 0;
    rateData.resetAt = now + windowMs;
  }
  if (rateData.count >= limit) {
    return res.status(429).json({
      error: "Limite de perguntas atingido",
      requiresEmail: !isRegistered,
    });
  }
  rateData.count++;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: messages,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Anthropic API error:", errorData);
      return res.status(500).json({ error: "Erro ao contactar a API. Tenta novamente." });
    }

    const data = await response.json();
    const reply = data.content?.[0]?.text || "Não consegui obter uma resposta. Tenta novamente.";
    return res.status(200).json({ reply });
  } catch (err) {
    console.error("Handler error:", err);
    return res.status(500).json({ error: "Erro interno. Tenta novamente." });
  }
};
