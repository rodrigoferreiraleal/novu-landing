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
Temas de imigração, burocracia, integração e vida quotidiana em Portugal: vistos, documentos, residência, trabalho, moradia, bancos, telemóveis, crédito, cidadania e tudo o que envolve viver em Portugal como imigrante.
Para qualquer outro tema sem relação com Portugal ou imigração, diz: "Só posso ajudar com temas relacionados com a vida em Portugal como imigrante."

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

### TELEMÓVEIS / OPERADORAS
- NOS — melhor cobertura geral, pré-pagos a partir de €10/mês
- MEO — boa cobertura, planos "Go" a partir de €7/mês
- Vodafone — excelente cobertura urbana, ~8€/mês
- NOWO — mais barato mas cobertura limitada fora das cidades grandes
- Dica: pré-pago NOS ou MEO no aeroporto ou supermercado. Não precisas de NIF nem morada.

### BANCOS
- ActivoBank ⭐ — 100% digital, sem mensalidade, NIF + passaporte
- Millennium BCP — presencial, aceita visto válido + NIF
- Novobanco — conta jovem gratuita até 30 anos
- BPI / Santander — opções semelhantes
- Revolut / Wise — alternativas digitais para os primeiros meses

### CRÉDITO
- Cartão de crédito: 3-6 meses de conta activa
- Crédito pessoal: 6-12 meses historial bancário
- Crédito habitação: 2+ anos com contrato sem termo

### PORTAIS
AIMA: aima.gov.pt | Finanças: portaldasfinancas.gov.pt | Seg. Social: seg-social.pt | SNS: sns24.gov.pt | IRN: justica.gov.pt

### EMPREGO
- LinkedIn, Net-Empregos, ITJobs, Indeed Portugal, IEFP, Glassdoor
- Salário mínimo: 870€/mês (2025)
- CV em formato Europass: europass.eu
- IEFP: formações gratuitas + bolsa de emprego

Sou uma ferramenta de informação — não presto aconselhamento jurídico.`;

// ─── EMAIL DE BOAS-VINDAS ────────────────────────────────────────────────────
const WELCOME_EMAILS = {
  pt: {
    subject: "Bem-vindo/a à NOVU 🇵🇹",
    html: (name) => `
