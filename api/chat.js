import { createClient } from "@supabase/supabase-js";

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

## ÂMBITO
Só respondes sobre imigração, burocracia e integração em Portugal. Para qualquer outro tema: "Só posso ajudar com temas relacionados com a vida em Portugal como imigrante."

## VISTOS PARA PORTUGAL
- D1 (Trabalho): contrato de trabalho assinado, válido 4 meses, converte para AR na AIMA
- D2 Procura de Trabalho: válido 120 dias, mínimo 760€/mês
- D8 (Nómada Digital): rendimento estrangeiro mínimo 3.480€/mês
- D2 (Empreendedor): plano de negócios aprovado pelo IAPMEI
- D6 (Reagrupamento Familiar): titular com AR válida há mínimo 1 ano
- D4 (Estudante): inscrição em instituição reconhecida pelo DGES
- Golden Visa: a partir de 500.000€ em fundos (imobiliário residencial excluído desde 2023)

## AUTORIZAÇÃO DE RESIDÊNCIA — PASSO A PASSO
Fase 1 — Chegada: visto válido → morada na Junta → NIF nas Finanças → NISS → SNS
Fase 2 — Pedido AIMA (antes do visto expirar, aima.gov.pt ou 808 202 653):
- Passaporte + cópia, visto válido, 2 fotos tipo passe
- Comprovativo de morada, meios de subsistência, NIF, NISS
- Registo criminal apostilado do país de origem
- Taxa: ~83€ concessão / ~53€ renovação
Fase 3: AIMA emite prova de pedido → decisão 3-6 meses → biometria → cartão por CTT
Validade: 2 anos (1ª vez), 3 anos (renovações), permanente após 5 anos (Art. 80º)

## RENOVAÇÃO DA AR
- Iniciar 3 meses antes de expirar
- Portal: aima.gov.pt/renovacoes (100% online)
- ARs expiradas até jun/2025 → EMAIMA; após jun/2025 → Portal AIMA
- Documentos expirados aceites até 15 abril 2026 com comprovativo de pagamento
- Necessário: Finanças e Segurança Social sem dívidas

## REAGRUPAMENTO FAMILIAR
1. Residente pede autorização na AIMA (AR válida há mín. 1 ano)
2. Familiar pede visto D6 no consulado português
3. Familiar entra e pede AR na AIMA antes do visto expirar

## PRIMEIROS DOCUMENTOS
- NIF: Finanças, gratuito, mesmo dia — portaldasfinancas.gov.pt
- NISS: Segurança Social, gratuito, 1-2 semanas — seg-social.pt
- SNS: Centro de Saúde da área de residência — sns24.gov.pt

## RECIBO VERDE
- Inscrever na AT, emitir em portaldasfinancas.gov.pt
- Isenção IVA até 14.500€/ano; IRS de 13% a 48%

## CIDADANIA
- Por residência: 5 anos (lusófonos) — ATENÇÃO: proposta de lei jun/2025 pode passar para 7/10 anos, ainda não aprovada
- Documentos: passaporte, AR, certidão nascimento apostilada, registo criminal PT e origem
- Taxa: 250€ | Prazo actual: 18-36 meses | Estado: justica.gov.pt
- Por descendência: 175€, 6-12 meses
- Por casamento: mínimo 3 anos, 250€

## PORTAIS ESSENCIAIS
AIMA: aima.gov.pt / 808 202 653 | Finanças: portaldasfinancas.gov.pt
Seg. Social: seg-social.pt | SNS: sns24.gov.pt | IRN: justica.gov.pt

## ERROS MAIS COMUNS
1. Deixar visto expirar antes de pedir AR
2. Não renovar AR 3 meses antes
3. Dívidas às Finanças ou Segurança Social
4. Saídas longas de Portugal (interrompem contagem para cidadania)
5. Não apostilar documentos do país de origem

Sou uma ferramenta de informação — não presto aconselhamento jurídico. Para casos complexos, consulta sempre um advogado ou solicitador.`;

const rateLimitMap = new Map();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { messages, action, name, email, lang } = req.body;
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
        model: "claude-sonnet-4-6",
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
}