<!DOCTYPE html><html><body style="font-family:'DM Sans',Arial,sans-serif;background:#F5F9FF;margin:0;padding:24px;">
<div style="max-width:560px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(10,37,64,0.08);">
  <div style="background:#0A2540;padding:32px 36px;text-align:center;">
    <h1 style="color:white;font-size:2rem;margin:0;font-family:Georgia,serif;">N<span style="color:#2E7FD4">O</span>VU</h1>
    <p style="color:rgba(255,255,255,0.7);margin:8px 0 0;font-size:0.9rem;">Do avião à cidadania</p>
  </div>
  <div style="padding:32px 36px;">
    <h2 style="color:#0A2540;font-size:1.3rem;margin:0 0 16px;">Olá${name ? ', ' + name : ''}! 👋</h2>
    <p style="color:#4A6580;line-height:1.7;margin:0 0 20px;">A tua conta NOVU está activa. Tens acesso ilimitado ao assistente de IA e a todas as funcionalidades da plataforma.</p>
    <p style="color:#4A6580;font-weight:600;margin:0 0 16px;">O que podes fazer agora:</p>
    <div style="display:flex;flex-direction:column;gap:10px;">
      <a href="https://novuai.pt" style="display:flex;align-items:center;gap:12px;padding:14px 16px;background:#F5F9FF;border-radius:10px;text-decoration:none;border:1px solid #E8EEF5;">
        <span style="font-size:1.4rem;">🤖</span>
        <div><div style="color:#0A2540;font-weight:700;font-size:0.92rem;">Assistente IA</div><div style="color:#8FA3BC;font-size:0.8rem;">Perguntas ilimitadas sobre burocracia portuguesa</div></div>
      </a>
      <a href="https://novuai.pt/documentos.html" style="display:flex;align-items:center;gap:12px;padding:14px 16px;background:#F5F9FF;border-radius:10px;text-decoration:none;border:1px solid #E8EEF5;">
        <span style="font-size:1.4rem;">📄</span>
        <div><div style="color:#0A2540;font-weight:700;font-size:0.92rem;">Documentos PDF</div><div style="color:#8FA3BC;font-size:0.8rem;">15 modelos essenciais — declarações, cartas AIMA e mais</div></div>
      </a>
      <a href="https://novuai.pt/empregos.html" style="display:flex;align-items:center;gap:12px;padding:14px 16px;background:#F5F9FF;border-radius:10px;text-decoration:none;border:1px solid #E8EEF5;">
        <span style="font-size:1.4rem;">💼</span>
        <div><div style="color:#0A2540;font-weight:700;font-size:0.92rem;">Empregos</div><div style="color:#8FA3BC;font-size:0.8rem;">Vagas verificadas com salário visível</div></div>
      </a>
      <a href="https://novuai.pt/curriculo.html" style="display:flex;align-items:center;gap:12px;padding:14px 16px;background:#F5F9FF;border-radius:10px;text-decoration:none;border:1px solid #E8EEF5;">
        <span style="font-size:1.4rem;">📝</span>
        <div><div style="color:#0A2540;font-weight:700;font-size:0.92rem;">Currículo Europeu</div><div style="color:#8FA3BC;font-size:0.8rem;">Gera o teu CV em formato Europass</div></div>
      </a>
    </div>
    <div style="margin-top:28px;padding:16px;background:#EBF4FF;border-radius:10px;border-left:4px solid #2E7FD4;">
      <p style="color:#1A4A7A;font-size:0.85rem;margin:0;line-height:1.6;">💡 <strong>Dica:</strong> Guarda este email para voltares à NOVU quando precisares. Estamos sempre aqui.</p>
    </div>
  </div>
  <div style="padding:20px 36px;border-top:1px solid #E8EEF5;text-align:center;">
    <p style="color:#8FA3BC;font-size:0.78rem;margin:0;">© 2026 NOVU · <a href="https://novuai.pt/privacidade.html" style="color:#2E7FD4;">Privacidade</a> · <a href="https://novuai.pt" style="color:#2E7FD4;">novuai.pt</a></p>
  </div>
</div>
</body></html>`,
  },
  en: {
    subject: "Welcome to NOVU 🇵🇹",
    html: (name) => `
<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background:#F5F9FF;margin:0;padding:24px;">
<div style="max-width:560px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;">
  <div style="background:#0A2540;padding:32px 36px;text-align:center;">
    <h1 style="color:white;font-size:2rem;margin:0;">N<span style="color:#2E7FD4">O</span>VU</h1>
  </div>
  <div style="padding:32px 36px;">
    <h2 style="color:#0A2540;">Hello${name ? ', ' + name : ''}! 👋</h2>
    <p style="color:#4A6580;line-height:1.7;">Your NOVU account is active. You have unlimited access to the AI assistant and all platform features.</p>
    <p><a href="https://novuai.pt" style="background:#0A2540;color:white;padding:12px 28px;border-radius:50px;text-decoration:none;font-weight:700;">Go to NOVU →</a></p>
  </div>
</div></body></html>`,
  },
  es: {
    subject: "Bienvenido/a a NOVU 🇵🇹",
    html: (name) => `
<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background:#F5F9FF;margin:0;padding:24px;">
<div style="max-width:560px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;">
  <div style="background:#0A2540;padding:32px 36px;text-align:center;">
    <h1 style="color:white;font-size:2rem;margin:0;">N<span style="color:#2E7FD4">O</span>VU</h1>
  </div>
  <div style="padding:32px 36px;">
    <h2 style="color:#0A2540;">¡Hola${name ? ', ' + name : ''}! 👋</h2>
    <p style="color:#4A6580;line-height:1.7;">Tu cuenta NOVU está activa. Tienes acceso ilimitado al asistente de IA y a todas las funcionalidades.</p>
    <p><a href="https://novuai.pt" style="background:#0A2540;color:white;padding:12px 28px;border-radius:50px;text-decoration:none;font-weight:700;">Ir a NOVU →</a></p>
  </div>
</div></body></html>`,
  },
};

// Enviar email via Brevo
async function sendWelcomeEmail(name, email, lang) {
  const BREVO_KEY = process.env.BREVO_API_KEY;
  if (!BREVO_KEY) return; // sem Brevo configurado, skip silencioso

  const tpl = WELCOME_EMAILS[lang] || WELCOME_EMAILS.pt;
  try {
    await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": BREVO_KEY,
      },
      body: JSON.stringify({
        sender: { name: "NOVU", email: "noreply@novuai.pt" },
        to: [{ email, name: name || email }],
        subject: tpl.subject,
        htmlContent: tpl.html(name),
      }),
    });
    console.log("Welcome email sent to", email);
  } catch (err) {
    console.warn("Brevo email failed (non-critical):", err.message);
  }
}

// ─── FAQ CACHE ───────────────────────────────────────────────────────────────
const FAQ = {
  "como tirar nif": "Para obter o NIF em Portugal:\n\n• **Online** (mais rápido): portaldasfinancas.gov.pt → registo de contribuinte\n• **Presencialmente**: qualquer Serviço de Finanças com passaporte e comprovativo de morada\n• Gratuito, feito no mesmo dia\n• Se ainda não resides em Portugal, precisas de um representante fiscal residente\n\nO NIF é o primeiro passo — precisas dele para abrir conta bancária, assinar contratos e quase tudo em Portugal. 🇵🇹",
  "como tirar niss": "Para obter o NISS:\n\n• Online: seg-social.pt → Serviços Online → Identificação\n• Ou presencialmente num Centro Distrital da Segurança Social\n• Documentos: passaporte, NIF e comprovativo de morada\n• Gratuito — demora 1 a 2 semanas\n\nO NISS é obrigatório para trabalhar, aceder a subsídios e serviços sociais. 📋",
  "como abrir atividade": "Para abrir actividade (recibo verde) nas Finanças:\n\n• Online: portaldasfinancas.gov.pt → Início de Actividade\n• Ou presencialmente num Serviço de Finanças\n• Precisas de: NIF, NISS e código de actividade (CAE/CIRS)\n• Gratuito\n\nIVA isento até 14.500€/ano. IRS retido na fonte: 25% (não residentes) ou tabela normal. 📊",
  "numero de utente": "Para obter o número de utente SNS:\n\n• Vai ao Centro de Saúde da tua área de residência\n• Documentos: passaporte, NIF e comprovativo de morada portuguesa\n• Gratuito | Linha SNS 24: 808 24 24 24\n\nCom o número de utente tens acesso a consultas, urgências e medicamentos comparticipados. 🏥",
  "qual o visto": "Portugal tem vários vistos. Os principais:\n\n• **D1 — Trabalho**: contrato com empresa portuguesa\n• **D7 — Rendimento passivo**: pensão, rendas, trabalho remoto estrangeiro\n• **D8 — Nómada Digital**: rendimento mín. ~3.480€/mês\n• **D2 — Empreendedor**: projecto aprovado pelo IAPMEI\n• **D4 — Estudante**: inscrição em universidade reconhecida\n• **D6 — Reagrupamento familiar**: familiar de residente\n• **Golden Visa**: investimento mín. 500.000€ em fundos\n\nQual é a tua situação? Posso dizer exactamente qual o visto certo. 🇵🇹",
  "validar diploma": "Para reconhecimento de diploma em Portugal:\n\n**Diplomas universitários:**\n• Processo na instituição de ensino superior equivalente\n• Portal: dges.gov.pt | Prazo: 3-6 meses | Taxa: ~50-150€\n\n**Diplomas profissionais** (médicos, advogados, engenheiros): cada ordem tem o seu processo.\n\n**Apostila de Haia:** verifica se o teu país é signatário — alguns documentos precisam de apostila. 🎓",
  "encontrar quarto": "Para encontrar quarto/casa em Portugal:\n\n• idealista.pt — o maior portal imobiliário\n• imovirtual.com\n• uniplaces.com — focado em estudantes\n• Grupos Facebook locais de arrendamento\n\nExige sempre contrato de arrendamento escrito e regista-o nas Finanças.\nLisboa/Porto: quartos ~400-700€/mês. Fora das capitais: mais barato. 🏠",
  "bancos": "Para abrir conta bancária em Portugal como imigrante:\n\n• **ActivoBank** ⭐ — 100% digital, sem mensalidade, só NIF + passaporte. O mais fácil\n• **Millennium BCP** — presencial, aceita visto válido + NIF\n• **Novobanco** — conta jovem gratuita até 30 anos\n• **Revolut** — abre com passaporte, sem morada PT. Útil nos primeiros meses\n• **Wise** — excelente para receber em moeda estrangeira\n\nDocumentos: passaporte, NIF, comprovativo de morada. 🏦",
  "telemovel": "Operadoras em Portugal para quem chega:\n\n• **NOS** — melhor cobertura, pré-pago ~10€/mês\n• **MEO** — planos \"Go\" a partir de ~7€/mês\n• **Vodafone** — excelente cobertura urbana, ~8€/mês\n\n**Dica:** nos primeiros dias compra pré-pago NOS ou MEO no aeroporto ou supermercado. Sem NIF nem morada.\n\nApós 3-6 meses podes mudar para plano contrato com desconto. 📱",
  "site de emprego": "Portais de emprego em Portugal:\n\n• **LinkedIn** — escritório, tech e gestão\n• **Net-Empregos** — o maior portal generalista\n• **ITJobs** — exclusivo para tecnologia\n• **Indeed Portugal** — agrega ofertas de vários portais\n• **IEFP** (iefp.pt) — ofertas oficiais + formações gratuitas\n\nCV em formato Europass: europass.eu. Regista-te no IEFP — acesso a formações gratuitas. 💼",
  "contrato de trabalho": "Para conseguir emprego em Portugal:\n\n• linkedin.com/jobs, net-empregos.com, itjobs.pt, iefp.pt\n\n**Direitos com contrato:**\n• 22 dias úteis de férias + subsídio de férias\n• Subsídio de Natal (13º mês)\n• Salário mínimo: 870€/mês (2025)\n\n**Visto D1:** precisas do contrato ANTES do visto. Após entrada tens 4 meses para pedir AR na AIMA. 💼",
};

function normalizeFAQ(text) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9 ]/g, "").trim();
}
function checkFAQ(userMessage) {
  const normalized = normalizeFAQ(userMessage);
  for (const [key, answer] of Object.entries(FAQ)) {
    const normalizedKey = normalizeFAQ(key);
    if (normalized.includes(normalizedKey) || normalizedKey.split(" ").every(w => normalized.includes(w))) {
      return answer;
    }
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
const rateLimitMap = new Map();

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const { messages, action, name, email, lang, ref } = body;
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";

  // ── REGISTO ────────────────────────────────────────────────────────────────
  if (action === "register") {
    if (!email) return res.status(400).json({ error: "Email obrigatório" });
    try {
      const { cidade, pais } = body;
      const upsertData = { name, email, lang, unlocked: true };
      if (ref && ref.trim()) upsertData.ref = ref.trim().toLowerCase();
      if (cidade && cidade.trim()) upsertData.cidade = cidade.trim();
      if (pais && pais.trim()) upsertData.pais_origem = pais.trim();

      const { error } = await supabase
        .from("waitlist")
        .upsert(upsertData, { onConflict: "email" });

      if (error) throw error;

      // Enviar email de boas-vindas (não bloqueia a resposta)
      sendWelcomeEmail(name, email, lang || "pt").catch(() => {});

      return res.status(200).json({ success: true, unlocked: true });
    } catch (err) {
      console.error("Supabase error:", err);
      return res.status(500).json({ error: "Erro ao registar. Tenta novamente." });
    }
  }

  // ── RATE LIMIT ─────────────────────────────────────────────────────────────
  const userEmail = body.userEmail || null;
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
  if (now > rateData.resetAt) { rateData.count = 0; rateData.resetAt = now + windowMs; }
  if (rateData.count >= limit) {
    return res.status(429).json({ error: "Limite de perguntas atingido", requiresEmail: !isRegistered });
  }
  rateData.count++;

  // ── FAQ CACHE ──────────────────────────────────────────────────────────────
  const lastUserMessage = messages?.[messages.length - 1]?.content || "";
  const faqAnswer = checkFAQ(lastUserMessage);
  if (faqAnswer) {
    console.log("FAQ cache hit:", lastUserMessage);
    return res.status(200).json({ reply: faqAnswer, fromCache: true });
  }

  // ── API ANTHROPIC ──────────────────────────────────────────────────────────
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
};
